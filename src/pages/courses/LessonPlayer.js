import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import '../../styles/EduFlow.css';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/lessons/course/${courseId}`)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
        
        if (lessonId) {
          setCurrentLesson(lessonsRes.data.find(l => l._id === lessonId));
        } else if (lessonsRes.data.length > 0) {
          setCurrentLesson(lessonsRes.data[0]);
        }
      } catch (err) {
        console.error('Error fetching lesson data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  if (loading) return <div className="edu-page"><Navbar /><div style={{textAlign:'center', padding:'100px'}}>Loading Lesson...</div><Footer /></div>;
  if (!course) return <div className="edu-page"><Navbar /><div style={{textAlign:'center', padding:'100px'}}>Course not found</div><Footer /></div>;

  return (
    <div className="edu-page" style={{display:'flex', flexDirection:'column', minHeight:'100vh'}}>
      <Navbar />
      <div className="edu-player-layout">
        {/* Sidebar: Lesson List */}
        <div className="edu-player-sidebar">
          <div className="ps-header">
            <h4>{course.title}</h4>
            <span>{lessons.length} Lessons</span>
          </div>
          <div style={{paddingBottom: '20px'}}>
            {lessons.map((lesson, idx) => (
              <div 
                key={lesson._id}
                onClick={() => setCurrentLesson(lesson)}
                className={`ps-item ${currentLesson?._id === lesson._id ? 'active' : ''}`}
              >
                <span className="ps-num">{idx + 1}</span>
                <span>{lesson.title}</span>
                {currentLesson?._id === lesson._id && <span style={{marginLeft:'auto', fontSize:'12px'}}>▶</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Lesson View */}
        <div className="edu-player-main">
          {currentLesson ? (
            <div>
              <h1>{currentLesson.title}</h1>
              
              <div className="edu-player-video">
                {currentLesson.videoUrl ? (
                  <iframe 
                    src={currentLesson.videoUrl.replace('watch?v=', 'embed/').split('&')[0]} 
                    title="Lesson Video"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div style={{height:'100%', display:'flex', alignItems:'center', justifyCenter:'center', background:'#F0EEE9', color:'#9B9890'}}>
                    No video content for this lesson.
                  </div>
                )}
              </div>

              <div className="edu-player-text">
                <h3>Lesson Overview</h3>
                <p>{currentLesson.content}</p>
              </div>

              <div className="edu-player-nav">
                <button 
                  onClick={() => {
                    const idx = lessons.findIndex(l => l._id === currentLesson._id);
                    if (idx > 0) setCurrentLesson(lessons[idx - 1]);
                  }}
                  disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
                >
                  ← Previous
                </button>
                <button 
                  className="primary"
                  onClick={() => {
                    const idx = lessons.findIndex(l => l._id === currentLesson._id);
                    if (idx < lessons.length - 1) setCurrentLesson(lessons[idx + 1]);
                  }}
                  disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
                >
                  Next Lesson →
                </button>
              </div>
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '100px', color: '#9B9890'}}>
              <h3>Select a lesson to start learning.</h3>
              <p>Great things take time. Choose a lesson from the sidebar to begin your journey.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonPlayer;
