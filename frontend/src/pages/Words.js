import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, Container, Row, Col, Modal, Form, Alert, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const Words = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordToDelete, setWordToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [editForm, setEditForm] = useState({
    word: '',
    translation: '',
    example: '',
    pronunciation: '',
    tags: ''
  });

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/words');
      setWords(response.data);
    } catch (err) {
      console.error('获取单词列表失败:', err);
      setError('加载单词失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (word) => {
    setWordToDelete(word);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (wordToDelete) {
      try {
        await axios.delete(`/api/words/${wordToDelete._id}`);
        setWords(words.filter(word => word._id !== wordToDelete._id));
        setShowDeleteModal(false);
        setWordToDelete(null);
      } catch (err) {
        console.error('删除单词失败:', err);
        alert('删除单词失败，请重试');
      }
    }
  };

  const handleEditClick = (word) => {
    setEditingWord(word);
    setEditForm({
      word: word.word,
      translation: word.translation,
      example: word.example || '',
      pronunciation: word.pronunciation || '',
      tags: word.tags ? word.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingWord) return;

    try {
      // 处理标签格式
      const formattedTags = editForm.tags
        ? editForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

      const updatedData = {
        ...editForm,
        tags: formattedTags
      };

      const response = await axios.put(`/api/words/${editingWord._id}`, updatedData);
      
      // 更新单词列表
      setWords(words.map(word => 
        word._id === editingWord._id ? response.data : word
      ));
      
      setShowEditModal(false);
      setEditingWord(null);
    } catch (err) {
      console.error('更新单词失败:', err);
      alert('更新单词失败，请重试');
    }
  };

  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (word.tags && word.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

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
        <h1>我的单词</h1>
        <Link to="/words/create">
          <Button variant="primary">添加新单词</Button>
        </Link>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* 搜索栏 */}
      <InputGroup className="mb-4">
        <Form.Control
          placeholder="搜索单词、翻译或标签..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>单词</th>
                <th>翻译</th>
                <th>例句</th>
                <th>发音</th>
                <th>标签</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.length > 0 ? (
                filteredWords.map(word => (
                  <tr key={word._id}>
                    <td>{word.word}</td>
                    <td>{word.translation}</td>
                    <td>{word.example || '-'}</td>
                    <td>{word.pronunciation || '-'}</td>
                    <td>
                      {word.tags && word.tags.length > 0 ? (
                        <div>
                          {word.tags.map((tag, index) => (
                            <span key={index} className="badge badge-secondary mr-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'  
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="mr-2"
                        onClick={() => handleEditClick(word)}
                      >
                        编辑
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(word)}
                      >
                        删除
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <p className="text-muted">{searchTerm ? '没有找到匹配的单词' : '您还没有添加任何单词'}</p>
                    {!searchTerm && (
                      <Link to="/words/create" className="mt-2">
                        <Button variant="info">添加第一个单词</Button>
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* 删除确认模态框 */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>确认删除</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确定要删除单词 "{wordToDelete?.word}" 吗？此操作无法撤销。
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

      {/* 编辑单词模态框 */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>编辑单词</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group controlId="editFormWord">
              <Form.Label>单词</Form.Label>
              <Form.Control
                type="text"
                name="word"
                value={editForm.word}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="editFormTranslation" className="mt-3">
              <Form.Label>翻译</Form.Label>
              <Form.Control
                type="text"
                name="translation"
                value={editForm.translation}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="editFormExample" className="mt-3">
              <Form.Label>例句</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="example"
                value={editForm.example}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="editFormPronunciation" className="mt-3">
              <Form.Label>发音</Form.Label>
              <Form.Control
                type="text"
                name="pronunciation"
                value={editForm.pronunciation}
                onChange={handleEditChange}
              />
            </Form.Group>

            <Form.Group controlId="editFormTags" className="mt-3">
              <Form.Label>标签</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={editForm.tags}
                onChange={handleEditChange}
                placeholder="请输入标签，用逗号分隔"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-4">
              保存更改
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Words;