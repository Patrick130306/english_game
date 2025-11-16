import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const Review = () => {
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadReviewWords = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 获取需要复习的单词
        const response = await axios.get('/study/scheduled');
        
        if (response.data.length === 0) {
          setError('当前没有需要复习的单词');
          setLoading(false);
          return;
        }
        
        // 打乱单词顺序
        const shuffledWords = [...response.data].sort(() => Math.random() - 0.5);
        setWords(shuffledWords);
      } catch (err) {
        setError('加载复习单词失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadReviewWords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentWord = words[currentWordIndex];
    
    // 简单的答案检查（实际项目中可以更复杂，考虑大小写、部分匹配等）
    const isCorrect = currentWord.translation.toLowerCase().includes(answer.toLowerCase()) || 
                     answer.toLowerCase().includes(currentWord.translation.toLowerCase());
    
    // 提供反馈
    setFeedback({
      correct: isCorrect,
      correctAnswer: currentWord.translation,
      userAnswer: answer
    });
    
    // 记录复习结果
    try {
      await axios.post('/study/record-review', {
        wordId: currentWord._id,
        correct: isCorrect
      });
    } catch (err) {
      console.error('保存复习记录失败:', err);
    }
  };

  const handleNext = () => {
    // 检查是否复习完所有单词
    if (currentWordIndex >= words.length - 1) {
      setReviewCompleted(true);
      return;
    }
    
    // 重置状态，进入下一个单词
    setCurrentWordIndex(currentWordIndex + 1);
    setAnswer('');
    setFeedback(null);
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">加载中...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="info">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/decks')}>
          浏览单词本
        </Button>
      </Container>
    );
  }

  if (reviewCompleted) {
    return (
      <Container className="mt-5">
        <Card className="text-center">
          <Card.Body>
            <h2>复习完成！</h2>
            <p className="mt-4">您已完成所有待复习单词的复习</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/')}>返回仪表盘</Button>
              <Button variant="outline-secondary" className="ml-2" onClick={() => window.location.reload()}>
                查看更多复习单词
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentWord = words[currentWordIndex];
  const progress = ((currentWordIndex + 1) / words.length) * 100;

  return (
    <Container className="mt-5">
      <div className="mb-4">
        <h2>单词复习</h2>
        <div className="d-flex justify-content-between text-muted">
          <span>{currentWordIndex + 1} / {words.length}</span>
          <span>进度: {Math.round(progress)}%</span>
        </div>
        <div className="progress mt-2">
          <div 
            className="progress-bar progress-bar-striped bg-primary" 
            role="progressbar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="review-card shadow-lg">
        <Card.Body>
          <div className="d-flex justify-content-center mb-4">
            <Button 
              variant="outline-info" 
              size="sm" 
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance(currentWord.word);
                window.speechSynthesis.speak(utterance);
              }}
            >
              🔊 发音
            </Button>
          </div>

          <div className="text-center mb-6">
            <h3 className="display-4">{currentWord.word}</h3>
          </div>

          {feedback ? (
            <div>
              <div className={`p-3 rounded ${feedback.correct ? 'bg-success text-white' : 'bg-danger text-white'} mb-4`}>
                {feedback.correct ? '✅ 回答正确！' : '❌ 回答错误'}
              </div>
              
              <div className="mb-3">
                <h4>正确翻译:</h4>
                <p className="text-lg">{feedback.correctAnswer}</p>
              </div>
              
              {currentWord.example && (
                <div className="mb-4">
                  <h4>例句:</h4>
                  <p className="italic text-muted">{currentWord.example}</p>
                </div>
              )}
              
              <Button variant="primary" size="lg" onClick={handleNext} className="w-100 mt-4">
                下一个
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="answerForm">
                <Form.Label>请输入单词的中文意思:</Form.Label>
                <Form.Control
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="请输入翻译"
                  required
                  autoFocus
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100 mt-4">
                提交答案
              </Button>
            </Form>
          )}
        </Card.Body>
      </Card>

      <div className="mt-4 text-center">
        <Button variant="outline-secondary" onClick={() => navigate('/')}>
          退出复习
        </Button>
      </div>
    </Container>
  );
};

export default Review;