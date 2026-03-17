import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const About = () => {
  useEffect(() => {
    gsap.from('.edu-page-header', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' });
    gsap.from('.edu-about-card', { opacity: 0, scale: 0.9, stagger: 0.2, duration: 0.8, delay: 0.3 });
    gsap.from('.edu-about-cta', { opacity: 0, y: 40, duration: 1, delay: 0.6 });
  }, []);

  return (
    <div className="edu-page">
      <Navbar />
      
      <div className="edu-page-content">
        <header className="edu-page-header">
          <h1>About NexLearn</h1>
          <p>Architecting the future of intelligence through immersive digital education.</p>
        </header>

        <section className="edu-about-grid">
          <div className="edu-about-card">
            <span style={{fontSize: '2rem', marginBottom: '15px', display: 'block'}}>🎯</span>
            <h3>Our Mission</h3>
            <p>
              To make high-quality education accessible to everyone, everywhere. We believe that learning shouldn't be limited by geography or resources. Our platform is designed to provide equal opportunities for all.
            </p>
          </div>
          <div className="edu-about-card">
            <span style={{fontSize: '2rem', marginBottom: '15px', display: 'block'}}>👁️</span>
            <h3>Our Vision</h3>
            <p>
              To build a global community of skilled professionals who are ready to tackle the challenges of the modern digital economy. We aim to be the bridge between traditional education and industry requirements.
            </p>
          </div>
        </section>

        <section className="edu-about-cta">
          <h3>The Origin Of Flow</h3>
          <p>
            NexLearn was conceived by a collective of visionaries who recognized the friction between academic theory and industry velocity. We engineered this ecosystem to dissolve those barriers through hyper-focused, result-oriented learning.
          </p>
          <p style={{marginTop: '20px'}}>
            We don't just teach fragments of code; we cultivate the mindset of a builder. Our curriculum is an evolving intelligence, curated to keep you ahead of the curve.
          </p>
          <div style={{marginTop: '32px'}}>
            <Link to="/register" className="edu-btn edu-btn-primary" style={{textDecoration: 'none'}}>Begin Your Evolution</Link>
          </div>
        </section>

        <div className="edu-page-header" style={{marginTop: '80px'}}>
          <h1>Core Principles</h1>
          <p>The philosophical foundation that drives our innovation.</p>
        </div>

        <div className="edu-features-grid">
          <div className="edu-card">
            <h4 className="edu-card-title">Innovation</h4>
            <p className="edu-card-text">We constantly push the boundaries of what's possible in online education.</p>
          </div>
          <div className="edu-card">
            <h4 className="edu-card-title">Accessibility</h4>
            <p className="edu-card-text">Education should be available to everyone, regardless of their background.</p>
          </div>
          <div className="edu-card">
            <h4 className="edu-card-title">Community</h4>
            <p className="edu-card-text">Learning is better together. We foster a supportive environment for all.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
