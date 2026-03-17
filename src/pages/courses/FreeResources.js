import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';
import '../../styles/EduFlow.css';

const FreeResources = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchFreeCourses = async () => {
            try {
                const res = await api.get('/courses/free-courses');
                setCourses(res.data);
            } catch (err) {
                console.error('Error fetching free courses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFreeCourses();
        
        // Entrance Animation
        gsap.from('.free-header', { y: -50, opacity: 0, duration: 1, ease: 'power3.out' });
    }, []);

    useEffect(() => {
        if (!loading) {
            gsap.from('.resource-card', { 
                scale: 0.8, 
                opacity: 0, 
                stagger: 0.1, 
                duration: 0.6, 
                ease: 'back.out(1.7)' 
            });
        }
    }, [loading, selectedCategory]);

    const categories = ['All', ...new Set(courses.map(c => c.category))];
    const filteredCourses = selectedCategory === 'All' ? courses : courses.filter(c => c.category === selectedCategory);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Coupon code copied: ' + text);
    };

    return (
        <div className="edu-page">
            <Navbar />
            
            <div className="container py-5 mt-5">
                <header className="free-header text-center mb-5">
                    <h1 className="display-4 fw-bold" style={{fontFamily: "'Playfair Display', serif"}}>Free Learning Vault</h1>
                    <p className="lead" style={{color: '#6B6962'}}>Access world-class education from Harvard, freeCodeCamp, and more—completely free.</p>
                    
                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)}
                                className={`edu-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                {loading ? (
                    <div style={{textAlign: 'center', padding: '100px'}}>
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3" style={{color: '#9B9890'}}>Scanning the web for free knowledge...</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredCourses.map((course, idx) => (
                            <div className="col-md-6 col-lg-4" key={course._id}>
                                <div className="edu-card resource-card h-100 p-0 shadow-sm border-0">
                                    <div className="p-4" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px'}}>
                                        {course.thumbnail || '📚'}
                                    </div>
                                    <div className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="edu-tag edu-tag-blue" style={{fontSize: '10px'}}>{course.category}</span>
                                            <span className="fw-bold" style={{color: '#2D5BE3', fontSize: '10px'}}>{course.source}</span>
                                        </div>
                                        <h3 style={{fontSize: '18px', fontWeight: 700, marginBottom: '12px'}}>{course.title}</h3>
                                        <p style={{fontSize: '13px', color: '#6B6962', lineHeight: '1.6', marginBottom: '20px'}}>
                                            {course.description.substring(0, 100)}...
                                        </p>
                                        
                                        {course.couponCode && (
                                            <div className="coupon-box mb-3 p-2 text-center" style={{background: '#EEF1FD', border: '1px dashed #2D5BE3', borderRadius: '8px', cursor: 'pointer'}} onClick={() => copyToClipboard(course.couponCode)}>
                                                <span style={{fontSize: '11px', color: '#2D5BE3', fontWeight: 600}}>Coupon: </span>
                                                <span style={{fontSize: '13px', fontWeight: 700, letterSpacing: '1px'}}>{course.couponCode}</span>
                                                <div style={{fontSize: '9px', color: '#9B9890', marginTop: '2px'}}>Click to copy</div>
                                            </div>
                                        )}

                                        <a 
                                            href={course.externalLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="edu-btn edu-btn-primary w-100 justify-content-center"
                                            style={{fontSize: '13px'}}
                                        >
                                            Enroll Now 🚀
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default FreeResources;
