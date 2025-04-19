import React from 'react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="copyright">&copy; {year} Lab Website. All rights reserved.</p>
          <div className="footer-links">
            <a  className="footer-link">Terms</a>
            <a  className="footer-link">Privacy</a>
            <a  className="footer-link">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;