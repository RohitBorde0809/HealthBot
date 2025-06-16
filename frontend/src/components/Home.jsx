import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to AI Chat Assistant</h1>
          <p>Experience the power of artificial intelligence in your conversations</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">Get Started</Link>
            <Link to="/login" className="cta-button secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Smart Conversations</h3>
            <p>Engage in natural, intelligent conversations powered by advanced AI</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your conversations are protected with enterprise-grade security</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Responses</h3>
            <p>Get instant, accurate responses to your questions</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who are already experiencing the future of AI chat</p>
        <Link to="/register" className="cta-button primary">Start Chatting Now</Link>
      </section>
    </div>
  );
};

export default Home; 