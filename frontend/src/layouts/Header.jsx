import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Kaisang AI</h1>
      <button
        onClick={handleLogout}
        className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;