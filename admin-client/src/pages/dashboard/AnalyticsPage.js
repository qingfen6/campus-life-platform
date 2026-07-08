import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { Line, Bar, Pie } from '@ant-design/plots';

// 模拟数据
const overviewData = [
  { title: '注册用户总数', value: 1234 },
  { title: '活跃用户数', value: 234 },
  { title: '学校总数', value: 56 },
  { title: '今日新增用户', value: 12 },
];

const userGrowthData = [
  { date: '2024-06-01', count: 10 },
  { date: '2024-06-02', count: 15 },
  { date: '2024-06-03', count: 20 },
  { date: '2024-06-04', count: 18 },
  { date: '2024-06-05', count: 25 },
];

const contentGrowthData = [
  { date: '2024-06-01', count: 5 },
  { date: '2024-06-02', count: 8 },
  { date: '2024-06-03', count: 12 },
  { date: '2024-06-04', count: 10 },
  { date: '2024-06-05', count: 15 },
];

const userTypeData = [
  { type: '学生', value: 1000 },
  { type: '教师', value: 200 },
  { type: '管理员', value: 34 },
];

const schoolRegionData = [
  { province: '北京', count: 10 },
  { province: '上海', count: 8 },
  { province: '江苏', count: 7 },
  { province: '浙江', count: 6 },
];

const recentUsers = [
  { user_id: 1, username: '张三', real_name: '张三', email: 'zhangsan@example.com', created_at: '2024-06-05' },
  { user_id: 2, username: '李四', real_name: '李四', email: 'lisi@example.com', created_at: '2024-06-05' },
];

const recentSchools = [
  { school_id: 1, school_name: '北京大学', school_code: 'PKU', province: '北京', city: '北京', created_at: '2024-06-05' },
  { school_id: 2, school_name: '清华大学', school_code: 'THU', province: '北京', city: '北京', created_at: '2024-06-04' },
];

const AnalyticsPage = () => {
  // 折线图配置
  const userGrowthConfig = {
    data: userGrowthData,
    xField: 'date',
    yField: 'count',
    point: { size: 5, shape: 'diamond' },
    smooth: true,
    height: 220,
    title: { visible: true, text: '用户增长趋势' },
  };
  // 柱状图配置
  const contentGrowthConfig = {
    data: contentGrowthData,
    xField: 'date',
    yField: 'count',
    height: 220,
    title: { visible: true, text: '内容发布趋势' },
  };
  // 饼图配置
  const userTypeConfig = {
    data: userTypeData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: { type: 'outer', content: '{name} {percentage}' },
    height: 220,
    title: { visible: true, text: '用户类型分布' },
  };
  // 条形图配置
  const schoolRegionConfig = {
    data: schoolRegionData,
    xField: 'count',
    yField: 'province',
    seriesField: 'province',
    height: 220,
    title: { visible: true, text: '学校地域分布' },
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {overviewData.map((item, idx) => (
          <Col span={6} key={item.title}>
            <Card>
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>
      {/* 趋势图 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="用户增长趋势">
            <Line {...userGrowthConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="内容发布趋势">
            <Bar {...contentGrowthConfig} />
          </Card>
        </Col>
      </Row>
      {/* 分布图 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="用户类型分布">
            <Pie {...userTypeConfig} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="学校地域分布">
            <Bar {...schoolRegionConfig} />
          </Card>
        </Col>
      </Row>
      {/* 明细表 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近注册用户">
            <Table
              dataSource={recentUsers}
              rowKey="user_id"
              columns={[
                { title: '用户名', dataIndex: 'username' },
                { title: '真实姓名', dataIndex: 'real_name' },
                { title: '邮箱', dataIndex: 'email' },
                { title: '注册时间', dataIndex: 'created_at' },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="新增学校">
            <Table
              dataSource={recentSchools}
              rowKey="school_id"
              columns={[
                { title: '学校名称', dataIndex: 'school_name' },
                { title: '学校代码', dataIndex: 'school_code' },
                { title: '省份', dataIndex: 'province' },
                { title: '城市', dataIndex: 'city' },
                { title: '录入时间', dataIndex: 'created_at' },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsPage; 