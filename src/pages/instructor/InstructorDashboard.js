import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import authService from '../../services/authService';
import PlayfulButton from '../../components/PlayfulButton';
import gsap from 'gsap';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-courses');
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create/Edit Course Form State
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    price: '',
    video: null,
    isYouTube: false,
    playlistUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Lesson Management State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonData, setLessonData] = useState({ title: '', content: '', videoUrl: '', video: null });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonUploading, setLessonUploading] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
      alert('Access Denied: Instructor privileges required.');
      navigate('/');
      return;
    }
    fetchMyCourses();
  }, [navigate]);

  useEffect(() => {
    gsap.from('.dashboard-anim', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }, [activeTab, selectedCourse]);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses');
      const user = authService.getCurrentUser();
      const filtered = res.data.filter(c => c.instructor === user._id || user.role === 'admin');
      setMyCourses(filtered);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('category', courseData.category);
    formData.append('price', courseData.price);
    formData.append('isYouTube', courseData.isYouTube);
    formData.append('playlistUrl', courseData.playlistUrl);
    if (courseData.video) formData.append('video', courseData.video);

    try {
      if (isEditing) {
        await api.put(`/courses/${editCourseId}`, { ...courseData, video: undefined }); 
        alert('Course Updated!');
      } else {
        await api.post('/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Course Created!');
      }
      setCourseData({ title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: '' });
      setIsEditing(false);
      setActiveTab('my-courses');
      fetchMyCourses();
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (course) => {
    setCourseData({
      title: course.title,
      description: course.description,
      category: course.category,
      price: course.price,
      isYouTube: course.isYouTube || false,
      playlistUrl: course.playlistUrl || '',
      video: null
    });
    setEditCourseId(course._id);
    setIsEditing(true);
    setActiveTab('create');
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchMyCourses();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  // LESSONS MANAGEMENT
  const openLessons = async (course) => {
    setSelectedCourse(course);
    setLessonLoading(true);
    try {
      const res = await api.get(`/lessons/course/${course._id}`);
      setLessons(res.data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setLessonUploading(true);

    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('content', lessonData.content);
    formData.append('courseId', selectedCourse._id);
    
    if (lessonData.video) {
        formData.append('video', lessonData.video);
    } else if (lessonData.videoUrl) {
        formData.append('videoUrl', lessonData.videoUrl);
    }

    try {
      await api.post('/lessons', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLessonData({ title: '', content: '', videoUrl: '', video: null });
      alert('Lesson Added!');
      openLessons(selectedCourse); // Refresh
    } catch (err) {
      alert('Failed to add lesson: ' + (err.response?.data?.message || err.message));
    } finally {
      setLessonUploading(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await api.delete(`/lessons/${id}`);
        openLessons(selectedCourse);
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.main} className="dashboard-layout">
        <div style={styles.sidebar} className="sidebar-responsive">
          <h3 style={styles.sidebarTitle}>INSTRUCTOR DASHBOARD</h3>
          <ul style={styles.sidebarList} className="mobile-stack">
            <li 
              style={{...styles.sidebarItem, ...(activeTab === 'my-courses' && !selectedCourse ? styles.activeItem : {})}}
              onClick={() => { setActiveTab('my-courses'); setSelectedCourse(null); }}
            >
              My Courses
            </li>
            <li 
              style={{...styles.sidebarItem, ...(activeTab === 'create' ? styles.activeItem : {})}}
              onClick={() => { setActiveTab('create'); setIsEditing(false); setSelectedCourse(null); }}
            >
              Create Course
            </li>
          </ul>
        </div>
        
        <div style={styles.content} className="content-responsive">
          
          {loading ? (
            <p>Loading...</p>
          ) : selectedCourse ? (
             <div className="dashboard-anim">
                <button onClick={() => setSelectedCourse(null)} style={styles.backBtn}>← Back to Courses</button>
                <h2 style={styles.sectionTitle}>Manage Lessons: <span className="gradient-text">{selectedCourse.title}</span></h2>
                
                <div style={styles.lessonLayout} className="grid-responsive">
                  <div style={styles.lessonFormCard}>
                    <h4 style={{ marginBottom: '20px' }}>Add New Lesson</h4>
                    <form onSubmit={handleAddLesson} style={styles.form}>
                      <input 
                        placeholder="Lesson Title" 
                        style={styles.input} 
                        value={lessonData.title}
                        onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
                        required
                      />
                      <textarea 
                        placeholder="Lesson Content (Text)" 
                        style={{...styles.input, height: '150px'}} 
                        value={lessonData.content}
                        onChange={(e) => setLessonData({...lessonData, content: e.target.value})}
                        required
                      />
                      <input 
                        placeholder="Video URL (Optional)" 
                        style={styles.input} 
                        value={lessonData.videoUrl}
                        onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})}
                      />
                      <div style={{...styles.inputGroup, marginTop: '-15px'}}>
                        <label style={{fontSize: '0.8rem', color: 'var(--textSecondary)', fontWeight: 'bold'}}>OR Upload Video File</label>
                        <input 
                          type="file" 
                          accept="video/*"
                          style={styles.input}
                          onChange={(e) => setLessonData({...lessonData, video: e.target.files[0]})}
                        />
                      </div>
                      <PlayfulButton type="submit" disabled={lessonUploading}>
                        {lessonUploading ? 'Processing...' : 'Add Lesson'}
                      </PlayfulButton>
                    </form>
                  </div>

                  <div style={styles.lessonListCard}>
                    <h4>Existing Lessons</h4>
                    {lessonLoading ? <p>Loading lessons...</p> : lessons.length === 0 ? <p>No lessons added yet.</p> : (
                      <div style={{ marginTop: '20px' }}>
                        {lessons.map((lesson, idx) => (
                          <div key={lesson._id} style={styles.lessonItem}>
                            <div>
                               <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{idx + 1}.</span> {lesson.title}
                            </div>
                            <button onClick={() => handleDeleteLesson(lesson._id)} style={styles.deleteLink}>Delete</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
             </div>
          ) : activeTab === 'my-courses' ? (
            <div className="dashboard-anim">
              <h2 style={styles.sectionTitle}>Your Published <span className="gradient-text">Courses</span></h2>
              <div style={styles.grid}>
                {myCourses.map(course => (
                  <div key={course._id} style={styles.courseCard}>
                    <div style={{ flex: 1 }}>
                      <h4 style={styles.cardTitle}>{course.title}</h4>
                      <p style={styles.cardInfo}>{course.category} • ${course.price}</p>
                    </div>
                    <div style={styles.cardActions}>
                      <button onClick={() => startEdit(course)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => openLessons(course)} style={styles.manageBtn}>Lessons</button>
                      <button onClick={() => handleDeleteCourse(course._id)} style={styles.deleteBtn}>Delete</button>
                    </div>
                  </div>
                ))}
                {myCourses.length === 0 && <p>No courses found. Create your first course!</p>}
              </div>
            </div>
          ) : (
            <div className="dashboard-anim">
              <h2 style={styles.sectionTitle}>{isEditing ? 'Edit' : 'Launch'} <span className="gradient-text">Course</span></h2>
              <div style={styles.formCard}>
                <form onSubmit={handleCourseSubmit} style={styles.form}>
                  <input 
                    placeholder="Course Title"
                    style={styles.input}
                    value={courseData.title}
                    onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                    required
                  />
                  <textarea 
                    placeholder="Course Description"
                    style={{...styles.input, height: '100px'}}
                    value={courseData.description}
                    onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                    required
                  />
                  <div style={styles.row}>
                    <select 
                      style={{...styles.input, flex: 1}}
                      value={courseData.category}
                      onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                    >
                      <option>Technology</option>
                      <option>Business</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Price ($)"
                      style={{...styles.input, flex: 1}}
                      value={courseData.price}
                      onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold'}}>
                      <input 
                        type="checkbox" 
                        checked={courseData.isYouTube}
                        onChange={(e) => setCourseData({...courseData, isYouTube: e.target.checked})}
                        style={{width: '18px', height: '18px'}}
                      />
                      Is this a YouTube-hosted course?
                    </label>
                  </div>
                  
                  {courseData.isYouTube ? (
                    <div style={styles.inputGroup}>
                      <label style={{fontSize: '0.8rem', color: 'var(--textSecondary)', fontWeight: 'bold'}}>YouTube Playlist URL</label>
                      <input 
                        placeholder="https://www.youtube.com/playlist?list=..."
                        style={styles.input}
                        value={courseData.playlistUrl}
                        onChange={(e) => setCourseData({...courseData, playlistUrl: e.target.value})}
                        required
                      />
                    </div>
                  ) : (
                    !isEditing && (
                      <div style={styles.inputGroup}>
                        <label style={{fontSize: '0.8rem', color: 'var(--textSecondary)', fontWeight: 'bold'}}>Intro Video (Native Upload)</label>
                        <input 
                          type="file" 
                          accept="video/*"
                          style={styles.input}
                          onChange={(e) => setCourseData({...courseData, video: e.target.files[0]})}
                        />
                      </div>
                    )
                  )}
                  <PlayfulButton type="submit" disabled={uploading}>
                    {uploading ? 'Processing...' : isEditing ? 'Update Course' : 'Publish Course'}
                  </PlayfulButton>
                  {isEditing && (
                    <button onClick={() => setIsEditing(false)} style={styles.cancelBtn}>Cancel Edit</button>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: { backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  main: { display: 'flex', marginTop: '80px', flex: 1 },
  sidebar: { width: '280px', backgroundColor: 'var(--cardBg)', borderRight: '1px solid var(--cardBorder)', padding: '50px 20px' },
  sidebarTitle: { color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '800', marginBottom: '30px', letterSpacing: '1px' },
  sidebarList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  sidebarItem: { padding: '14px 20px', borderRadius: '12px', color: 'var(--textSecondary)', cursor: 'pointer', transition: '0.3s', fontWeight: '500' },
  activeItem: { backgroundColor: 'var(--badgeBg)', color: 'var(--accent)', fontWeight: '700' },
  content: { flex: 1, padding: '50px 60px' },
  sectionTitle: { fontSize: '2.2rem', fontWeight: '800', marginBottom: '40px', color: 'var(--text)' },
  grid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  courseCard: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '25px', 
    backgroundColor: 'var(--cardBg)', 
    borderRadius: '20px', 
    border: '1px solid var(--cardBorder)',
    boxShadow: 'var(--cardShadow)'
  },
  cardTitle: { margin: 0, fontSize: '1.25rem', fontWeight: '700' },
  cardInfo: { margin: '8px 0 0 0', color: 'var(--textSecondary)', fontSize: '0.9rem' },
  cardActions: { display: 'flex', gap: '10px' },
  editBtn: { backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' },
  manageBtn: { backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' },
  formCard: { backgroundColor: 'var(--cardBg)', padding: '45px', borderRadius: '28px', border: '1px solid var(--cardBorder)', maxWidth: '750px', boxShadow: 'var(--cardShadow)' },
  form: { display: 'flex', flexDirection: 'column', gap: '25px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid var(--cardBorder)', backgroundColor: 'var(--bgSecondary)', color: 'var(--text)', outline: 'none', fontSize: '1rem' },
  row: { display: 'flex', gap: '20px' },
  cancelBtn: { backgroundColor: 'transparent', color: 'var(--textSecondary)', border: '1px solid var(--cardBorder)', padding: '10px', borderRadius: '12px', cursor: 'pointer' },
  backBtn: { background: 'none', border: 'none', color: 'var(--accent)', fontWeight: '700', cursor: 'pointer', marginBottom: '20px' },
  
  lessonLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' },
  lessonFormCard: { backgroundColor: 'var(--cardBg)', padding: '30px', borderRadius: '24px', border: '1px solid var(--cardBorder)' },
  lessonListCard: { backgroundColor: 'var(--cardBg)', padding: '30px', borderRadius: '24px', border: '1px solid var(--cardBorder)' },
  lessonItem: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid var(--cardBorder)' },
  deleteLink: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }
};

export default InstructorDashboard;
