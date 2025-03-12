import React from 'react';
import './footer.css'; // Import updated CSS

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <nav className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </nav>
        <p>&copy; {new Date().getFullYear()} Online Learning. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
