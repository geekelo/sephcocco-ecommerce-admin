
import React from 'react';
import { Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import '../styles/Footer.css';
import Logo from '../assets/logo.png'
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo-section">
          <div className="footer-logo">
            <img src={Logo} alt="Logo" className="logo" />
          </div>
          <div className="company-name">SEPHCOCCO LOUNGE</div>
        </div>
        
        <div className="footer-columns">
          <div className="footer-column">
            <h3 className="footer-title">Products</h3>
            <ul className="footer-links">
              <li><a href="/products">Products</a></li>
              <li><a href="/orders">Orders</a></li>
              <li><a href="/messages">Messages</a></li>
              <li><a href="/faqs">FAQs</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Restaurant</h3>
            <ul className="footer-links">
              <li><a href="/restaurant/menu">Menu</a></li>
              <li><a href="/restaurant/reservations">Reservations</a></li>
              <li><a href="/restaurant/specials">Specials</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Lounge</h3>
            <ul className="footer-links">
              <li><a href="/lounge/events">Events</a></li>
              <li><a href="/lounge/vip">VIP</a></li>
              <li><a href="/lounge/bookings">Bookings</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Pharmacy</h3>
            <ul className="footer-links">
              <li><a href="/pharmacy/prescriptions">Prescriptions</a></li>
              <li><a href="/pharmacy/consultations">Consultations</a></li>
              <li><a href="/pharmacy/otc">OTC</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-social-section">
          <h3 className="footer-title">Get In Touch With Us</h3>
          <div className="social-links">
            <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <Linkedin size={20} />
            </a>
            <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </a>
            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;