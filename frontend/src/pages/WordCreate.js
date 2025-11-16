import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

const WordCreate = () => {
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

      const wordData = {
        ...formData,
        tags: formattedTags
      };

      await axios.post('/api/words', wordData);
      
      setSuccess('单词创建成功！');
      setFormData({
        word: '',
        translation: '',
        example: '',
        pronunciation: '',
        tags: ''
      });
    } catch (err) {
      console.error('创建单词失败:', err);
      setError('创建单词失败，请重试');
    }
  };

  const handleAddMore = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">创建新单词</h2>
              
              {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
              {success && <Alert variant="success" className="mb-4">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formWord">
                  <Form.Label>单词 *</Form.Label>
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
                  <Form.Label>翻译 *</Form.Label>
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
                    rows={3}
                    name="example"
                    value={formData.example}
                    onChange={handleChange}
                    placeholder="请输入包含该单词的例句"
                  />
                  <Form.Text className="text-muted">
                    例句有助于理解单词的实际用法
                  </Form.Text>
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
                  <Form.Text className="text-muted">
                    使用国际音标标注发音
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="formTags" className="mt-3">
                  <Form.Label>标签（可选）</Form.Label>
                  <Form.Control
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="请输入标签，用逗号分隔（如：高频词,商务英语,托福）"
                  />
                  <Form.Text className="text-muted">
                    标签可以帮助您更好地分类和查找单词
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between mt-5">
                  <Button variant="secondary" onClick={() => navigate('/words')}>
                    返回单词列表
                  </Button>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      className="mr-2" 
                      onClick={handleAddMore}
                    >
                      保存并创建另一个
                    </Button>
                    <Button variant="primary" type="submit">
                      保存单词
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

export default WordCreate;