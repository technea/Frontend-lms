import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';
import { FiSearch, FiActivity } from 'react-icons/fi';
import '../../styles/EduFlow.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gsap.from('.edu-page-header', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' });
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
    
    gsap.fromTo('.edu-card-v2', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
    );
  }, [searchQuery, courses, activeCategory]);

  const categories = ['All', 'Technology', 'Design', 'Business', 'Marketing', 'Data Science'];

  return (
    <div className="edu-page">
      <Navbar />
      
      <div className="edu-page-content" style={{paddingTop: '100px'}}>
        <header className="edu-page-header">
          <h1 className="display-4 fw-bold mb-3">Explore Our Courses</h1>
          <p className="lead mb-5">
            Discover professional courses designed to help you master new skills and advance your career.
          </p>
          
          <div style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="edu-search-v3">
              <FiSearch style={{fontSize: '20px', color: '#9B9890'}} />
              <input 
                type="text" 
                placeholder="Search by topic, skill, or platform..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="edu-filter-row justify-content-center">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`edu-filter-chip ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div style={{textAlign: 'center', padding: '100px'}}>
             <div className="edu-loading-ring"></div>
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="edu-course-grid-v2">
                {filteredCourses.map((course, idx) => (
                  <Link to={`/course/${course._id}`} key={course._id} className="edu-card-v2">
                    <div className="c-v2-thumb">
                      <FiActivity style={{fontSize: '40px', color: '#2D5BE3', opacity: 0.6}} />
                      {course.isExternal && (
                        <div className="c-v2-source-badge">
                           {course.source}
                        </div>
                      )}
                    </div>
                    <div className="c-v2-body">
                      <div className="c-v2-header">
                        <span className="c-v2-tag">{course.category}</span>
                        <div className="c-v2-price">{course.price === 0 ? 'FREE' : `$${course.price}`}</div>
                      </div>
                      <h3 className="c-v2-title">{course.title}</h3>
                      <p className="c-v2-desc">{course.description ? course.description.substring(0, 90) + '...' : 'Details pending.'}</p>
                      
                      <div className="c-v2-footer">
                         <div className="c-v2-stats">
                            <FiActivity style={{marginRight: '5px', color: '#2D5BE3'}} /> Professional Track
                         </div>
                         <div className="c-v2-link">View Course →</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="edu-empty-vault-v2">
                <div className="empty-v2-icon">🔭</div>
                <h2>No Results Found</h2>
                <p>We couldn't locate any intelligence matching "{searchQuery}". <br/>Try adjusting your query parameters.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="edu-pill-btn active"
                  style={{marginTop: '20px'}}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />

      <style>{`
        .edu-search-v3 { 
          background: #fff; border-radius: 12px; padding: 12px 20px; 
          display: flex; align-items: center; border: 1px solid var(--cardBorder); 
          transition: 0.3s; box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .edu-search-v3:focus-within { border-color: var(--accent); box-shadow: 0 10px 30px rgba(45,91,227,0.05); }
        .edu-search-v3 input { border: none; outline: none; font-size: 15px; padding: 2px 15px; flex: 1; }
        
        .edu-empty-vault-v2 { text-align: center; padding: 100px 40px; }
        .empty-v2-icon { font-size: 60px; margin-bottom: 20px; opacity: 0.5; }
        
        .edu-loading-ring { width: 40px; height: 40px; border: 3px solid var(--bgAlt); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CourseList;
