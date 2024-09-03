import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <>
      <NavBar />
      <div>{children}</div>
      <Footer />
    </>
  );
};

export default MainLayout;
