import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Decks from './pages/Decks';
import DeckDetail from './pages/DeckDetail';
import CreateDeck from './pages/CreateDeck';
import EditDeck from './pages/EditDeck';
import Study from './pages/Study';
import Review from './pages/Review';
import Profile from './pages/Profile';
import WordDetail from './pages/WordDetail';
import CreateWord from './pages/CreateWord';
import EditWord from './pages/EditWord';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/decks/:id" element={<DeckDetail />} />
            <Route path="/decks/create" element={<CreateDeck />} />
            <Route path="/decks/:id/edit" element={<EditDeck />} />
            <Route path="/study/:deckId" element={<Study />} />
            <Route path="/review" element={<Review />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/words/:id" element={<WordDetail />} />
            <Route path="/words/create" element={<CreateWord />} />
            <Route path="/words/:id/edit" element={<EditWord />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;