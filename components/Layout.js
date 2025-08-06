import React from 'react';
import Header from './Header.js';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          color: #2c5282;
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
        <Footer />
      </div>
    </>
  );
};

export default Layout;
