import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api, { IMAGE_BASE_URL } from '../../services/api';
import '../../styles/EduFlow.css';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes, myCRes] = await Promise.all([
          api.get(`/courses/${courseId}`),
          api.get(`/lessons/course/${courseId}`),
          api.get('/my-courses').catch(() => ({ data: [] }))
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);

        // Find specific enrollment
        const currentEnroll = myCRes.data.find(e => (e.course?._id === courseId || e.course === courseId));
        setEnrollment(currentEnroll);
        
        if (lessonId) {
          setCurrentLesson(lessonsRes.data.find(l => l._id === lessonId));
        } else if (lessonsRes.data.length > 0) {
          setCurrentLesson(lessonsRes.data[0]);
        } else if (courseRes.data.isYouTube && courseRes.data.playlistUrl) {
          // Virtual lesson for YouTube playlist
          setCurrentLesson({
            _id: 'v-playlist',
            title: 'Full Course Playlist',
            videoUrl: courseRes.data.playlistUrl,
            content: 'Watch the full course video/playlist on YouTube via the player above.'
          });
        }
      } catch (err) {
        console.error('Error fetching lesson data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  const handleCompleteCourse = async () => {
    if (!enrollment) return;
    setUpdating(true);
    try {
      await api.put(`/enrollments/${enrollment._id}`, { progress: 100 });
      setEnrollment({ ...enrollment, progress: 100 });
      alert(`Congratulations! You've earned ${course.points || 0} points for completing this course.`);
    } catch (err) {
      console.error('Progress update error:', err);
    } finally {
      setUpdating(false);
    }
  };

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
            {lessons.length > 0 ? lessons.map((lesson, idx) => (
              <div 
                key={lesson._id}
                onClick={() => setCurrentLesson(lesson)}
                className={`ps-item ${currentLesson?._id === lesson._id ? 'active' : ''}`}
              >
                <span className="ps-num">{idx + 1}</span>
                <span>{lesson.title}</span>
                {currentLesson?._id === lesson._id && <span style={{marginLeft:'auto', fontSize:'12px'}}>▶</span>}
              </div>
            )) : course.isYouTube && (
              <div 
                className={`ps-item active`}
                onClick={() => setCurrentLesson({
                  _id: 'v-playlist',
                  title: 'Full Course Playlist',
                  videoUrl: course.playlistUrl,
                  content: 'Watch the full course video/playlist'
                })}
              >
                <span className="ps-num">▶</span>
                <span>Watch Full Playlist</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Lesson View */}
        <div className="edu-player-main">
          {currentLesson ? (
            <div>
              <h1>{currentLesson.title}</h1>
              
              <div className="edu-player-video">
                {currentLesson.videoUrl ? (
                  (() => {
                    const url = currentLesson.videoUrl;
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                    const match = url.match(regExp);
                    const videoId = (match && match[2].length === 11) ? match[2] : null;
                    
                    if (videoId || url.includes('youtube.com/embed') || url.includes('list=')) {
                      let finalSrc = url;
                      if (videoId && !url.includes('embed')) finalSrc = `https://www.youtube.com/embed/${videoId}`;
                      if (url.includes('list=') && !url.includes('embed')) {
                        const listMatch = url.match(/[?&]list=([^#&?]+)/);
                        if (listMatch) finalSrc = `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
                      }
                      
                      return (
                        <iframe 
                          src={finalSrc} 
                          title="Lesson Video"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        ></iframe>
                      );
                    }
                    
                    // Fallback for non-YouTube
                    return (
                      <video 
                        src={url.startsWith('http') ? url : `${IMAGE_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`} 
                        controls 
                        width="100%" 
                        height="100%"
                        style={{borderRadius: '16px'}}
                      ></video>
                    );
                  })()
                ) : (
                  <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#F0EEE9', color:'#9B9890'}}>
                    No video content for this lesson.
                  </div>
                )}
              </div>

              <div className="edu-player-text">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <h3>Lesson Overview</h3>
                   {enrollment && enrollment.progress < 100 && (
                     <button 
                        className="edu-btn edu-btn-primary" 
                        style={{fontSize:'12px', padding:'8px 16px', background:'var(--edu-green)'}}
                        onClick={handleCompleteCourse}
                        disabled={updating}
                     >
                        {updating ? 'Updating...' : 'Mark Course as Completed'}
                     </button>
                   )}
                   {enrollment && enrollment.progress >= 100 && (
                     <span style={{fontSize:'13px', color:'var(--edu-green)', fontWeight:700}}>✓ Course Completed</span>
                   )}
                </div>
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
