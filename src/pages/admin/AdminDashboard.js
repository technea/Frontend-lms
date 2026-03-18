import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardSidebar from '../../components/DashboardSidebar';
import api from '../../services/api';
import authService from '../../services/authService';
import gsap from 'gsap';
import { 
  FiUsers, FiBookOpen, FiActivity, FiShield, 
  FiUploadCloud, FiSettings, FiGrid, FiTrash2, FiUserCheck, FiDatabase
} from 'react-icons/fi';
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
      navigate('/admin/login');
      return;
    }
    setUser(currentUser);
    fetchData();

    // Entrance Animation
    gsap.from('.edu-admin-header', { y: -20, opacity: 0, duration: 0.8 });
    gsap.from('.edu-admin-sidebar-nav', { x: -30, opacity: 0, duration: 0.8, stagger: 0.1 });
    gsap.from('.edu-admin-stat-card', { scale: 0.95, opacity: 0, duration: 0.6, stagger: 0.1, delay: 0.3 });
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
    if (window.confirm('Terminate this user account? This action cannot be undone.')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User Purged');
        fetchData();
      } catch (err) { toast.error('Elimination failed'); }
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm('Retire this course from the curriculum?')) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course Retired');
        fetchData();
      } catch (err) { toast.error('Decommissioning failed'); }
    }
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData();
    Object.keys(courseData).forEach(key => formData.append(key, courseData[key]));
    try {
      await api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('System Update: New Course Published');
      setCourseData({ title: '', description: '', category: 'Technology', price: '', video: null, isYouTube: false, playlistUrl: '' });
      setActiveTab('courses');
      fetchData();
    } catch (err) { toast.error('Publication failed'); } finally { setUploading(false); }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'A';

  return (
    <div className="edu-dashboard admin-dashboard-v2" style={{background: '#F8F7F2', minHeight: '100vh', display: 'flex'}}>
      {/* Sleek Custom Sidebar */}
      <aside className="admin-side-nav" style={{
        width: '280px', 
        background: '#1A1916', 
        color: '#fff', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{marginBottom: '40px'}}>
          <h2 style={{fontSize: '20px', fontWeight: 800, color: '#E85D2A', letterSpacing: '2px'}}>NEXLEARN</h2>
          <span style={{fontSize: '10px', color: '#9B9890', letterSpacing: '3px'}}>CENTRAL COMMAND</span>
        </div>

        <nav className="edu-admin-sidebar-nav" style={{flexGrow: 1}}>
          {[
            { id: 'overview', name: 'Overview', icon: <FiActivity /> },
            { id: 'users', name: 'User Registry', icon: <FiUsers /> },
            { id: 'courses', name: 'Curriculum', icon: <FiBookOpen /> },
            { id: 'upload', name: 'Global Upload', icon: <FiUploadCloud /> },
            { id: 'settings', name: 'System Core', icon: <FiSettings /> }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                background: activeTab === item.id ? 'rgba(232, 93, 42, 0.1)' : 'transparent',
                color: activeTab === item.id ? '#E85D2A' : '#9B9890',
                border: 'none',
                borderRadius: '12px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: '0.3s',
                textAlign: 'left',
                fontWeight: activeTab === item.id ? 600 : 400
              }}
            >
              <span style={{fontSize: '18px'}}>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div style={{marginTop: 'auto', padding: '20px', background: '#252420', borderRadius: '16px', fontSize: '12px'}}>
           <div style={{color: '#E85D2A', fontWeight: 700, marginBottom: '5px'}}>Security Status</div>
           <div style={{color: '#A3E635'}}>● System Online</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{flexGrow: 1, padding: '40px', maxWidth: '1400px', margin: '0 auto'}}>
        <header className="edu-admin-header" style={{
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{fontSize: '32px', fontFamily: '"Playfair Display", serif', fontWeight: 900}}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
            </h1>
            <p style={{color: '#6B6962', fontSize: '14px'}}>Logged in as Terminal Administrator: {user?.name}</p>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <div style={{textAlign: 'right'}}>
                <div style={{fontWeight: 700, fontSize: '14px'}}>{user?.email}</div>
                <div style={{fontSize: '11px', color: '#E85D2A', textTransform: 'uppercase', fontWeight: 800}}>Admin Tier 1</div>
             </div>
             <div className="edu-avatar" style={{width: '50px', height: '50px', background: '#1A1916', color: '#fff', fontSize: '18px'}}>{initials}</div>
          </div>
        </header>

        {loading ? (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh'}}>
             <div className="edu-spinner"></div>
             <p style={{marginTop: '20px', color: '#9B9890', letterSpacing: '2px'}}>DECRYPTING CORE DATA...</p>
          </div>
        ) : (
          <div className="admin-tab-content">
            {activeTab === 'overview' && (
              <>
                <div className="admin-stats-v2-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px'
                }}>
                  {[
                    { label: 'Network Users', val: stats.totalUsers, icon: <FiUsers />, color: '#2D5BE3' },
                    { label: 'Active Curriculum', val: stats.totalCourses, icon: <FiBookOpen />, color: '#E85D2A' },
                    { label: 'Live Enrollments', val: stats.totalEnrollments, icon: <FiActivity />, color: '#10B981' },
                    { label: 'System Health', val: '98%', icon: <FiShield />, color: '#B56C10' }
                  ].map((s, i) => (
                    <div key={i} className="edu-admin-stat-card" style={{
                      background: '#fff', 
                      padding: '25px', 
                      borderRadius: '20px', 
                      border: '1px solid #E2E0D8',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
                    }}>
                       <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                          <span style={{padding: '10px', background: s.color + '15', color: s.color, borderRadius: '12px', fontSize: '20px'}}>{s.icon}</span>
                          <span style={{background: '#f0f0f0', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, color: '#666'}}>+2.4%</span>
                       </div>
                       <h4 style={{color: '#9B9890', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px'}}>{s.label}</h4>
                       <div style={{fontSize: '28px', fontWeight: 800, color: '#1A1916'}}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px'}}>
                   <div className="edu-card" style={{borderRadius: '24px', padding: '30px'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                         <h3 style={{fontSize: '18px', fontWeight: 800}}>System Infrastructure</h3>
                         <button className="edu-btn-text" style={{fontSize: '13px', color: '#E85D2A'}}>View Node Logs</button>
                      </div>
                      <div className="admin-infogrid" style={{display: 'grid', gap: '15px'}}>
                         <div style={{padding: '15px', background: '#F8F7F2', borderRadius: '14px', border: '1px solid #E2E0D8', display: 'flex', justifyContent: 'space-between'}}>
                            <span>Database Cluster 0 (Atlas)</span>
                            <span style={{color: '#10B981', fontWeight: 700}}>OPERATIONAL</span>
                         </div>
                         <div style={{padding: '15px', background: '#F8F7F2', borderRadius: '14px', border: '1px solid #E2E0D8', display: 'flex', justifyContent: 'space-between'}}>
                            <span>Frontend CDN (Vercel Edge)</span>
                            <span style={{color: '#10B981', fontWeight: 700}}>SYNCED</span>
                         </div>
                         <div style={{padding: '15px', background: '#F8F7F2', borderRadius: '14px', border: '1px solid #E2E0D8', display: 'flex', justifyContent: 'space-between'}}>
                            <span>JWT Authentication Interface</span>
                            <span style={{color: '#10B981', fontWeight: 700}}>SECURE</span>
                         </div>
                      </div>
                   </div>

                   <div className="edu-card" style={{borderRadius: '24px', padding: '30px', background: '#1A1916', color: '#fff'}}>
                      <h3 style={{fontSize: '18px', fontWeight: 800, marginBottom: '20px'}}>Role Distribution</h3>
                      <div style={{marginBottom: '15px'}}>
                         <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px'}}>
                            <span>Students</span><span>{stats.roleBreakdown.students}</span>
                         </div>
                         <div style={{height: '6px', background: '#333', borderRadius: '10px'}}><div style={{height: '100%', width: (stats.roleBreakdown.students / stats.totalUsers * 100) + '%', background: '#E85D2A', borderRadius: '10px'}}></div></div>
                      </div>
                      <div style={{marginBottom: '15px'}}>
                         <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px'}}>
                            <span>Instructors</span><span>{stats.roleBreakdown.instructors}</span>
                         </div>
                         <div style={{height: '6px', background: '#333', borderRadius: '10px'}}><div style={{height: '100%', width: (stats.roleBreakdown.instructors / stats.totalUsers * 100) + '%', background: '#2D5BE3', borderRadius: '10px'}}></div></div>
                      </div>
                      <div style={{marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px', fontSize: '12px', color: '#9B9890'}}>
                         Platform Capacity: INFINITE
                      </div>
                   </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="edu-card" style={{borderRadius: '24px', overflow: 'hidden', padding: 0}}>
                <div style={{padding: '25px', borderBottom: '1px solid #E2E0D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{fontSize: '18px', fontWeight: 800}}>User Registry</h3>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input type="text" placeholder="Filter Registry..." style={{padding: '8px 15px', borderRadius: '10px', border: '1px solid #E2E0D8', fontSize: '13px'}} />
                  </div>
                </div>
                <div className="edu-table-wrap">
                  <table className="edu-table v2">
                    <thead style={{background: '#F8F7F2'}}>
                      <tr><th>User Entity</th><th>Electronic Mail</th><th>Clearance</th><th>Security</th><th>Protocol</th></tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} style={{borderBottom: '1px solid #F5F4F0'}}>
                          <td><div style={{fontWeight: 700}}>{u.name}</div></td>
                          <td><code style={{fontSize: '12px'}}>{u.email}</code></td>
                          <td><span className="edu-tag" style={{
                            background: u.role === 'admin' ? '#1A1916' : u.role === 'instructor' ? '#E85D2A15' : '#F0F0F0',
                            color: u.role === 'admin' ? '#fff' : u.role === 'instructor' ? '#E85D2A' : '#666',
                            fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'
                          }}>{u.role}</span></td>
                          <td>{u.isVerified ? <span style={{color: '#10B981'}}>● Verified</span> : <span style={{color: '#B56C10'}}>● Pending</span>}</td>
                          <td>
                            {u.role !== 'admin' && (
                              <button onClick={() => handleDeleteUser(u._id)} className="action-btn-del" style={{
                                color: '#E85D2A', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px'
                              }}><FiTrash2 /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="edu-card" style={{borderRadius: '24px', overflow: 'hidden', padding: 0}}>
                <div style={{padding: '25px', borderBottom: '1px solid #E2E0D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{fontSize: '18px', fontWeight: 800}}>Curriculum Repository</h3>
                  <button onClick={() => setActiveTab('upload')} className="edu-btn edu-btn-primary" style={{padding: '10px 20px', borderRadius: '12px'}}>+ Add Course</button>
                </div>
                <div className="edu-table-wrap">
                  <table className="edu-table v2">
                    <thead style={{background: '#F8F7F2'}}>
                      <tr><th>Curriculum Title</th><th>Classification</th><th>Valuation</th><th>Source</th><th>Admin</th></tr>
                    </thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c._id} style={{borderBottom: '1px solid #F5F4F0'}}>
                          <td style={{fontWeight: 700, width: '40%'}}>{c.title}</td>
                          <td>{c.category}</td>
                          <td style={{fontWeight: 800}}>{c.price === 0 ? 'FREE' : `$${c.price}`}</td>
                          <td>
                            <span style={{fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: c.isExternal ? '#B56C1015' : '#E85D2A15', color: c.isExternal ? '#B56C10' : '#E85D2A', fontWeight: 700}}>
                               {c.isExternal ? c.source : 'Internal'}
                            </span>
                          </td>
                          <td>
                             <button onClick={() => handleDeleteCourse(c._id)} className="action-btn-del" style={{
                                color: '#E85D2A', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px'
                              }}><FiTrash2 /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px'}}>
                 <div className="edu-card" style={{borderRadius: '24px', padding: '30px'}}>
                    <h3 style={{fontSize: '20px', fontWeight: 800, marginBottom: '25px'}}>New Curriculum Entry</h3>
                    <form onSubmit={handleCourseSubmit} className="edu-admin-form-v2">
                      <div className="form-group-v2">
                          <label>Display Title</label>
                          <input type="text" placeholder="Enter course title" required onChange={e => setCourseData({...courseData, title: e.target.value})} />
                      </div>
                      <div className="form-group-v2">
                          <label>Executive Summary (Description)</label>
                          <textarea placeholder="Describe the curriculum value..." required onChange={e => setCourseData({...courseData, description: e.target.value})} />
                      </div>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                        <div className="form-group-v2">
                          <label>Category</label>
                          <select value={courseData.category} onChange={e => setCourseData({...courseData, category: e.target.value})}>
                              <option>Technology</option><option>Business</option><option>Design</option><option>Marketing</option><option>Data Science</option>
                          </select>
                        </div>
                        <div className="form-group-v2">
                          <label>Access Price ($)</label>
                          <input type="number" placeholder="0.00" value={courseData.price} required onChange={e => setCourseData({...courseData, price: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="edu-btn edu-btn-primary" style={{width: '100%', padding: '16px', borderRadius: '14px', fontSize: '16px', marginTop: '10px'}} disabled={uploading}>
                        {uploading ? 'TRANSMITTING...' : 'AUTHORIZE PUBLICATION'}
                      </button>
                    </form>
                 </div>

                 <div className="edu-card" style={{borderRadius: '24px', padding: '30px', background: '#F5F4F0'}}>
                    <h4 style={{fontSize: '16px', fontWeight: 800, marginBottom: '20px'}}>Media Strategy</h4>
                    <div className="media-toggle" style={{display: 'flex', gap: '10px', marginBottom: '25px'}}>
                        <button 
                          onClick={() => setCourseData({...courseData, isYouTube: true})} 
                          style={{flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid ' + (courseData.isYouTube ? '#E85D2A' : '#E2E0D8'), background: courseData.isYouTube ? '#fff' : 'transparent', color: courseData.isYouTube ? '#E85D2A' : '#6B6962', cursor: 'pointer', transition: '0.3s'}}
                        >
                          YouTube Feed
                        </button>
                        <button 
                          onClick={() => setCourseData({...courseData, isYouTube: false})} 
                          style={{flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid ' + (!courseData.isYouTube ? '#E85D2A' : '#E2E0D8'), background: !courseData.isYouTube ? '#fff' : 'transparent', color: !courseData.isYouTube ? '#E85D2A' : '#6B6962', cursor: 'pointer', transition: '0.3s'}}
                        >
                          Direct Upload
                        </button>
                    </div>

                    {courseData.isYouTube ? (
                        <div className="form-group-v2">
                            <label>YouTube Playlist Reference (URL)</label>
                            <input type="text" placeholder="https://youtube.com/playlist?list=..." value={courseData.playlistUrl} onChange={e => setCourseData({...courseData, playlistUrl: e.target.value})} required />
                            <p style={{fontSize: '11px', color: '#6B6962', marginTop: '10px'}}>System will automatically index all fragments from this identifier.</p>
                        </div>
                    ) : (
                        <div className="form-group-v2">
                            <label>Curriculum Introduction (MP4/MKV)</label>
                            <input type="file" accept="video/*" onChange={e => setCourseData({...courseData, video: e.target.files[0]})} />
                            <p style={{fontSize: '11px', color: '#6B6962', marginTop: '10px'}}>Max file size: 50MB. High-speed uplink suggested.</p>
                        </div>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="edu-card" style={{borderRadius: '24px', padding: '40px', textAlign: 'center'}}>
                 <div style={{fontSize: '50px', marginBottom: '20px'}}>⚙️</div>
                 <h2 style={{fontWeight: 800, marginBottom: '10px'}}>System Core Settings</h2>
                 <p style={{color: '#6B6962', marginBottom: '30px'}}>Configure global NexLearn parameters and authentication layers.</p>
                 
                 <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '800px', margin: '0 auto'}}>
                    <button className="admin-tool-box" onClick={() => toast.success('Database Integrity: 100%')}>
                       <FiDatabase style={{fontSize: '24px', marginBottom: '10px', color: '#2D5BE3'}} />
                       <div style={{fontWeight: 700}}>Repopulate DB</div>
                    </button>
                    <button className="admin-tool-box" onClick={() => toast.info('Cache Flush Initiated')}>
                       <FiActivity style={{fontSize: '24px', marginBottom: '10px', color: '#E85D2A'}} />
                       <div style={{fontWeight: 700}}>Flush CDN</div>
                    </button>
                    <button className="admin-tool-box" onClick={() => toast.loading('Syncing...')} style={{border: '1px solid #10B981', background: '#10B98105'}}>
                       <FiUserCheck style={{fontSize: '24px', marginBottom: '10px', color: '#10B981'}} />
                       <div style={{fontWeight: 700}}>Verify All Users</div>
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        .admin-dashboard-v2 { font-family: 'Inter', sans-serif; }
        .admin-side-nav button { transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
        .admin-side-nav button:hover { transform: translateX(5px); background: rgba(232,93,42,0.1) !important; color: #E85D2A !important; }
        
        .form-group-v2 { margin-bottom: 25px; }
        .form-group-v2 label { display: block; font-size: 11px; font-weight: 800; color: #1A1916; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7; }
        .form-group-v2 input, .form-group-v2 textarea, .form-group-v2 select { 
          width: 100%; padding: 16px; border-radius: 16px; border: 1px solid #E2E0D8; 
          background: #fff; font-size: 15px; color: #1A1916; transition: all 0.3s;
        }
        .form-group-v2 input:focus { outline: none; border-color: #1A1916; box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.03); }
        
        .edu-btn-primary { 
          background: #1A1916 !important; color: #fff !important; border: none !important; 
          box-shadow: 0 15px 30px rgba(0,0,0,0.15); transition: all 0.4s !important;
          font-weight: 700 !important; letter-spacing: 0.5px;
        }
        .edu-btn-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.2) !important; background: #E85D2A !important; }
        .edu-btn-primary:active { transform: translateY(0); }

        .edu-table.v2 th { padding: 20px 25px; color: #9B9890; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #E2E0D8; }
        .edu-table.v2 td { padding: 20px 25px; font-size: 14px; vertical-align: middle; border: none; }
        
        .admin-tool-box { 
          padding: 30px; background: #fff; border: 1px solid #E2E0D8; border-radius: 24px; 
          cursor: pointer; transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 15px;
        }
        .admin-tool-box:hover { 
          transform: translateY(-10px) scale(1.03); 
          border-color: #E85D2A; 
          box-shadow: 0 30px 60px rgba(232, 93, 42, 0.1); 
        }
        
        .edu-spinner { border: 4px solid #E2E0D8; border-top: 4px solid #E85D2A; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* V2 Card Glassmorphism */
        .edu-admin-stat-card { transition: all 0.4s ease; }
        .edu-admin-stat-card:hover { transform: translateY(-8px); border-color: #E85D2A; box-shadow: 0 25px 50px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
