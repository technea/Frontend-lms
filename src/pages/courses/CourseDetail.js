import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import authService from '../../services/authService';
import '../../styles/EduFlow.css';

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
          api.get('/my-courses').catch(() => ({ data: [] }))
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

  const handleEnroll = async () => {
    const user = authService.getCurrentUser();
    if (!user) { navigate('/login'); return; }

    setEnrolling(true);
    try {
      await api.post('/enroll', { courseId: course._id });
      toast.success('Enrolled successfully!');
      setIsEnrolled(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="edu-page"><Navbar /><div className="edu-page-content" style={{textAlign:'center', padding:'100px'}}>Loading Details...</div><Footer /></div>;
  if (!course) return <div className="edu-page"><Navbar /><div className="edu-page-content" style={{textAlign:'center', padding:'100px'}}>Course Not Found</div><Footer /></div>;

  return (
    <div className="edu-page">
      <Navbar />
      <div className="edu-page-content">
        <div className="edu-detail-grid">
          
          <div className="edu-detail-main">
            <span className="edu-tag edu-tag-blue d-badge">{course.category}</span>
            <h1>{course.title}</h1>
            <p className="d-instructor">Curated by <span style={{ color: '#2D5BE3', fontWeight: 'bold' }}>NexLearn Faculty</span> · Protocol Updated March 2026</p>
            
            <div className="d-desc">
              <h3>What you'll learn</h3>
              <p>{course.description}</p>
              
              <div className="edu-grid-2" style={{marginTop: '32px'}}>
                <div style={{display: 'flex', gap: '12px'}}>
                  <span style={{fontSize: '20px'}}>✅</span>
                  <div>
                    <h5 style={{fontSize: '14px', marginBottom: '4px'}}>Industry Standard Skills</h5>
                    <p style={{fontSize: '12px', color: '#6B6962'}}>Get hands-on experience with the latest technologies.</p>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '12px'}}>
                  <span style={{fontSize: '20px'}}>✅</span>
                  <div>
                    <h5 style={{fontSize: '14px', marginBottom: '4px'}}>Project-Based Learning</h5>
                    <p style={{fontSize: '12px', color: '#6B6962'}}>Build real-world applications for your portfolio.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="edu-detail-sidebar">
            <div className="edu-detail-price-card">
              <h2>{isEnrolled ? 'Enrolled' : course.price === 0 ? 'FREE' : `$${course.price}`}</h2>
              
              {isEnrolled ? (
                <button 
                  className="edu-auth-btn" 
                  onClick={() => navigate(`/course/${course._id}/lesson`)}
                >
                  Start Learning
                </button>
              ) : (
                <button 
                  className="edu-auth-btn" 
                  disabled={enrolling}
                  onClick={handleEnroll}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              <ul>
                <li>🎬 {course.lessons?.length || 0} Video Lessons</li>
                <li>🏅 Digital Certificate on Completion</li>
                <li>📱 Access on mobile and desktop</li>
                <li>💬 Private Discord Community</li>
                <li>♾️ Lifetime Access to Materials</li>
              </ul>
              
              <div style={{marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E0D8'}}>
                <p style={{fontSize: '11px', color: '#9B9890'}}>30-Day Money-Back Guarantee</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseDetail;
