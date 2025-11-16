import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from './AuthContext';

// 创建单词本上下文
export const DeckContext = createContext();

// 单词本上下文提供者组件
export const DeckProvider = ({ children }) => {
  const { user, loadUser } = useContext(AuthContext);
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [loading, setLoading] = useState(false);

  // 当用户状态变化时，加载单词本列表
  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user]);

  // 获取所有单词本
  const fetchDecks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/decks');
      setDecks(res.data);
    } catch (error) {
      console.error('获取单词本失败:', error);
      if (error.response?.status === 401) {
        // 如果是认证错误，尝试重新加载用户
        loadUser();
      }
    } finally {
      setLoading(false);
    }
  };

  // 获取单个单词本详情
  const fetchDeckById = async (deckId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/decks/${deckId}`);
      setCurrentDeck(res.data);
      return res.data;
    } catch (error) {
      console.error('获取单词本详情失败:', error);
      toast.error('获取单词本详情失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 创建新单词本
  const createDeck = async (deckData) => {
    try {
      setLoading(true);
      const res = await axios.post('/decks', deckData);
      setDecks(prevDecks => [res.data, ...prevDecks]);
      toast.success('单词本创建成功');
      return res.data;
    } catch (error) {
      console.error('创建单词本失败:', error);
      toast.error('创建单词本失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 更新单词本
  const updateDeck = async (deckId, deckData) => {
    try {
      setLoading(true);
      const res = await axios.put(`/decks/${deckId}`, deckData);
      setDecks(prevDecks => 
        prevDecks.map(deck => deck._id === deckId ? res.data : deck)
      );
      if (currentDeck && currentDeck._id === deckId) {
        setCurrentDeck(res.data);
      }
      toast.success('单词本更新成功');
      return res.data;
    } catch (error) {
      console.error('更新单词本失败:', error);
      toast.error('更新单词本失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 删除单词本
  const deleteDeck = async (deckId) => {
    try {
      setLoading(true);
      await axios.delete(`/decks/${deckId}`);
      setDecks(prevDecks => 
        prevDecks.filter(deck => deck._id !== deckId)
      );
      if (currentDeck && currentDeck._id === deckId) {
        setCurrentDeck(null);
      }
      toast.success('单词本删除成功');
      return true;
    } catch (error) {
      console.error('删除单词本失败:', error);
      toast.error('删除单词本失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 向单词本添加单词
  const addWordToDeck = async (deckId, wordId) => {
    try {
      setLoading(true);
      const res = await axios.post(`/decks/${deckId}/words`, { wordId });
      setDecks(prevDecks => 
        prevDecks.map(deck => deck._id === deckId ? res.data : deck)
      );
      if (currentDeck && currentDeck._id === deckId) {
        setCurrentDeck(res.data);
      }
      toast.success('单词已添加到单词本');
      return res.data;
    } catch (error) {
      console.error('添加单词到单词本失败:', error);
      toast.error('添加单词到单词本失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 从单词本移除单词
  const removeWordFromDeck = async (deckId, wordId) => {
    try {
      setLoading(true);
      const res = await axios.delete(`/decks/${deckId}/words/${wordId}`);
      setDecks(prevDecks => 
        prevDecks.map(deck => deck._id === deckId ? res.data : deck)
      );
      if (currentDeck && currentDeck._id === deckId) {
        setCurrentDeck(res.data);
      }
      toast.success('单词已从单词本移除');
      return res.data;
    } catch (error) {
      console.error('从单词本移除单词失败:', error);
      toast.error('从单词本移除单词失败');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 获取单词本学习统计
  const getDeckStats = async (deckId) => {
    try {
      const res = await axios.get(`/study/stats/${deckId}`);
      return res.data;
    } catch (error) {
      console.error('获取单词本统计失败:', error);
      return null;
    }
  };

  // 上下文值
  const deckContext = {
    decks,
    currentDeck,
    loading,
    fetchDecks,
    fetchDeckById,
    createDeck,
    updateDeck,
    deleteDeck,
    addWordToDeck,
    removeWordFromDeck,
    getDeckStats
  };

  return (
    <DeckContext.Provider value={deckContext}>
      {children}
    </DeckContext.Provider>
  );
};