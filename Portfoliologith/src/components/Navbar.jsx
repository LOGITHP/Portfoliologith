import { useState, useEffect, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import { convertDriveLink } from '../utils/driveLinkConverter';

export default function Navbar({ onAdminTrigger, isAdmin, setIsAdmin, onResetDefaults }) {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef(null);
  
  const [logoUrl, setLogoUrl] = useState('');
  const [siteTitle, setSiteTitle] = useState("LOGTIH'S PORTFOLIO");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const docRef = ref(db, 'content/hero');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.logoUrl) {
            const converted = convertDriveLink(data.logoUrl);
            setLogoUrl(converted);
            
            // Programmatically update the browser's favicon dynamically!
            const favicon = document.getElementById('favicon');
            if (favicon) {
              favicon.href = converted;
            }
          }
          if (data.siteTitle) setSiteTitle(data.siteTitle);
        }
      } catch (err) {
        console.error("Error fetching navbar data:", err);
      }
    };
    fetchHeroData();
  }, [isAdmin]); 

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    setClickCount((prev) => prev + 1);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClickCount(0), 3000);
  };

  useEffect(() => {
    if (clickCount === 5) {
      onAdminTrigger();
      setClickCount(0);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [clickCount, onAdminTrigger]);

  return (
    <nav className={`glass-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-wrapper">
        <div 
          className="logo-container" 
          onClick={handleLogoClick}
          title="Click logo 5 times to log in as admin!"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="logo-img" />
          ) : (
            <div className="logo-img-placeholder">
              LP
            </div>
          )}
          <span className="logo-text">{siteTitle}</span>
        </div>

        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#skills" onClick={() => setIsMobileMenuOpen(false)}>Skills</a>
          <a href="#projects" onClick={() => setIsMobileMenuOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
          {isAdmin && (
            <>
              <button 
                onClick={() => {
                  if (onResetDefaults) onResetDefaults();
                  setIsMobileMenuOpen(false);
                }}
                className="reset-defaults-btn"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px dashed var(--accent-color)',
                  padding: '0.4rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Reset Defaults
              </button>
              <button 
                onClick={() => {
                  setIsAdmin(false);
                  setIsMobileMenuOpen(false);
                }}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}

