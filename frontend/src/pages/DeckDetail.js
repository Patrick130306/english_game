import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Container, Button, ListGroup, Row, Col, Alert, Form, Modal } from 'react-bootstrap';
import { DeckContext } from '../context/DeckContext';

const DeckDetail = () => {
  const { id } = useParams();
  const { decks, loading, error, fetchDecks, updateDeck, removeWordFromDeck } = useContext(DeckContext);
  const [deck, setDeck] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ name: '', description: '', isPublic: false, coverImage: '' });
  const [showRemoveWordModal, setShowRemoveWordModal] = useState(false);
  const [wordToRemove, setWordToRemove] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (decks.length === 0 && !loading) {
      fetchDecks();
    }
  }, [decks.length, loading, fetchDecks]);

  useEffect(() => {
    const foundDeck = decks.find(d => d._id === id);
    if (foundDeck) {
      setDeck(foundDeck);
      setUpdateForm({
        name: foundDeck.name,
        description: foundDeck.description,
        isPublic: foundDeck.isPublic,
        coverImage: foundDeck.coverImage || ''
      });
    }
  }, [id, decks]);

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateForm({
      ...updateForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUpdate = async () => {
    try {
      await updateDeck(id, updateForm);
      setShowUpdateModal(false);
      fetchDecks(); // 重新获取以更新数据
    } catch (err) {
      console.error('更新单词本失败:', err);
      alert('更新失败，请重试');
    }
  };

  const handleRemoveWord = async () => {
    if (wordToRemove) {
      await removeWordFromDeck(id, wordToRemove._id);
      setShowRemoveWordModal(false);
      setWordToRemove(null);
      fetchDecks(); // 重新获取以更新数据
    }
  };

  const confirmRemoveWord = (word) => {
    setWordToRemove(word);
    setShowRemoveWordModal(true);
  };

  if (loading || !deck) {
    return (
      <Container className="mt-5">
        <div className="text-center">加载中...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {/* 单词本基本信息 */}
      <Row className="mb-5">
        <Col md={4}>
          {deck.coverImage ? (
            <Card.Img 
              src={deck.coverImage} 
              alt={deck.name} 
              className="w-100 rounded"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
            />
          ) : (
            <div className="w-100 bg-light rounded" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-muted">无封面图片</span>
            </div>
          )}
        </Col>
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1>{deck.name}</h1>
              <div className="text-muted">创建于: {new Date(deck.createdAt).toLocaleDateString()}</div>
              {deck.lastStudied && (
                <div className="text-muted">最近学习: {new Date(deck.lastStudied).toLocaleDateString()}</div>
              )}
              <div className="mt-2">
                {deck.isPublic ? (
                  <span className="badge bg-info">公开</span>
                ) : (
                  <span className="badge bg-secondary">私有</span>
                )}
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={() => setShowUpdateModal(true)}>
                编辑信息
              </Button>
              <Link to={`/decks/${id}/study`} className="btn btn-success">
                开始学习
              </Link>
              <Link to={`/decks/${id}/words/add`} className="btn btn-info">
                添加单词
              </Link>
            </div>
          </div>
          <div className="mt-4">
            <h4>描述</h4>
            <p>{deck.description || '暂无描述'}</p>
          </div>
          <div className="mt-2">
            <div className="d-inline-block mr-4">
              <strong>{deck.words?.length || 0}</strong> 个单词
            </div>
            <div className="d-inline-block">
              <strong>{deck.studyCount || 0}</strong> 次学习
            </div>
          </div>
        </Col>
      </Row>

      {/* 单词列表 */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>单词列表</h3>
          <Link to={`/decks/${id}/words/add`} className="btn btn-sm btn-info">
            + 添加新单词
          </Link>
        </Card.Header>
        <ListGroup variant="flush">
          {deck.words && deck.words.length > 0 ? (
            deck.words.map((word, index) => (
              <ListGroup.Item key={word._id} className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1">
                  <div className="d-flex items-center">
                    <span className="text-muted mr-3">{index + 1}.</span>
                    <div>
                      <h5 className="mb-0">{word.word}</h5>
                      <p className="text-muted mb-0">{word.translation}</p>
                      {word.example && (
                        <small className="text-secondary italic">"{word.example}"</small>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => confirmRemoveWord(word)}
                >
                  移除
                </Button>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-center py-5">
              <p className="text-muted">单词本中还没有单词</p>
              <Link to={`/decks/${id}/words/add`} className="mt-2 btn btn-info">
                添加单词
              </Link>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      {/* 更新单词本模态框 */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>编辑单词本</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="updateFormDeckName">
              <Form.Label>单词本名称</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={updateForm.name}
                onChange={handleUpdateChange}
                required
                maxLength={100}
              />
            </Form.Group>

            <Form.Group controlId="updateFormDeckDescription" className="mt-3">
              <Form.Label>单词本描述</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={updateForm.description}
                onChange={handleUpdateChange}
                maxLength={500}
              />
            </Form.Group>

            <Form.Group controlId="updateFormDeckCover" className="mt-3">
              <Form.Label>封面图片URL</Form.Label>
              <Form.Control
                type="text"
                name="coverImage"
                value={updateForm.coverImage}
                onChange={handleUpdateChange}
              />
            </Form.Group>

            <Form.Group controlId="updateFormDeckPublic" className="mt-3">
              <Form.Check
                type="checkbox"
                label="设为公开单词本"
                name="isPublic"
                checked={updateForm.isPublic}
                onChange={handleUpdateChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            取消
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            保存更改
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 移除单词确认模态框 */}
      <Modal show={showRemoveWordModal} onHide={() => setShowRemoveWordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>确认移除单词</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确定要从单词本中移除单词 "{wordToRemove?.word}" 吗？
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveWordModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={handleRemoveWord}>
            确认移除
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DeckDetail;