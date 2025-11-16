import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { DeckContext } from '../context/DeckContext';
import axios from 'axios';

const AddWord = () => {
  const { id } = useParams();
  const { decks, fetchDecks } = useContext(DeckContext);
  const [deck, setDeck] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    translation: '',
    example: '',
    pronunciation: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadDeck = async () => {
      if (decks.length === 0) {
        await fetchDecks();
      }
      const foundDeck = decks.find(d => d._id === id);
      if (foundDeck) {
        setDeck(foundDeck);
      } else {
        setError('未找到指定的单词本');
      }
    };

    loadDeck();
  }, [id, decks, fetchDecks]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 处理标签格式
      const formattedTags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      // 创建单词
      const wordData = {
        ...formData,
        tags: formattedTags
      };

      // 先创建单词
      const wordResponse = await axios.post('/api/words', wordData);
      
      // 将单词添加到单词本
      await axios.post(`/api/decks/${id}/words`, {
        wordId: wordResponse.data._id
      });

      setSuccess('单词添加成功！');
      setFormData({
        word: '',
        translation: '',
        example: '',
        pronunciation: '',
        tags: ''
      });

      // 重新获取单词本数据以更新
      fetchDecks();
    } catch (err) {
      console.error('添加单词失败:', err);
      setError('添加单词失败，请重试');
    }
  };

  const handleAddMore = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  if (!deck) {
    return (
      <Container className="mt-5">
        <div className="text-center">{error || '加载中...'}</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="mb-4">
        <h2>向单词本添加单词</h2>
        <p className="text-muted">当前单词本: {deck.name}</p>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formWord">
                  <Form.Label>单词</Form.Label>
                  <Form.Control
                    type="text"
                    name="word"
                    value={formData.word}
                    onChange={handleChange}
                    placeholder="请输入单词"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formTranslation" className="mt-3">
                  <Form.Label>翻译</Form.Label>
                  <Form.Control
                    type="text"
                    name="translation"
                    value={formData.translation}
                    onChange={handleChange}
                    placeholder="请输入中文翻译"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="formExample" className="mt-3">
                  <Form.Label>例句（可选）</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="example"
                    value={formData.example}
                    onChange={handleChange}
                    placeholder="请输入例句"
                  />
                </Form.Group>

                <Form.Group controlId="formPronunciation" className="mt-3">
                  <Form.Label>发音（可选）</Form.Label>
                  <Form.Control
                    type="text"
                    name="pronunciation"
                    value={formData.pronunciation}
                    onChange={handleChange}
                    placeholder="请输入发音（如 /wɜːrd/）"
                  />
                </Form.Group>

                <Form.Group controlId="formTags" className="mt-3">
                  <Form.Label>标签（可选）</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="请输入标签，用逗号分隔（如：高频词,商务英语）"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button variant="secondary" onClick={() => navigate(`/decks/${id}`)}>
                    完成
                  </Button>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      className="mr-2" 
                      onClick={handleAddMore}
                    >
                      添加并继续
                    </Button>
                    <Button variant="primary" type="submit">
                      添加单词
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddWord;