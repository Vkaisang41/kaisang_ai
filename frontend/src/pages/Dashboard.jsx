import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const features = [
    {
      title: "Start Chatting",
      description: "Ask questions, get answers, and have intelligent conversations with AI.",
      link: "/chat",
      buttonText: "Open Chat",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
      icon: "Chat"
    },
    {
      title: "Search Chats",
      description: "Find previous conversations and messages quickly.",
      link: "/search",
      buttonText: "Search",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
      icon: "Search"
    },
    {
      title: "Generate Images",
      description: "Create stunning images from text descriptions.",
      link: "/images",
      buttonText: "Create Images",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700",
      icon: "Images"
    },
    {
      title: "Manage Projects",
      description: "Organize your work with projects and notes.",
      link: "/projects",
      buttonText: "View Projects",
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
      icon: "Projects"
    },
    {
      title: "Settings",
      description: "Customize your preferences and account settings.",
      link: "/settings",
      buttonText: "Settings",
      gradient: "from-red-500 to-red-600",
      hoverGradient: "from-red-600 to-red-700",
      icon: "Settings"
    },
    {
      title: "Account",
      description: "Manage your account and profile information.",
      link: "/account",
      buttonText: "Account",
      gradient: "from-indigo-500 to-indigo-600",
      hoverGradient: "from-indigo-600 to-indigo-700",
      icon: "Account"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Kaisang AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent assistant for conversations, image generation, and project management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
              <div className="text-center">
                <Link
                  to={feature.link}
                  className={`inline-block bg-gradient-to-r ${feature.gradient} hover:${feature.hoverGradient} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
                >
                  {feature.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;