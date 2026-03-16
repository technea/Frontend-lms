import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../services/api';
import authService from '../../services/authService';
import PlayfulButton from '../../components/PlayfulButton';
import gsap from 'gsap';

const AdminDashboard = () => {
  const navigate = useNavigate();
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
  
  // Course Form State (for Admin to also upload if needed)
  const [courseData, setCourseData] = useState({
    title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      alert('Access Denied: Admin privileges required.');
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    gsap.from('.admin-content-anim', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/users'),
        api.get('/courses')
      ]);
      
      if (statsRes.data.success) setStats(statsRes.data.data);
      setUsers(usersRes.data);
      setCourses(coursesRes.data);
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

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.main} className="dashboard-layout">
        <div style={styles.sidebar} className="sidebar-responsive">
          <h3 style={styles.sidebarTitle}>ADMIN CONTROL</h3>
          <ul style={styles.sidebarList} className="mobile-stack">
            {['overview', 'users', 'courses', 'upload', 'settings'].map(tab => (
              <li 
                key={tab}
                style={{...styles.sidebarItem, ...(activeTab === tab ? styles.activeItem : {})}}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </li>
            ))}
          </ul>
        </div>
        
        <div style={styles.content} className="content-responsive">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="admin-content-anim">
              <h1 style={styles.pageTitle}>{activeTab.toUpperCase()}</h1>
              
              {activeTab === 'overview' && (
                <>
                  <div style={styles.statsGrid} className="grid-responsive grid-1-mobile grid-3-desktop">
                    <div style={styles.statCard} className="stat-card-anim playful-card">
                        <p style={styles.statLabel}>Users</p>
                        <h2 style={{...styles.statValue, color: '#4f46e5'}}>{stats.totalUsers}</h2>
                        <div style={styles.roleStats}>{stats.roleBreakdown.students} St. / {stats.roleBreakdown.instructors} Inst.</div>
                    </div>
                    <div style={styles.statCard} className="stat-card-anim playful-card">
                        <p style={styles.statLabel}>Courses</p>
                        <h2 style={{...styles.statValue, color: '#a855f7'}}>{stats.totalCourses}</h2>
                        <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Active on platform</p>
                    </div>
                    <div style={styles.statCard} className="stat-card-anim playful-card">
                        <p style={styles.statLabel}>Enrollments</p>
                        <h2 style={{...styles.statValue, color: '#f59e0b'}}>{stats.totalEnrollments}</h2>
                        <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>Total student reach</p>
                    </div>
                  </div>
                  <div style={styles.infoCard}>
                    <h3>Platform Activity</h3>
                    <p>Monitoring system performance and user engagement metrics.</p>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td style={styles.td}>{u.name}</td>
                          <td style={styles.td}>{u.email}</td>
                          <td style={styles.td}><span style={styles.roleBadge}>{u.role}</span></td>
                          <td style={styles.td}>{u.isVerified ? '✅ Verified' : '⏳ Pending'}</td>
                          <td style={styles.td}>
                            {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u._id)} style={styles.deleteBtn}>Delete</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'courses' && (
                <div style={styles.tableWrapper}>
                   <table style={styles.table}>
                    <thead>
                      <tr><th>Title</th><th>Category</th><th>Price</th><th>Instructor</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c._id}>
                          <td style={styles.td}>{c.title}</td>
                          <td style={styles.td}>{c.category}</td>
                          <td style={styles.td}>${c.price}</td>
                          <td style={styles.td}>{c.instructor?.name || 'Admin'}</td>
                          <td style={styles.td}>
                             <button onClick={() => handleDeleteCourse(c._id)} style={styles.deleteBtn}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'upload' && (
                <div style={styles.formCard}>
                  <form onSubmit={handleCourseSubmit} style={styles.form}>
                    <input placeholder="Title" style={styles.input} required onChange={e => setCourseData({...courseData, title: e.target.value})} />
                    <textarea placeholder="Description" style={{...styles.input, height: '100px'}} required onChange={e => setCourseData({...courseData, description: e.target.value})} />
                    <div style={styles.row}>
                      <select style={styles.input} value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})}>
                        <option>Technology</option><option>Business</option><option>Design</option>
                      </select>
                      <input type="number" placeholder="Price" style={styles.input} value={courseData.price} required onChange={e => setCourseData({...courseData, price: e.target.value})} />
                    </div>
                    
                    <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                        <input 
                            type="checkbox" 
                            checked={courseData.isYouTube} 
                            onChange={e => setCourseData({...courseData, isYouTube: e.target.checked})} 
                        />
                        Populate from YouTube Playlist?
                    </label>

                    {courseData.isYouTube ? (
                        <input 
                            placeholder="YouTube Playlist URL" 
                            style={styles.input} 
                            value={courseData.playlistUrl} 
                            onChange={e => setCourseData({...courseData, playlistUrl: e.target.value})} 
                            required 
                        />
                    ) : (
                        <input type="file" accept="video/*" style={styles.input} onChange={e => setCourseData({...courseData, video: e.target.files[0]})} />
                    )}

                    <PlayfulButton type="submit" disabled={uploading}>{uploading ? 'Processing...' : 'Publish'}</PlayfulButton>
                  </form>
                </div>
              )}

              {activeTab === 'settings' && (
                <div style={styles.infoCard}>
                  <h4>Maintenance Options</h4>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                    <PlayfulButton onClick={() => alert('Maintenance Mode Toggled')}>Toggle Maintenance</PlayfulButton>
                    <PlayfulButton onClick={() => alert('Logs Exported')}>Export Logs</PlayfulButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", sans-serif' },
  main: { display: 'flex', marginTop: '80px', flex: 1 },
  sidebar: { width: '280px', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0', padding: '50px 20px' },
  sidebarTitle: { color: '#4f46e5', fontSize: '0.8rem', fontWeight: '800', marginBottom: '30px', letterSpacing: '2px' },
  sidebarList: { listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  sidebarItem: { padding: '14px 20px', borderRadius: '12px', color: '#64748b', cursor: 'pointer', transition: '0.3s', fontWeight: '500' },
  activeItem: { backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', fontWeight: '700' },
  content: { flex: 1, padding: '50px 60px' },
  pageTitle: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '40px', color: '#0f172a' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '50px' },
  statCard: { padding: '30px', backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' },
  statLabel: { fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' },
  statValue: { fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' },
  roleStats: { fontSize: '0.8rem', color: '#94a3b8' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  td: { padding: '16px', borderBottom: '1px solid #f1f5f9' },
  roleBadge: { backgroundColor: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700' },
  deleteBtn: { backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  formCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '800px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: '#f8fafc' },
  row: { display: 'flex', gap: '20px' },
  infoCard: { padding: '40px', backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }
};

export default AdminDashboard;
