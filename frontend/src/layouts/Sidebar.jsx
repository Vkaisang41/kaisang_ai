import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/chat', label: 'Chat' },
    { path: '/search', label: 'Search' },
    { path: '/images', label: 'Images' },
    { path: '/projects', label: 'Projects' },
    { path: '/settings', label: 'Settings' },
    { path: '/account', label: 'Account' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white h-full shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8">Kaisang AI</h1>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-blue-700 shadow-md'
                      : 'hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;