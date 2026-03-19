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

    if (course.isExternal && course.externalLink) {
      let finalLink = course.externalLink;
      if (course.couponCode && course.externalLink.includes('udemy.com')) {
        finalLink = course.externalLink.includes('?') 
          ? `${course.externalLink}&couponCode=${course.couponCode}`
          : `${course.externalLink}?couponCode=${course.couponCode}`;
      }
      window.open(finalLink, '_blank');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enroll', { course: course._id });
      toast.success('🎉 Successfully enrolled! Start learning now.');
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
      <div className="edu-page-content" style={{paddingTop: '100px'}}>
        
        {/* Hero Banner */}
        <div className="cd-hero">
          <div className="cd-hero-inner">
            <span className="cd-badge">{course.category}</span>
            <h1 className="cd-title">{course.title}</h1>
            <p className="cd-meta">
              Curated by <span style={{ color: '#2D5BE3', fontWeight: 600 }}>NexLearn Faculty</span> · Updated March 2026
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="cd-grid">
          {/* Left Content */}
          <div className="cd-main">
            <div className="cd-section">
              <h3 className="cd-section-title">What you'll learn</h3>
              <p className="cd-desc">{course.description}</p>
              
              <div className="cd-features">
                <div className="cd-feature">
                  <div className="cd-feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h5>Industry Standard Skills</h5>
                    <p>Get hands-on experience with the latest technologies.</p>
                  </div>
                </div>
                <div className="cd-feature">
                  <div className="cd-feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h5>Project-Based Learning</h5>
                    <p>Build real-world applications for your portfolio.</p>
                  </div>
                </div>
                <div className="cd-feature">
                  <div className="cd-feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h5>Expert-Led Content</h5>
                    <p>Learn from industry professionals and gain practical insights.</p>
                  </div>
                </div>
                <div className="cd-feature">
                  <div className="cd-feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h5>Certificate of Completion</h5>
                    <p>Earn a digital certificate to showcase your achievement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="cd-sidebar">
            <div className="cd-price-card">
              <div className="cd-price">
                {isEnrolled ? '✓ Enrolled' : course.price === 0 ? 'FREE' : `$${course.price}`}
              </div>
              
              {isEnrolled ? (
                <button 
                  className="cd-enroll-btn cd-enrolled"
                  onClick={() => navigate(`/course/${course._id}/lesson`)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18, height:18}}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Start Learning
                </button>
              ) : (
                <button 
                  className="cd-enroll-btn"
                  disabled={enrolling}
                  onClick={handleEnroll}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              <ul className="cd-perks">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2" style={{width:16, height:16, flexShrink:0}}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  {course.lessons?.length || 0} Video Lessons
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2" style={{width:16, height:16, flexShrink:0}}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  Digital Certificate
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2" style={{width:16, height:16, flexShrink:0}}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  Mobile & Desktop Access
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2" style={{width:16, height:16, flexShrink:0}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Community Support
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#2D5BE3" strokeWidth="2" style={{width:16, height:16, flexShrink:0}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Lifetime Access
                </li>
              </ul>
              
              <div className="cd-guarantee">
                30-Day Money-Back Guarantee
              </div>
            </div>
          </div>
        </div>

      </div>
      <Footer />

      <style>{`
        .cd-hero {
          background: linear-gradient(135deg, #EEF1FD 0%, #F8F9FF 50%, #E8EDFD 100%);
          border-radius: 20px;
          padding: 50px 40px;
          margin-bottom: 40px;
          border: 1px solid #D6DEF5;
        }
        .cd-hero-inner { max-width: 700px; }
        .cd-badge {
          display: inline-block;
          background: #2D5BE3;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 14px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .cd-title {
          font-family: 'Playfair Display', serif;
          font-size: 34px;
          font-weight: 700;
          color: #1A1916;
          line-height: 1.2;
          margin: 0 0 12px;
        }
        .cd-meta { font-size: 14px; color: #6B6962; margin: 0; }

        /* Grid */
        .cd-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 40px;
          align-items: start;
        }

        /* Main Section */
        .cd-section {
          background: #fff;
          border: 1px solid #F0EFEA;
          border-radius: 18px;
          padding: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
        }
        .cd-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #1A1916;
          margin-bottom: 12px;
        }
        .cd-desc {
          font-size: 14px;
          color: #6B6962;
          line-height: 1.8;
          margin-bottom: 28px;
        }
        .cd-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .cd-feature {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .cd-feature-icon {
          width: 32px;
          height: 32px;
          background: #EEF1FD;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cd-feature-icon svg { width: 16px; height: 16px; }
        .cd-feature h5 {
          font-size: 14px;
          font-weight: 600;
          color: #1A1916;
          margin: 0 0 4px;
        }
        .cd-feature p {
          font-size: 12px;
          color: #9B9890;
          margin: 0;
          line-height: 1.5;
        }

        /* Sidebar Price Card */
        .cd-sidebar { position: sticky; top: 90px; }
        .cd-price-card {
          background: #fff;
          border: 1px solid #F0EFEA;
          border-radius: 18px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }
        .cd-price {
          font-size: 38px;
          font-weight: 800;
          color: #1A1916;
          margin-bottom: 20px;
        }
        .cd-enroll-btn {
          width: 100%;
          padding: 14px 24px;
          background: #2D5BE3;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .cd-enroll-btn:hover { background: #1F47B8; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(45,91,227,0.3); }
        .cd-enroll-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .cd-enroll-btn.cd-enrolled { background: #1C7A52; }
        .cd-enroll-btn.cd-enrolled:hover { background: #156640; box-shadow: 0 8px 25px rgba(28,122,82,0.3); }

        .cd-perks {
          list-style: none;
          padding: 0;
          margin: 24px 0 0;
          text-align: left;
        }
        .cd-perks li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          font-size: 13px;
          color: #6B6962;
          border-bottom: 1px solid #F5F4F0;
        }
        .cd-perks li:last-child { border-bottom: none; }

        .cd-guarantee {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #F0EFEA;
          font-size: 11px;
          color: #9B9890;
          font-weight: 500;
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 991px) {
          .cd-hero { padding: 36px 24px; }
          .cd-title { font-size: 26px; }
          .cd-grid { grid-template-columns: 1fr; gap: 24px; }
          .cd-sidebar { position: static; }
          .cd-features { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
          .cd-hero { padding: 28px 18px; border-radius: 14px; }
          .cd-title { font-size: 22px; }
          .cd-section { padding: 20px; }
          .cd-price-card { padding: 24px; }
          .cd-price { font-size: 30px; }
        }
      `}</style>
    </div>
  );
};

export default CourseDetail;
