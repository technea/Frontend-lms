import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import authService from '../../services/authService';
import '../../styles/InstructorStudio.css';
import gsap from 'gsap';
import { FiPlus, FiBook, FiTrash2, FiEdit, FiArrowLeft, FiClock, FiLayers, FiMenu, FiHelpCircle } from 'react-icons/fi';

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

  const [quizzes, setQuizzes] = useState([]);
  const [quizData, setQuizData] = useState({ title: '', description: '', tag: 'General', difficulty: 'Intermediate', courseId: '' });
  const [quizUploading, setQuizUploading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'instructor' && currentUser.role !== 'admin')) {
      navigate('/');
      return;
    }
    setUser(currentUser);
    fetchMyCourses();
    fetchQuizzes();

    // GSAP Entrance Animation
    gsap.from('.animate-fade-up', {
      y: 30,
      opacity: 0,
      scrollTrigger: {
        trigger: ".animate-fade-up",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      },
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    });
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

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes');
      const currentUser = authService.getCurrentUser();
      const filtered = res.data.filter(q => q.instructor?._id === currentUser._id || q.instructor === currentUser._id);
      setQuizzes(filtered);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
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

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    setQuizUploading(true);
    try {
      await api.post('/quizzes', quizData);
      toast.success('Quiz Created!');
      setQuizData({ title: '', description: '', tag: 'General', difficulty: 'Intermediate', courseId: '' });
      setActiveTab('quizzes');
      fetchQuizzes();
    } catch (err) {
      toast.error('Action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setQuizUploading(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (window.confirm('Delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${id}`);
        fetchQuizzes();
      } catch (err) { toast.error('Delete failed'); }
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'I';

  return (
    <div className="studio-dashboard">
      {/* Sidebar */}
      <aside className={`studio-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="studio-logo">
          <div className="studio-logo-icon">N</div>
          <span className="studio-logo-text">NexLearn</span>
        </div>
        
        <nav className="studio-nav">
          <div style={{fontSize: '10px', color: 'var(--studio-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '16px'}}>Studio</div>
          <button 
            className={`studio-nav-item ${activeTab === 'my-courses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('my-courses'); setSelectedCourse(null); setIsEditing(false); setSidebarOpen(false); }}
          >
            <FiLayers /> Courses
          </button>
          <button 
            className={`studio-nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => { setActiveTab('create'); setSelectedCourse(null); setSidebarOpen(false); }}
          >
            <FiPlus /> {isEditing ? 'Edit Course' : 'Add Course'}
          </button>
          <button 
            className={`studio-nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quizzes'); setSelectedCourse(null); setIsEditing(false); setSidebarOpen(false); }}
          >
            <FiHelpCircle /> Quizzes
          </button>
          <button 
            className={`studio-nav-item ${activeTab === 'add-quiz' ? 'active' : ''}`}
            onClick={() => { setActiveTab('add-quiz'); setSelectedCourse(null); setSidebarOpen(false); }}
          >
            <FiPlus /> Add Quiz
          </button>
          
          <div style={{marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--studio-border)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '16px'}}>
              <div className="edu-avatar" style={{width: '32px', height: '32px'}}>{initials}</div>
              <div style={{overflow: 'hidden'}}>
                <div style={{fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: 'var(--studio-text)'}}>{user?.name}</div>
                <div style={{fontSize: '11px', color: 'var(--studio-text-muted)', textTransform: 'capitalize'}}>{user?.role} Role</div>
              </div>
            </div>
            <button className="studio-nav-item" onClick={() => navigate('/profile')}>
               Profile Settings
            </button>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="studio-main">
        <header className="studio-topbar">
          <button className="studio-hamburger" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div style={{fontSize: '14px', fontWeight: '500', color: 'var(--studio-text-muted)'}}>
            Instructor Panel / <span style={{color: 'var(--studio-text)'}}>{selectedCourse ? 'Course Content' : activeTab === 'my-courses' ? 'Courses' : activeTab === 'quizzes' ? 'Quizzes' : activeTab === 'add-quiz' ? 'Add Quiz' : 'Add Course'}</span>
          </div>
          <div className="edu-topbar-actions">
            <button className="studio-btn studio-btn-primary" onClick={() => setActiveTab('create')} style={{padding: '8px 16px', fontSize: '12px'}}>
              <FiPlus /> Add Course
            </button>
          </div>
        </header>

        <section className="studio-content">
          {loading ? (
            <div style={{textAlign: 'center', padding: '150px', color: 'var(--studio-text-muted)'}}>
               <div style={{fontSize: '32px', marginBottom: '16px'}}>⚡</div>
               Preparing your creative workspace...
            </div>
          ) : selectedCourse ? (
             <div className="animate-fade-up">
                <button onClick={() => setSelectedCourse(null)} className="studio-btn studio-btn-outline" style={{marginBottom: '28px'}}>
                  <FiArrowLeft /> Back to Courses
                </button>
                
                <h1 className="studio-page-title">Course Content: {selectedCourse.title}</h1>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px'}}>
                  <div className="studio-form-container" style={{margin: '0', maxWidth: '100%'}}>
                    <h3 style={{marginBottom: '24px', fontSize: '18px'}}>Add Curriculum Content</h3>
                    <form onSubmit={handleAddLesson} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                      <div>
                        <label className="studio-label">Lesson Title</label>
                        <input className="studio-input" placeholder="e.g. Setting up the environment" value={lessonData.title} onChange={(e) => setLessonData({...lessonData, title: e.target.value})} required />
                      </div>
                      <div>
                        <label className="studio-label">Key Learning Points</label>
                        <textarea className="studio-input studio-textarea" placeholder="Detailed content or learning objectives..." value={lessonData.content} onChange={(e) => setLessonData({...lessonData, content: e.target.value})} required />
                      </div>
                      
                      <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '16px'}}>
                        <div>
                          <label className="studio-label">Video Source Type</label>
                          <select 
                            className="studio-input studio-select" 
                            style={{padding: '12px'}}
                            value={lessonData.sourceType || 'file'}
                            onChange={(e) => {
                               setLessonData({
                                  ...lessonData, 
                                  sourceType: e.target.value,
                                  video: null,
                                  videoUrl: ''
                               });
                            }}
                          >
                            <option value="file">Local Video (File Upload)</option>
                            <option value="url">External Video (YouTube Link)</option>
                          </select>
                        </div>

                        {lessonData.sourceType === 'url' ? (
                          <div className="animate-fade-up">
                            <label className="studio-label">YouTube Video URL</label>
                            <input 
                              className="studio-input" 
                              placeholder="https://www.youtube.com/watch?v=..." 
                              value={lessonData.videoUrl} 
                              onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})} 
                              required
                            />
                            <p style={{fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '4px'}}>
                               Supports both full YouTube links and short youtu.be links.
                            </p>
                            {lessonData.videoUrl && (
                                <div style={{marginTop: '10px', fontSize: '11px', color: '#10b981'}}>
                                    ✓ Valid URL detected. It will be converted to an embed format.
                                </div>
                            )}
                          </div>
                        ) : (
                          <div className="animate-fade-up">
                            <label className="studio-label">Upload Video Attachment</label>
                            <div style={{
                                border: '2px dashed var(--studio-border)',
                                borderRadius: '16px',
                                padding: '20px',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <input 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={(e) => setLessonData({...lessonData, video: e.target.files[0]})} 
                                    id="lesson-video-id"
                                    hidden
                                />
                                <label htmlFor="lesson-video-id" style={{cursor: 'pointer'}}>
                                    <div style={{fontSize: '24px', marginBottom: '8px'}}><FiPlus /></div>
                                    <div style={{fontSize: '13px', color: 'var(--studio-text)'}}>
                                        {lessonData.video ? lessonData.video.name : 'Choose video file'}
                                    </div>
                                    <div style={{fontSize: '11px', color: 'var(--studio-text-muted)', marginTop: '4px'}}>
                                        Max 50MB (mp4, mkv, avi)
                                    </div>
                                </label>
                            </div>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="studio-btn studio-btn-primary" style={{width: '100%', justifyContent: 'center', padding: '14px', marginTop: '10px'}} disabled={lessonUploading}>
                        {lessonUploading ? 'Syncing...' : 'Publish Lesson'}
                      </button>
                    </form>
                  </div>

                  <aside style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div style={{background: 'var(--studio-card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--studio-border)'}}>
                      <h4 style={{fontSize: '14px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <FiLayers style={{color: 'var(--studio-accent)'}} /> Curriculum Plan
                      </h4>
                      {lessonLoading ? (
                        <p style={{fontSize: '12px', color: 'var(--studio-text-muted)'}}>Indexing content...</p>
                      ) : lessons.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '20px'}}>
                           <div style={{fontSize: '24px', marginBottom: '8px'}}>📦</div>
                           <p style={{color: 'var(--studio-text-muted)', fontSize: '13px'}}>Your curriculum is currently empty.</p>
                        </div>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                          {lessons.map((lesson, idx) => (
                            <div key={lesson._id} className="animate-fade-up" style={{display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--studio-card)', borderRadius: '14px', border: '1px solid var(--studio-border)'}}>
                              <div style={{fontSize: '13px', display: 'flex', gap: '10px'}}>
                                <span style={{fontWeight: '700', color: 'var(--studio-accent)'}}>{idx + 1}</span>
                                <span>{lesson.title}</span>
                              </div>
                              <button onClick={() => handleDeleteLesson(lesson._id)} style={{color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6}}>
                                <FiTrash2 />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
             </div>
          ) : activeTab === 'my-courses' ? (
            <div className="animate-fade-up">
              <div className="studio-dash-header" style={{marginBottom: '40px'}}>
                <div>
                  <h1 className="studio-page-title" style={{marginBottom: '4px'}}>Manage Courses</h1>
                  <p style={{color: 'var(--studio-text-muted)', fontSize: '14px'}}>Manage your published courses and curriculum.</p>
                </div>
              </div>

              <div className="studio-courses-grid">
                {myCourses.map(course => (
                   <div key={course._id} className="studio-course-card animate-fade-up">
                    <div className="studio-card-thumb">
                       <span>{course.category === 'Technology' ? '💻' : course.category === 'Design' ? '🎨' : '📚'}</span>
                       <span className="studio-card-badge">${course.price}</span>
                    </div>
                    <div className="studio-card-body">
                      <div className="studio-card-cat">{course.category}</div>
                      <div className="studio-card-title">{course.title}</div>
                      
                      <div className="studio-card-meta">
                         <span className="studio-meta-item">
                           <FiBook /> {course.lessons?.length || 0} Lessons
                         </span>
                         <span className="studio-meta-item">
                           <FiClock /> Lifetime Access
                         </span>
                      </div>

                      <div className="studio-card-actions">
                        <button onClick={() => openLessons(course)} className="studio-btn studio-btn-primary" style={{flex: 1}}>
                          <FiLayers /> Manage
                        </button>
                        <button onClick={() => startEdit(course)} className="studio-btn studio-btn-outline">
                          <FiEdit />
                        </button>
                        <button onClick={() => handleDeleteCourse(course._id)} className="studio-btn studio-btn-danger">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {myCourses.length === 0 && (
                   <div className="studio-empty" style={{gridColumn: '1/-1'}}>
                      <div className="studio-empty-icon">📂</div>
                      <p className="studio-empty-text">Your list of courses is empty. Start adding some!</p>
                      <button className="studio-btn studio-btn-primary" style={{margin: '0 auto'}} onClick={() => setActiveTab('create')}>
                         <FiPlus /> Add Course
                      </button>
                   </div>
                )}
              </div>
            </div>
          ) : activeTab === 'quizzes' ? (
            <div className="animate-fade-up">
              <div className="studio-dash-header" style={{marginBottom: '40px'}}>
                <div>
                  <h1 className="studio-page-title" style={{marginBottom: '4px'}}>Manage Quizzes</h1>
                  <p style={{color: 'var(--studio-text-muted)', fontSize: '14px'}}>Manage interactive quizzes for your students.</p>
                </div>
              </div>

              <div className="studio-courses-grid">
                {quizzes.map(quiz => (
                   <div key={quiz._id} className="studio-course-card animate-fade-up">
                    <div className="studio-card-thumb" style={{background: 'linear-gradient(135deg, #EEF1FD 0%, #E2E8FA 100%)'}}>
                       <span>❓</span>
                       <span className="studio-card-badge">{quiz.difficulty}</span>
                    </div>
                    <div className="studio-card-body">
                      <div className="studio-card-cat">{quiz.tag}</div>
                      <div className="studio-card-title">{quiz.title}</div>
                      <p style={{fontSize: '12px', color: 'var(--studio-text-muted)', marginTop: '8px', marginBottom: '8px', height: '36px', overflow: 'hidden'}}>{quiz.description}</p>
                      
                      <div className="studio-card-meta">
                         <span className="studio-meta-item">
                           <FiBook /> {quiz.questions?.length || 0} Questions
                         </span>
                         {quiz.courseId && <span className="studio-meta-item"><FiLayers /> Linked to Course</span>}
                      </div>

                      <div className="studio-card-actions">
                        <button onClick={() => handleDeleteQuiz(quiz._id)} className="studio-btn studio-btn-danger" style={{flex: 1, justifyContent: 'center'}}>
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {quizzes.length === 0 && (
                   <div className="studio-empty" style={{gridColumn: '1/-1'}}>
                      <div className="studio-empty-icon">📝</div>
                      <p className="studio-empty-text">No quizzes published yet.</p>
                      <button className="studio-btn studio-btn-primary" style={{margin: '0 auto'}} onClick={() => setActiveTab('add-quiz')}>
                         <FiPlus /> Add Quiz
                      </button>
                   </div>
                )}
              </div>
            </div>
          ) : activeTab === 'add-quiz' ? (
            <div className="animate-fade-up">
                <header style={{marginBottom: '40px'}}>
                  <h1 className="studio-page-title" style={{marginBottom: '4px'}}>Add New Quiz</h1>
                  <p style={{color: 'var(--studio-text-muted)', fontSize: '14px'}}>Create a new quiz to assess your students.</p>
                </header>

                <div className="studio-form-container">
                  <form onSubmit={handleQuizSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    <div>
                      <label className="studio-label">Quiz Title</label>
                      <input className="studio-input" placeholder="e.g. JavaScript Basics" value={quizData.title} onChange={(e) => setQuizData({...quizData, title: e.target.value})} required />
                    </div>
                    <div>
                      <label className="studio-label">Description</label>
                      <textarea className="studio-input studio-textarea" placeholder="Briefly describe what this quiz is about..." value={quizData.description} onChange={(e) => setQuizData({...quizData, description: e.target.value})} required />
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                      <div>
                          <label className="studio-label">Topic / Tag</label>
                          <input className="studio-input" placeholder="e.g. JavaScript, React, Security" value={quizData.tag} onChange={(e) => setQuizData({...quizData, tag: e.target.value})} />
                      </div>
                      <div>
                          <label className="studio-label">Difficulty Level</label>
                          <select className="studio-input studio-select" value={quizData.difficulty} onChange={(e) => setQuizData({...quizData, difficulty: e.target.value})}>
                              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                          </select>
                      </div>
                    </div>

                    <div>
                      <label className="studio-label">Link to Course (Optional)</label>
                      <select className="studio-input studio-select" value={quizData.courseId} onChange={(e) => setQuizData({...quizData, courseId: e.target.value})}>
                          <option value="">-- No Course --</option>
                          {myCourses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>

                    <div style={{display: 'flex', gap: '16px', marginTop: '20px'}}>
                      <button type="submit" className="studio-btn studio-btn-primary" style={{flex: 2, padding: '14px', justifyContent: 'center'}} disabled={quizUploading}>
                          {quizUploading ? 'Saving Quiz...' : 'Create Quiz'}
                      </button>
                    </div>
                  </form>
                </div>
            </div>
          ) : (
            <div className="animate-fade-up">
                <header style={{marginBottom: '40px'}}>
                  <h1 className="studio-page-title" style={{marginBottom: '4px'}}>{isEditing ? 'Editing Course' : 'Add New Course'}</h1>
                  <p style={{color: 'var(--studio-text-muted)', fontSize: '14px'}}>Set the foundations for your upcoming course.</p>
                </header>

                <div className="studio-form-container">
                  <form onSubmit={handleCourseSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    <div>
                      <label className="studio-label">Project Title</label>
                      <input className="studio-input" placeholder="e.g. Masterclass: Cinematic Lighting" value={courseData.title} onChange={(e) => setCourseData({...courseData, title: e.target.value})} required />
                    </div>
                    <div>
                      <label className="studio-label">Description & Vision</label>
                      <textarea className="studio-input studio-textarea" placeholder="What is the ultimate goal of this project?" value={courseData.description} onChange={(e) => setCourseData({...courseData, description: e.target.value})} required />
                    </div>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                      <div>
                      <label className="studio-label">Course Category</label>
                          <select className="studio-input studio-select" value={courseData.category} onChange={(e) => setCourseData({...courseData, category: e.target.value})}>
                              <option>Technology</option><option>Business</option><option>Design</option><option>Marketing</option>
                          </select>
                      </div>
                      <div>
                          <label className="studio-label">Access Investment ($)</label>
                          <input type="number" className="studio-input" placeholder="0 for Free Access" value={courseData.price} onChange={(e) => setCourseData({...courseData, price: e.target.value})} required />
                      </div>
                    </div>
                    
                    <div style={{padding: '20px', background: 'var(--studio-card)', borderRadius: '16px', border: '1px solid var(--studio-border)'}}>
                      <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--studio-text)'}}>
                        <input 
                          type="checkbox" 
                          checked={courseData.isYouTube} 
                          onChange={(e) => setCourseData({...courseData, isYouTube: e.target.checked})} 
                          style={{accentColor: 'var(--studio-accent)', width: '18px', height: '18px'}}
                        />
                        Sync curriculum with a YouTube Playlist
                      </label>
                    </div>
                    
                    {courseData.isYouTube ? (
                      <div>
                        <label className="studio-label">Playlist Connection URL</label>
                        <input className="studio-input" placeholder="https://youtube.com/playlist?list=..." value={courseData.playlistUrl} onChange={(e) => setCourseData({...courseData, playlistUrl: e.target.value})} required />
                      </div>
                    ) : (
                      !isEditing && (
                        <div>
                          <label className="studio-label">Brand Intro Video (Optional)</label>
                          <input 
                            type="file" 
                            accept="video/*" 
                            className="studio-input" 
                            style={{padding: '10px'}}
                            onChange={(e) => setCourseData({...courseData, video: e.target.files[0]})} 
                          />
                        </div>
                      )
                    )}

                    <div style={{display: 'flex', gap: '16px', marginTop: '20px'}}>
                      <button type="submit" className="studio-btn studio-btn-primary" style={{flex: 2, padding: '14px', justifyContent: 'center'}} disabled={uploading}>
                          {uploading ? 'Processing...' : isEditing ? 'Update Course' : 'Add Course'}
                      </button>
                      {isEditing && (
                          <button onClick={() => {setIsEditing(false); setActiveTab('my-courses');}} className="studio-btn studio-btn-outline" style={{flex: 1, justifyContent: 'center'}}>Cancel</button>
                      )}
                    </div>
                  </form>
                </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InstructorDashboard;
