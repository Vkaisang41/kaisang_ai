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
      // Update the chat in the chats array with latest messages
      setChats(prev => prev.map(c => 
        c.id === currentChat.id 
          ? { ...c, messages: currentChat.messages || [] } 
          : c
      ));
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
  }, [messages, loading]);

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

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(chats.filter(c => c.id !== chatId));
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
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
      setMessages(prev => {
        const newMessages = [...prev, message];
        // Update the chat in chats array with the new message
        if (currentChat) {
          setChats(prevChats => prevChats.map(c => 
            c.id === currentChat.id 
              ? { ...c, messages: newMessages } 
              : c
          ));
        }
        return newMessages;
      });
      setLoading(false);
    };
    ws.onclose = () => {
      console.log('WebSocket closed');
      setLoading(false);
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };
    wsRef.current = ws;
  };

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      // Update the chat in chats array with the user message
      if (currentChat) {
        setChats(prevChats => prevChats.map(c => 
          c.id === currentChat.id 
            ? { ...c, messages: newMessages } 
            : c
        ));
      }
      return newMessages;
    });
    setLoading(true);
    wsRef.current.send(input);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ChatGPT-like welcome screen
  const WelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#171717] text-white px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-semibold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          How can I help you today?
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <button
            onClick={() => setInput('Help me with coding')}
            className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors group"
          >
            <div className="text-lg font-medium mb-1 group-hover:text-green-400">Help me with coding</div>
            <div className="text-sm text-gray-400">Write, debug, or understand code</div>
          </button>
          <button
            onClick={() => setInput('Explain something to me')}
            className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors group"
          >
            <div className="text-lg font-medium mb-1 group-hover:text-green-400">Explain something to me</div>
            <div className="text-sm text-gray-400">Learn about any topic</div>
          </button>
          <button
            onClick={() => setInput('Write a creative story')}
            className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors group"
          >
            <div className="text-lg font-medium mb-1 group-hover:text-green-400">Write a creative story</div>
            <div className="text-sm text-gray-400">Generate creative writing</div>
          </button>
          <button
            onClick={() => setInput('Answer my questions')}
            className="p-4 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-left transition-colors group"
          >
            <div className="text-lg font-medium mb-1 group-hover:text-green-400">Answer my questions</div>
            <div className="text-sm text-gray-400">Ask me anything</div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#171717]">
      {/* Sidebar */}
      <div className="w-64 bg-[#202123] flex flex-col border-r border-gray-700">
        <div className="p-3">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-white text-sm font-medium transition-colors border border-gray-600 hover:border-gray-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-2">
          <div className="text-xs font-medium text-gray-400 px-2 py-2 uppercase tracking-wider">
            Chat History
          </div>
          <ul className="space-y-1">
            {chats.map(chat => (
              <li
                key={chat.id}
                onClick={() => selectChat(chat)}
                className={`group flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg transition-colors ${
                  currentChat?.id === chat.id
                    ? 'bg-[#343541] text-white'
                    : 'text-gray-300 hover:bg-[#2a2a2a]'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="truncate text-sm">Chat {chat.id}</span>
                </div>
                <button
                  onClick={(e) => deleteChat(e, chat.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 rounded transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User info at bottom of sidebar */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-[#2a2a2a] rounded-lg cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
              U
            </div>
            <span className="text-sm">User</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#171717]">
              <div className="max-w-3xl mx-auto py-4 px-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 py-4 ${msg.role === 'user' ? 'bg-[#171717]' : ''}`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#5436da] flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-1">
                        U
                      </div>
                    )}
                    <div className={`flex-1 ${msg.role === 'user' ? 'bg-[#2a2a2a] rounded-lg p-4' : ''}`}>
                      <div className={`prose prose-invert max-w-none ${msg.role === 'user' ? '' : 'text-gray-100'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {loading && (
                  <div className="flex gap-4 py-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0 mt-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#171717] border-t border-gray-800">
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Message ChatGPT..."
                    className="w-full bg-[#2a2a2a] text-white rounded-lg py-3 px-4 pr-12 resize-none border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-colors"
                    rows={1}
                    style={{ minHeight: '52px', maxHeight: '200px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="absolute right-2 bottom-2 p-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-500">AI can make mistakes. Consider checking important information.</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default Chat;
