import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Container, Modal, Form, Alert } from 'react-bootstrap';
import { DeckContext } from '../context/DeckContext';

const Decks = () => {
  const { decks, loading, error, fetchDecks, deleteDeck } = useContext(DeckContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState(null);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleDeleteClick = (deck) => {
    setDeckToDelete(deck);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deckToDelete) {
      await deleteDeck(deckToDelete._id);
      setShowDeleteModal(false);
      setDeckToDelete(null);
    }
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">加载中...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>我的单词本</h1>
        <Link to="/decks/create">
          <Button variant="primary">创建新单词本</Button>
        </Link>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {decks.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>您还没有创建单词本</h4>
            <p className="text-muted mt-2">创建单词本开始学习之旅</p>
            <Link to="/decks/create" className="mt-3">
              <Button variant="primary">创建第一个单词本</Button>
            </Link>
          </Card.Body>
        </Card>
      ) : (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
          {decks.map(deck => (
            <Col key={deck._id}>
              <Card className="h-100">
                {deck.coverImage && (
                  <Card.Img 
                    variant="top" 
                    src={deck.coverImage} 
                    alt={deck.name} 
                    className="deck-cover-image"
                  />
                )}
                <Card.Body className="flex flex-column h-100">
                  <Card.Title>{deck.name}</Card.Title>
                  <Card.Text className="text-muted flex-grow-1">
                    {deck.description || '暂无描述'}
                  </Card.Text>
                  <div className="text-sm text-muted mt-2">
                    单词数量: {deck.words?.length || 0}
                  </div>
                  {deck.lastStudied && (
                    <div className="text-sm text-muted">
                      最近学习: {new Date(deck.lastStudied).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-3 d-grid gap-2">
                    <Link to={`/decks/${deck._id}`} className="btn btn-primary">
                      查看详情
                    </Link>
                    <Link to={`/decks/${deck._id}/study`} className="btn btn-success">
                      开始学习
                    </Link>
                    <Button 
                      variant="outline-danger" 
                      onClick={() => handleDeleteClick(deck)}
                    >
                      删除单词本
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 删除确认模态框 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>确认删除</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确定要删除单词本 "{deckToDelete?.name}" 吗？此操作无法撤销。
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            确认删除
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Decks;