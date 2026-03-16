import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PlayfulButton from '../../components/PlayfulButton';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // ===== HERO ENTRANCE ANIMATION =====
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    heroTl
      .from('.hero-badge', {
        y: 40,
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        delay: 0.2
      })
      .from('.hero-title-word', {
        y: 100,
        opacity: 0,
        rotationX: 30,
        duration: 1,
        stagger: 0.1,
        ease: 'back.out(1.2)'
      }, '-=0.4')
      .from('.hero-subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.8
      }, '-=0.5');

    // ===== STATS SECTION =====
    if (statsRef.current) {
      gsap.from(statsRef.current.querySelectorAll('.stat-card'), {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        y: 40,
        opacity: 0,
        scale: 0.9,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.5)'
      });

      statsRef.current.querySelectorAll('.stat-number').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const counter = { val: 0 };

        gsap.to(counter, {
          val: target,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          },
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(counter.val) + suffix;
          }
        });
      });
    }

    // ===== FEATURES SECTION =====
    if (featuresRef.current) {
      gsap.from(featuresRef.current.querySelector('.section-heading'), {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from(featuresRef.current.querySelectorAll('.feature-card'), {
        scrollTrigger: {
          trigger: featuresRef.current.querySelector('.features-grid'),
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        },
        y: 50,
        opacity: 0,
        scale: 0.85,
        rotationY: 10,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.3)'
      });
    }

    // ===== PARALLAX =====
    gsap.to('.hero-overlay', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      opacity: 0.95,
      ease: 'none'
    });

    gsap.to('.hero-content', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: -80,
      ease: 'none'
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <div ref={containerRef} style={styles.container}>
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} style={styles.hero} className="hero-responsive">
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent} className="hero-content-anim">
          <div className="hero-badge" style={styles.badge}>Next Generation Learning</div>
          <h1 style={styles.mainTitle} className="page-title-responsive">
            <span className="hero-title-word">Master </span>
            <span className="hero-title-word">Future </span>
            <br />
            <span className="hero-title-word gradient-text">Professional </span>
            <span className="hero-title-word gradient-text">Skills</span>
          </h1>
          <p className="hero-subtitle" style={styles.heroSub}>
            Join 10,000+ students mastering Tech, Design, and Business with our award-winning LMS platform.
          </p>
          <div style={styles.btnGroup} className="mobile-stack">
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <PlayfulButton>Get Started Today</PlayfulButton>
            </Link>
            <Link to="/courses" style={{ textDecoration: 'none' }}>
              <PlayfulButton>Browse Courses</PlayfulButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} style={styles.statsSection} className="section-padding-responsive">
        <div style={styles.statsGrid} className="grid-2-mobile grid-4-tablet">
          <div className="stat-card stat-card-anim mobile-text-center" style={styles.statCard}>
            <h2 className="stat-number gradient-text" style={styles.statNumber} data-target="150" data-suffix="+">0</h2>
            <p style={styles.statLabel}>Expert Courses</p>
          </div>
          <div className="stat-card stat-card-anim mobile-text-center" style={styles.statCard}>
            <h2 className="stat-number gradient-text" style={styles.statNumber} data-target="10" data-suffix="K+">0</h2>
            <p style={styles.statLabel}>Active Learners</p>
          </div>
          <div className="stat-card stat-card-anim mobile-text-center" style={styles.statCard}>
            <h2 className="stat-number gradient-text" style={styles.statNumber} data-target="98" data-suffix="%">0</h2>
            <p style={styles.statLabel}>Success Rate</p>
          </div>
          <div className="stat-card stat-card-anim mobile-text-center" style={styles.statCard}>
            <h2 className="stat-number gradient-text" style={styles.statNumber} data-target="24" data-suffix="/7">0</h2>
            <p style={styles.statLabel}>Student Support</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} style={styles.featuresSection} className="section-padding-responsive">
        <h2 className="section-heading page-title-responsive mobile-text-center" style={styles.sectionHeading}>
          Why Choose <span className="gradient-text">NexLearn</span>?
        </h2>
        <div className="features-grid grid-1-mobile" style={styles.featuresGrid}>
          <div className="feature-card playful-card" style={styles.featureCard}>
            <div style={styles.iconBox}>🚀</div>
            <h3 style={styles.featureTitle}>Self-Paced Learning</h3>
            <p style={styles.featureText}>Learn at your own speed with lifetime access to all course materials.</p>
          </div>
          <div className="feature-card playful-card" style={styles.featureCard}>
            <div style={styles.iconBox}>🏆</div>
            <h3 style={styles.featureTitle}>Certified Mentors</h3>
            <p style={styles.featureText}>Learn from industry leaders with years of practical experience.</p>
          </div>
          <div className="feature-card playful-card" style={styles.featureCard}>
            <div style={styles.iconBox}>💻</div>
            <h3 style={styles.featureTitle}>Interactive Projects</h3>
            <p style={styles.featureText}>Build real-world applications and portfolio-ready assignments.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: '"Outfit", sans-serif'
  },
  hero: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    background: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflow: 'hidden'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--heroOverlay)',
    zIndex: 1
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '900px',
    padding: '0 20px'
  },
  badge: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: 'var(--badgeBg)',
    color: 'var(--badgeText)',
    borderRadius: '100px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid var(--badgeBorder)'
  },
  mainTitle: {
    fontSize: '4.5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '25px',
    letterSpacing: '-1.5px',
    color: 'var(--text)'
  },
  heroSub: {
    fontSize: '1.25rem',
    color: 'var(--textSecondary)',
    marginBottom: '40px',
    lineHeight: '1.6'
  },
  btnGroup: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  },
  statsSection: {
    padding: '40px 0',
    background: 'var(--bgSecondary)',
    borderBottom: '1px solid var(--sectionBorder)'
  },
  statsGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '30px',
    padding: '0 20px'
  },
  statCard: {
    textAlign: 'center',
    padding: '20px',
    borderRadius: '16px',
    cursor: 'pointer'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 5px 0'
  },
  statLabel: {
    color: 'var(--textSecondary)',
    margin: 0,
    fontSize: '1rem',
    fontWeight: '700'
  },
  featuresSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px'
  },
  sectionHeading: {
    fontSize: '3rem',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '40px',
    color: 'var(--text)'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px'
  },
  featureCard: {
    padding: '40px',
    backgroundColor: 'var(--cardBg)',
    borderRadius: '24px',
    boxShadow: 'var(--cardShadow)',
    border: '1px solid var(--cardBorder)',
    cursor: 'pointer'
  },
  iconBox: {
    fontSize: '2.5rem',
    marginBottom: '20px'
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '15px',
    color: 'var(--text)'
  },
  featureText: {
    color: 'var(--textMuted)',
    lineHeight: '1.6'
  }
};

export default Home;
