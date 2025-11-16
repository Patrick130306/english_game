import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, ListGroup, ProgressBar, Container } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { DeckContext } from '../context/DeckContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { decks, loading, fetchDecks } = useContext(DeckContext);
  const [stats, setStats] = useState({
    totalDecks: 0,
    totalWords: 0,
    wordsToReview: 0,
    todayProgress: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingStats(true);
        
        // 确保单词本已加载
        if (decks.length === 0 && !loading) {
          await fetchDecks();
        }

        // 获取需要复习的单词
        const reviewRes = await axios.get('/study/scheduled');
        const wordsToReview = reviewRes.data.length;

        // 计算总单词数（通过遍历所有单词本）
        let totalWords = 0;
        decks.forEach(deck => {
          totalWords += deck.words?.length || 0;
        });

        // 模拟今日进度（实际项目中应从API获取）
        const dailyGoal = user?.settings?.dailyGoal || 20;
        const todayProgress = Math.min(100, (wordsToReview / dailyGoal) * 100);

        setStats({
          totalDecks: decks.length,
          totalWords,
          wordsToReview,
          todayProgress
        });

        // 模拟最近活动数据（实际项目中应从API获取）
        const activity = [
          { id: 1, text: '创建了新单词本 "托福核心词汇"', time: '2小时前' },
          { id: 2, text: '学习了15个新单词', time: '昨天' },
          { id: 3, text: '成功复习了20个单词', time: '2天前' },
        ];
        setRecentActivity(activity);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, decks, loading, fetchDecks]);

  if (loadingStats) {
    return (
      <Container className="mt-5">
        <div className="text-center">加载中...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h1>欢迎回来，{user?.username}！</h1>
      
      {/* 统计卡片 */}
      <Row className="mt-4">
        <Col xs={12} md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title>单词本</Card.Title>
                <Card.Text className="text-3xl font-bold">{stats.totalDecks}</Card.Text>
              </div>
              <Link to="/decks" className="text-primary">查看全部</Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title>单词总数</Card.Title>
                <Card.Text className="text-3xl font-bold">{stats.totalWords}</Card.Text>
              </div>
              <Link to="/decks" className="text-primary">浏览单词</Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body className="d-flex flex-column justify-content-between">
              <div>
                <Card.Title>待复习</Card.Title>
                <Card.Text className="text-3xl font-bold">{stats.wordsToReview}</Card.Text>
              </div>
              <Link to="/review" className="text-primary">开始复习</Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xs={12} md={6} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>今日目标完成度</Card.Title>
              <ProgressBar 
                now={stats.todayProgress} 
                label={`${Math.round(stats.todayProgress)}%`}
                className="mt-2"
              />
              <p className="mt-2 text-sm">目标: {user?.settings?.dailyGoal || 20} 个单词</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 最近活动和快速操作 */}
      <Row className="mt-5">
        <Col md={6}>
          <Card>
            <Card.Header>最近活动</Card.Header>
            <ListGroup variant="flush">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <ListGroup.Item key={activity.id}>
                    <div>{activity.text}</div>
                    <small className="text-muted">{activity.time}</small>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>暂无活动记录</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>快速操作</Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Link to="/decks/create">
                  <Button variant="primary" size="lg" block>
                    创建新单词本
                  </Button>
                </Link>
                <Link to="/review">
                  <Button variant="success" size="lg" block>
                    开始复习
                  </Button>
                </Link>
                <Link to="/words/create">
                  <Button variant="info" size="lg" block>
                    添加新单词
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;