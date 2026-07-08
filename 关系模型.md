
# 校园社交平台概念数据模型

## 1. 用户相关模型

### 1.1 用户与用户关系模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
        varchar username "用户名"
        char password "密码"
        varchar email "邮箱"
        varchar phone "电话"
        varchar real_name "真实姓名"
        varchar nickname "昵称"
        varchar avatar_url "头像URL"
        text bio "个人简介"
        enum gender "性别"
        date birth_date "出生日期"
        bigint school_id FK "学校ID"
        bigint faculty_id FK "学院ID"
        varchar student_id "学号"
        year enrollment_year "入学年份"
        enum user_status "用户状态"
    }
    
    用户关系 {
        bigint relation_id PK "关系ID"
        bigint user_id FK "用户ID"
        bigint related_user_id FK "关联用户ID"
        enum relation_type "关系类型"
    }
    
    用户 ||--o{ 用户关系 : "发起关系"
    用户 }o--o{ 用户关系 : "被关联"
```

## 2. 学校与学院模型

```mermaid
erDiagram
    学校 {
        bigint school_id PK "学校ID"
        varchar school_name "学校名称"
        varchar school_code "学校代码"
        varchar province "省份"
        varchar city "城市"
        text address "地址"
        enum school_type "学校类型"
        year founding_year "成立年份"
        varchar logo_url "校徽URL"
    }
    
    学院 {
        bigint faculty_id PK "学院ID"
        bigint school_id FK "学校ID"
        varchar faculty_name "学院名称"
        varchar faculty_code "学院代码"
        varchar director "院长"
        varchar faculty_type "学院类型"
        year founding_year "成立年份"
        text description "描述"
    }
    
    学校 ||--o{ 学院 : "设有"
    学校 ||--o{ 用户 : "拥有"
    学院 ||--o{ 用户 : "包含"
```

## 3. 内容发布模型

### 3.1 动态发布模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    动态 {
        bigint post_id PK "动态ID"
        bigint user_id FK "用户ID"
        text content "内容"
        enum post_type "动态类型"
        enum visibility "可见性"
        varchar location "位置"
        int like_count "点赞数"
        int comment_count "评论数"
        int share_count "分享数"
    }
    
    动态媒体 {
        bigint media_id PK "媒体ID"
        bigint post_id FK "动态ID"
        enum media_type "媒体类型"
        varchar media_url "媒体URL"
        varchar thumbnail_url "缩略图URL"
        tinyint display_order "显示顺序"
    }
    
    用户 ||--o{ 动态 : "发布"
    动态 ||--o{ 动态媒体 : "包含"
```

### 3.2 商品发布模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    商品 {
        bigint product_id PK "商品ID"
        bigint user_id FK "用户ID"
        varchar title "标题"
        text description "描述"
        decimal price "价格"
        decimal original_price "原价"
        varchar category "类别"
        enum condition_type "商品状况"
        varchar location "位置"
        boolean is_negotiable "是否可议价"
        boolean is_sold "是否已售"
    }
    
    商品图片 {
        bigint image_id PK "图片ID"
        bigint product_id FK "商品ID"
        varchar image_url "图片URL"
        tinyint display_order "显示顺序"
    }
    
    用户 ||--o{ 商品 : "发布"
    商品 ||--o{ 商品图片 : "包含"
```

### 3.3 悬赏任务模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    悬赏任务 {
        bigint mission_id PK "任务ID"
        bigint user_id FK "用户ID"
        varchar title "标题"
        text description "描述"
        decimal reward "悬赏金额"
        varchar category "类别"
        enum difficulty "难度"
        decimal estimated_hours "预计时间"
        varchar location "位置"
        datetime deadline "截止时间"
        enum status "状态"
    }
    
    悬赏接取 {
        bigint take_id PK "接取ID"
        bigint mission_id FK "任务ID"
        bigint taker_id FK "接取人ID"
        enum status "状态"
        text apply_message "申请消息"
        datetime completed_at "完成时间"
        tinyint rating "评分"
        text review "评价"
    }
    
    用户 ||--o{ 悬赏任务 : "发布"
    悬赏任务 ||--o{ 悬赏接取 : "被接取"
    用户 ||--o{ 悬赏接取 : "接取"
```

## 4. 社交互动模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    评论 {
        bigint comment_id PK "评论ID"
        enum content_type "内容类型"
        bigint content_id "内容ID"
        bigint user_id FK "用户ID"
        bigint parent_id FK "父评论ID"
        text content "内容"
        int like_count "点赞数"
    }
    
    点赞 {
        bigint like_id PK "点赞ID"
        enum content_type "内容类型"
        bigint content_id "内容ID"
        bigint user_id FK "用户ID"
    }
    
    分享 {
        bigint share_id PK "分享ID"
        enum content_type "内容类型"
        bigint content_id "内容ID"
        bigint user_id FK "用户ID"
        enum share_platform "分享平台"
        text share_content "分享内容"
    }
    
    打赏 {
        bigint reward_id PK "打赏ID"
        enum content_type "内容类型"
        bigint content_id "内容ID"
        bigint sender_id FK "发送人ID"
        bigint receiver_id FK "接收人ID"
        decimal amount "金额"
        text message "留言"
        enum status "状态"
    }
    
    用户 ||--o{ 评论 : "发表"
    评论 ||--o{ 评论 : "回复"
    用户 ||--o{ 点赞 : "点赞"
    用户 ||--o{ 分享 : "分享"
    用户 ||--o{ 打赏 : "发送"
    用户 }o--o{ 打赏 : "接收"
```

## 5. 活动与社团模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    学校 {
        bigint school_id PK "学校ID"
    }
    
    活动 {
        bigint activity_id PK "活动ID"
        varchar title "标题"
        text description "描述"
        enum organizer_type "组织者类型"
        bigint organizer_id "组织者ID"
        varchar location "位置"
        datetime start_time "开始时间"
        datetime end_time "结束时间"
        int max_participants "最大参与人数"
        int current_participants "当前参与人数"
        datetime registration_deadline "报名截止时间"
    }
    
    活动参与 {
        bigint participation_id PK "参与ID"
        bigint activity_id FK "活动ID"
        bigint user_id FK "用户ID"
        enum status "状态"
        datetime check_in_time "签到时间"
        text feedback "反馈"
        tinyint rating "评分"
    }
    
    社团 {
        bigint club_id PK "社团ID"
        bigint school_id FK "学校ID"
        varchar club_name "社团名称"
        varchar club_type "社团类型"
        text description "描述"
        date founding_date "成立日期"
        varchar logo_url "标志URL"
        int member_count "成员数量"
    }
    
    社团成员 {
        bigint membership_id PK "成员身份ID"
        bigint club_id FK "社团ID"
        bigint user_id FK "用户ID"
        enum role "角色"
        date join_date "加入日期"
        date exit_date "退出日期"
        enum status "状态"
    }
    
    学校 ||--o{ 社团 : "拥有"
    社团 ||--o{ 社团成员 : "包含"
    用户 ||--o{ 社团成员 : "加入"
    活动 ||--o{ 活动参与 : "参与"
    用户 ||--o{ 活动参与 : "参加"
```

## 6. 通信与通知模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    消息 {
        bigint message_id PK "消息ID"
        bigint sender_id FK "发送者ID"
        bigint receiver_id FK "接收者ID"
        text content "内容"
        boolean has_read "是否已读"
    }
    
    通知 {
        bigint notification_id PK "通知ID"
        bigint user_id FK "用户ID"
        bigint sender_id FK "发送者ID"
        enum notification_type "通知类型"
        text content "内容"
        enum content_type "内容类型"
        bigint content_id "内容ID"
        boolean has_read "是否已读"
    }
    
    用户 ||--o{ 消息 : "发送"
    用户 }o--o{ 消息 : "接收"
    用户 ||--o{ 通知 : "接收"
```

## 7. 标签与分类模型

```mermaid
erDiagram
    标签 {
        bigint tag_id PK "标签ID"
        varchar tag_name "标签名称"
        enum tag_type "标签类型"
    }
    
    内容标签关联 {
        bigint content_tag_id PK "内容标签ID"
        enum content_type "内容类型"
        bigint content_id "内容ID"
        bigint tag_id FK "标签ID"
    }
    
    标签 ||--o{ 内容标签关联 : "应用于"
```

## 8. 订单与交易模型

```mermaid
erDiagram
    用户 {
        bigint user_id PK "用户ID"
    }
    
    商品 {
        bigint product_id PK "商品ID"
    }
    
    悬赏任务 {
        bigint mission_id PK "任务ID"
    }
    
    订单 {
        bigint order_id PK "订单ID"
        bigint buyer_id FK "买家ID"
        bigint seller_id FK "卖家ID"
        bigint product_id FK "商品ID"
        bigint mission_id FK "任务ID"
        enum order_type "订单类型"
        decimal amount "金额"
        enum status "状态"
        varchar payment_method "支付方式"
        datetime payment_time "支付时间"
        datetime completion_time "完成时间"
        text buyer_address "买家地址"
        varchar shipping_method "配送方式"
        varchar tracking_number "追踪号码"
    }
    
    用户 ||--o{ 订单 : "购买"
    用户 }o--o{ 订单 : "销售"
    商品 ||--o{ 订单 : "下单"
    悬赏任务 ||--o{ 订单 : "下单"
```
