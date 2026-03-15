import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import gsap from 'gsap';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
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
        
        // Set initial lesson
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

  useEffect(() => {
    if (currentLesson) {
      gsap.from('.lesson-content-anim', {
        opacity: 0,
        x: 20,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [currentLesson]);

  if (loading) return <div style={styles.loading}><Navbar />Loading Lesson...<Footer /></div>;
  if (!course) return <div style={styles.error}><Navbar />Course not found<Footer /></div>;

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.playerLayout} className="dashboard-layout">
        {/* Sidebar: Lesson List */}
        <div style={styles.sidebar} className="sidebar-responsive">
          <div style={styles.sidebarHeader}>
            <h4 style={styles.courseTitle}>{course.title}</h4>
            <div style={styles.progressText}>{lessons.length} Lessons</div>
          </div>
          <div style={styles.lessonList}>
            {lessons.map((lesson, idx) => (
              <div 
                key={lesson._id}
                onClick={() => setCurrentLesson(lesson)}
                style={{
                  ...styles.lessonItem,
                  ...(currentLesson?._id === lesson._id ? styles.activeLesson : {})
                }}
              >
                <span style={styles.lessonNum}>{idx + 1}</span>
                <span style={styles.lessonTitle}>{lesson.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Lesson View */}
        <div style={styles.mainContent} className="content-responsive">
          {currentLesson ? (
            <div className="lesson-content-anim">
              <h1 style={styles.lessonHeading}>{currentLesson.title}</h1>
              
              {currentLesson.videoUrl ? (
                <div style={styles.videoWrapper}>
                   <iframe 
                     style={styles.video}
                     src={currentLesson.videoUrl.replace('watch?v=', 'embed/').split('&')[0]} 
                     title="Lesson Video"
                     frameBorder="0" 
                     allowFullScreen
                   ></iframe>
                </div>
              ) : (
                <div style={styles.noVideo}>
                   <span>No video content for this lesson.</span>
                </div>
              )}

              <div style={styles.textContent}>
                <h3>Lesson Overview</h3>
                <p style={styles.text}>{currentLesson.content}</p>
              </div>

              <div style={styles.navigation}>
                <button 
                   style={styles.navBtn} 
                   onClick={() => {
                     const idx = lessons.findIndex(l => l._id === currentLesson._id);
                     if (idx > 0) setCurrentLesson(lessons[idx - 1]);
                   }}
                   disabled={lessons.findIndex(l => l._id === currentLesson._id) === 0}
                >
                  Previous
                </button>
                <button 
                  style={{...styles.navBtn, backgroundColor: 'var(--accent)', color: 'white'}}
                  onClick={() => {
                    const idx = lessons.findIndex(l => l._id === currentLesson._id);
                    if (idx < lessons.length - 1) setCurrentLesson(lessons[idx + 1]);
                  }}
                  disabled={lessons.findIndex(l => l._id === currentLesson._id) === lessons.length - 1}
                >
                  Next Lesson
                </button>
              </div>
            </div>
          ) : course.isYouTube && course.playlistUrl ? (
            <div className="lesson-content-anim">
              <h1 style={styles.lessonHeading}>Course Playlist</h1>
              <div style={styles.videoWrapper}>
                 <iframe 
                   style={styles.video}
                   src={course.playlistUrl.includes('list=') 
                        ? `https://www.youtube.com/embed/videoseries?list=${course.playlistUrl.split('list=')[1].split('&')[0]}`
                        : course.playlistUrl.replace('watch?v=', 'embed/')} 
                   title="Course Playlist"
                   frameBorder="0" 
                   allowFullScreen
                 ></iframe>
              </div>
              <div style={styles.textContent}>
                <h3>About this Course</h3>
                <p style={styles.text}>{course.description}</p>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>Select a lesson to start learning.</div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: { backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  loading: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' },
  error: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  playerLayout: { display: 'flex', marginTop: '80px', flex: 1, backgroundColor: 'var(--bg)' },
  
  sidebar: { width: '350px', backgroundColor: 'var(--cardBg)', borderRight: '1px solid var(--cardBorder)', overflowY: 'auto' },
  sidebarHeader: { padding: '30px', borderBottom: '1px solid var(--cardBorder)', backgroundColor: 'var(--bgSecondary)' },
  courseTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '10px' },
  progressText: { fontSize: '0.85rem', color: 'var(--textSecondary)', fontWeight: '600' },
  lessonList: { padding: '10px 0' },
  lessonItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '18px 30px', cursor: 'pointer', transition: '0.2s', borderLeft: '4px solid transparent' },
  activeLesson: { backgroundColor: 'var(--badgeBg)', borderLeft: '4px solid var(--accent)', color: 'var(--accent)' },
  lessonNum: { fontSize: '0.9rem', opacity: 0.5, fontWeight: '700' },
  lessonTitle: { fontSize: '0.95rem', fontWeight: '500' },

  mainContent: { flex: 1, padding: '50px 80px', overflowY: 'auto' },
  lessonHeading: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px' },
  videoWrapper: { width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', marginBottom: '40px' },
  video: { width: '100%', height: '100%' },
  noVideo: { width: '100%', height: '300px', backgroundColor: 'var(--bgSecondary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--textMuted)', marginBottom: '40px' },
  textContent: { backgroundColor: 'var(--cardBg)', padding: '40px', borderRadius: '24px', border: '1px solid var(--cardBorder)', boxShadow: 'var(--cardShadow)' },
  text: { fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--textSecondary)', marginTop: '20px' },
  navigation: { display: 'flex', justifyContent: 'space-between', marginTop: '50px' },
  navBtn: { padding: '12px 30px', borderRadius: '12px', border: '1px solid var(--cardBorder)', backgroundColor: 'var(--cardBg)', cursor: 'pointer', fontWeight: '700', transition: '0.3s' },
  emptyState: { textAlign: 'center', padding: '100px', color: 'var(--textMuted)', fontSize: '1.2rem' }
};

export default LessonPlayer;
