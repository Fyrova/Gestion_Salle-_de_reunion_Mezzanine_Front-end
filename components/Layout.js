import React from 'react';
import Header from './Header.js';

const Layout = ({ children }) => {
  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: black;
          color: white;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>

      <div style={{ minHeight: '100vh' }}>
        <Header />

        <main>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
