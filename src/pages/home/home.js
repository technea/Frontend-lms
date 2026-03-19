import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
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

  useEffect(() => {
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

  const thumbColors = ['t1', 't2', 't3', 't4'];

  return (
    <div className="edu-page">
      <Navbar />
      
      <div className="edu-page-content">
        {/* HERO SECTION */}
        <section className="edu-home-hero" style={{background: '#fff', borderBottom: '1px solid #F0EFEA', padding: 'clamp(60px, 15vw, 120px) 20px', textAlign: 'center'}}>
          <div className="hero-text" style={{maxWidth: '850px', margin: '0 auto'}}>
            <div className="hero-eyebrow" style={{color: '#2D5BE3', fontWeight: 800, fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px'}}>NexLearn Academy</div>
            <h1 className="hero-title" style={{color: '#1A1916', fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, fontFamily: '"Playfair Display", serif', lineHeight: 1.1, marginBottom: '24px'}}>Elevate Your Skills <br/>For the Digital Era</h1>
            <p className="hero-sub" style={{color: '#6B6962', fontSize: '1.1rem', margin: '0 auto 40px', maxWidth: '650px', lineHeight: 1.6}}>
              Master top-tier curriculum engineered for high-performance careers in technology, design, and business. Start your journey today with world-class mentors.
            </p>
            <div className="hero-actions" style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <Link to="/register" className="edu-btn edu-btn-primary" style={{padding: '16px 40px', borderRadius: '12px', fontWeight: 800, textDecoration: 'none'}}>Get Started for Free</Link>
              <Link to="/courses" className="edu-btn edu-btn-outline" style={{padding: '16px 40px', borderRadius: '12px', fontWeight: 800, textDecoration: 'none'}}>Explore All Programs</Link>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <div className="container" style={{marginTop: '100px'}}>
           <div className="row g-4">
            <div className="col-md-4">
              <div className="edu-feature-card" style={{background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #E2E0D8', textAlign: 'center'}}>
                <FiZap style={{fontSize: '32px', color: '#2D5BE3', marginBottom: '20px'}} />
                <h3 style={{fontSize: '20px', fontWeight: 800, marginBottom: '15px'}}>Focused Learning</h3>
                <p style={{color: '#6B6962', fontSize: '14px'}}>Optimized curriculums for rapid skill retention and real-world application.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="edu-feature-card" style={{background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #E2E0D8', textAlign: 'center'}}>
                 <FiUsers style={{fontSize: '32px', color: '#2D5BE3', marginBottom: '20px'}} />
                <h3 style={{fontSize: '20px', fontWeight: 800, marginBottom: '15px'}}>Expert Mentors</h3>
                <p style={{color: '#6B6962', fontSize: '14px'}}>Learn directly from industry leaders with decades of practical experience.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="edu-feature-card" style={{background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #E2E0D8', textAlign: 'center'}}>
                 <FiCpu style={{fontSize: '32px', color: '#2D5BE3', marginBottom: '20px'}} />
                <h3 style={{fontSize: '20px', fontWeight: 800, marginBottom: '15px'}}>Modern Patterns</h3>
                <p style={{color: '#6B6962', fontSize: '14px'}}>Master the advanced architectural mental models behind every craft.</p>
              </div>
            </div>
          </div>
        </div>

        {/* POPULAR COURSES SECTION */}
        <div className="container" style={{marginTop: '120px', marginBottom: '100px'}}>
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 style={{fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: 900}}>Recommended Programs</h2>
              <p style={{color: '#6B6962', fontSize: '16px'}}>Curated curriculum to help you achieve mastery.</p>
            </div>
            <Link to="/courses" className="edu-pill-btn active" style={{textDecoration: 'none'}}>Explore All Programs</Link>
          </div>

          <div className="edu-course-grid-v2">
            {loading ? (
              <p style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#9B9890'}}>Sourcing recommended programs...</p>
            ) : (
              courses.map((course, idx) => (
                <Link to={`/course/${course._id}`} key={course._id} className="edu-card-v2">
                  <div className={`c-v2-thumb ${thumbColors[idx % 4]}`} style={{height: '140px'}}>
                     {[<FiGlobe />, <FiZap />, <FiCommand />, <FiLayers />, <FiCpu />, <FiBox />, <FiActivity />, <FiTarget />][idx % 8]}
                  </div>
                  <div className="c-v2-body" style={{padding: '25px'}}>
                    <span className="c-v2-tag" style={{fontSize: '10px', color: '#2D5BE3', fontWeight: 800, textTransform: 'uppercase'}}>{course.category}</span>
                    <h3 className="c-v2-title" style={{fontSize: '18px', margin: '10px 0', fontFamily: 'inherit', fontWeight: 800}}>{course.title}</h3>
                    <p className="c-v2-desc" style={{fontSize: '14px', marginBottom: '20px', color: '#6B6962'}}>{course.description ? course.description.substring(0, 85) + '...' : 'Program details pending.'}</p>
                    <div className="c-v2-footer" style={{paddingTop: '15px', borderTop: '1px solid #F5F4F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{fontWeight: 900, color: '#1A1916'}}>{course.price === 0 ? 'FREE' : `$${course.price}`}</span>
                      <span style={{fontSize: '11px', fontWeight: 800, color: '#2D5BE3'}}>Explore →</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* CTA SECTION */}
        <section className="edu-about-cta" style={{marginTop: '100px'}}>
          <h3>Ready to start your journey?</h3>
          <p>Join thousands of students and start learning today. Get access to expert-led courses and a supportive community.</p>
          <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
            <Link to="/register" className="edu-btn edu-btn-primary" style={{textDecoration: 'none'}}>Create Free Account</Link>
            <Link to="/about" className="edu-btn edu-btn-outline" style={{textDecoration: 'none'}}>Learn More</Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
