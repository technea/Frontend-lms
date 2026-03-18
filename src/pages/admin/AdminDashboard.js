import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import authService from '../../services/authService';
import gsap from 'gsap';
import { 
  FiUsers, FiBookOpen, FiActivity, FiShield, 
  FiUploadCloud, FiSettings, FiGrid, FiTrash2, FiUserCheck, 
  FiDatabase, FiBell, FiSearch, FiMoreVertical, FiLogOut
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
      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <div className="logo-icon">N</div>
          <span className="logo-text">NexLearn<span>Admin</span></span>
        </div>

        <nav className="dash-nav">
          <div className="nav-group-label">General</div>
          {[
            { id: 'overview', name: 'Dashboard', icon: <FiGrid /> },
            { id: 'users', name: 'User Management', icon: <FiUsers /> },
            { id: 'courses', name: 'Course Library', icon: <FiBookOpen /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}

          <div className="nav-group-label">Operations</div>
          {[
            { id: 'upload', name: 'Course Creator', icon: <FiUploadCloud /> },
            { id: 'settings', name: 'System Core', icon: <FiSettings /> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar-footer">
          <button onClick={() => { authService.logout(); navigate('/login'); }} className="logout-btn">
            <FiLogOut /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="dash-main">
        {/* Top Header */}
        <header className="dash-header">
          <div className="header-search">
            <FiSearch />
            <input type="text" placeholder="Search for users, courses, or events..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn"><FiBell /><span className="badge"></span></button>
            <div className="header-divider"></div>
            <div className="header-user">
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">System Administrator</span>
              </div>
              <div className="user-avatar">{initials}</div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="dash-loading">
            <div className="spinner-v3"></div>
            <p>Gathering Intelligence...</p>
          </div>
        ) : (
          <div className="dash-body">
            {activeTab === 'overview' && (
              <div className="overview-tab animate-in">
                <div className="welcome-banner">
                  <h1>Welcome back, {user?.name.split(' ')[0]}!</h1>
                  <p>Here's what's happening across the NexLearn ecosystem today.</p>
                </div>

                <div className="stat-grid-v3">
                  {[
                    { label: 'Total Learners', val: stats.totalUsers, icon: <FiUsers />, trend: '+12%', color: '#6366F1' },
                    { label: 'Live Courses', val: stats.totalCourses, icon: <FiBookOpen />, trend: '+3', color: '#F59E0B' },
                    { label: 'New Enrollments', val: stats.totalEnrollments, icon: <FiActivity />, trend: '+24%', color: '#10B981' },
                    { label: 'Security Score', val: 'A+', icon: <FiShield />, trend: 'Stable', color: '#EF4444' }
                  ].map((s, i) => (
                    <div key={i} className="stat-card-v3">
                      <div className="stat-icon-v3" style={{backgroundColor: s.color + '15', color: s.color}}>{s.icon}</div>
                      <div className="stat-content-v3">
                        <span className="stat-label-v3">{s.label}</span>
                        <div className="stat-value-v3">{s.val}</div>
                      </div>
                      <div className="stat-trend-v3" style={{color: s.color}}>{s.trend}</div>
                    </div>
                  ))}
                </div>

                <div className="info-section-grid">
                  <div className="data-card shadow-sm">
                    <div className="card-header-v3">
                      <h3>Infrastructure Health</h3>
                      <button className="text-btn">View Monitoring</button>
                    </div>
                    <div className="health-list">
                      <div className="health-item">
                        <div className="dot green"></div>
                        <div className="health-info"><span>API Gateway</span><small>Standard Latency: 42ms</small></div>
                      </div>
                      <div className="health-item">
                        <div className="dot green"></div>
                        <div className="health-info"><span>Database Cluster</span><small>Primary: Synchronized</small></div>
                      </div>
                      <div className="health-item">
                        <div className="dot green"></div>
                        <div className="health-info"><span>Auth Service</span><small>Active Sessions: 124</small></div>
                      </div>
                    </div>
                  </div>

                  <div className="data-card shadow-sm role-distribution">
                    <div className="card-header-v3">
                      <h3>Organization</h3>
                    </div>
                    <div className="role-progress">
                       <div className="role-pb-item">
                          <div className="label-row"><span>Students</span> <span>{stats.roleBreakdown.students}</span></div>
                          <div className="progress-bar-v3"><div style={{width: (stats.roleBreakdown.students / (stats.totalUsers || 1) * 100) + '%', backgroundColor: '#6366F1'}}></div></div>
                       </div>
                       <div className="role-pb-item">
                          <div className="label-row"><span>Instructors</span> <span>{stats.roleBreakdown.instructors}</span></div>
                          <div className="progress-bar-v3"><div style={{width: (stats.roleBreakdown.instructors / (stats.totalUsers || 1) * 100) + '%', backgroundColor: '#F59E0B'}}></div></div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="table-card-v3 animate-in shadow-sm">
                <div className="card-header-v3">
                  <div>
                    <h3>User Registry</h3>
                    <p>Manage access control and view user analytical data.</p>
                  </div>
                  <div className="header-actions-v3">
                    <button className="primary-btn-v3">+ Create User</button>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table-v3">
                    <thead>
                      <tr><th>Full Name</th><th>Account ID</th><th>Access Level</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="table-user">
                              <div className="table-avatar">{u.name[0]}</div>
                              <div className="table-user-info">
                                <strong>{u.name}</strong>
                                <span>{u.isVerified ? 'Verified Profile' : 'Awaiting Docs'}</span>
                              </div>
                            </div>
                          </td>
                          <td><code>{u.email}</code></td>
                          <td><span className={`role-badge ${u.role}`}>{u.role}</span></td>
                          <td><div className="status-indicator"><span className={u.isVerified ? 'online' : 'away'}></span> {u.isVerified ? 'Authorized' : 'Restricted'}</div></td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleDeleteUser(u._id)} className="delete-btn-v3" title="Archive User"><FiTrash2 /></button>
                              <button className="more-btn-v3"><FiMoreVertical /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="table-card-v3 animate-in shadow-sm">
                <div className="card-header-v3 border-bottom-0">
                  <div>
                    <h3>Course Catalogue</h3>
                    <p>Overview of all published and pending curriculum.</p>
                  </div>
                  <button onClick={() => setActiveTab('upload')} className="primary-btn-v3">+ Author New Course</button>
                </div>
                <div className="table-responsive">
                  <table className="table-v3">
                    <thead>
                      <tr><th>Curriculum Details</th><th>Classification</th><th>Valuation</th><th>Authority</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c._id}>
                          <td>
                            <div className="course-table-cell">
                              <strong>{c.title}</strong>
                              <small>{c.description?.substring(0, 45)}...</small>
                            </div>
                          </td>
                          <td><span className="cat-badge">{c.category}</span></td>
                          <td><div className="price-tag-v3">{c.price === 0 ? 'COMPLIMENTARY' : `$${c.price}`}</div></td>
                          <td>
                            <span className={`source-badge ${c.isExternal ? 'ext' : 'int'}`}>
                              {c.isExternal ? c.source : 'NexLearn Native'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button onClick={() => handleDeleteCourse(c._id)} className="delete-btn-v3"><FiTrash2 /></button>
                              <button className="more-btn-v3"><FiMoreVertical /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
               <div className="upload-container-v3 animate-in">
                  <div className="upload-card shadow-lg">
                     <div className="upload-header-v3">
                        <FiUploadCloud />
                        <h2>Course Architect</h2>
                        <p>Initialize new learning fragments in the global repository.</p>
                     </div>
                     <form onSubmit={handleCourseSubmit} className="upload-form-v3">
                        <div className="input-group-v3">
                           <label>Project Title</label>
                           <input type="text" placeholder="e.g. Advanced Quantum Computing" required onChange={e => setCourseData({...courseData, title: e.target.value})} />
                        </div>
                        <div className="input-group-v3">
                           <label>Strategic Summary</label>
                           <textarea rows="3" placeholder="Define the pedagogical impact..." required onChange={e => setCourseData({...courseData, description: e.target.value})} />
                        </div>
                        <div className="row">
                           <div className="col-md-6 mb-3">
                              <label>Classification</label>
                              <select className="form-select-v3" value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})}>
                                 <option>Technology</option><option>Business</option><option>Design</option><option>Marketing</option><option>Data Science</option>
                              </select>
                           </div>
                           <div className="col-md-6 mb-3">
                              <label>Pricing Strategy ($)</label>
                              <input type="number" className="form-control-v3" placeholder="0.00" value={courseData.price} required onChange={e => setCourseData({...courseData, price: e.target.value})} />
                           </div>
                        </div>

                        <div className="media-strategy-box">
                           <h4>Media Orchestration</h4>
                           <div className="strategy-toggle">
                              <button type="button" className={courseData.isYouTube ? 'active' : ''} onClick={() => setCourseData({...courseData, isYouTube: true})}>Cloud Sync (YT)</button>
                              <button type="button" className={!courseData.isYouTube ? 'active' : ''} onClick={() => setCourseData({...courseData, isYouTube: false})}>Deep Storage (Local)</button>
                           </div>
                           {courseData.isYouTube ? (
                              <input type="text" className="mt-3" placeholder="Enter Full YouTube Playlist URI" value={courseData.playlistUrl} onChange={e => setCourseData({...courseData, playlistUrl: e.target.value})} required />
                           ) : (
                              <input type="file" className="mt-3" accept="video/*" onChange={e => setCourseData({...courseData, video: e.target.files[0]})} />
                           )}
                        </div>

                        <button type="submit" className="submit-btn-v3" disabled={uploading}>
                           {uploading ? 'Transmitting Intelligence...' : 'Authorize Publication'}
                        </button>
                     </form>
                  </div>
               </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-grid-v3 animate-in">
                  <div className="settings-card shadow-sm text-center">
                     <div className="settings-hero">🛠️</div>
                     <h3>System Core Operations</h3>
                     <p>Managing global state and database integrity protocols.</p>
                     
                     <div className="tools-grid-v3">
                        <button className="tool-card-v3" onClick={() => fetchData()}>
                           <FiDatabase /> <span>Refresh Data Cache</span>
                        </button>
                        <button className="tool-card-v3" onClick={() => toast.info('Maintenance Mode requires Bio-Authentication')}>
                           <FiShield /> <span>Security Hardening</span>
                        </button>
                        <button className="tool-card-v3" onClick={() => toast.success('Verification Complete')}>
                           <FiUserCheck /> <span>Audit All Identities</span>
                        </button>
                     </div>
                  </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .admin-portal-v3 { 
          font-family: 'Inter', sans-serif; height: 100vh; display: flex; 
          background: #F8FAFC; color: #1E293B; overflow: hidden;
        }

        /* SIDEBAR */
        .dash-sidebar { 
          width: 280px; background: #0F172A; color: #fff; padding: 24px; 
          display: flex; flex-direction: column; gap: 32px; flex-shrink: 0;
        }
        .dash-logo { display:flex; align-items:center; gap:12px; }
        .logo-icon { width:36px; height:36px; background:#6366F1; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:20px; color:#fff; }
        .logo-text { font-size:20px; font-weight:800; }
        .logo-text span { color:#6366F1; font-size:12px; margin-left:4px; opacity:0.8; }
        
        .dash-nav { display:flex; flex-direction:column; gap:8px; flex-grow:1; }
        .nav-group-label { font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:1px; margin-top:16px; margin-bottom:8px; }
        .nav-item { 
          display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; 
          border:none; background:transparent; color:#94A3B8; font-size:14px; font-weight:500; 
          transition:0.3s; cursor:pointer; text-align:left;
        }
        .nav-item:hover { background:rgba(255,255,255,0.05); color:#fff; }
        .nav-item.active { background:#6366F1; color:#fff; box-shadow:0 10px 20px rgba(99,102,241,0.2); }
        .nav-item svg { font-size:18px; }

        .dash-sidebar-footer { border-top:1px solid #1E293B; padding-top:20px; }
        .logout-btn { display:flex; align-items:center; gap:12px; background:transparent; border:none; color:#94A3B8; cursor:pointer; font-weight:600; }
        .logout-btn:hover { color:#EF4444; }

        /* MAIN CONTENT */
        .dash-main { flex-grow:1; display:flex; flex-direction:column; overflow-y:auto; }
        
        /* HEADER */
        .dash-header { 
          height:80px; background:#fff; border-bottom:1px solid #E2E8F0; padding:0 40px; 
          display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100;
        }
        .header-search { display:flex; align-items:center; gap:12px; background:#F1F5F9; border-radius:12px; padding:10px 16px; width:400px; }
        .header-search input { border:none; background:transparent; outline:none; font-size:14px; width:100%; }
        .header-actions { display:flex; align-items:center; gap:20px; }
        .icon-btn { position:relative; background:transparent; border:none; color:#64748B; font-size:20px; cursor:pointer; }
        .icon-btn .badge { position:absolute; top:0; right:0; width:8px; height:8px; background:#EF4444; border-radius:50%; border:2px solid #fff; }
        .header-divider { width:1px; height:32px; background:#E2E8F0; }
        .header-user { display:flex; align-items:center; gap:12px; }
        .user-info { text-align:right; }
        .user-name { display:block; font-size:14px; font-weight:700; color:#1E293B; }
        .user-role { display:block; font-size:12px; color:#64748B; font-weight:500; }
        .user-avatar { width:40px; height:40px; background:#6366F1; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; }

        /* BODY */
        .dash-body { padding:40px; flex-grow:1; }
        .welcome-banner { margin-bottom:40px; }
        .welcome-banner h1 { font-size:28px; font-weight:800; letter-spacing:-0.5px; margin-bottom:8px; }
        .welcome-banner p { color:#64748B; font-weight:500; }

        /* STAT CARDS */
        .stat-grid-v3 { display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:40px; }
        .stat-card-v3 { background:#fff; padding:24px; border-radius:20px; border:1px solid #E2E8F0; display:flex; align-items:center; gap:20px; position:relative; transition:0.3s; cursor:pointer; }
        .stat-card-v3:hover { transform:translateY(-5px); box-shadow:0 15px 30px rgba(0,0,0,0.05); border-color:#6366F1; }
        .stat-icon-v3 { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:20px; }
        .stat-content-v3 { flex:1; }
        .stat-label-v3 { display:block; font-size:13px; font-weight:600; color:#64748B; margin-bottom:4px; }
        .stat-value-v3 { font-size:24px; font-weight:800; color:#1E293B; }
        .stat-trend-v3 { font-size:12px; font-weight:700; align-self:flex-start; margin-top:4px; }

        /* INFO SECTIONS */
        .info-section-grid { display:grid; grid-template-columns:1.5fr 1fr; gap:24px; }
        .data-card { background:#fff; border-radius:24px; border:1px solid #E2E8F0; padding:32px; }
        .card-header-v3 { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
        .card-header-v3 h3 { font-size:18px; font-weight:700; margin:0; }
        .text-btn { background:transparent; border:none; color:#6366F1; font-weight:700; font-size:13px; cursor:pointer; }
        
        .health-list { display:flex; flex-direction:column; gap:16px; }
        .health-item { display:flex; align-items:center; gap:12px; }
        .dot { width:10px; height:10px; border-radius:50%; }
        .dot.green { background:#10B981; box-shadow:0 0 10px rgba(16,185,129,0.5); }
        .health-info span { display:block; font-size:14px; font-weight:700; color:#1E293B; }
        .health-info small { font-size:12px; color:#64748B; }

        .role-progress { display:flex; flex-direction:column; gap:20px; }
        .label-row { display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:8px; }
        .progress-bar-v3 { height:8px; background:#F1F5F9; border-radius:10px; overflow:hidden; }
        .progress-bar-v3 div { height:100%; border-radius:10px; }

        /* TABLES */
        .table-card-v3 { background:#fff; border-radius:24px; border:1px solid #E2E8F0; overflow:hidden; }
        .table-responsive { width:100%; }
        .table-v3 { width:100%; border-collapse:collapse; text-align:left; }
        .table-v3 th { padding:20px 32px; background:#F8FAFC; color:#64748B; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #E2E8F0; }
        .table-v3 td { padding:20px 32px; border-bottom:1px solid #F1F5F9; }
        
        .table-user { display:flex; align-items:center; gap:12px; }
        .table-avatar { width:36px; height:36px; border-radius:50%; background:#F1F5F9; color:#6366F1; font-weight:800; display:flex; align-items:center; justify-content:center; }
        .table-user-info strong { display:block; font-size:14px; color:#1E293B; }
        .table-user-info span { display:block; font-size:12px; color:#64748B; }
        
        .role-badge { padding:4px 12px; border-radius:30px; font-size:11px; font-weight:700; text-transform:uppercase; }
        .role-badge.admin { background:#FEE2E2; color:#EF4444; }
        .role-badge.instructor { background:#FEF3C7; color:#F59E0B; }
        .role-badge.student { background:#E0E7FF; color:#6366F1; }
        
        .status-indicator { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:#64748B; }
        .status-indicator span { width:8px; height:8px; border-radius:50%; }
        .status-indicator span.online { background:#10B981; box-shadow:0 0 8px rgba(16,185,129,0.5); }
        .status-indicator span.away { background:#94A3B8; }

        .table-actions { display:flex; gap:8px; }
        .delete-btn-v3 { color:#EF4444; background:transparent; border:none; font-size:16px; transition:0.2s; cursor:pointer; }
        .more-btn-v3 { color:#94A3B8; background:transparent; border:none; font-size:16px; cursor:pointer; }
        
        /* UPLOAD */
        .upload-container-v3 { display:flex; justify-content:center; padding:20px 0; }
        .upload-card { background:#fff; border-radius:32px; padding:48px; width:100%; maxWidth:700px; text-align:center; }
        .upload-header-v3 { margin-bottom:32px; }
        .upload-header-v3 svg { font-size:48px; color:#6366F1; margin-bottom:16px; }
        .upload-header-v3 h2 { font-size:24px; font-weight:800; margin-bottom:8px; }
        
        .input-group-v3 { text-align:left; margin-bottom:20px; }
        .input-group-v3 label { display:block; font-size:13px; font-weight:700; margin-bottom:8px; color:#475569; }
        .input-group-v3 input, .input-group-v3 textarea, .form-select-v3, .form-control-v3 { width:100%; border:1px solid #E2E8F0; border-radius:12px; padding:14px; font-size:14px; }
        
        .media-strategy-box { background:#F8FAFC; border-radius:24px; padding:24px; margin:32px 0; text-align:left; }
        .media-strategy-box h4 { font-size:14px; font-weight:800; margin-bottom:16px; }
        .strategy-toggle { display:flex; gap:10px; }
        .strategy-toggle button { flex:1; padding:12px; border-radius:12px; border:1px solid #E2E8F0; background:#fff; color:#64748B; font-weight:700; transition:0.3s; cursor:pointer; }
        .strategy-toggle button.active { border-color:#6366F1; color:#6366F1; background:rgba(99,102,241,0.05); }
        
        .submit-btn-v3 { width:100%; padding:18px; background:#6366F1; color:#fff; border:none; border-radius:16px; font-weight:700; font-size:16px; box-shadow:0 15px 30px rgba(99,102,241,0.2); transition:0.3s; cursor:pointer; }
        .submit-btn-v3:hover { transform:translateY(-3px); box-shadow:0 20px 40px rgba(99,102,241,0.3); }

        /* LOADING */
        .dash-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; }
        .spinner-v3 { width:40px; height:40px; border:3px solid #E2E8F0; border-top-color:#6366F1; border-radius:50%; animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .animate-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .cat-badge { padding:4px 10px; background:#F1F5F9; border-radius:8px; font-size:11px; font-weight:700; color:#475569; }
        .source-badge { font-size:11px; font-weight:700; }
        .source-badge.ext { color:#F59E0B; }
        .source-badge.int { color:#10B981; }

        .primary-btn-v3 { background:#6366F1; color:#fff; border:none; padding:10px 24px; border-radius:10px; font-weight:700; cursor:pointer; transition:0.3s; }
        .primary-btn-v3:hover { transform:translateY(-2px); box-shadow:0 10px 20px rgba(99,102,241,0.2); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
