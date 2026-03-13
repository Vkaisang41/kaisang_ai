import React, { useState, useEffect } from 'react';

const Message = ({ message, onSend }) => {
  const isUser = message.role === 'user';
  const [displayedText, setDisplayedText] = useState(isUser ? message.content : '');
  const [isTyping, setIsTyping] = useState(!isUser);

  useEffect(() => {
    if (!isUser && message.content) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText(message.content.slice(0, index + 1));
        index++;
        if (index >= message.content.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20); // Adjust speed as needed
      return () => clearInterval(interval);
    }
  }, [message.content, isUser]);

  const handleFollowUp = (text) => {
    onSend(text);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-2xl">
        <div className={`p-4 rounded-2xl ${isUser ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-700 text-zinc-100'}`}>
          <p className="leading-relaxed">{displayedText}{isTyping && '|'}</p>
          {message.source && message.source !== 'ml' && !isTyping && (
            <div className="text-xs text-zinc-400 mt-2">
              {message.source === 'llm' ? 'Advanced reasoning' : message.source === 'search' ? 'From search' : 'Response'}
            </div>
          )}
        </div>
        {message.follow_up && !isTyping && (
          <div className="flex space-x-2 mt-2">
            {message.follow_up.split(', ').map((text, index) => (
              <button
                key={index}
                onClick={() => handleFollowUp(text)}
                className="px-3 py-1 bg-zinc-600 text-zinc-100 rounded-lg hover:bg-zinc-500 text-sm"
              >
                {text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;