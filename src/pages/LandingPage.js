import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [text, setText] = useState('');
  const fullText = 'Welcome to the Lab Website';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText(prevText => prevText + fullText[index]);
        setIndex(prevIndex => prevIndex + 1);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="container">
          <h1 className="typewriter">{text}<span className="cursor">|</span></h1>
          <p className="subtitle">A platform for research collaboration and knowledge sharing</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">Join Now</Link>
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Research Sharing</h3>
              <p>Share your research findings with colleagues and peers around the world.</p>
            </div>
            <div className="feature-card">
              <h3>Collaboration</h3>
              <p>Connect with other researchers and collaborate on projects.</p>
            </div>
            <div className="feature-card">
              <h3>Community</h3>
              <p>Join a community of like-minded researchers in your field.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;