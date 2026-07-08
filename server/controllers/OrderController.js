// server/controllers/OrderController.js
// 该文件负责处理所有与订单相关的业务逻辑，包括创建订单、查询订单、更新订单状态等。

const { pool } = require('../config/db'); // 直接从 db.js 解构导入 pool
const { handleMockPaymentInternal } = require('./PaymentController'); // 导入 PaymentController 以使用其内部函数
const { sendNotificationInternal } = require('./notification/notificationController'); // 通知控制器内部函数

// console.log("--- DEBUG: PaymentController Module ---");
// console.log(require('./PaymentController'));
// console.log("--- DEBUG: handleMockPaymentInternal (destructured) ---");
// console.log(handleMockPaymentInternal); // 确保 createOrder 不再依赖这个直接导入

/**
 * @desc 创建新订单 (不立即处理支付)
 * @route POST /api/orders
 * @access Private (用户必须登录)
 */
const createOrder = async (req, res) => {
    // console.log("--- DEBUG: Inside createOrder (new version) ---");
    const buyerId = req.user?.id;
    const { productId, buyer_address } = req.body;

    if (!buyerId) {
        return res.status(401).json({ success: false, message: "用户未登录，无法创建订单。" });
    }
    if (!productId) {
        return res.status(400).json({ success: false, message: "创建订单失败，缺少商品ID。" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [productRows] = await connection.query(
            'SELECT user_id AS seller_id, price, title, status, is_sold FROM products WHERE product_id = ?',
            [productId]
        );

        if (productRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "商品不存在。" });
        }

        const product = productRows[0];
        const { seller_id: sellerId, price: amount, title: productTitle, status: productStatus, is_sold: isSold } = product;

        if (productStatus !== 'active' || isSold) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: "商品已售出或不可用。" });
        }
        
        if (buyerId === sellerId) {
             await connection.rollback();
             return res.status(400).json({ success: false, message: "您不能购买自己的商品。" });
        }

        const orderType = 'product';
        const initialOrderStatus = 'pending'; // 订单初始状态为待支付

        const [orderResult] = await connection.query(
            `INSERT INTO orders (buyer_id, seller_id, product_id, order_type, amount, status, buyer_address, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [buyerId, sellerId, productId, orderType, amount, initialOrderStatus, buyer_address || null]
        );
        const orderId = orderResult.insertId;

        await connection.commit(); // 提交事务，订单已创建

        // 通知卖家有新订单等待支付
        if (sellerId !== buyerId) { // 避免给自己发通知
            await sendNotificationInternal(
                sellerId, 
                buyerId, 
                'market', // 或 'new_order'
                `您收到一个新商品订单 (ID: ${orderId})，来自用户 ${req.user?.name || '买家'}，商品: "${productTitle}"，等待买家支付。`, 
                'order', 
                orderId
            );
        }
        // (可选) 给买家发送订单创建通知，告知订单已生成，等待支付
        // await sendNotificationInternal(buyerId, null, 'market', `您的订单 (ID: ${orderId}) "${productTitle}" 已成功创建，请尽快完成支付。`, 'order', orderId);


        res.status(201).json({
            success: true,
            message: "订单创建成功，等待支付。",
            orderId: orderId,
            orderStatus: initialOrderStatus,
            amount: amount, // 返回金额，前端支付页面可能需要
            productTitle: productTitle // 返回商品标题，前端支付页面可能需要
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("创建订单失败 (v2 logic):", error);
        res.status(500).json({ success: false, message: "创建订单时发生内部服务器错误。", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @desc 验证订单数据 (辅助函数，可能在 createOrder 内部调用)
 * @param {object} orderData - 订单数据
 * @returns {boolean} - 数据是否有效
 */
const validateOrderData = (orderData) => {
    console.log("验证订单数据...", orderData);
    return true;
};

/**
 * @desc 处理订单支付 (通常由 PaymentController 处理，这里可能是流程的一部分)
 * @route POST /api/orders/:id/pay
 * @access Private
 */
const processOrderPayment = async (req, res) => {
    const orderId = req.params.id;
    res.status(501).json({ message: `订单 ${orderId} 支付处理功能尚未实现` });
};

/**
 * @desc 完成订单 (例如，在支付成功且商品已发货/服务已完成后)
 * @route PUT /api/orders/:id/complete
 * @access Private
 */
const completeOrder = async (req, res) => {
    const orderId = req.params.id;
    res.status(501).json({ message: `完成订单 ${orderId} 功能尚未实现` });
};

/**
 * @desc 获取用户订单列表 (买家或卖家)
 * @route GET /api/orders/my
 * @access Private
 */
const getUserOrders = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "用户未登录" });
    }
    try {
        const [orders] = await pool.query(
            `SELECT o.*, p.title AS product_title, seller.username AS seller_name, buyer.username AS buyer_name
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.product_id
             LEFT JOIN users seller ON o.seller_id = seller.user_id
             LEFT JOIN users buyer ON o.buyer_id = buyer.user_id
             WHERE o.buyer_id = ? OR o.seller_id = ? ORDER BY o.created_at DESC`,
            [userId, userId]
        );
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("获取用户订单列表失败:", error);
        res.status(500).json({ success: false, message: "获取订单列表失败", error: error.message });
    }
};

/**
 * @desc 获取特定订单详情
 * @route GET /api/orders/:id
 * @access Private
 */
const getOrderById = async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ success: false, message: "用户未登录" });
    }
    try {
        const [orderRows] = await pool.query(
            `SELECT o.*, p.title AS product_title, p.description AS product_description, p.price AS product_price, p.category AS product_category, p.location AS product_location, pi.image_url AS product_image_url, seller.username AS seller_name, seller.avatar_url AS seller_avatar, buyer.username AS buyer_name, buyer.avatar_url AS buyer_avatar
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.product_id
             LEFT JOIN users seller ON o.seller_id = seller.user_id
             LEFT JOIN users buyer ON o.buyer_id = buyer.user_id
             LEFT JOIN (SELECT product_id, MIN(image_url) AS image_url FROM product_images GROUP BY product_id) pi ON p.product_id = pi.product_id
             WHERE o.order_id = ? AND (o.buyer_id = ? OR o.seller_id = ?)`,
            [orderId, userId, userId]
        );
        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: "订单未找到或无权访问。" });
        }
        res.status(200).json({ success: true, order: orderRows[0] });
    } catch (error) {
        console.error(`获取订单 ${orderId} 详情失败:`, error);
        res.status(500).json({ success: false, message: "获取订单详情失败", error: error.message });
    }
};

/**
 * @desc 确认（模拟）订单支付
 * @route POST /api/orders/:orderId/confirm-mock-payment
 * @access Private (用户必须登录)
 */
const confirmMockOrderPayment = async (req, res) => {
    const { orderId } = req.params;
    const buyerId = req.user?.id;

    if (!buyerId) {
        return res.status(401).json({ success: false, message: "用户未登录。" });
    }

    let connection;
    try {
        // 1. 查询订单，验证订单状态和归属
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [orderRows] = await connection.query(
            'SELECT o.*, p.title as product_title, p.user_id as product_seller_id FROM orders o JOIN products p ON o.product_id = p.product_id WHERE o.order_id = ? AND o.buyer_id = ?',
            [orderId, buyerId]
        );

        if (orderRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: '订单未找到或您无权操作此订单。' });
        }
        const order = orderRows[0];

        if (order.status !== 'pending') {
            await connection.rollback();
            return res.status(400).json({ success: false, message: `订单当前状态为 "${order.status}"，无法处理支付。` });
        }

        // 2. 调用 PaymentController 的模拟支付逻辑
        // (handleMockPaymentInternal 内部会创建 transaction 记录)
        const paymentResult = await handleMockPaymentInternal(order.order_id, order.amount, order.buyer_id);

        let finalOrderStatus;
        let notificationContentToBuyer, notificationContentToSeller;

        if (paymentResult.success) {
            finalOrderStatus = 'paid';
            await connection.query('UPDATE products SET is_sold = TRUE, status = \'sold\' WHERE product_id = ?', [order.product_id]);
            console.log(`订单 ${orderId} (确认流程) 支付成功。商品 ${order.product_id} 状态已更新为已售。`);
            
            notificationContentToBuyer = `您订单 (ID: ${orderId}) "${order.product_title}" 的支付已成功处理！`;
            if (order.product_seller_id !== buyerId) {
                notificationContentToSeller = `卖家您好，订单 (ID: ${orderId}) "${order.product_title}" 买家已成功支付。`;
            }
        } else {
            finalOrderStatus = 'payment_failed';
            console.log(`订单 ${orderId} (确认流程) 支付失败: ${paymentResult.message}`);
            notificationContentToBuyer = `您订单 (ID: ${orderId}) "${order.product_title}" 的支付处理失败: ${paymentResult.message}。`;
            // 支付失败通常不需要额外通知卖家，除非订单因此被取消
        }

        // 3. 更新订单状态和支付信息
        await connection.query(
            'UPDATE orders SET status = ?, transaction_id = ?, updated_at = NOW() WHERE order_id = ?',
            [finalOrderStatus, paymentResult.transactionId || null, orderId]
        );

        await connection.commit();

        // 4. 发送通知
        if (paymentResult.success) {
            await sendNotificationInternal(
                buyerId, 
                null, // 系统操作
                'payment_success', 
                notificationContentToBuyer, 
                'order', 
                orderId
            );
            if (notificationContentToSeller && order.product_seller_id && order.product_seller_id !== buyerId) {
                await sendNotificationInternal(
                    order.product_seller_id, 
                    null, // 系统操作
                    'order_paid', 
                    notificationContentToSeller, 
                    'order', 
                    orderId
                );
            }
        } else {
            // 支付失败的通知 (如果需要，但上面已经有 notificationContentToBuyer)
             await sendNotificationInternal(
                buyerId, 
                null, // 系统操作
                'payment_failed', 
                notificationContentToBuyer, 
                'order', 
                orderId
            );
        }

        res.status(200).json({
            success: paymentResult.success,
            message: paymentResult.message,
            orderId: orderId,
            orderStatus: finalOrderStatus,
            transactionId: paymentResult.transactionId
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`确认订单 ${orderId} 支付失败:`, error);
        res.status(500).json({ success: false, message: '处理支付确认时发生内部服务器错误。', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @desc 卖家标记订单为已发货
 * @route PUT /api/orders/:orderId/ship
 * @access Private (卖家)
 */
const markOrderAsShipped = async (req, res) => {
    const { orderId } = req.params;
    const sellerId = req.user?.id; 

    if (!sellerId) {
        return res.status(401).json({ success: false, message: "用户未登录。" });
    }
    if (!orderId) {
        return res.status(400).json({ success: false, message: "缺少订单ID。" });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [orderRows] = await connection.query(
            'SELECT o.*, p.title as product_title FROM orders o JOIN products p ON o.product_id = p.product_id WHERE o.order_id = ? AND o.seller_id = ?',
            [orderId, sellerId]
        );

        if (orderRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: '订单未找到或您无权操作此订单。' });
        }

        const order = orderRows[0];
        if (order.status !== 'paid') { 
            await connection.rollback();
            return res.status(400).json({ success: false, message: `订单状态为 "${order.status}"，无法标记为已发货。只有已支付的订单才能发货。` });
        }

        const [updateResult] = await connection.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?',
            ['shipped', orderId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(500).json({ success: false, message: '更新订单状态失败。' });
        }
        
        if (order.buyer_id) {
            await sendNotificationInternal(
                order.buyer_id,
                sellerId, 
                'order_shipped',
                `您的订单 (ID: ${orderId}) \"${order.product_title}\" 已发货！`,
                'order',
                orderId
            );
        }

        await connection.commit();
        res.status(200).json({ success: true, message: `订单 ${orderId} 已成功标记为已发货。`, orderStatus: 'shipped' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error(`标记订单 ${orderId} 为已发货时失败:`, error);
        res.status(500).json({ success: false, message: '处理请求时发生内部服务器错误。', error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    createOrder,
    validateOrderData, 
    processOrderPayment,
    completeOrder,
    getUserOrders,
    getOrderById,
    confirmMockOrderPayment,
    markOrderAsShipped,
}; 