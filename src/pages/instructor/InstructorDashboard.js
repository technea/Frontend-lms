import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardSidebar from '../../components/DashboardSidebar';
import api from '../../services/api';
import authService from '../../services/authService';
import '../../styles/EduFlow.css';

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-courses');
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [courseData, setCourseData] = useState({
    title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonData, setLessonData] = useState({ title: '', content: '', videoUrl: '', video: null });
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonUploading, setLessonUploading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'instructor' && currentUser.role !== 'admin')) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    fetchMyCourses();
  }, [navigate]);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses');
      const currentUser = authService.getCurrentUser();
      const filtered = res.data.filter(c => c.instructor?._id === currentUser._id || c.instructor === currentUser._id);
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
        toast.success('Course Updated!');
      } else {
        await api.post('/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Course Created!');
      }
      setCourseData({ title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: '' });
      setIsEditing(false);
      setActiveTab('my-courses');
      fetchMyCourses();
    } catch (err) {
      toast.error('Action failed: ' + (err.response?.data?.message || err.message));
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
      } catch (err) { toast.error('Delete failed'); }
    }
  };

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
      toast.success('Lesson Added!');
      openLessons(selectedCourse);
    } catch (err) {
      toast.error('Failed to add lesson: ' + (err.response?.data?.message || err.message));
    } finally {
      setLessonUploading(false);
    }
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await api.delete(`/lessons/${id}`);
        openLessons(selectedCourse);
      } catch (err) { toast.error('Delete failed'); }
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'I';

  return (
    <div className="edu-dashboard">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="edu-main">
        <header className="edu-topbar">
          <button className="edu-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="edu-topbar-title">Instructor Studio</span>
          <div className="edu-topbar-actions">
            <div className="edu-avatar">{initials}</div>
          </div>
        </header>

        <div className="edu-content">
          {!selectedCourse && (
            <aside style={{marginBottom:'24px', display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'8px'}}>
              {[
                { id: 'my-courses', name: 'My Courses', icon: '📚' },
                { id: 'create', name: isEditing ? 'Edit Course' : 'Create New Course', icon: '➕' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`edu-filter-chip ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab.id); if(tab.id==='my-courses') setIsEditing(false); }}
                >
                   {tab.icon} {tab.name}
                </button>
              ))}
            </aside>
          )}

          {loading ? (
            <div style={{textAlign:'center', padding:'100px', color:'#9B9890'}}>Loading your curriculum...</div>
          ) : selectedCourse ? (
             <div className="edu-main-content-inner">
                <button onClick={() => setSelectedCourse(null)} className="edu-btn edu-btn-outline" style={{marginBottom:'24px', fontSize:'11px'}}>← Back to Courses</button>
                <header className="edu-dash-header">
                    <h1 className="edu-dash-title" style={{fontSize:'22px'}}>Lessons: {selectedCourse.title}</h1>
                </header>
                
                <div className="edu-main-grid">
                  <div className="edu-profile-section">
                    <h4 style={{ marginBottom: '20px', fontSize:'15px', fontWeight:'600' }}>Add New Lesson</h4>
                    <form onSubmit={handleAddLesson} className="edu-auth-form">
                      <div>
                        <label className="edu-auth-label">Lesson Title</label>
                        <input className="edu-auth-input" placeholder="Title" value={lessonData.title} onChange={(e) => setLessonData({...lessonData, title: e.target.value})} required />
                      </div>
                      <div>
                        <label className="edu-auth-label">Lesson Content</label>
                        <textarea className="edu-auth-input" style={{height: '100px'}} placeholder="What will students learn?" value={lessonData.content} onChange={(e) => setLessonData({...lessonData, content: e.target.value})} required />
                      </div>
                      <div>
                        <label className="edu-auth-label">YouTube URL (Optional)</label>
                        <input className="edu-auth-input" placeholder="https://youtube.com/..." value={lessonData.videoUrl} onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})} />
                      </div>
                      <div style={{padding:'14px', background:'#F5F4F0', borderRadius:8}}>
                        <label className="edu-auth-label">OR Upload Video</label>
                        <input type="file" accept="video/*" className="edu-auth-input" style={{background:'transparent', border:'none', padding:0}} onChange={(e) => setLessonData({...lessonData, video: e.target.files[0]})} />
                      </div>
                      <button type="submit" className="edu-auth-btn" disabled={lessonUploading}>
                        {lessonUploading ? 'Uploading...' : 'Add Lesson'}
                      </button>
                    </form>
                  </div>

                  <div className="edu-right-panel">
                    <div className="edu-card">
                      <h4 style={{ marginBottom: '16px', fontSize:'14px', fontWeight:'600' }}>Curriculum Schedule</h4>
                      {lessonLoading ? <p style={{fontSize:'12px'}}>Loading...</p> : lessons.length === 0 ? <p style={{color:'#9B9890', fontSize:'12px'}}>No lessons yet.</p> : (
                        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                          {lessons.map((lesson, idx) => (
                            <div key={lesson._id} style={{display:'flex', justifyContent:'space-between', padding:'10px', background:'#F5F4F0', borderRadius:'8px'}}>
                              <div style={{fontSize:'13px'}}><span style={{fontWeight:'bold', color:'#2D5BE3', marginRight:'6px'}}>{idx + 1}.</span> {lesson.title}</div>
                              <button onClick={() => handleDeleteLesson(lesson._id)} style={{color:'#2D5BE3', background:'none', border:'none', fontSize:'11px', cursor:'pointer'}}>Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
             </div>
          ) : activeTab === 'my-courses' ? (
            <div>
              <header className="edu-dash-header">
                <h1 className="edu-dash-title" style={{fontSize:'22px'}}>Your Catalog</h1>
                <button className="edu-btn edu-btn-primary" style={{padding:'8px 16px', fontSize:'12px'}} onClick={() => setActiveTab('create')}>+ Create Course</button>
              </header>
              <div className="edu-courses-grid">
                {myCourses.map(course => (
                   <div key={course._id} className="edu-course-card">
                    <div className="edu-course-thumb">
                       <div className="edu-thumb-bg teal">📚</div>
                       <span className="edu-course-badge edu-badge-progress">${course.price}</span>
                    </div>
                    <div className="edu-course-body">
                      <div className="edu-course-tag">{course.category}</div>
                      <div className="edu-course-title">{course.title}</div>
                      <div className="edu-course-meta">
                         <span className="edu-course-meta-item">
                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                           {course.lessons?.length || 0} Lessons
                         </span>
                      </div>
                      <div style={{display:'flex', gap:'8px', marginTop:'14px'}}>
                        <button onClick={() => openLessons(course)} className="edu-btn edu-btn-outline" style={{flex:1, padding:'6px', fontSize:'11px'}}>Manage</button>
                        <button onClick={() => startEdit(course)} className="edu-btn edu-btn-outline" style={{flex:1, padding:'6px', fontSize:'11px'}}>Edit</button>
                        <button onClick={() => handleDeleteCourse(course._id)} className="edu-btn edu-btn-outline" style={{padding:'6px', color:'#2D5BE3', borderColor:'#2D5BE3'}}><span role="img" aria-label="delete">🗑️</span></button>
                      </div>
                    </div>
                  </div>
                ))}
                {myCourses.length === 0 && (
                   <div style={{gridColumn:'1/-1', textAlign:'center', padding:'60px', background:'white', borderRadius:'14px', border:'1px dashed #E2E0D8'}}>
                      <p style={{color:'#9B9890', marginBottom:'16px'}}>You haven't published any courses yet.</p>
                      <button className="edu-btn edu-btn-primary" onClick={() => setActiveTab('create')}>Start Teaching Today</button>
                   </div>
                )}
              </div>
            </div>
          ) : (
            <div className="edu-profile-section" style={{maxWidth:'800px'}}>
               <header className="edu-dash-header">
                <h1 className="edu-dash-title" style={{fontSize:'22px'}}>{isEditing ? 'Edit' : 'Create'} Course</h1>
              </header>
                <form onSubmit={handleCourseSubmit} className="edu-auth-form">
                  <div>
                    <label className="edu-auth-label">Course Title</label>
                    <input className="edu-auth-input" placeholder="e.g. Modern Web Design" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} required />
                  </div>
                  <div>
                    <label className="edu-auth-label">Description</label>
                    <textarea className="edu-auth-input" style={{height: '100px'}} placeholder="What will students achieve?" value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} required />
                  </div>
                  <div className="edu-auth-row">
                    <div>
                        <label className="edu-auth-label">Category</label>
                        <select className="edu-auth-input" value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})}>
                            <option>Technology</option><option>Business</option><option>Design</option><option>Marketing</option>
                        </select>
                    </div>
                    <div>
                        <label className="edu-auth-label">Price ($)</label>
                        <input type="number" className="edu-auth-input" placeholder="0 for Free" value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div style={{padding:'14px', background:'#F5F4F0', borderRadius: 8, marginBottom: '14px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', fontSize:'13px'}}>
                      <input type="checkbox" checked={courseData.isYouTube} onChange={(e) => setCourseData({...courseData, isYouTube: e.target.checked})} />
                      This course uses a YouTube Playlist
                    </label>
                  </div>
                  
                  {courseData.isYouTube ? (
                    <div>
                      <label className="edu-auth-label">YouTube Playlist URL</label>
                      <input className="edu-auth-input" placeholder="https://..." value={courseData.playlistUrl} onChange={(e) => setCourseData({...courseData, playlistUrl: e.target.value})} required />
                    </div>
                  ) : (
                    !isEditing && (
                      <div>
                        <label className="edu-auth-label">Promotional Video</label>
                        <input type="file" accept="video/*" className="edu-auth-input" onChange={(e) => setCourseData({...courseData, video: e.target.files[0]})} />
                      </div>
                    )
                  )}
                  <div style={{display:'flex', gap:'12px', marginTop:'20px'}}>
                    <button type="submit" className="edu-auth-btn" style={{flex:2}} disabled={uploading}>
                        {uploading ? 'Finalizing...' : isEditing ? 'Update Course' : 'Launch Course'}
                    </button>
                    {isEditing && (
                        <button onClick={() => {setIsEditing(false); setActiveTab('my-courses');}} className="edu-btn edu-btn-outline" style={{flex:1}}>Cancel</button>
                    )}
                  </div>
                </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
