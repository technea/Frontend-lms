import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { Modal } from 'react-bootstrap';
import { createBaseAccountSDK } from "@base-org/account";
import socketService from '../services/socketService';
import '../styles/EduFlow.css';

const IS_VERCEL = window.location.hostname.includes('vercel.app');

const Navbar = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [chatConnected, setChatConnected] = React.useState(socketService.isConnected());

  React.useEffect(() => {
    if (IS_VERCEL) return;

    const checkInterval = setInterval(() => {
      setChatConnected(socketService.isConnected());
    }, 2000);

    return () => clearInterval(checkInterval);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const handleWalletLogin = async () => {
    try {
      const sdk = createBaseAccountSDK({ appName: "NexLearn" });
      const provider = sdk.getProvider();
      const { accounts } = await provider.request({
        method: "wallet_connect",
        params: [{ version: "1", capabilities: { signInWithEthereum: { nonce: window.crypto.randomUUID().replace(/-/g, ""), chainId: "0x2105" }}}],
      });
      const { address } = accounts[0];
      const { message, signature } = accounts[0].capabilities.signInWithEthereum;
      const data = await authService.walletLogin({ address, message, signature });
      if (data.token) {
        setUser(data.user);
        navigate(data.user?.role === 'admin' ? '/admin' : (data.user?.role === 'instructor' ? '/instructor' : '/dashboard'));
      }
    } catch (err) { console.error("Wallet Login Error:", err); }
  };

  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) return alert('MetaMask not found!');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      const message = `Welcome to NexLearn! Sign this message to log in.\n\nNonce: ${window.crypto.randomUUID()}`;
      const signature = await window.ethereum.request({ method: 'personal_sign', params: [message, address] });
      const data = await authService.walletLogin({ address, message, signature });
      if (data.token) {
        setUser(data.user);
        navigate(data.user?.role === 'admin' ? '/admin' : (data.user?.role === 'instructor' ? '/instructor' : '/dashboard'));
      }
    } catch (err) { console.error("MetaMask Error:", err); }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' },
  ];

  return (
    <>
      <nav className="edu-navbar">
        <div className="edu-navbar-container">
          <Link to="/" className="edu-navbar-brand">
            <div className="brand-icon" style={{background: '#2D5BE3'}}>
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="white"/></svg>
            </div>
            <span className="brand-name">NexLearn</span>
          </Link>

          {/* Desktop Links */}
          <div className="edu-navbar-desktop">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`edu-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="nav-divider"></div>
            
            <div className="nav-user-actions" style={{display:'flex', alignItems:'center', gap:'12px'}}>
              {/* Always show Connect Wallet as an option, optionally next to user dashboard */}
              {/* Removed redundant Connect Wallet button to consolidate at login */}

              {user ? (
                <>
                  {/* Chat Connection Status (Up Front) */}
                  <Link to="/community-chat" className="chat-status-indicator" style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    background: IS_VERCEL ? 'rgba(13, 202, 240, 0.1)' : (chatConnected ? 'rgba(25, 135, 84, 0.1)' : 'rgba(255, 193, 7, 0.1)'),
                    padding: '6px 14px',
                    borderRadius: '20px',
                    marginRight: '8px',
                    border: `1px solid ${IS_VERCEL ? '#0dcaf0' : (chatConnected ? '#198754' : '#ffc107')}`,
                    textDecoration: 'none',
                    transition: '0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      background: IS_VERCEL ? '#0dcaf0' : (chatConnected ? '#198754' : '#ffc107'),
                      boxShadow: chatConnected ? 'none' : '0 0 8px #ffc107',
                      animation: chatConnected ? 'none' : 'pulse-yellow 1.5s infinite'
                    }} />
                    <span style={{
                      fontSize: '11px', 
                      fontWeight: 700, 
                      color: IS_VERCEL ? '#0dcaf0' : (chatConnected ? '#198754' : '#856404'),
                      textTransform: 'uppercase'
                    }}>
                      {IS_VERCEL ? '☁️ Cloud' : (chatConnected ? 'Connected' : 'Connecting')}
                    </span>
                  </Link>

                  <Link to={user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'} className="edu-btn edu-btn-outline" style={{padding: '8px 16px', fontSize: '13px'}}>Dashboard</Link>
                  <button onClick={handleLogout} className="edu-btn edu-btn-primary" style={{padding: '8px 16px', fontSize: '13px', background:'rgba(45, 91, 227, 0.1)', color:'#2D5BE3'}}>Logout</button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowWalletModal(true)}
                    className="edu-btn edu-btn-primary" 
                    style={{
                      padding: '8px 20px', 
                      fontSize: '12px', 
                      borderRadius: '30px', 
                      background: '#2D5BE3',
                      boxShadow: '0 4px 12px rgba(45, 91, 227, 0.2)',
                      marginRight: '8px'
                    }}
                  >
                    Connect Wallet
                  </button>
                  <Link to="/login" className="edu-nav-link" style={{fontSize:'13px'}}>Login</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className="edu-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18"}/></svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="edu-mobile-menu">
             {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">{link.name}</Link>
             ))}
             <div className="mobile-divider"></div>
             
             <div style={{padding:'10px 20px', display:'flex', flexDirection:'column', gap:'10px'}}>
               {/* Consolidated Connect Wallet button removed from here */}

               {user ? (
                 <>
                   <Link to={user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} style={{textDecoration:'none', color:'#1A1916', fontWeight:600}}>Dashboard</Link>
                   <button onClick={handleLogout} className="edu-btn edu-btn-outline" style={{padding:'10px', borderRadius:'10px'}}>Logout</button>
                 </>
               ) : (
                 <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{textAlign:'center', textDecoration:'none', color:'#2D5BE3', fontWeight:700, marginTop:'10px'}}>Email Login</Link>
               )}
             </div>
          </div>
        )}
      </nav>

      {/* Wallet Selection Modal */}
      <Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} centered>
        <Modal.Header closeButton style={{border: 'none', padding: '24px 24px 10px'}}>
          <Modal.Title style={{fontWeight: 900, fontFamily: '"Playfair Display", serif'}}>Connect Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding: '0 24px 30px'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <div 
              onClick={() => { setShowWalletModal(false); handleWalletLogin(); }}
              style={{padding: '16px', borderRadius: '12px', border: '1px solid #F0EFEA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', background: '#F8F7F2'}}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#2D5BE3'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#F0EFEA'}
            >
              <div style={{width: '32px', height: '32px', background: '#0052FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{width: '18px', height: '16px', borderRadius: '50%', background: 'white'}} />
              </div>
              <div style={{fontWeight: 800}}>Base / Coinbase</div>
            </div>

            <div 
              onClick={() => { setShowWalletModal(false); handleMetaMaskLogin(); }}
              style={{padding: '16px', borderRadius: '12px', border: '1px solid #F0EFEA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', background: '#F8F7F2'}}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#E2761B'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#F0EFEA'}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg" alt="MetaMask" style={{width: '32px', height: '32px'}} />
              <div style={{fontWeight: 800}}>MetaMask</div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Navbar;