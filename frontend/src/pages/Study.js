import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Container, Button, Row, Col, Form, Alert } from 'react-bootstrap';
import { DeckContext } from '../context/DeckContext';
import axios from 'axios';

const Study = () => {
  const { id } = useParams();
  const { decks } = useContext(DeckContext);
  const [deck, setDeck] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [wordsToStudy, setWordsToStudy] = useState([]);
  const [studyRecord, setStudyRecord] = useState({});
  const [studyCompleted, setStudyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadStudyData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 查找当前单词本
        const foundDeck = decks.find(d => d._id === id);
        if (!foundDeck) {
          throw new Error('未找到单词本');
        }
        setDeck(foundDeck);

        // 从API获取需要学习的单词
        const response = await axios.get(`/study/words/${id}`);
        const words = response.data.length > 0 ? response.data : foundDeck.words || [];
        
        // 如果没有单词，显示错误
        if (words.length === 0) {
          throw new Error('该单词本中没有可学习的单词');
        }

        // 打乱单词顺序
        const shuffledWords = [...words].sort(() => Math.random() - 0.5);
        setWordsToStudy(shuffledWords);

        // 初始化学习记录
        const initialRecord = {};
        shuffledWords.forEach(word => {
          initialRecord[word._id] = {
            correct: false,
            attempts: 0
          };
        });
        setStudyRecord(initialRecord);

      } catch (err) {
        setError(err.message || '加载学习数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadStudyData();
  }, [id, decks]);

  const handleNextWord = () => {
    // 更新学习记录
    const updatedRecord = {
      ...studyRecord,
      [wordsToStudy[currentWordIndex]._id]: {
        ...studyRecord[wordsToStudy[currentWordIndex]._id],
        attempts: studyRecord[wordsToStudy[currentWordIndex]._id].attempts + 1
      }
    };
    setStudyRecord(updatedRecord);
    
    // 检查是否学完所有单词
    if (currentWordIndex >= wordsToStudy.length - 1) {
      finishStudy(updatedRecord);
      return;
    }
    
    setCurrentWordIndex(currentWordIndex + 1);
    setShowAnswer(false);
  };

  const handleMarkCorrect = () => {
    const updatedRecord = {
      ...studyRecord,
      [wordsToStudy[currentWordIndex]._id]: {
        correct: true,
        attempts: studyRecord[wordsToStudy[currentWordIndex]._id].attempts + 1
      }
    };
    setStudyRecord(updatedRecord);
    
    // 检查是否学完所有单词
    if (currentWordIndex >= wordsToStudy.length - 1) {
      finishStudy(updatedRecord);
      return;
    }
    
    setCurrentWordIndex(currentWordIndex + 1);
    setShowAnswer(false);
  };

  const finishStudy = async (finalRecord) => {
    try {
      // 发送学习记录到服务器
      await axios.post('/study/record', {
        deckId: id,
        studyRecord: finalRecord
      });
      
      setStudyCompleted(true);
    } catch (err) {
      console.error('保存学习记录失败:', err);
      // 即使保存失败，也显示完成界面
      setStudyCompleted(true);
    }
  };

  const calculateScore = () => {
    const correctCount = Object.values(studyRecord).filter(record => record.correct).length;
    const totalCount = Object.keys(studyRecord).length;
    return Math.round((correctCount / totalCount) * 100);
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
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/decks')}>返回单词本列表</Button>
      </Container>
    );
  }

  if (studyCompleted) {
    const score = calculateScore();
    return (
      <Container className="mt-5">
        <Card className="text-center">
          <Card.Body>
            <h2>学习完成！</h2>
            <div className="mt-4">
              <div className="display-4 mb-2">{score}%</div>
              <p>正确率</p>
            </div>
            <div className="mt-4">
              <Button variant="primary" className="mr-2" onClick={() => navigate(`/decks/${id}`)}>
                返回单词本
              </Button>
              <Button variant="success" onClick={() => window.location.reload()}>
                重新学习
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentWord = wordsToStudy[currentWordIndex];
  const progress = ((currentWordIndex + 1) / wordsToStudy.length) * 100;

  return (
    <Container className="mt-5">
      <div className="mb-4">
        <h2>学习: {deck.name}</h2>
        <div className="d-flex justify-content-between text-muted">
          <span>{currentWordIndex + 1} / {wordsToStudy.length}</span>
          <span>进度: {Math.round(progress)}%</span>
        </div>
        <div className="progress mt-2">
          <div 
            className="progress-bar progress-bar-striped bg-success" 
            role="progressbar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="study-card shadow-lg">
        <Card.Body>
          <div className="d-flex justify-content-center mb-4">
            {currentWord.pronunciation && (
              <Button 
                variant="outline-info" 
                size="sm" 
                onClick={() => {
                  // 简单的发音实现，实际项目中可以使用语音合成API
                  const utterance = new SpeechSynthesisUtterance(currentWord.word);
                  window.speechSynthesis.speak(utterance);
                }}
              >
                🔊 发音
              </Button>
            )}
          </div>

          <div className="text-center mb-4">
            <h3 className="display-4">{currentWord.word}</h3>
          </div>

          {showAnswer ? (
            <div>
              <div className="mb-3">
                <h4>翻译:</h4>
                <p className="text-lg">{currentWord.translation}</p>
              </div>
              {currentWord.example && (
                <div className="mb-4">
                  <h4>例句:</h4>
                  <p className="italic text-muted">{currentWord.example}</p>
                </div>
              )}
              <div className="d-grid gap-2 mt-4">
                <Button variant="success" size="lg" onClick={handleMarkCorrect}>
                  ✅ 记住了
                </Button>
                <Button variant="warning" size="lg" onClick={handleNextWord}>
                  ⚠️ 再记一遍
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => setShowAnswer(true)}
                className="mt-5"
              >
                显示答案
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="mt-4 text-center">
        <Button variant="outline-secondary" onClick={() => navigate(`/decks/${id}`)}>
          退出学习
        </Button>
      </div>
    </Container>
  );
};

export default Study;