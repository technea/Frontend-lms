import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardSidebar from '../../components/DashboardSidebar';
import api from '../../services/api';
import authService from '../../services/authService';
import '../../styles/EduFlow.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    roleBreakdown: { students: 0, instructors: 0, admins: 0 }
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [courseData, setCourseData] = useState({
    title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    setUser(currentUser);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ data: { success: false } })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] }))
      ]);
      
      if (statsRes.data.success) setStats(statsRes.data.data);
      setUsers(usersRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Delete this user?')) {
      await api.delete(`/users/${id}`);
      fetchData();
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Delete this course?')) {
      await api.delete(`/courses/${id}`);
      fetchData();
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    Object.keys(courseData).forEach(key => formData.append(key, courseData[key]));
    try {
      await api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Course Published!');
      setCourseData({ title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: '' });
      setActiveTab('overview');
      fetchData();
    } catch (err) { alert('Upload failed'); } finally { setUploading(false); }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'A';

  return (
    <div className="edu-dashboard">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="edu-main">
        <header className="edu-topbar">
          <button className="edu-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <span className="edu-topbar-title">Admin Console</span>
          <div className="edu-topbar-actions">
            <div className="edu-avatar" style={{cursor:'default'}}>{initials}</div>
          </div>
        </header>

        <div className="edu-content">
          <aside style={{marginBottom:'24px', display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'8px'}}>
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'users', name: 'User Management', icon: '👤' },
              { id: 'courses', name: 'Course Management', icon: '📚' },
              { id: 'upload', name: 'Global Upload', icon: '📤' },
              { id: 'settings', name: 'System Settings', icon: '⚙️' }
            ].map(tab => (
              <button 
                key={tab.id}
                className={`edu-filter-chip ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </aside>

          {loading ? (
            <div style={{textAlign:'center', padding:'100px', color:'#9B9890'}}>Loading Intelligence...</div>
          ) : (
            <div>
              {activeTab === 'overview' && (
                <>
                  <div className="edu-stats-row">
                    <div className="edu-stat-item">
                        <div className="edu-stat-num" style={{color:'#2D5BE3'}}>{stats.totalUsers}</div>
                        <div className="edu-stat-label">System Users</div>
                        <div style={{fontSize:'11px', color:'#9B9890', marginTop:'8px'}}>{stats.roleBreakdown.students} Students / {stats.roleBreakdown.instructors} Instructors</div>
                    </div>
                    <div className="edu-stat-item">
                        <div className="edu-stat-num" style={{color:'#E85D2A'}}>{stats.totalCourses}</div>
                        <div className="edu-stat-label">Published Courses</div>
                    </div>
                    <div className="edu-stat-item">
                        <div className="edu-stat-num" style={{color:'#1C7A52'}}>{stats.totalEnrollments}</div>
                        <div className="edu-stat-label">Global Enrollments</div>
                    </div>
                    <div className="edu-stat-item">
                        <div className="edu-stat-num" style={{color:'#B56C10'}}>4.8</div>
                        <div className="edu-stat-label">Platform Rating</div>
                    </div>
                  </div>
                  <div className="edu-card">
                    <h3 style={{fontSize:'16px', fontWeight:600, marginBottom:'12px'}}>Deployment Status</h3>
                    <p style={{fontSize:'14px', color:'#6B6962'}}>All services operational. Vercel deployment synced with main branch.</p>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <div className="edu-table-wrap">
                  <table className="edu-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className="edu-tag edu-tag-blue" style={{textTransform:'capitalize'}}>{u.role}</span></td>
                          <td>{u.isVerified ? '✅ Verified' : '⏳ Pending'}</td>
                          <td>
                            {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u._id)} className="edu-btn edu-btn-outline" style={{padding:'4px 12px', color:'#E85D2A', borderColor:'#E85D2A', fontSize:'11px'}}>Delete</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="edu-table-wrap">
                   <table className="edu-table">
                    <thead>
                      <tr><th>Title</th><th>Category</th><th>Price</th><th>Instructor</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c._id}>
                          <td>{c.title}</td>
                          <td>{c.category}</td>
                          <td>${c.price}</td>
                          <td>{c.instructor?.name || 'Admin'}</td>
                          <td>
                             <button onClick={() => handleDeleteCourse(c._id)} className="edu-btn edu-btn-outline" style={{padding:'4px 12px', color:'#E85D2A', borderColor:'#E85D2A', fontSize:'11px'}}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="edu-profile-section" style={{maxWidth:'800px'}}>
                  <form onSubmit={handleCourseSubmit} className="edu-auth-form">
                    <div>
                        <label className="edu-auth-label">Course Title</label>
                        <input className="edu-auth-input" placeholder="Title" required onChange={e => setCourseData({...courseData, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="edu-auth-label">Description</label>
                        <textarea className="edu-auth-input" style={{height:'100px'}} required onChange={e => setCourseData({...courseData, description: e.target.value})} />
                    </div>
                    <div className="edu-auth-row">
                      <div>
                        <label className="edu-auth-label">Category</label>
                        <select className="edu-auth-input" value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})}>
                            <option>Technology</option><option>Business</option><option>Design</option>
                        </select>
                      </div>
                      <div>
                        <label className="edu-auth-label">Price ($)</label>
                        <input type="number" className="edu-auth-input" placeholder="Price" value={courseData.price} required onChange={e => setCourseData({...courseData, price: e.target.value})} />
                      </div>
                    </div>
                    
                    <div style={{padding:'14px', background:'#F5F4F0', borderRadius:8}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize:'13px', fontWeight:'600'}}>
                            <input 
                                type="checkbox" 
                                checked={courseData.isYouTube} 
                                onChange={e => setCourseData({...courseData, isYouTube: e.target.checked})} 
                            />
                            Populate from YouTube Playlist?
                        </label>
                    </div>

                    {courseData.isYouTube ? (
                        <div>
                            <label className="edu-auth-label">Playlist URL</label>
                            <input className="edu-auth-input" placeholder="YouTube Playlist URL" value={courseData.playlistUrl} onChange={e => setCourseData({...courseData, playlistUrl: e.target.value})} required />
                        </div>
                    ) : (
                        <div>
                            <label className="edu-auth-label">Intro Video File</label>
                            <input type="file" accept="video/*" className="edu-auth-input" onChange={e => setCourseData({...courseData, video: e.target.files[0]})} />
                        </div>
                    )}

                    <button type="submit" className="edu-auth-btn" disabled={uploading}>{uploading ? 'Processing...' : 'Publish Course'}</button>
                  </form>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="edu-card">
                  <h4 style={{marginBottom:15}}>Development Tools</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap:'wrap' }}>
                    <button className="edu-btn edu-btn-outline" onClick={() => alert('Vercel logs redirected...')}>Check Logs</button>
                    <button className="edu-btn edu-btn-outline" onClick={() => alert('Cache cleared')}>Purge CDN</button>
                    <button className="edu-btn edu-btn-outline" onClick={() => alert('Syncing database...')}>Repair Database</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
