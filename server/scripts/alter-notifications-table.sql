-- 为notifications表添加action字段
ALTER TABLE notifications 
ADD action VARCHAR(50);

-- 为notifications表添加data字段(JSON数据)
ALTER TABLE notifications 
ADD data TEXT;

-- 更新已有的mission类型通知，根据不同情况设置action值
UPDATE notifications 
SET action = 'application' 
WHERE notification_type = 'mission' 
AND content LIKE '%申请接受你的任务%';

UPDATE notifications 
SET action = 'accepted' 
WHERE notification_type = 'mission' 
AND content LIKE '%已被接受%';

UPDATE notifications 
SET action = 'rejected' 
WHERE notification_type = 'mission' 
AND content LIKE '%被拒绝了%';

UPDATE notifications 
SET action = 'completed' 
WHERE notification_type = 'mission' 
AND content LIKE '%已被标记为完成%';

-- 为其他通知类型设置默认action
UPDATE notifications 
SET action = 'general' 
WHERE action IS NULL; 