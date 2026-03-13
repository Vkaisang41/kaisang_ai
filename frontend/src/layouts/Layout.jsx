import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="h-screen bg-[#171717]">
      <Outlet />
    </div>
  );
};

export default Layout;
