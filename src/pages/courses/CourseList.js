import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';
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
    <div className="edu-page">
      <Navbar />
      
      <div className="container py-5 mt-5">
        <header className="edu-page-header text-center mb-5">
          <h1 className="display-4 fw-bold">NexLearn Universe</h1>
          <p className="lead border-bottom pb-4">Accelerate your growth with our elite curriculum engineered for impact.</p>
          
          <div className="row justify-content-center mt-4">
            <div className="col-md-6">
              <div className="edu-search-wrap shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input 
                  type="text" 
                  className="form-control form-control-lg border-0 bg-light"
                  placeholder="Search NexLearn curriculum..." 
                  style={{paddingLeft: '45px'}}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill px-4 shadow-sm`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div style={{textAlign: 'center', padding: '100px', color: '#9B9890'}}>Loading amazing courses for you...</div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="edu-courses-list">
                {filteredCourses.map((course, idx) => (
                  <Link to={`/course/${course._id}`} key={course._id} className="edu-course-item">
                    <div className={`c-thumb ${thumbColors[idx % 4]}`}>
                      {getCourseEmoji(course.category)}
                    </div>
                    <div className="c-body">
                      <div style={{display: 'flex', gap: '8px', marginBottom: '5px'}}>
                        <span className="c-cat">{course.category}</span>
                        {course.isExternal && <span className="edu-tag edu-tag-orange" style={{padding: '1px 8px', fontSize: '9px'}}>{course.source}</span>}
                      </div>
                      <h3 className="c-title">{course.title}</h3>
                      <p className="c-desc">{course.description ? course.description.substring(0, 100) + '...' : 'No description available.'}</p>
                      <div className="c-footer">
                        <span className="c-price">{course.price === 0 ? 'FREE' : `$${course.price}`}</span>
                        <span className="edu-btn edu-btn-primary" style={{padding: '6px 14px', fontSize: '11px'}}>View Details</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '14px', border: '1px solid #E2E0D8'}}>
                <h3 style={{marginBottom: '10px'}}>No courses found matching "{searchQuery}"</h3>
                <p style={{color: '#6B6962', fontSize: '14px', marginBottom: '20px'}}>Try searching for different keywords or categories.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="edu-btn edu-btn-outline"
                >
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CourseList;
