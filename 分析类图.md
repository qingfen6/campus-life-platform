1. 发布动态分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +char password 密码
        +varchar email 邮箱
        +varchar phone 电话
        +varchar student_id 学号
        +enum user_status 用户状态
        +verifySchoolStatus() 验证学校状态()
        +getUserInfo() 获取用户信息()
    }
    
    class Post {
        +bigint post_id 动态ID
        +bigint user_id 用户ID
        +text content 内容
        +enum post_type 动态类型
        +enum visibility 可见性
        +varchar location 位置
        +int like_count 点赞数
        +int comment_count 评论数
        +int share_count 分享数
        +enum status 状态
        +createPost() 创建动态()
        +updatePost() 更新动态()
        +deletePost() 删除动态()
    }
    
    class PostMedia {
        +bigint media_id 媒体ID
        +bigint post_id 动态ID
        +enum media_type 媒体类型
        +varchar media_url 媒体URL
        +varchar thumbnail_url 缩略图URL
        +tinyint display_order 显示顺序
        +uploadMedia() 上传媒体()
        +removeMedia() 移除媒体()
    }
    
    class PostView {
        +displayPostForm() 显示发布表单()
        +showMediaUploadOptions() 显示媒体上传选项()
        +previewPost() 预览动态()
        +submitPost() 提交动态()
        +showError() 显示错误()
    }
    
    class AuthController {
        +verifySchoolAuth() 验证学校认证()
        +getAuthStatus() 获取认证状态()
        +checkCredentials() 检查凭证()
    }
    
    class PostController {
        +createPost() 创建动态()
        +attachMedia() 附加媒体()
        +validatePostData() 验证动态数据()
        +submitPost() 提交动态()
    }
    
    class MediaController {
        +uploadMedia() 上传媒体()
        +processMedia() 处理媒体()
        +generateThumbnail() 生成缩略图()
        +saveMediaToPost() 保存媒体到动态()
    }
    
    User "1" -- "0..*" Post : publishes 发布
    Post "1" -- "0..*" PostMedia : contains 包含
    PostView -- PostController : uses 使用
    PostView -- MediaController : uses 使用
    PostController -- AuthController : uses 使用
    PostController -- User : validates 验证
    PostController -- Post : manages 管理
    MediaController -- PostMedia : manages 管理


2. 发布商品分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +varchar email 邮箱
        +enum user_status 用户状态
        +verifySchoolStatus() 验证学校状态()
        +getUserInfo() 获取用户信息()
    }
    
    class Product {
        +bigint product_id 商品ID
        +bigint user_id 用户ID
        +varchar title 标题
        +text description 描述
        +decimal price 价格
        +decimal original_price 原价
        +varchar category 类别
        +enum condition_type 商品状况
        +varchar location 位置
        +boolean is_negotiable 可议价
        +boolean is_sold 已售出
        +enum status 状态
        +int view_count 浏览量
        +createProduct() 创建商品()
        +updateProductStatus() 更新商品状态()
        +setNegotiable() 设置可议价()
    }
    
    class ProductImage {
        +bigint image_id 图片ID
        +bigint product_id 商品ID
        +varchar image_url 图片URL
        +tinyint display_order 显示顺序
        +uploadImage() 上传图片()
        +updateOrder() 更新顺序()
        +removeImage() 移除图片()
    }
    
    class ProductView {
        +displayProductForm() 显示商品表单()
        +showImageUploader() 显示图片上传器()
        +previewProduct() 预览商品()
        +submitProduct() 提交商品()
        +showError() 显示错误()
    }
    
    class AuthController {
        +verifySchoolAuth() 验证学校认证()
        +getAuthStatus() 获取认证状态()
        +checkUserStatus() 检查用户状态()
    }
    
    class ProductController {
        +createProduct() 创建商品()
        +validateProductData() 验证商品数据()
        +updateProduct() 更新商品()
        +checkProductStatus() 检查商品状态()
    }
    
    class ImageController {
        +uploadProductImage() 上传商品图片()
        +processImage() 处理图片()
        +validateImage() 验证图片()
        +attachImageToProduct() 添加图片到商品()
    }
    
    User "1" -- "0..*" Product : publishes 发布
    Product "1" -- "0..*" ProductImage : has 拥有
    ProductView -- ProductController : uses 使用
    ProductView -- ImageController : uses 使用
    ProductController -- AuthController : uses 使用
    ProductController -- Product : manages 管理
    ImageController -- ProductImage : manages 管理


3. 发布悬赏分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +enum user_status 用户状态
        +verifySchoolStatus() 验证学校状态()
        +checkUserCredit() 检查用户信用()
    }
    
    class Mission {
        +bigint mission_id 任务ID
        +bigint user_id 用户ID
        +varchar title 标题
        +text description 描述
        +decimal reward 悬赏金额
        +varchar category 类别
        +enum difficulty 难度
        +decimal estimated_hours 预计时间
        +varchar location 地点
        +datetime deadline 截止时间
        +enum status 状态
        +int view_count 浏览量
        +createMission() 创建任务()
        +updateStatus() 更新状态()
        +checkDeadline() 检查截止时间()
    }
    
    class Account {
        +bigint account_id 账户ID
        +bigint user_id 用户ID
        +decimal balance 余额
        +decimal frozen_amount 冻结金额
        +checkBalance() 检查余额()
        +freezeAmount() 冻结金额()
        +updateBalance() 更新余额()
    }
    
    class Transaction {
        +bigint transaction_id 交易ID
        +bigint user_id 用户ID
        +enum transaction_type 交易类型
        +decimal amount 金额
        +enum status 状态
        +varchar reference_id 参考ID
        +text description 描述
        +createTransaction() 创建交易()
        +updateStatus() 更新状态()
        +completeTransaction() 完成交易()
    }
    
    class MissionView {
        +displayMissionForm() 显示任务表单()
        +showRewardInput() 显示悬赏输入()
        +previewMission() 预览任务()
        +submitMission() 提交任务()
        +showError() 显示错误()
    }
    
    class AuthController {
        +verifySchoolAuth() 验证学校认证()
        +getAuthStatus() 获取认证状态()
        +checkUserPermission() 检查用户权限()
    }
    
    class MissionController {
        +createMission() 创建任务()
        +validateMissionData() 验证任务数据()
        +updateMission() 更新任务()
        +checkDeadline() 检查截止时间()
    }
    
    class PaymentController {
        +checkBalance() 检查余额()
        +freezeReward() 冻结悬赏()
        +createTransaction() 创建交易()
        +validatePayment() 验证支付()
    }
    
    User "1" -- "0..*" Mission : publishes 发布
    User "1" -- "1" Account : has 拥有
    Account "1" -- "0..*" Transaction : records 记录
    MissionView -- MissionController : uses 使用
    MissionView -- PaymentController : uses 使用
    MissionController -- AuthController : uses 使用
    MissionController -- Mission : manages 管理
    PaymentController -- Account : manages 管理
    PaymentController -- Transaction : creates 创建
```

4. 购买商品分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +enum user_status 用户状态
        +getUserInfo() 获取用户信息()
        +checkUserStatus() 检查用户状态()
    }
    
    class Product {
        +bigint product_id 商品ID
        +bigint user_id 用户ID
        +varchar title 标题
        +text description 描述
        +decimal price 价格
        +varchar category 类别
        +varchar location 位置
        +boolean is_sold 已售出
        +enum status 状态
        +getProductDetails() 获取商品详情()
        +updateStatus() 更新状态()
        +markAsSold() 标记为已售()
    }
    
    class Order {
        +bigint order_id 订单ID
        +bigint buyer_id 买家ID
        +bigint seller_id 卖家ID
        +bigint product_id 商品ID
        +enum order_type 订单类型
        +decimal amount 金额
        +enum status 状态
        +varchar payment_method 支付方式
        +datetime payment_time 支付时间
        +text buyer_address 买家地址
        +createOrder() 创建订单()
        +updateStatus() 更新状态()
        +processPayment() 处理支付()
    }
    
    class Account {
        +bigint account_id 账户ID
        +bigint user_id 用户ID
        +decimal balance 余额
        +decimal frozen_amount 冻结金额
        +checkBalance() 检查余额()
        +freezeAmount() 冻结金额()
        +transferAmount() 转移金额()
    }
    
    class Transaction {
        +bigint transaction_id 交易ID
        +bigint user_id 用户ID
        +enum transaction_type 交易类型
        +decimal amount 金额
        +enum status 状态
        +createTransaction() 创建交易()
        +updateStatus() 更新状态()
    }
    
    class ProductDetailView {
        +displayProductDetails() 显示商品详情()
        +showBuyButton() 显示购买按钮()
        +showSellerInfo() 显示卖家信息()
    }
    
    class OrderView {
        +displayOrderForm() 显示订单表单()
        +showPaymentOptions() 显示支付选项()
        +confirmOrder() 确认订单()
        +showError() 显示错误()
    }
    
    class ProductController {
        +getProductDetails() 获取商品详情()
        +checkProductStatus() 检查商品状态()
        +updateProductStatus() 更新商品状态()
    }
    
    class OrderController {
        +createOrder() 创建订单()
        +validateOrderData() 验证订单数据()
        +processPayment() 处理支付()
        +completeOrder() 完成订单()
    }
    
    class PaymentController {
        +checkBalance() 检查余额()
        +freezePayment() 冻结支付()
        +processTransaction() 处理交易()
        +validatePayment() 验证支付()
    }
    
    class NotificationController {
        +notifySeller() 通知卖家()
        +notifyBuyer() 通知买家()
        +sendOrderNotification() 发送订单通知()
    }
    
    User "1" -- "0..*" Product : sells 销售
    User "1" -- "0..*" Order : places 下单
    User "1" -- "1" Account : has 拥有
    Product "1" -- "0..*" Order : ordered in 被订购
    Account "1" -- "0..*" Transaction : records 记录
    ProductDetailView -- ProductController : uses 使用
    OrderView -- OrderController : uses 使用
    OrderController -- ProductController : uses 使用
    OrderController -- PaymentController : uses 使用
    OrderController -- NotificationController : uses 使用
    PaymentController -- Account : manages 管理
    PaymentController -- Transaction : creates 创建
    OrderController -- Order : manages 管理
    ProductController -- Product : manages 管理
```

5. 接取悬赏分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +enum user_status 用户状态
        +getUserInfo() 获取用户信息()
        +verifySchoolStatus() 验证学校状态()
    }
    
    class Mission {
        +bigint mission_id 任务ID
        +bigint user_id 用户ID
        +varchar title 标题
        +text description 描述
        +decimal reward 悬赏金额
        +varchar category 类别
        +enum difficulty 难度
        +datetime deadline 截止时间
        +enum status 状态
        +getMissionDetails() 获取任务详情()
        +updateStatus() 更新状态()
        +checkAvailable() 检查可用性()
    }
    
    class MissionApply {
        +bigint take_id 接取ID
        +bigint mission_id 任务ID
        +bigint taker_id 接取者ID
        +enum status 状态
        +text apply_message 申请消息
        +datetime completed_at 完成时间
        +tinyint rating 评分
        +text review 评价
        +submitApplication() 提交申请()
        +updateStatus() 更新状态()
        +completeTask() 完成任务()
    }
    
    class MissionDetailView {
        +displayMissionDetails() 显示任务详情()
        +showApplyButton() 显示申请按钮()
        +showPublisherInfo() 显示发布者信息()
    }
    
    class ApplyView {
        +displayApplyForm() 显示申请表单()
        +submitApplication() 提交申请()
        +showSuccessMessage() 显示成功消息()
        +showError() 显示错误()
    }
    
    class MissionController {
        +getMissionDetails() 获取任务详情()
        +checkMissionStatus() 检查任务状态()
        +updateMissionStatus() 更新任务状态()
    }
    
    class ApplyController {
        +submitApplication() 提交申请()
        +validateApplyData() 验证申请数据()
        +updateApplicationStatus() 更新申请状态()
        +getMissionApplications() 获取任务申请()
    }
    
    class NotificationController {
        +notifyPublisher() 通知发布者()
        +notifyApplicant() 通知申请者()
        +sendApplicationNotification() 发送申请通知()
    }
    
    User "1" -- "0..*" Mission : publishes 发布
    User "1" -- "0..*" MissionApply : takes 接取
    Mission "1" -- "0..*" MissionApply : has 拥有
    MissionDetailView -- MissionController : uses 使用
    ApplyView -- ApplyController : uses 使用
    ApplyController -- MissionController : uses 使用
    ApplyController -- NotificationController : uses 使用
    MissionController -- Mission : manages 管理
    ApplyController -- MissionApply : manages 管理
```

6. 发布社团公告分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +enum user_status 用户状态
        +getUserInfo() 获取用户信息()
        +checkUserPermission() 检查用户权限()
    }
    
    class Club {
        +bigint club_id 社团ID
        +bigint school_id 学校ID
        +varchar club_name 社团名称
        +varchar club_type 社团类型
        +text description 描述
        +varchar logo_url 徽标URL
        +int member_count 成员数量
        +enum status 状态
        +getClubDetails() 获取社团详情()
        +updateClubInfo() 更新社团信息()
    }
    
    class ClubMember {
        +bigint membership_id 成员资格ID
        +bigint club_id 社团ID
        +bigint user_id 用户ID
        +enum role 角色
        +date join_date 加入日期
        +enum status 状态
        +getMemberRole() 获取成员角色()
        +checkPermission() 检查权限()
    }
    
    class Announcement {
        +bigint announcement_id 公告ID
        +bigint club_id 社团ID
        +bigint publisher_id 发布者ID
        +varchar title 标题
        +text content 内容
        +enum visibility 可见性
        +enum status 状态
        +createAnnouncement() 创建公告()
        +updateStatus() 更新状态()
    }
    
    class AnnouncementMedia {
        +bigint media_id 媒体ID
        +bigint announcement_id 公告ID
        +enum media_type 媒体类型
        +varchar media_url 媒体URL
        +uploadMedia() 上传媒体()
        +removeMedia() 移除媒体()
    }
    
    class ClubView {
        +displayClubDashboard() 显示社团仪表板()
        +showMemberManagement() 显示成员管理()
        +showClubStatistics() 显示社团统计()
    }
    
    class AnnouncementView {
        +displayAnnouncementForm() 显示公告表单()
        +showMediaUploader() 显示媒体上传器()
        +previewAnnouncement() 预览公告()
        +submitAnnouncement() 提交公告()
        +showError() 显示错误()
    }
    
    class ClubController {
        +getClubDetails() 获取社团详情()
        +checkMemberPermission() 检查成员权限()
        +getClubMembers() 获取社团成员()
    }
    
    class AnnouncementController {
        +createAnnouncement() 创建公告()
        +validateAnnouncementData() 验证公告数据()
        +publishAnnouncement() 发布公告()
    }
    
    class MediaController {
        +uploadAnnouncementMedia() 上传公告媒体()
        +processMedia() 处理媒体()
        +attachMediaToAnnouncement() 添加媒体到公告()
    }
    
    class NotificationController {
        +notifyClubMembers() 通知社团成员()
        +notifySchoolUsers() 通知学校用户()
        +sendAnnouncementNotification() 发送公告通知()
    }
    
    User "1" -- "0..*" ClubMember : joins 加入
    Club "1" -- "0..*" ClubMember : has 拥有
    Club "1" -- "0..*" Announcement : publishes 发布
    Announcement "1" -- "0..*" AnnouncementMedia : contains 包含
    ClubView -- ClubController : uses 使用
    AnnouncementView -- AnnouncementController : uses 使用
    AnnouncementView -- MediaController : uses 使用
    AnnouncementController -- ClubController : uses 使用
    AnnouncementController -- NotificationController : uses 使用
    ClubController -- Club : manages 管理
    ClubController -- ClubMember : manages 管理
    AnnouncementController -- Announcement : manages 管理
    MediaController -- AnnouncementMedia : manages 管理
```

7. 审核加入校园人员分析类图

```mermaid
classDiagram
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +varchar email 邮箱
        +varchar real_name 真实姓名
        +varchar student_id 学号
        +bigint school_id 学校ID
        +enum user_status 用户状态
        +getUserInfo() 获取用户信息()
        +updateUserStatus() 更新用户状态()
    }
    
    class School {
        +bigint school_id 学校ID
        +varchar school_name 学校名称
        +varchar school_code 学校代码
        +getSchoolInfo() 获取学校信息()
        +verifyStudentInfo() 验证学生信息()
    }
    
    class VerificationRequest {
        +bigint request_id 请求ID
        +bigint user_id 用户ID
        +bigint school_id 学校ID
        +enum status 状态
        +text rejection_reason 拒绝原因
        +boolean needs_additional_docs 需要额外文档
        +createRequest() 创建请求()
        +updateStatus() 更新状态()
        +requestAdditionalDocs() 请求额外文档()
    }
    
    class VerificationDocument {
        +bigint document_id 文档ID
        +bigint request_id 请求ID
        +enum document_type 文档类型
        +varchar document_url 文档URL
        +boolean is_verified 已验证
        +uploadDocument() 上传文档()
        +verifyDocument() 验证文档()
    }
    
    class SchoolView {
        +displaySchoolDashboard() 显示学校仪表板()
        +showSchoolStatistics() 显示学校统计()
        +managePendingRequests() 管理待处理请求()
    }
    
    class UserReviewView {
        +displayPendingRequests() 显示待处理请求()
        +showRequestDetails() 显示请求详情()
        +approveRequest() 批准请求()
        +rejectRequest() 拒绝请求()
        +requestMoreInfo() 请求更多信息()
    }
    
    class DetailView {
        +displayRequestDetails() 显示请求详情()
        +showUserInfo() 显示用户信息()
        +showDocuments() 显示文档()
        +validateUserInfo() 验证用户信息()
    }
    
    class SchoolController {
        +getSchoolDetails() 获取学校详情()
        +validateStudentInfo() 验证学生信息()
        +getSchoolStatistics() 获取学校统计()
    }
    
    class AuthController {
        +getPendingRequests() 获取待处理请求()
        +getRequestDetails() 获取请求详情()
        +approveRequest() 批准请求()
        +rejectRequest() 拒绝请求()
        +requestAdditionalInfo() 请求额外信息()
    }
    
    class UserController {
        +getUserDetails() 获取用户详情()
        +updateUserVerification() 更新用户验证()
        +getUsersBySchool() 获取学校用户()
    }
    
    class NotificationController {
        +notifyApplicant() 通知申请人()
        +notifySchoolAdmin() 通知学校管理员()
        +sendVerificationNotification() 发送验证通知()
    }
    
    User "1" -- "0..*" VerificationRequest : submits 提交
    School "1" -- "0..*" VerificationRequest : processes 处理
    School "1" -- "0..*" User : has 拥有
    VerificationRequest "1" -- "0..*" VerificationDocument : contains 包含
    SchoolView -- SchoolController : uses 使用
    UserReviewView -- AuthController : uses 使用
    DetailView -- AuthController : uses 使用
    DetailView -- UserController : uses 使用
    DetailView -- SchoolController : uses 使用
    AuthController -- NotificationController : uses 使用
    SchoolController -- School : manages 管理
    AuthController -- VerificationRequest : manages 管理
    AuthController -- VerificationDocument : manages 管理
    UserController -- User : manages 管理
```

8. 系统监控分析类图

```mermaid
classDiagram
    class SystemAdmin {
        +bigint admin_id 管理员ID
        +varchar username 用户名
        +enum admin_level 管理员级别
        +getAdminPermissions() 获取管理员权限()
        +checkAdminStatus() 检查管理员状态()
    }
    
    class SystemMetric {
        +bigint metric_id 指标ID
        +varchar metric_name 指标名称
        +varchar metric_value 指标值
        +varchar metric_unit 指标单位
        +datetime collected_at 收集时间
        +collectMetric() 收集指标()
        +compareHistorical() 比较历史()
        +detectAnomaly() 检测异常()
    }
    
    class SystemLog {
        +bigint log_id 日志ID
        +enum log_level 日志级别
        +varchar source 来源
        +text message 消息
        +varchar stack_trace 堆栈跟踪
        +datetime created_at 创建时间
        +logEvent() 记录事件()
        +searchLogs() 搜索日志()
        +aggregateLogs() 聚合日志()
    }
    
    class System {
        +varchar system_version 系统版本
        +enum system_status 系统状态
        +json configuration 配置
        +datetime last_updated 最后更新
        +getSystemInfo() 获取系统信息()
        +updateStatus() 更新状态()
        +applyConfiguration() 应用配置()
    }
    
    class SystemMonitorView {
        +displayDashboard() 显示仪表板()
        +showPerformanceMetrics() 显示性能指标()
        +showSystemLogs() 显示系统日志()
        +showAlerts() 显示警报()
        +generateReport() 生成报告()
    }
    
    class SystemController {
        +getSystemStatus() 获取系统状态()
        +updateSystemStatus() 更新系统状态()
        +restartService() 重启服务()
        +applySystemUpdates() 应用系统更新()
    }
    
    class MonitorController {
        +getPerformanceMetrics() 获取性能指标()
        +setAlertThresholds() 设置警报阈值()
        +getHistoricalMetrics() 获取历史指标()
        +detectAnomalies() 检测异常()
    }
    
    class LogController {
        +getSystemLogs() 获取系统日志()
        +searchLogsByCriteria() 按条件搜索日志()
        +exportLogs() 导出日志()
        +analyseLogs() 分析日志()
    }
    
    class AlertService {
        +generateAlert() 生成警报()
        +notifyAdmins() 通知管理员()
        +resolveAlert() 解决警报()
        +escalateAlert() 升级警报()
    }
    
    SystemAdmin "1" -- "0..*" SystemLog : reviews 查看
    SystemAdmin "1" -- "0..*" SystemMetric : monitors 监控
    System "1" -- "0..*" SystemMetric : generates 生成
    System "1" -- "0..*" SystemLog : produces 产生
    SystemMonitorView -- SystemController : uses 使用
    SystemMonitorView -- MonitorController : uses 使用
    SystemMonitorView -- LogController : uses 使用
    MonitorController -- AlertService : uses 使用
    SystemController -- System : manages 管理
    MonitorController -- SystemMetric : manages 管理
    LogController -- SystemLog : manages 管理
```

9. 用户管理分析类图

```mermaid
classDiagram
    class SystemAdmin {
        +bigint admin_id 管理员ID
        +varchar username 用户名
        +enum admin_level 管理员级别
        +getAdminPermissions() 获取管理员权限()
        +manageUsers() 管理用户()
    }
    
    class User {
        +bigint user_id 用户ID
        +varchar username 用户名
        +char password 密码
        +varchar email 邮箱
        +enum user_status 用户状态
        +getUserInfo() 获取用户信息()
        +updateStatus() 更新状态()
    }
    
    class Role {
        +bigint role_id 角色ID
        +varchar role_name 角色名称
        +text description 描述
        +getRolePermissions() 获取角色权限()
        +assignToUser() 分配给用户()
    }
    
    class Permission {
        +bigint permission_id 权限ID
        +varchar permission_name 权限名称
        +varchar resource 资源
        +enum action 操作
        +checkPermission() 检查权限()
        +assignToRole() 分配给角色()
    }
    
    class UserManagementView {
        +displayUserList() 显示用户列表()
        +showUserDetails() 显示用户详情()
        +editUserForm() 编辑用户表单()
        +manageUserRoles() 管理用户角色()
        +showBanUser() 显示禁用用户()
    }
    
    class UserController {
        +getAllUsers() 获取所有用户()
        +getUserById() 通过ID获取用户()
        +updateUser() 更新用户()
        +deleteUser() 删除用户()
        +searchUsers() 搜索用户()
    }
    
    class AuthController {
        +assignRole() 分配角色()
        +revokeRole() 撤销角色()
        +suspendUser() 暂停用户()
        +activateUser() 激活用户()
        +resetUserPassword() 重置用户密码()
    }
    
    class NotificationController {
        +notifyUser() 通知用户()
        +sendStatusChangeNotification() 发送状态变更通知()
        +sendPasswordResetNotification() 发送密码重置通知()
    }
    
    SystemAdmin "1" -- "0..*" User : manages 管理
    User "0..*" -- "0..*" Role : has 拥有
    Role "0..*" -- "0..*" Permission : includes 包括
    UserManagementView -- UserController : uses 使用
    UserManagementView -- AuthController : uses 使用
    AuthController -- NotificationController : uses 使用
    UserController -- User : manages 管理
    AuthController -- Role : manages 管理
    AuthController -- Permission : manages 管理
```

10. 系统配置分析类图

```mermaid
classDiagram
    class SystemAdmin {
        +bigint admin_id 管理员ID
        +varchar username 用户名
        +enum admin_level 管理员级别
        +getAdminPermissions() 获取管理员权限()
        +configureSystem() 配置系统()
    }
    
    class SystemConfig {
        +bigint config_id 配置ID
        +varchar config_key 配置键
        +varchar config_value 配置值
        +text description 描述
        +enum config_type 配置类型
        +datetime updated_at 更新时间
        +getConfigValue() 获取配置值()
        +updateConfig() 更新配置()
        +validateConfig() 验证配置()
    }
    
    class ConfigCategory {
        +bigint category_id 类别ID
        +varchar category_name 类别名称
        +text description 描述
        +getCategoryConfigs() 获取类别配置()
        +addConfig() 添加配置()
    }
    
    class ConfigChangeLog {
        +bigint log_id 日志ID
        +bigint config_id 配置ID
        +bigint admin_id 管理员ID
        +varchar old_value 旧值
        +varchar new_value 新值
        +datetime changed_at 变更时间
        +text change_reason 变更原因
        +logChange() 记录变更()
        +getChangeHistory() 获取变更历史()
    }
    
    class System {
        +varchar system_version 系统版本
        +enum system_status 系统状态
        +json configuration 配置
        +getSystemInfo() 获取系统信息()
        +applyConfiguration() 应用配置()
        +validateSystemState() 验证系统状态()
    }
    
    class ConfigView {
        +displayConfigCategories() 显示配置类别()
        +showCategoryConfigs() 显示类别配置()
        +editConfigForm() 编辑配置表单()
        +showConfigHistory() 显示配置历史()
        +confirmConfigChange() 确认配置变更()
    }
    
    class ConfigController {
        +getConfigCategories() 获取配置类别()
        +getCategoryConfigs() 获取类别配置()
        +updateConfig() 更新配置()
        +validateConfigUpdate() 验证配置更新()
        +getConfigHistory() 获取配置历史()
    }
    
    class SystemController {
        +applyConfigs() 应用配置()
        +restartServices() 重启服务()
        +backupConfig() 备份配置()
        +restoreConfig() 恢复配置()
        +validateSystemConfig() 验证系统配置()
    }
    
    class NotificationController {
        +notifyAdmins() 通知管理员()
        +broadcastMaintenance() 广播维护()
        +sendConfigChangeAlert() 发送配置变更警报()
    }
    
    SystemAdmin "1" -- "0..*" ConfigChangeLog : makes 做出
    SystemConfig "1" -- "0..*" ConfigChangeLog : has 拥有
    ConfigCategory "1" -- "0..*" SystemConfig : contains 包含
    System -- SystemConfig : applies 应用
    ConfigView -- ConfigController : uses 使用
    ConfigView -- SystemController : uses 使用
    ConfigController -- NotificationController : uses 使用
    SystemController -- System : manages 管理
    ConfigController -- SystemConfig : manages 管理
    ConfigController -- ConfigCategory : manages 管理
    ConfigController -- ConfigChangeLog : manages 管理
```
