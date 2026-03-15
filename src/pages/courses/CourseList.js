import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from('.course-card', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <header style={styles.header}>
          <h1 style={styles.title}>Explore <span className="gradient-text">Our Courses</span></h1>
          <p style={styles.subtitle}>Start your learning journey with world-class curriculum curated by industry experts.</p>
        </header>

        {loading ? (
          <div style={styles.loading}>Loading amazing courses for you...</div>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <div key={course._id} className="course-card playful-card" style={styles.card}>
                <div style={styles.categoryBadge}>{course.category}</div>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.courseDesc}>{course.description.substring(0, 100)}...</p>
                <div style={styles.footer}>
                  <span style={styles.price}>${course.price}</span>
                  <Link to={`/course/${course._id}`} style={styles.viewBtn}>View Details</Link>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '30px'
  },
  card: {
    backgroundColor: 'var(--cardBg)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid var(--cardBorder)',
    boxShadow: 'var(--cardShadow)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease'
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '5px 12px',
    backgroundColor: 'var(--badgeBg)',
    color: 'var(--badgeText)',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: '700',
    marginBottom: '15px',
    width: 'fit-content'
  },
  courseTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '12px',
    lineHeight: '1.3'
  },
  courseDesc: {
    color: 'var(--textSecondary)',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '20px',
    flex: 1
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid var(--sectionBorder)'
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text)'
  },
  viewBtn: {
    backgroundColor: 'var(--accent)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'opacity 0.2s'
  }
};

export default CourseList;
