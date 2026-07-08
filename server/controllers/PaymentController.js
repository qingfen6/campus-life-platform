// server/controllers/PaymentController.js

const { pool } = require('../config/db'); // 直接从 db.js 解构导入 pool

/**
 * @desc 处理模拟支付请求
 * @route POST /api/payments/mock_process
 * @access Private
 */
const processMockPayment = async (req, res) => {
    const { orderId, amount, buyerId, /* productId, sellerId */ } = req.body; 
    // productId, sellerId might not be needed if orderId is sufficient to fetch details

    if (!orderId || !amount || !buyerId) {
        return res.status(400).json({ success: false, message: "Missing required fields for mock payment: orderId, amount, buyerId." });
    }

    try {
        // This route handler can now use the internal function.
        // It might be used for paying an *existing* pending order.
        // The full creation flow is in OrderController.createOrder.
        console.log(`Received direct request to processMockPayment for order ${orderId}`);
        const result = await handleMockPaymentInternal(orderId, amount, buyerId);
        
        if (result.success) {
            // If called directly, the caller is responsible for updating order/product status.
            // This endpoint just processes/simulates the payment part.
            // For a complete flow, OrderController.createOrder should be used.
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error(`Error in processMockPayment route for order ${orderId}:`, error);
        res.status(500).json({ success: false, message: "Error processing mock payment via API.", error: error.message });
    }
};

/**
 * @desc 检查余额 (模拟或真实支付场景)
 * @param {string} userId - 用户ID
 * @param {number} amountToPay - 需要支付的金额
 * @returns {Promise<boolean>} - 余额是否充足
 */
const checkBalance = async (userId, amountToPay) => {
    // TODO: (未来) 对于真实支付，这里可能需要查询用户账户余额
    // 对于模拟支付，可以简单返回 true 或根据测试需要返回特定值
    console.log(`检查用户 ${userId} 余额是否足够支付 ${amountToPay}`);
    return true; // 占位符
};

/**
 * @desc 冻结金额 (模拟或真实支付场景，例如下单后)
 * @param {string} userId - 用户ID
 * @param {number} amountToFreeze - 需要冻结的金额
 * @returns {Promise<boolean>} - 操作是否成功
 */
const freezeAmount = async (userId, amountToFreeze) => {
    // TODO: (未来) 实现冻结金额逻辑
    console.log(`为用户 ${userId} 冻结金额 ${amountToFreeze}`);
    return true; // 占位符
};

/**
 * @desc 处理交易 (创建交易记录)
 * @param {object} transactionData - 交易数据 (order_id, user_id, amount, transaction_type, status)
 * @returns {Promise<object>} - 创建的交易对象 { success: true, transaction_id, status } or throws error
 */
const processTransaction = async (transactionData) => {
    const { order_id, user_id, amount, transaction_type, status } = transactionData;
    try {
        const sql = `INSERT INTO transactions (order_id, user_id, amount, transaction_type, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`; // MySQL uses ? for placeholders
        const [result] = await pool.query( // pool.query for mysql2 returns [rows, fields] or [resultObject]
            sql,
            [order_id, user_id, amount, transaction_type, status]
        );
        // For mysql2, INSERT result is an object with insertId, affectedRows etc.
        if (result && result.insertId) { 
            console.log(`Transaction recorded: ${result.insertId} for order ${order_id} with status ${status}`);
            return { success: true, transaction_id: result.insertId, status };
        }
        throw new Error("Failed to create transaction record: ID not returned.");
    } catch (error) {
        console.error(`Error in processTransaction for order ${order_id}:`, error);
        throw error;
    }
};

/**
 * @desc 验证支付信息 (辅助函数)
 * @param {object} paymentData - 支付相关数据
 * @returns {boolean} - 数据是否有效
 */
const validatePayment = (paymentData) => {
    // TODO: 实现支付数据验证逻辑
    console.log("验证支付数据:", paymentData);
    return true; // 占位符
};

/**
 * @desc Internal function to handle mock payment logic
 * @param {string} orderId - The ID of the order
 * @param {number} amount - The amount to be paid
 * @param {string} buyerId - The ID of the buyer
 * @returns {Promise<object>} - { success: boolean, message: string, transactionId?: string }
 */
const handleMockPaymentInternal = async (orderId, amount, buyerId) => {
    const isPaymentSuccessful = Math.random() > 0.2;
    if (isPaymentSuccessful) {
        try {
            const transactionData = {
                order_id: orderId,
                user_id: buyerId,
                amount: amount,
                transaction_type: 'product_purchase',
                status: 'completed'
            };
            const transactionResult = await processTransaction(transactionData);
            console.log(`Order ${orderId} mock payment successful. Amount: ${amount}. Transaction ID: ${transactionResult.transaction_id}`);
            return { success: true, message: "Mock payment successful.", transactionId: transactionResult.transaction_id };
        } catch (dbError) {
            console.error(`Order ${orderId} mock payment was successful, but failed to record transaction:`, dbError);
            return { success: false, message: "Mock payment processed, but failed to record transaction internally. Please check logs.", error: dbError.message };
        }
    } else {
        try {
             const failedTransactionData = {
                order_id: orderId,
                user_id: buyerId,
                amount: amount,
                transaction_type: 'product_purchase',
                status: 'failed'
            };
            await processTransaction(failedTransactionData);
            console.log(`Order ${orderId} mock payment failed. Failed transaction attempt recorded.`);
        } catch (failedRecordError) {
            console.error(`Order ${orderId} mock payment failed, and also failed to record the failed transaction event:`, failedRecordError);
        }
        console.log(`Order ${orderId} mock payment failed by simulation. Amount: ${amount}`);
        return { success: false, message: "Mock payment failed (simulated decline)." };
    }
};

module.exports = {
    processMockPayment,
    handleMockPaymentInternal,
    processTransaction,
    checkBalance,
    freezeAmount,
    validatePayment,
}; 