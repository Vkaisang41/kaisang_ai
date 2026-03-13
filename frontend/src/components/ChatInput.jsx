import React, { useState } from 'react';

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="sticky bottom-0 bg-gray-900 p-4 border-t border-gray-700">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-3 bg-white text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Type your message..."
            rows={1}
            disabled={disabled}
          />
          <button
            onClick={sendMessage}
            className="bg-emerald-500 text-white px-4 py-3 rounded-xl hover:bg-emerald-600 disabled:bg-zinc-600"
            disabled={!input.trim() || disabled}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;