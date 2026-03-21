import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import authService from '../../services/authService';
import { Modal } from 'react-bootstrap';
import { createBaseAccountSDK } from "@base-org/account";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiActivity, FiZap, FiUsers, FiCpu, FiLayers,
  FiGlobe, FiCommand, FiTarget, FiBox
} from 'react-icons/fi';
import '../../styles/EduFlow.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(authService.getCurrentUser());
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.slice(0, 4)); // Show only 4 courses on home
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();

    // GSAP Animations
    gsap.from('.hero-title', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' });
    gsap.from('.hero-sub', { opacity: 0, y: 20, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.hero-actions', { opacity: 0, y: 20, duration: 1, delay: 0.4, ease: 'power3.out' });

    // Feature Cards Premium Animation
    gsap.fromTo('.edu-feature-card',
      { opacity: 0, scale: 0.9, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.row.g-4',
          start: 'top 85%',
        }
      }
    );
  }, []);

  const handleWalletLogin = async () => {
    try {
      const sdk = createBaseAccountSDK({ appName: "NexLearn" });
      const provider = sdk.getProvider();
      const { accounts } = await provider.request({
        method: "wallet_connect",
        params: [{ version: "1", capabilities: { signInWithEthereum: { nonce: window.crypto.randomUUID().replace(/-/g, ""), chainId: "0x2105" } } }],
      });
      const { address } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;
      const data = await authService.walletLogin({ address, message, signature });
      if (data.token) navigate(data.user?.role === 'admin' ? '/admin' : (data.user?.role === 'instructor' ? '/instructor' : '/dashboard'));
    } catch (err) {
      console.error("Wallet Login Error:", err);
    }
  };

  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) return alert('MetaMask not found!');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      const message = `Welcome to NexLearn! Sign this message to log in.\n\nNonce: ${window.crypto.randomUUID()}`;
      const signature = await window.ethereum.request({ method: 'personal_sign', params: [message, address] });
      const data = await authService.walletLogin({ address, message, signature });
      if (data.token) navigate(data.user?.role === 'admin' ? '/admin' : (data.user?.role === 'instructor' ? '/instructor' : '/dashboard'));
    } catch (err) {
      console.error("MetaMask Error:", err);
    }
  };

  const thumbColors = ['t1', 't2', 't3', 't4'];

  return (
    <div className="edu-page">
      <Navbar />

      <div className="edu-page-content">
        {/* HERO SECTION */}
        <section className="edu-home-hero" style={{ background: '#fff', borderBottom: '1px solid #F0EFEA', padding: 'clamp(60px, 15vw, 120px) 20px', textAlign: 'center' }}>
          <div className="hero-text" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div className="hero-eyebrow" style={{ color: '#2D5BE3', fontWeight: 800, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>NexLearn Academy</div>
            <h1 className="hero-title" style={{ color: '#1A1916', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, fontFamily: '"Playfair Display", serif', lineHeight: 1.1, marginBottom: '24px' }}>Elevate Your Skills <br />For the Digital Era</h1>
            <p className="hero-sub" style={{ color: '#6B6962', fontSize: '1.1rem', margin: '0 auto 40px', maxWidth: '650px', lineHeight: 1.6 }}>
              Master top-tier curriculum engineered for high-performance careers in technology, design, and business. Start your journey today with world-class mentors.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {!user ? (
                <>
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="edu-btn edu-btn-primary"
                    style={{ padding: '16px 40px', borderRadius: '12px', fontWeight: 800, background: '#2D5BE3', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" /></svg>
                    Connect Wallet
                  </button>
                  <Link to="/login" className="edu-btn edu-btn-outline" style={{ padding: '16px 40px', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', background: '#F8F7F2', border: '1px solid #E2E0D8' }}>Email Login</Link>
                </>
              ) : (
                <Link to="/dashboard" className="edu-btn edu-btn-primary" style={{ padding: '16px 40px', borderRadius: '12px', fontWeight: 800, textDecoration: 'none' }}>My Dashboard</Link>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <div className="container" style={{ marginTop: '100px' }}>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="edu-feature-card" style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #E2E0D8', textAlign: 'center' }}>
                <FiZap style={{ fontSize: '32px', color: '#2D5BE3', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>Focused Learning</h3>
                <p style={{ color: '#6B6962', fontSize: '14px' }}>Optimized curriculums for rapid skill retention and real-world application.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="edu-feature-card" style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #E2E0D8', textAlign: 'center' }}>
                <FiUsers style={{ fontSize: '32px', color: '#2D5BE3', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>Expert Mentors</h3>
                <p style={{ color: '#6B6962', fontSize: '14px' }}>Learn directly from industry leaders with decades of practical experience.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="edu-feature-card" style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #E2E0D8', textAlign: 'center' }}>
                <FiCpu style={{ fontSize: '32px', color: '#2D5BE3', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '15px' }}>Modern Patterns</h3>
                <p style={{ color: '#6B6962', fontSize: '14px' }}>Master the advanced architectural mental models behind every craft.</p>
              </div>
            </div>
          </div>
        </div>

        {/* POPULAR COURSES SECTION */}
        <div className="container" style={{ marginTop: '120px', marginBottom: '100px' }}>
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: 900 }}>Recommended Programs</h2>
              <p style={{ color: '#6B6962', fontSize: '16px' }}>Curated curriculum to help you achieve mastery.</p>
            </div>
            <Link to="/courses" className="edu-pill-btn active" style={{ textDecoration: 'none' }}>Explore All Programs</Link>
          </div>

          <div className="edu-course-grid-v2">
            {loading ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#9B9890' }}>Sourcing recommended programs...</p>
            ) : (
              courses.map((course, idx) => (
                <Link to={`/course/${course._id}`} key={course._id} className="edu-card-v2">
                  <div className={`c-v2-thumb ${thumbColors[idx % 4]}`} style={{ height: '140px' }}>
                    {[<FiGlobe />, <FiZap />, <FiCommand />, <FiLayers />, <FiCpu />, <FiBox />, <FiActivity />, <FiTarget />][idx % 8]}
                  </div>
                  <div className="c-v2-body" style={{ padding: '25px' }}>
                    <span className="c-v2-tag" style={{ fontSize: '10px', color: '#2D5BE3', fontWeight: 800, textTransform: 'uppercase' }}>{course.category}</span>
                    <h3 className="c-v2-title" style={{ fontSize: '18px', margin: '10px 0', fontFamily: 'inherit', fontWeight: 800 }}>{course.title}</h3>
                    <p className="c-v2-desc" style={{ fontSize: '14px', marginBottom: '20px', color: '#6B6962' }}>{course.description ? course.description.substring(0, 85) + '...' : 'Program details pending.'}</p>
                    <div className="c-v2-footer" style={{ paddingTop: '15px', borderTop: '1px solid #F5F4F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, color: '#1A1916' }}>{course.price === 0 ? 'FREE' : `$${course.price}`}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#2D5BE3' }}>Explore →</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* CTA SECTION */}
        <section className="edu-about-cta" style={{ marginTop: '100px' }}>
          <h3>Ready to start your journey?</h3>
          <p>Join thousands of students and start learning today. Get access to expert-led courses and a supportive community.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/register" className="edu-btn edu-btn-primary" style={{ textDecoration: 'none' }}>Create Free Account</Link>
            <Link to="/about" className="edu-btn edu-btn-outline" style={{ textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>

      <Footer />

      {/* Wallet Selection Modal */}
      <Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} centered>
        <Modal.Header closeButton style={{ border: 'none', padding: '24px 24px 10px' }}>
          <Modal.Title style={{ fontWeight: 900, fontFamily: '"Playfair Display", serif' }}>Choose Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0 24px 30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              onClick={() => { setShowWalletModal(false); handleWalletLogin(); }}
              style={{ padding: '18px', borderRadius: '16px', border: '1px solid #F0EFEA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', background: '#F8F7F2', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#2D5BE3'; e.currentTarget.style.background = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#F0EFEA'; e.currentTarget.style.background = '#F8F7F2'; }}
            >
              <div style={{ width: '36px', height: '36px', background: '#0052FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white' }} />
              </div>
              <div style={{ fontWeight: 800 }}>Base / Coinbase</div>
            </div>

            <div
              onClick={() => { setShowWalletModal(false); handleMetaMaskLogin(); }}
              style={{ padding: '18px', borderRadius: '16px', border: '1px solid #F0EFEA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', background: '#F8F7F2', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#E2761B'; e.currentTarget.style.background = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#F0EFEA'; e.currentTarget.style.background = '#F8F7F2'; }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" alt="MetaMask" style={{ width: '36px', height: '36px' }} />
              <div style={{ fontWeight: 800 }}>MetaMask</div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Home;
