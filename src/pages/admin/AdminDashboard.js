import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import authService from '../../services/authService';
import gsap from 'gsap';
import { 
  FiUsers, FiBookOpen, FiActivity, FiShield, 
  FiUploadCloud, FiSettings, FiGrid, FiTrash2, 
  FiBell, FiSearch, FiLogOut
} from 'react-icons/fi';
import '../../styles/EduFlow.css';

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
  
  const [courseData, setCourseData] = useState({
    title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    setUser(currentUser);
    fetchData();

    // Entrance Animations
    gsap.from('.dash-sidebar', { x: -50, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.dash-main', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
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
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User removed successfully');
        fetchData();
      } catch (err) { toast.error('Failed to remove user'); }
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Delete this course permanently?')) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course deleted');
        fetchData();
      } catch (err) { toast.error('Failed to delete course'); }
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    Object.keys(courseData).forEach(key => formData.append(key, courseData[key]));
    try {
      await api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Course published successfully!');
      setCourseData({ title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: '' });
      setActiveTab('courses');
      fetchData();
    } catch (err) { toast.error('Failed to upload course'); } finally { setUploading(false); }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'AD';

  return (
    <div className="admin-portal-v3">
      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.1)', zIndex: 1000 }} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: '#fff', color: '#1A1916', borderRight: '1px solid #F0EFEA' }}>
        <div className="dash-logo" style={{ padding: '0 10px', marginBottom: '40px' }}>
          <div className="logo-icon" style={{ background: '#2D5BE3', borderRadius: '10px' }}>
             <svg viewBox="0 0 24 24" style={{width:'20px', height:'20px'}}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="white"/></svg>
          </div>
          <span className="logo-text" style={{ color: '#1A1916' }}>NexLearn<span>Admin</span></span>
        </div>

        <nav className="dash-nav">
          <div className="nav-group-label" style={{ color: '#2D5BE3', opacity: 0.8 }}>General</div>
          {[
            { id: 'overview', name: 'Dashboard', icon: <FiGrid /> },
            { id: 'users', name: 'User Management', icon: <FiUsers /> },
            { id: 'courses', name: 'Course Library', icon: <FiBookOpen /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{ color: activeTab === item.id ? '#2D5BE3' : '#6B6962', background: activeTab === item.id ? 'rgba(232, 93, 42, 0.05)' : 'transparent', border:'none', width:'100%', textAlign:'left', padding:'12px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'12px', marginBottom:4, cursor:'pointer' }}
            >
              <span style={{ color: activeTab === item.id ? '#2D5BE3' : 'inherit' }}>{item.icon}</span>
              <span style={{ fontWeight: activeTab === item.id ? 700 : 500 }}>{item.name}</span>
            </button>
          ))}

          <div className="nav-group-label" style={{ color: '#9B9890', opacity: 0.6 }}>Operations</div>
          {[
            { id: 'upload', name: 'Course Creator', icon: <FiUploadCloud /> },
            { id: 'settings', name: 'System Core', icon: <FiSettings /> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{ color: activeTab === item.id ? '#2D5BE3' : '#6B6962', background: activeTab === item.id ? '#EEF1FD' : 'transparent', border:'none', width:'100%', textAlign:'left', padding:'12px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'12px', marginBottom:4, cursor:'pointer' }}
            >
              <span style={{ color: activeTab === item.id ? '#2D5BE3' : 'inherit' }}>{item.icon}</span>
              <span style={{ fontWeight: activeTab === item.id ? 700 : 500 }}>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer" style={{ marginTop: 'auto' }}>
          <button onClick={() => { authService.logout(); navigate('/login'); }} className="logout-btn" style={{ color: '#9B9890', background:'none', border:'none', display:'flex', alignItems:'center', gap:'10px', padding:'12px', cursor:'pointer' }}>
            <FiLogOut /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        {/* Top Header */}
        <header className="dash-header">
          <button 
            className="edu-hamburger" 
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="header-search">
            <FiSearch />
            <input type="text" placeholder="Search infrastructure..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FiBell /></button>
            <div className="header-user">
              <div className="user-info" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span className="user-name" style={{ fontSize: '13px', fontWeight: '700' }}>{user?.name}</span>
                <span className="user-role" style={{ fontSize: '11px', color: '#9B9890' }}>Administrator</span>
              </div>
              <div className="user-avatar">{initials}</div>
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#9B9890' }}>
            <p>Syncing Global State...</p>
          </div>
        ) : (
          <div className="dash-body">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="welcome-banner">
                  <h1>System Overview</h1>
                  <p>Real-time analytics across the learning ecosystem.</p>
                </div>

                <div className="stat-grid-v3">
                  {[
                    { label: 'Learners', val: stats.totalUsers, icon: <FiUsers />, color: '#2D5BE3' },
                    { label: 'Courses', val: stats.totalCourses, icon: <FiBookOpen />, color: '#F59E0B' },
                    { label: 'Enrollments', val: stats.totalEnrollments, icon: <FiActivity />, color: '#10B981' },
                    { label: 'Security', val: 'Active', icon: <FiShield />, color: '#EF4444' }
                  ].map((s, i) => (
                    <div key={i} className="stat-card-v3">
                      <div className="stat-icon-v3" style={{color: s.color}}>{s.icon} <span style={{fontSize:'10px', marginLeft:'auto', opacity:0.6}}>LIVE</span></div>
                      <div className="stat-label-v3">{s.label}</div>
                      <div className="stat-value-v3">{s.val}</div>
                    </div>
                  ))}
                </div>

                <div className="data-card" style={{ background: '#fff', border: '1px solid #F0EFEA', borderRadius: '16px', padding: '24px' }}>
                   <h3 style={{ fontSize: '16px', marginBottom: '20px' }}>Recent Distribution</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Students</span>
                        <strong>{stats.roleBreakdown.students}</strong>
                      </div>
                      <div style={{ height: '6px', background: '#F5F4F0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${(stats.roleBreakdown.students / (stats.totalUsers || 1)) * 100}%`, background: '#2D5BE3', height: '100%' }} />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="table-card-v3">
                <div className="dash-header" style={{ border: 'none', height: 'auto', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px' }}>User Registry</h3>
                  <button className="primary-btn-v3" style={{ fontSize: '12px' }}>+ New Identity</button>
                </div>
                <div className="table-responsive">
                  <table className="table-v3">
                    <thead>
                      <tr><th>Identity</th><th>Access Level</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className="user-avatar" style={{width: 30, height: 30, fontSize: 11}}>{u.name[0]}</div>
                              <div>
                                <div style={{ fontWeight: 700 }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: '#9B9890' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                          <td>{u.isVerified ? '● Verified' : '○ Pending'}</td>
                          <td>
                            <button onClick={() => handleDeleteUser(u._id)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="table-card-v3">
                 <div className="dash-header" style={{ border: 'none', height: 'auto', padding: '24px' }}>
                  <h3 style={{ fontSize: '18px' }}>Course Library</h3>
                </div>
                <div className="table-responsive">
                  <table className="table-v3">
                    <thead>
                      <tr><th>Curriculum</th><th>Classification</th><th>Valuation</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c._id}>
                          <td><strong>{c.title}</strong></td>
                          <td><span className="role-badge" style={{ background: '#FAF9F6', color: '#6B6962' }}>{c.category}</span></td>
                          <td>${c.price}</td>
                          <td>{c.isExternal ? 'External' : 'Native'}</td>
                          <td>
                            <button 
                              onClick={() => handleDeleteCourse(c._id)} 
                              style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="stat-card-v3" style={{ padding: '32px' }}>
                  <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Course Architect</h2>
                  <p style={{ fontSize: '13px', color: '#9B9890', marginBottom: '24px' }}>Deploy new learning resources to the network.</p>
                  
                  <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9B9890', textTransform: 'uppercase' }}>Project Title</label>
                      <input className="form-control-v3" type="text" onChange={e => setCourseData({...courseData, title: e.target.value})} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#9B9890', textTransform: 'uppercase' }}>Strategy</label>
                      <textarea className="form-control-v3" rows="3" onChange={e => setCourseData({...courseData, description: e.target.value})} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#9B9890', textTransform: 'uppercase' }}>Category</label>
                        <select className="form-control-v3" onChange={e => setCourseData({...courseData, category: e.target.value})}>
                          <option>Technology</option><option>Business</option><option>Design</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#9B9890', textTransform: 'uppercase' }}>Valuation ($)</label>
                        <input className="form-control-v3" type="number" onChange={e => setCourseData({...courseData, price: e.target.value})} />
                      </div>
                    </div>
                    <button type="submit" className="primary-btn-v3" style={{ width: '100%', padding: '14px' }} disabled={uploading}>
                      {uploading ? 'Transmitting...' : 'Authorize Publication'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
