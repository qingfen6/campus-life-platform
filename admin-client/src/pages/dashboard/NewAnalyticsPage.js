import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, message, Button, Select } from 'antd';
import { Line, Bar, Pie } from '@ant-design/plots';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import api from '../../services/api'; // 确保这个路径和导出是正确的

const { Option } = Select;

const NewAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [contentGrowthData, setContentGrowthData] = useState([]);
  const [userTypeData, setUserTypeData] = useState([]);
  const [schoolRegionData, setSchoolRegionData] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSchools, setRecentSchools] = useState([]);

  const [schoolChartType, setSchoolChartType] = useState('bar'); // 'bar' or 'map'
  const [userGrowthType, setUserGrowthType] = useState('day'); // 新增

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const overviewRes = await api.get('/admin/statistics/overview');
        if (overviewRes && typeof overviewRes === 'object' && overviewRes !== null && !Array.isArray(overviewRes)) {
          setOverviewData(overviewRes);
        } else {
          console.warn('Overview data is not a valid object or is missing:', overviewRes);
          setOverviewData({});
        }

        const userGrowthRes = await api.get(`/admin/statistics/user-growth?type=${userGrowthType}`);
        if (Array.isArray(userGrowthRes)) {
          // 按不同类型格式化日期
          let formatted = userGrowthRes;
          if (userGrowthType === 'day') {
            formatted = userGrowthRes.map(item => ({ ...item, date: new Date(item.date).toLocaleDateString() }));
          }
          setUserGrowthData(formatted);
        } else {
          console.warn('User growth data is not an array or is undefined:', userGrowthRes);
          setUserGrowthData([]);
        }

        const contentGrowthRes = await api.get('/admin/statistics/content-growth');
        if (Array.isArray(contentGrowthRes)) {
          setContentGrowthData(contentGrowthRes.map(item => ({ ...item, date: new Date(item.date).toLocaleDateString() })));
        } else {
          console.warn('Content growth data is not an array or is undefined:', contentGrowthRes);
          setContentGrowthData([]);
        }
        
        const userTypeRes = await api.get('/admin/statistics/user-type-distribution');
        if (Array.isArray(userTypeRes)) {
          setUserTypeData(userTypeRes);
        } else {
          console.warn('User type data is not an array or is undefined:', userTypeRes);
          setUserTypeData([]);
        }

        const schoolRegionRes = await api.get('/admin/statistics/school-region-distribution');
        console.log('获取到的学校地域分布数据:', schoolRegionRes); // 添加日志
        
        if (Array.isArray(schoolRegionRes)) {
          // 按学校数量降序排序
          const sortedData = schoolRegionRes.sort((a, b) => b.count - a.count);
          console.log('排序后的数据:', sortedData); // 添加日志
          setSchoolRegionData(sortedData);
        } else {
          console.warn('学校地域分布数据格式不正确:', schoolRegionRes);
          setSchoolRegionData([]);
        }

        const recentUsersRes = await api.get('/admin/statistics/recent-users?limit=5');
        if (Array.isArray(recentUsersRes)) {
          setRecentUsers(recentUsersRes.map(user => ({ ...user, created_at: new Date(user.created_at).toLocaleString() })));
        } else {
          console.warn('Recent users data is not an array or is undefined:', recentUsersRes);
          setRecentUsers([]);
        }

        const recentSchoolsRes = await api.get('/admin/statistics/recent-schools?limit=5');
        if (Array.isArray(recentSchoolsRes)) {
          setRecentSchools(recentSchoolsRes.map(school => ({ ...school, created_at: new Date(school.created_at).toLocaleString()})));
        } else {
          console.warn('Recent schools data is not an array or is undefined:', recentSchoolsRes);
          setRecentSchools([]);
        }

      } catch (error) {
        console.error("获取数据失败:", error);
        message.error('加载数据失败: ' + (error.response?.data?.message || error.message));
        setOverviewData({});
        setUserGrowthData([]);
        setContentGrowthData([]);
        setUserTypeData([]);
        setSchoolRegionData([]);
        setRecentUsers([]);
        setRecentSchools([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [userGrowthType]); // 依赖 userGrowthType

  useEffect(() => {
    // 注册中国地图数据
    const registerMap = async () => {
      try {
        const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
        const geoJson = await response.json();
        echarts.registerMap('china', geoJson);
      } catch (error) {
        console.error('加载地图数据失败:', error);
        message.error('加载地图数据失败');
      }
    };
    registerMap();
  }, []);

  // 图表配置 (与旧 AnalyticsPage 类似，但数据从 state 获取)
  const userGrowthConfig = {
    data: userGrowthData,
    xField: 'date',
    yField: 'count',
    point: { size: 5, shape: 'diamond' },
    smooth: true,
    height: 220,
  };

  const contentGrowthConfig = {
    data: contentGrowthData,
    xField: 'date',
    yField: 'count',
    height: 220,
  };

  const userTypeConfig = {
    data: userTypeData, // userTypeData 现在应该是 [{ type: '类型', value: 数量 }]
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: { type: 'outer', content: '{name} {percentage}' },
    height: 220,
  };

  // 动态分组与色阶生成函数
  function getColorSteps(data, key = 'count') {
    if (!data || data.length === 0) return ['#e0f3f8'];
    const values = data.map(item => item[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    // 设定分组数
    let groupCount = 5;
    if (range <= 2) groupCount = 3;
    else if (range <= 5) groupCount = 4;
    else if (range <= 10) groupCount = 5;
    else groupCount = 7;
    // 主色阶（高对比度蓝色系）
    const baseColors = ['#e3f2fd', '#90caf9', '#42a5f5', '#1976d2', '#1565c0', '#0d47a1', '#001f4b'];
    // 取需要的色阶
    const colorSteps = baseColors.slice(0, groupCount);
    // 计算分组区间
    const step = range / (groupCount - 1 || 1);
    const breaks = Array.from({length: groupCount}, (_, i) => min + i * step);
    return { colorSteps, breaks, min, max, groupCount };
  }

  // 生成分段 pieces
  function getMapPieces(data, key = 'count', colorSteps) {
    if (!data || data.length === 0) return [];
    const values = data.map(item => item[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // 0单独分段
    let pieces = [
      { min: 0, max: 0, label: '0所', color: colorSteps[0] }
    ];
    // 其余分段
    const nonZero = values.filter(v => v > 0);
    if (nonZero.length === 0) return pieces;
    const nMin = Math.min(...nonZero);
    const nMax = Math.max(...nonZero);
    const range = nMax - nMin;
    let groupCount = colorSteps.length - 1;
    if (range <= 2) groupCount = 2;
    else if (range <= 5) groupCount = 3;
    else if (range <= 10) groupCount = 4;
    else groupCount = colorSteps.length - 1;
    const step = Math.ceil((nMax - nMin + 1) / groupCount);
    for (let i = 0; i < groupCount; i++) {
      const from = nMin + i * step;
      const to = i === groupCount - 1 ? nMax : from + step - 1;
      pieces.push({ min: from, max: to, label: `${from}~${to}所`, color: colorSteps[i + 1] });
    }
    return pieces;
  }

  // 获取色阶和分组
  const colorInfo = getColorSteps(schoolRegionData, 'count');
  const mapPieces = getMapPieces(schoolRegionData, 'count', colorInfo.colorSteps);

  // 柱状图颜色函数，参数为数据项 datum
  const barColorFn = (datum) => {
    const piece = mapPieces.find(p => datum.count >= p.min && datum.count <= p.max);
    return piece ? piece.color : colorInfo.colorSteps[0];
  };

  // 学校地域分布柱状图配置
  const schoolRegionBarConfig = {
    data: schoolRegionData,
    xField: 'count',
    yField: 'province',
    seriesField: 'province',
    height: 350,
    legend: false,
    label: {
      position: 'right',
      style: {
        fill: '#000',
        fontSize: 12,
      },
    },
    color: barColorFn,
    meta: {
      count: {
        alias: '学校数量',
      },
      province: {
        alias: '省份',
      },
    },
    tooltip: {
      formatter: (datum) => {
        const data = schoolRegionData.find(item => item.province === datum.province);
        return {
          name: datum.province,
          value: [
            `学校数量: ${data.count}所`,
            `学生数量: ${data.studentCount}人`,
            `活跃学生: ${data.activeStudents}人`,
            `学院数量: ${data.facultyCount}个`,
            `活跃度: ${data.activityRate}%`
          ].join('\n')
        };
      },
    },
  };

  // 学校地域分布地图配置
  const schoolRegionMapConfig = {
    title: {
      text: '学校地域分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        // 兼容"北京市"与"北京"这种情况
        const normalize = name => name.replace(/(省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区)$/g, '');
        const data = schoolRegionData.find(
          item => normalize(item.province) === normalize(params.name)
        );
        if (!data) return params.name;
        return [
          `${params.name}`,
          `学校数量: ${data.count}所`,
          `学生数量: ${data.studentCount}人`,
          `活跃学生: ${data.activeStudents}人`,
          `学院数量: ${data.facultyCount}个`,
          `活跃度: ${data.activityRate}%`
        ].join('<br/>');
      }
    },
    visualMap: {
      type: 'piecewise',
      pieces: mapPieces,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: false
    },
    series: [
      {
        name: '学校分布',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: {
          label: {
            show: true
          }
        },
        data: schoolRegionData.map(item => ({
          name: item.province,
          value: item.count,
          studentCount: item.studentCount,
          activeStudents: item.activeStudents,
          facultyCount: item.facultyCount,
          activityRate: item.activityRate
        })),
        label: {
          show: true,
          fontSize: 8,
          formatter: (params) => {
            const data = schoolRegionData.find(item => item.province === params.name);
            return data ? `${params.name}\n${data.count}所` : params.name;
          }
        },
        itemStyle: {
          areaColor: '#E6F7FF',
          borderColor: '#91D5FF'
        },
        emphasis: {
          itemStyle: {
            areaColor: '#91D5FF'
          },
          label: {
            show: true,
            fontSize: 10
          }
        }
      }
    ]
  };
  
  const schoolRegionCardTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      学校地域分布
      <Button 
        onClick={() => setSchoolChartType(prev => prev === 'bar' ? 'map' : 'bar')} 
        size="small"
      >
        切换到{schoolChartType === 'bar' ? '地图热力图' : '柱状图'}
      </Button>
    </div>
  );

  // 用户增长趋势下拉选项
  const userGrowthTypeOptions = [
    { label: '按日（近30日）', value: 'day' },
    { label: '按月（近12个月）', value: 'month' },
    { label: '按年（近3年）', value: 'year' },
  ];

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 统计卡片 */}
      {overviewData && Object.keys(overviewData).length > 0 ? (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}><Card><Statistic title="注册用户总数" value={overviewData.totalUsers} loading={overviewData.totalUsers === undefined} /></Card></Col>
          <Col span={6}><Card><Statistic title="活跃用户数 (近7日)" value={overviewData.activeUsers} loading={overviewData.activeUsers === undefined} /></Card></Col>
          <Col span={6}><Card><Statistic title="学校总数" value={overviewData.totalSchools} loading={overviewData.totalSchools === undefined} /></Card></Col>
          <Col span={6}><Card><Statistic title="今日新增用户" value={overviewData.newUsersToday} loading={overviewData.newUsersToday === undefined} /></Card></Col>
        </Row>
      ) : (
        !loading && <Row gutter={16} style={{ marginBottom: 24 }}><Col span={24}><Card><p>概览数据加载失败或为空。</p></Card></Col></Row>
      )}

      {/* 趋势图 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title={<div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span>用户增长趋势</span>
            <Select
              size="small"
              style={{ width: 140 }}
              value={userGrowthType}
              onChange={setUserGrowthType}
              options={userGrowthTypeOptions}
            />
          </div>}>
            {userGrowthData.length > 0 ? <Line {...userGrowthConfig} /> : <p>暂无数据</p>}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="内容发布趋势 (近30日)">
            {contentGrowthData.length > 0 ? <Bar {...contentGrowthConfig} /> : <p>暂无数据</p>}
          </Card>
        </Col>
      </Row>

      {/* 分布图 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="用户类型分布">
            {userTypeData.length > 0 ? <Pie {...userTypeConfig} /> : <p>用户类型数据暂不可用或无数据</p>}
          </Card>
        </Col>
        <Col span={12}>
          <Card title={schoolRegionCardTitle}>
            {schoolChartType === 'bar' ? (
              schoolRegionData.length > 0 ? (
                <div style={{ height: '350px' }}>
                  <Bar {...schoolRegionBarConfig} />
                </div>
              ) : <p>暂无数据</p>
            ) : (
              schoolRegionData.length > 0 ? (
                <div style={{ height: '350px' }}>
                  <ReactECharts
                    option={schoolRegionMapConfig}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ 
                      renderer: 'canvas',
                      devicePixelRatio: window.devicePixelRatio,
                      useDirtyRect: true
                    }}
                    notMerge={true}
                    lazyUpdate={true}
                  />
                </div>
              ) : <p>暂无数据</p>
            )}
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
                { title: '用户名', dataIndex: 'username', key: 'username' },
                { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
                { title: '邮箱', dataIndex: 'email', key: 'email' },
                { title: '注册时间', dataIndex: 'created_at', key: 'created_at' },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近新增学校">
            <Table
              dataSource={recentSchools}
              rowKey="school_id"
              columns={[
                { title: '学校名称', dataIndex: 'school_name', key: 'school_name' },
                { title: '学校代码', dataIndex: 'school_code', key: 'school_code' },
                { title: '省份', dataIndex: 'province', key: 'province' },
                { title: '城市', dataIndex: 'city', key: 'city' },
                { title: '录入时间', dataIndex: 'created_at', key: 'created_at' },
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

export default NewAnalyticsPage; 