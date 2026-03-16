import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import PlayfulButton from '../../components/PlayfulButton';
import gsap from 'gsap';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await api.get('/my-courses');
        setEnrollments(res.data);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from('.enrollment-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main} className="section-padding-responsive">
        <header style={styles.header}>
          <h1 style={styles.title} className="page-title-responsive">My <span className="gradient-text">Learning Journey</span></h1>
          <p style={styles.subtitle} className="mobile-text-center">Continue where you left off and master new skills.</p>
        </header>

        {loading ? (
          <div style={styles.loading}>Loading your courses...</div>
        ) : enrollments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📚</div>
            <h3>No courses enrolled yet</h3>
            <p>Explore our catalog and start learning today!</p>
            <PlayfulButton onClick={() => window.location.href='/courses'}>Browse Courses</PlayfulButton>
          </div>
        ) : (
          <div style={styles.grid}>
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="enrollment-card playful-card" style={styles.card}>
                <div style={styles.categoryBadge}>{enrollment.course?.category}</div>
                <h3 style={styles.courseTitle}>{enrollment.course?.title}</h3>
                
                <div style={styles.progressSection}>
                  <div style={styles.progressLabel}>
                    <span>Progress</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${enrollment.progress}%` }}></div>
                  </div>
                </div>

                <div style={styles.footer}>
                  <PlayfulButton 
                    className="w-100" 
                    onClick={() => window.location.href=`/course/${enrollment.course?._id}`}
                  >
                    Continue Learning
                  </PlayfulButton>
                </div>
              </div>
            ))}
          </div>
        )}
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
    maxWidth: '1200px',
    margin: '80px auto 0 auto',
    padding: '60px 20px',
    width: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '15px'
  },
  subtitle: {
    color: 'var(--textSecondary)',
    fontSize: '1.1rem'
  },
  loading: {
    textAlign: 'center',
    padding: '100px',
    fontSize: '1.2rem',
    color: 'var(--textMuted)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'var(--cardBg)',
    borderRadius: '30px',
    border: '1px dashed var(--cardBorder)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '35px',
    width: '100%'
  },
  card: {
    backgroundColor: 'var(--cardBg)',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid var(--cardBorder)',
    boxShadow: 'var(--cardShadow)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease'
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: '700',
    marginBottom: '15px',
    width: 'fit-content',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  courseTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '25px',
    lineHeight: '1.3'
  },
  progressSection: {
    marginBottom: '30px'
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--textSecondary)',
    marginBottom: '8px',
    fontWeight: '600'
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'var(--bgSecondary)',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
    borderRadius: '10px',
    transition: 'width 1s ease-in-out'
  },
  footer: {
    marginTop: 'auto'
  }
};

export default MyCourses;
