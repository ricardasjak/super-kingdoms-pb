import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './navbar';

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Super Kingdoms &copy; {new Date().getFullYear()} &bull; Built with React, React Router &amp; PocketBase</p>
      </footer>
    </div>
  );
};
