import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">英语单词学习系统</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">首页</Nav.Link>
                <Nav.Link as={Link} to="/decks">单词本</Nav.Link>
                <Nav.Link as={Link} to="/review">复习</Nav.Link>
              </Nav>
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/profile">
                  <i className="fas fa-user mr-1"></i>{user.username}
                </Nav.Link>
                <Button variant="outline-danger" onClick={handleLogout}>
                  登出
                </Button>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login">登录</Nav.Link>
              <Nav.Link as={Link} to="/register">注册</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;