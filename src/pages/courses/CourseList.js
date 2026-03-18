import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';
import { FiSearch, FiActivity } from 'react-icons/fi';
import '../../styles/EduFlow.css';

const courseEmojis = { 'Technology': '💻', 'Design': '🎨', 'Business': '📈', 'Marketing': '📊', 'Data Science': '🤖' };
const getCourseEmoji = (cat) => courseEmojis[cat] || '📚';
const thumbColors = ['t1', 't2', 't3', 't4'];

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gsap.from('.edu-page-header', { opacity: 0, scale: 0.9, duration: 1, ease: 'back.out(1.7)' });
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
        setFilteredCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;
    if (activeCategory !== 'All') {
      filtered = filtered.filter(c => c.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredCourses(filtered);
    
    // Animate grid items
    gsap.fromTo('.edu-course-item', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
    );
  }, [searchQuery, courses, activeCategory]);

  const categories = ['All', 'Technology', 'Design', 'Business', 'Marketing', 'Data Science'];

  return (
    <div className="edu-page" style={{background: '#FAF9F6', minHeight: '100vh', position: 'relative'}}>
      <Navbar />
      
      {/* Cinematic Background Pattern */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(circle at 50% -20%, #E85D2A10 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }}></div>

      <div className="container py-5 mt-5" style={{position: 'relative', zIndex: 1}}>
        <header className="edu-page-header text-center mb-5" style={{maxWidth: '900px', margin: '0 auto'}}>
          <div className="edu-tag-mini mb-3">ELITE CURRICULUM</div>
          <h1 className="display-3 fw-bold mb-3" style={{
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #1A1916 0%, #E85D2A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            NexLearn Universe
          </h1>
          <p className="lead mb-5" style={{color: '#6B6962', fontSize: '1.2rem', fontWeight: 400}}>
            Accelerate your growth with our elite curriculum engineered for global impact. <br/>
            Sourced from the world's most prestigious institutions.
          </p>
          
          <div className="row justify-content-center mt-4">
            <div className="col-md-7">
              <div className="edu-search-v3 shadow-lg">
                <FiSearch style={{fontSize: '20px', color: '#9B9890'}} />
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="What would you like to master today?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd style={{background: '#F5F4F0', color: '#9B9890', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E0D8'}}>⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-5">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`edu-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div style={{textAlign: 'center', padding: '100px'}}>
             <div className="edu-loading-ring"></div>
             <p style={{color: '#9B9890', marginTop: '20px', letterSpacing: '2px'}}>SYNCHRONIZING REPOSITORY...</p>
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="edu-course-grid-v2">
                {filteredCourses.map((course, idx) => (
                  <Link to={`/course/${course._id}`} key={course._id} className="edu-card-v2">
                    <div className={`c-v2-thumb ${thumbColors[idx % 4]}`}>
                      <span className="c-v2-emoji">{getCourseEmoji(course.category)}</span>
                      {course.isExternal && (
                        <div className="c-v2-source-badge">
                           {course.source}
                        </div>
                      )}
                    </div>
                    <div className="c-v2-body">
                      <div className="c-v2-header">
                        <span className="c-v2-tag">{course.category}</span>
                        <div className="c-v2-price">{course.price === 0 ? 'COMPLIMENTARY' : `$${course.price}`}</div>
                      </div>
                      <h3 className="c-v2-title">{course.title}</h3>
                      <p className="c-v2-desc">{course.description ? course.description.substring(0, 110) + '...' : 'Premium curriculum details pending decryption.'}</p>
                      
                      <div className="c-v2-footer">
                         <div className="c-v2-stats">
                            <FiActivity style={{marginRight: '5px'}} /> Advanced Level
                         </div>
                         <div className="c-v2-link">Unlock Repository →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="edu-empty-vault-v2">
                <div className="empty-v2-icon">🔭</div>
                <h2>Search Fragmented</h2>
                <p>We couldn't locate any intelligence matching "{searchQuery}". <br/>Try adjusting your query parameters.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="edu-pill-btn active"
                >
                  Reset Parameters
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />

      <style>{`
        .edu-tag-mini { display: inline-block; padding: 4px 12px; background: #E85D2A15; color: #E85D2A; font-size: 10px; font-weight: 800; border-radius: 4px; letter-spacing: 2px; }
        .edu-search-v3 { background: #fff; border-radius: 50px; padding: 6px 20px; display: flex; align-items: center; border: 1px solid #E2E0D8; transition: 0.3s; }
        .edu-search-v3:focus-within { border-color: #E85D2A; box-shadow: 0 15px 35px rgba(232, 93, 42, 0.1) !important; }
        .edu-search-v3 input { border: none; box-shadow: none !important; font-size: 16px; padding: 10px 15px; }
        .edu-pill-btn { border: 1px solid #E2E0D8; background: #fff; padding: 8px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; color: #6B6962; transition: 0.3s; cursor: pointer; }
        .edu-pill-btn:hover { border-color: #E85D2A; color: #E85D2A; }
        .edu-pill-btn.active { background: #1A1916; color: #fff; border-color: #1A1916; }

        .edu-course-grid-v2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 35px; }
        .edu-card-v2 { background: #fff; border-radius: 28px; border: 1px solid #E2E0D8; overflow: hidden; text-decoration: none; color: inherit; transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); display: flex; flex-direction: column; }
        .edu-card-v2:hover { transform: translateY(-15px); border-color: #E85D2A; box-shadow: 0 35px 70px rgba(0,0,0,0.06); }
        
        .c-v2-thumb { height: 200px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .c-v2-emoji { font-size: 70px; transition: 0.6s cubic-bezier(0.19, 1, 0.22, 1); }
        .edu-card-v2:hover .c-v2-emoji { transform: scale(1.15) translateY(-5px); }
        
        .c-v2-source-badge { position: absolute; bottom: 15px; left: 15px; background: rgba(255,255,255,0.9); backdrop-filter: blur(5px); padding: 5px 12px; border-radius: 8px; font-size: 10px; font-weight: 800; color: #1A1916; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .c-v2-body { padding: 30px; flex-grow: 1; display: flex; flex-direction: column; }
        .c-v2-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
        .c-v2-tag { font-size: 10px; font-weight: 800; color: #E85D2A; letter-spacing: 1px; text-transform: uppercase; }
        .c-v2-price { font-size: 12px; font-weight: 900; color: #2D5BE3; }
        .c-v2-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; margin-bottom: 12px; line-height: 1.3; }
        .c-v2-desc { font-size: 15px; color: #6B6962; line-height: 1.6; margin-bottom: 25px; }
        
        .c-v2-footer { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: 20px; border-top: 1px solid #F5F4F0; }
        .c-v2-stats { font-size: 12px; color: #9B9890; display: flex; align-items: center; }
        .c-v2-link { font-size: 12px; font-weight: 700; color: #1A1916; transition: 0.3s; }
        .edu-card-v2:hover .c-v2-link { color: #E85D2A; transform: translateX(5px); }

        .edu-loading-ring { width: 40px; height: 40px; border: 3px solid #E2E0D8; border-top-color: #E85D2A; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .edu-empty-vault-v2 { text-align: center; padding: 100px 40px; }
        .empty-v2-icon { font-size: 60px; margin-bottom: 20px; opacity: 0.5; }
      `}</style>
    </div>
  );
};

export default CourseList;
