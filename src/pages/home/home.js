import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    gsap.from('.hero-title', { y: 100, opacity: 0, duration: 1.2, ease: 'power4.out' });
    gsap.from('.hero-sub', { y: 50, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
    gsap.from('.edu-feature-card', { 
      scale: 0.8, 
      opacity: 0, 
      stagger: 0.2, 
      duration: 1, 
      scrollTrigger: {
        trigger: '.edu-features-grid',
        start: 'top 80%'
      }
    });
  }, []);

  const courseEmojis = { 'Technology': '💻', 'Design': '🎨', 'Business': '📈', 'Marketing': '📊', 'Data Science': '🤖' };
  const getCourseEmoji = (cat) => courseEmojis[cat] || '📚';
  const thumbColors = ['t1', 't2', 't3', 't4'];

  return (
    <div className="edu-page">
      <Navbar />
      
      <div className="edu-page-content">
        {/* HERO SECTION */}
        <section className="edu-home-hero">
          <div className="hero-text">
            <div className="hero-eyebrow">Next Generation Learning</div>
            <h1 className="hero-title">Master The<br/>Art of Code & Flow</h1>
            <p className="hero-sub">
              Join 10,000+ creators architecting the digital future with our premium NexLearn experience.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="edu-btn edu-btn-white" style={{textDecoration: 'none'}}>Get Started</Link>
              <Link to="/courses" className="edu-btn edu-btn-outline" style={{color: 'white', borderColor: 'rgba(255,255,255,0.3)', textDecoration: 'none'}}>Browse Courses</Link>
            </div>
          </div>
          <div className="edu-home-hero-stats">
            <div className="hero-stats-row">
              <div className="h-stat">
                <div className="h-stat-num">150+</div>
                <div className="h-stat-label">Expert Courses</div>
              </div>
              <div className="h-divider"></div>
              <div className="h-stat">
                <div className="h-stat-num">10K+</div>
                <div className="h-stat-label">Active Learners</div>
              </div>
              <div className="h-divider"></div>
              <div className="h-stat">
                <div className="h-stat-num">98%</div>
                <div className="h-stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <div className="edu-page-header" style={{marginTop: '60px'}}>
          <h1>Why NexLearn?</h1>
          <p>We provide the elite infrastructure needed to accelerate your career trajectory.</p>
        </div>

        <div className="edu-features-grid">
          <div className="edu-feature-card">
            <div className="edu-feature-icon">⚡</div>
            <h3 className="edu-feature-title">Propulsive Learning</h3>
            <p className="edu-feature-text">High-octane curriculum designed for rapid skill acquisition and retention.</p>
          </div>
          <div className="edu-feature-card">
            <div className="edu-feature-icon">💎</div>
            <h3 className="edu-feature-title">Elite Mentorship</h3>
            <p className="edu-feature-text">Direct access to industry architects who have built world-class systems.</p>
          </div>
          <div className="edu-feature-card">
            <div className="edu-feature-icon">🏗️</div>
            <h3 className="edu-feature-title">Architectural Mindset</h3>
            <p className="edu-feature-text">Go beyond syntax; learn the patterns and architectures behind the code.</p>
          </div>
        </div>

        {/* POPULAR COURSES SECTION */}
        <div className="edu-page-header" style={{marginTop: '80px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div>
            <h1>Popular Courses</h1>
            <p>Start your journey with our top-rated curriculum.</p>
          </div>
          <Link to="/courses" className="edu-btn edu-btn-outline" style={{textDecoration: 'none'}}>View All</Link>
        </div>

        <div className="edu-courses-list">
          {loading ? (
            <p style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>Loading courses...</p>
          ) : (
            courses.map((course, idx) => (
              <Link to={`/course/${course._id}`} key={course._id} className="edu-course-item">
                <div className={`c-thumb ${thumbColors[idx % 4]}`}>
                  {getCourseEmoji(course.category)}
                </div>
                <div className="c-body">
                  <span className="c-cat">{course.category}</span>
                  <h3 className="c-title">{course.title}</h3>
                  <p className="c-desc">{course.description ? course.description.substring(0, 80) + '...' : 'No description available.'}</p>
                  <div className="c-footer">
                    <span className="c-price">{course.price === 0 ? 'FREE' : `$${course.price}`}</span>
                    <span className="edu-tag edu-tag-blue">View Details</span>
                  </div>
                </div>
              </Link>
            ))
          )}
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
