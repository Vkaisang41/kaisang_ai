import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const Chat = () => {
  const { id } = useParams();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (id && chats.length > 0) {
      const chat = chats.find(c => c.id == id);
      if (chat) setCurrentChat(chat);
    }
  }, [id, chats]);

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
      connectWebSocket(currentChat.id);
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await api.post('/chats', {});
      const newChat = response.data;
      setChats([...chats, newChat]);
      setCurrentChat(newChat);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const selectChat = (chat) => {
    setCurrentChat(chat);
  };

  const connectWebSocket = (chatId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}?token=${token}`);
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    wsRef.current = ws;
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    wsRef.current.send(input);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Chat List Sidebar */}
        <div className="w-80 bg-gradient-to-b from-blue-50 to-purple-50 p-6 overflow-y-auto border-r border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            + New Chat
          </button>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Chat History</h3>
          <ul className="space-y-2">
            {chats.map(chat => (
              <li
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`p-3 cursor-pointer rounded-xl transition-all duration-200 transform hover:scale-102 ${
                  currentChat?.id === chat.id
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-l-4 border-blue-500 shadow-md'
                    : 'hover:bg-gray-100 text-gray-700 hover:shadow-sm'
                }`}
              >
                <div className="font-semibold">Chat {chat.id}</div>
                <div className="text-sm text-gray-500">{new Date(chat.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                <div className="space-y-6 max-w-4xl mx-auto">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-end space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          AI
                        </div>
                      )}
                      <div className={`max-w-lg ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                        <div
                          className={`p-4 rounded-2xl shadow-lg ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className={`text-xs text-gray-500 mt-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                          U
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
              <div className="p-6 bg-white border-t border-gray-200">
                <div className="flex space-x-4 max-w-4xl mx-auto">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={!input.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Chat</h2>
                <p className="text-lg text-gray-600 mb-6">Select a chat from the sidebar or create a new one to start your conversation.</p>
                <button
                  onClick={createNewChat}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;