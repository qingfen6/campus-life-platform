/**
 * 日历卡片组件
 * 
 * 功能：
 * - 展示活动日历
 * - 支持事件标记
 * - 支持日历订阅
 * - 支持事件提醒
 * - 响应式设计
 * - 暗色模式支持
 */

import React from 'react';
import { Card, Calendar, Badge, Button, Space, Tooltip } from 'antd';
import { 
  CalendarOutlined,
  BellOutlined,
  LinkOutlined,
  TeamOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import '../../assets/styles/club.css';

const CalendarCard = ({ 
  events,
  onSelectDate,
  onSubscribe,
  onAddReminder
}) => {
  // 日期单元格渲染函数
  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const dayEvents = events.filter(event => event.date === date);

    return (
      <ul className="calendar-events">
        {dayEvents.map(event => (
          <li key={event.id}>
            <Badge 
              status={event.type === 'activity' ? 'success' : 'processing'} 
              text={event.title}
            />
          </li>
        ))}
      </ul>
    );
  };

  // 日期选择处理函数
  const handleSelect = (date) => {
    onSelectDate(date);
  };

  return (
    <Card
      className="calendar-card"
      title={
        <Space>
          <CalendarOutlined />
          活动日历
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="添加提醒">
            <Button 
              icon={<BellOutlined />}
              onClick={onAddReminder}
            />
          </Tooltip>
          <Tooltip title="订阅日历">
            <Button 
              icon={<LinkOutlined />}
              onClick={onSubscribe}
            />
          </Tooltip>
        </Space>
      }
    >
      <Calendar
        className="activity-calendar"
        onSelect={handleSelect}
        dateCellRender={dateCellRender}
        fullscreen={false}
        headerRender={({ value, onChange }) => (
          <div className="calendar-header">
            <Space>
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => onChange(value.clone().subtract(1, 'month'))}
              >
                上个月
              </Button>
              <span>{value.format('YYYY年MM月')}</span>
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => onChange(value.clone().add(1, 'month'))}
              >
                下个月
              </Button>
            </Space>
          </div>
        )}
      />

      <div className="calendar-legend">
        <Space>
          <Badge status="success" text="活动" />
          <Badge status="processing" text="招新" />
          <Badge status="warning" text="会议" />
          <Badge status="default" text="其他" />
        </Space>
      </div>

      <div className="upcoming-events">
        <h4>即将开始的活动</h4>
        <ul>
          {events
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5)
            .map(event => (
              <li key={event.id}>
                <Space>
                  <CalendarOutlined />
                  {event.date}
                  <TeamOutlined />
                  {event.club}
                  <EnvironmentOutlined />
                  {event.location}
                </Space>
              </li>
            ))}
        </ul>
      </div>
    </Card>
  );
};

export default CalendarCard; 