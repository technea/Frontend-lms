import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const PlayfulButton = ({ children, onClick, type = "button", className = "", style = {} }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    // Initial entrance animation
    gsap.from(buttonRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  }, []);

  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      y: -5,
      boxShadow: '0 15px 35px rgba(102, 16, 242, 0.4)',
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      y: 0,
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseDown = () => {
    gsap.to(buttonRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.in"
    });
  };

  const handleMouseUp = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    });
  };

  const defaultStyle = {
    borderRadius: '12px',
    padding: '14px 32px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: '#fff',
    margin: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    fontSize: '0.8rem',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden'
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      type={type}
      className={`btn-playful ${className}`}
      style={{ ...defaultStyle, ...style }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
};

export default PlayfulButton;
