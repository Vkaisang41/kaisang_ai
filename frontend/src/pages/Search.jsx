import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Search = () => {
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [chatId, setChatId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/search', {
        query,
        date_from: dateFrom ? new Date(dateFrom).toISOString() : null,
        date_to: dateTo ? new Date(dateTo).toISOString() : null,
        chat_id: chatId ? parseInt(chatId) : null,
      });
      setResults(response.data.results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const openChat = (id) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Search Chats</h2>
      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Search Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter keywords..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chat ID</label>
            <input
              type="number"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Specific chat ID..."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      <div>
        <h3 className="text-xl font-bold mb-4">Search Results</h3>
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div className="space-y-4">
            {results.map((chat) => (
              <div
                key={chat.id}
                className="border border-gray-300 rounded p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => openChat(chat.id)}
              >
                <h4 className="font-semibold">Chat {chat.id} - {new Date(chat.created_at).toLocaleDateString()}</h4>
                <div className="mt-2">
                  {chat.messages.map((msg, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      <strong>{msg.role}:</strong> {msg.content.slice(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;