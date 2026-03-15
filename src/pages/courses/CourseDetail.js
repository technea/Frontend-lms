import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import authService from '../../services/authService';
import PlayfulButton from '../../components/PlayfulButton';
import gsap from 'gsap';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, enrollRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get('/my-courses')
        ]);
        setCourse(courseRes.data);
        const enrolled = enrollRes.data.some(e => e.course?._id === id);
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!loading) {
      gsap.from('.course-reveal', {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }
  }, [loading]);

  const handleEnroll = async () => {
    const user = authService.getCurrentUser();
    if (!user) { navigate('/login'); return; }

    setEnrolling(true);
    try {
      await api.post('/enroll', { courseId: course._id });
      alert('Enrolled successfully!');
      setIsEnrolled(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div style={styles.loading}><Navbar />Loading Details...<Footer /></div>;
  if (!course) return <div style={styles.error}><Navbar />Course Not Found<Footer /></div>;

  return (
    <div style={styles.container}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.detailGrid}>
          
          <div className="course-reveal" style={styles.infoSection}>
            <div style={styles.badge}>{course.category}</div>
            <h1 style={styles.title}>{course.title}</h1>
            <p style={styles.instructor}>Created by <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>NexLearn Elite Instructor</span></p>
            
            <div style={styles.descriptionSection}>
              <h3 style={{ marginBottom: '20px' }}>What you'll learn</h3>
              <p style={styles.text}>{course.description}</p>
            </div>
          </div>

          <div className="course-reveal" style={styles.sidebar}>
            <div style={styles.priceCard}>
              <h2 style={styles.price}>{isEnrolled ? 'Enrolled' : `$${course.price}`}</h2>
              
              {isEnrolled ? (
                <PlayfulButton onClick={() => navigate(`/course/${course._id}/lesson`)}>
                  Start Learning
                </PlayfulButton>
              ) : (
                <div onClick={handleEnroll} style={{ width: '100%', cursor: 'pointer' }}>
                  <PlayfulButton disabled={enrolling}>
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </PlayfulButton>
                </div>
              )}

              <ul style={styles.featuresList}>
                <li>🎬 High Quality Videos</li>
                <li>🏅 Digital Certificate</li>
                <li>📱 Access on any device</li>
                <li>💬 Expert Discord Community</li>
              </ul>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

const styles = {
  container: { backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  loading: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' },
  error: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  main: { marginTop: '80px', flex: 1, maxWidth: '1200px', margin: '80px auto 0 auto', padding: '60px 20px', width: '100%' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '60px', alignItems: 'start' },
  badge: { display: 'inline-block', padding: '6px 16px', backgroundColor: 'var(--badgeBg)', color: 'var(--badgeText)', borderRadius: '100px', fontSize: '0.9rem', fontWeight: '700', marginBottom: '20px' },
  title: { fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' },
  instructor: { fontSize: '1.1rem', color: 'var(--textSecondary)', marginBottom: '40px' },
  descriptionSection: { padding: '40px', backgroundColor: 'var(--cardBg)', borderRadius: '24px', border: '1px solid var(--cardBorder)', boxShadow: 'var(--cardShadow)' },
  text: { fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--textSecondary)' },
  sidebar: { position: 'sticky', top: '120px' },
  priceCard: { backgroundColor: 'var(--cardBg)', padding: '40px', borderRadius: '30px', border: '1px solid var(--cardBorder)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', textAlign: 'center' },
  price: { fontSize: '3rem', fontWeight: '800', marginBottom: '30px' },
  featuresList: { listStyle: 'none', padding: 0, marginTop: '30px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--textSecondary)', fontSize: '0.95rem' }
};

export default CourseDetail;
