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
    <div className="container mx-auto px-4 py-4 h-full">
      <div className="flex h-full bg-white rounded-lg shadow-md overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-1/4 bg-gray-50 p-3 overflow-y-auto border-r">
          <button
            onClick={createNewChat}
            className="w-full mb-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            New Chat
          </button>
          <h3 className="text-lg font-bold mb-3 text-gray-800">Chat History</h3>
          <ul className="space-y-1">
            {chats.map(chat => (
              <li
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`p-2 cursor-pointer rounded-lg transition-colors ${
                  currentChat?.id === chat.id
                    ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-medium">Chat {chat.id}</div>
                <div className="text-sm text-gray-500">{new Date(chat.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          AI
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                        <div
                          className={`p-3 rounded-2xl shadow-sm ${
                            msg.role === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          U
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>
              <div className="p-3 bg-white border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!input.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-lg text-gray-600">Select a chat or create a new one to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;