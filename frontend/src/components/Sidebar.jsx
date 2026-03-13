import React from 'react';

const Sidebar = ({ chats, currentChat, onNewChat, onSelectChat, onViewChange, currentView }) => {
  const menuItems = [
    { key: 'chat', label: '💬 Chat', action: () => onViewChange('chat') },
    { key: 'search', label: '🔍 Search', action: () => onViewChange('search') },
    { key: 'images', label: '🖼️ Images', action: () => onViewChange('images') },
    { key: 'projects', label: '📁 Projects', action: () => onViewChange('projects') },
    { key: 'settings', label: '⚙️ Settings', action: () => onViewChange('settings') },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white h-full overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">Kaisang AI</h1>
        {menuItems.map(item => (
          <div
            key={item.key}
            onClick={item.action}
            className={`p-3 cursor-pointer rounded-lg mb-2 ${currentView === item.key ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            {item.label}
          </div>
        ))}
        {currentView === 'chat' && (
          <>
            <hr className="my-4 border-zinc-700" />
            <button
              onClick={onNewChat}
              className="w-full mb-4 bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600"
            >
              ➕ New Chat
            </button>
            <div className="space-y-2">
              {chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`p-3 cursor-pointer rounded-lg ${currentChat?.id === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                >
                  Chat {chat.id}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;