import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PlayfulButton from '../../components/PlayfulButton';
import gsap from 'gsap';

const About = () => {
  useEffect(() => {
    gsap.from('.about-content', {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.2
    });
  }, []);

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main} className="section-padding-responsive">
        <section style={styles.heroSection}>
          <h1 className="about-content gradient-text page-title-responsive" style={styles.title}>About NexLearn</h1>
          <p className="about-content mobile-text-center" style={styles.subtitle}>
            Empowering the next generation of digital leaders through world-class education.
          </p>
        </section>

        <section style={styles.contentSection}>
          <div style={styles.grid}>
            <div className="about-content" style={styles.card}>
              <h2 style={styles.cardTitle}>Our Mission</h2>
              <p style={styles.cardText}>
                To make high-quality education accessible to everyone, everywhere. We believe that learning shouldn't be limited by geography or resources.
              </p>
            </div>
            <div className="about-content" style={styles.card}>
              <h2 style={styles.cardTitle}>Our Vision</h2>
              <p style={styles.cardText}>
                To build a global community of skilled professionals who are ready to tackle the challenges of the modern digital economy.
              </p>
            </div>
          </div>

          <div className="about-content" style={styles.teamSection}>
            <h2 style={styles.sectionHeading}>Why We Started</h2>
            <p style={styles.text}>
              NexLearn was founded by a group of educators and developers who noticed a gap between traditional university curriculum and the demands of the tech industry. We built this LMS to bridge that gap with hands-on, project-based learning.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
               <PlayfulButton onClick={() => window.location.href='/register'}>Join Our Community</PlayfulButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    marginTop: '80px',
    flex: 1,
    padding: '60px 20px',
    maxWidth: '1200px',
    margin: '80px auto 0 auto'
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '800',
    marginBottom: '20px'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--textSecondary)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px'
  },
  card: {
    backgroundColor: 'var(--cardBg)',
    padding: '40px',
    borderRadius: '24px',
    border: '1px solid var(--cardBorder)',
    boxShadow: 'var(--cardShadow)'
  },
  cardTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: 'var(--text)'
  },
  cardText: {
    lineHeight: '1.7',
    color: 'var(--textSecondary)'
  },
  teamSection: {
    textAlign: 'center',
    padding: '60px 40px',
    backgroundColor: 'var(--bgSecondary)',
    borderRadius: '30px',
    border: '1px solid var(--sectionBorder)'
  },
  sectionHeading: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '30px'
  },
  text: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: 'var(--textSecondary)',
    maxWidth: '900px',
    margin: '0 auto'
  }
};

export default About;
