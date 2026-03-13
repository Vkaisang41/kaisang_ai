import React, { useEffect, useRef } from 'react';
import Message from './Message';
import ChatInput from './ChatInput';

const ChatArea = ({ messages, onSend, loading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => <Message key={index} message={msg} onSend={onSend} />)}
          {loading && <div className="text-gray-400 text-center">Kaisang AI is thinking...</div>}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={onSend} disabled={loading} />
    </div>
  );
};

export default ChatArea;