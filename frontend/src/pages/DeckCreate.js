import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { DeckContext } from '../context/DeckContext';

const DeckCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    coverImage: ''
  });
  const { createDeck } = useContext(DeckContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newDeck = await createDeck(formData);
      navigate(`/decks/${newDeck._id}`);
    } catch (error) {
      console.error('创建单词本失败:', error);
      alert('创建单词本失败，请重试');
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">创建新单词本</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formDeckName">
                  <Form.Label>单词本名称</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="请输入单词本名称"
                    required
                    maxLength={100}
                  />
                </Form.Group>

                <Form.Group controlId="formDeckDescription" className="mt-3">
                  <Form.Label>单词本描述</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="请输入单词本描述（可选）"
                    maxLength={500}
                  />
                </Form.Group>

                <Form.Group controlId="formDeckCover" className="mt-3">
                  <Form.Label>封面图片URL（可选）</Form.Label>
                  <Form.Control
                    type="text"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    placeholder="请输入图片URL"
                  />
                </Form.Group>

                <Form.Group controlId="formDeckPublic" className="mt-3">
                  <Form.Check
                    type="checkbox"
                    label="设为公开单词本"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    公开单词本将对其他用户可见
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    取消
                  </Button>
                  <Button variant="primary" type="submit">
                    创建单词本
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DeckCreate;