import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Kaisang AI</h2>
      <p className="text-lg text-gray-600 mb-8">Your intelligent assistant for conversations, image generation, and project management.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3 text-blue-600">Start Chatting</h3>
          <p className="text-gray-600 mb-4">Ask questions, get answers, and have intelligent conversations with AI.</p>
          <Link to="/chat" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Open Chat
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3 text-green-600">Search Chats</h3>
          <p className="text-gray-600 mb-4">Find previous conversations and messages quickly.</p>
          <Link to="/search" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            Search
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3 text-purple-600">Generate Images</h3>
          <p className="text-gray-600 mb-4">Create stunning images from text descriptions.</p>
          <Link to="/images" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors">
            Create Images
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3 text-orange-600">Manage Projects</h3>
          <p className="text-gray-600 mb-4">Organize your work with projects and notes.</p>
          <Link to="/projects" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
            View Projects
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3 text-red-600">Settings</h3>
          <p className="text-gray-600 mb-4">Customize your preferences and account settings.</p>
          <Link to="/settings" className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Settings
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-3 text-indigo-600">Account</h3>
          <p className="text-gray-600 mb-4">Manage your account and profile information.</p>
          <Link to="/account" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors">
            Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;