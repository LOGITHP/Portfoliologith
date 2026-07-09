import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { convertDriveLink } from '../utils/driveLinkConverter';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Hero({ isAdmin }) {
  const [heroData, setHeroData] = useState({
    name: 'Your Name',
    photoUrl: 'https://via.placeholder.com/150',
    logoUrl: '',
    siteTitle: "LOGTIH'S PORTFOLIO",
    slogan: '',
    isVisible: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState(heroData);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const docRef = ref(db, 'content/hero');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setHeroData({
            name: val.name || 'Your Name',
            photoUrl: val.photoUrl || 'https://via.placeholder.com/150',
            logoUrl: val.logoUrl || '',
            siteTitle: val.siteTitle || "LOGTIH'S PORTFOLIO",
            slogan: val.slogan || '',
            isVisible: val.isVisible !== false
          });
        }
      } catch (err) {
        console.error("Error fetching hero:", err);
      }
    };
    fetchHero();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const finalData = {
        ...tempData,
        photoUrl: convertDriveLink(tempData.photoUrl),
        logoUrl: convertDriveLink(tempData.logoUrl),
        isVisible: heroData.isVisible
      };
      await set(ref(db, 'content/hero'), finalData);
      setHeroData(finalData);
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !heroData.isVisible;
      const finalData = {
        ...heroData,
        isVisible: nextVisible
      };
      await set(ref(db, 'content/hero'), finalData);
      setHeroData(finalData);
    } catch (err) {
      alert("Error toggling visibility: " + err.message);
    }
  };

  if (!heroData.isVisible && !isAdmin) return null;

  const borderStyle = !heroData.isVisible && isAdmin ? '1px dashed var(--error-color)' : '1px solid var(--border-color)';
  const opacityStyle = !heroData.isVisible && isAdmin ? 0.65 : 1;

  return (
    <div id="home" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          minHeight: '350px', 
          textAlign: 'center',
          position: 'relative',
          opacity: opacityStyle,
          border: borderStyle
        }}
      >
        {isAdmin && (
          <button 
            onClick={toggleVisibility}
            className="visibility-toggle-btn"
            style={{
              background: heroData.isVisible ? 'rgba(26, 224, 148, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: heroData.isVisible ? 'var(--accent-color)' : 'var(--error-color)',
              border: `1px solid ${heroData.isVisible ? 'var(--accent-color)' : 'var(--error-color)'}`,
              padding: '0.3rem 0.6rem',
              borderRadius: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 10
            }}
          >
            {heroData.isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
            {heroData.isVisible ? '🟢 Public' : '🔴 Hidden'}
          </button>
        )}

        {!isEditing ? (
          <>
            <div style={{ position: 'relative', display: 'inline-block', marginTop: isAdmin ? '1rem' : '0' }}>
              <div style={{ 
                width: '180px', height: '180px', borderRadius: '50%', margin: '0 auto', 
                background: 'var(--border-color)', overflow: 'hidden', border: '4px solid var(--accent-color)',
                boxShadow: '0 0 25px var(--accent-glow)', transition: 'transform 0.4s ease'
              }} className="profile-img-container">
                <img 
                  src={convertDriveLink(heroData.photoUrl)} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginTop: '1.5rem', marginBottom: '0.2rem', background: 'linear-gradient(to right, white, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {heroData.name}
            </h1>
            
            {heroData.slogan && (
              <p style={{ fontSize: '1rem', color: 'var(--accent-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.25rem' }}>
                {heroData.slogan}
              </p>
            )}
            
            {isAdmin && (
              <button className="admin-edit-btn" style={{ marginTop: '1.25rem' }} onClick={() => {
                setTempData(heroData);
                setIsEditing(true);
              }}>
                Edit Hero Details
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleSave} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginTop: isAdmin ? '1.5rem' : '0' }}>
            <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Edit Hero & Navbar</h3>
            
            <label style={{ color: 'var(--text-secondary)' }}>Your Name</label>
            <input type="text" className="input-field" value={tempData.name} onChange={e => setTempData({...tempData, name: e.target.value})} required />
            
            <label style={{ color: 'var(--text-secondary)' }}>Slogan / Subtitle (below Name)</label>
            <input type="text" className="input-field" placeholder="e.g. Creative Developer & IoT Specialist" value={tempData.slogan} onChange={e => setTempData({...tempData, slogan: e.target.value})} />
            
            <label style={{ color: 'var(--text-secondary)' }}>Profile Photo (Paste Google Drive Link)</label>
            <input type="url" className="input-field" value={tempData.photoUrl} onChange={e => setTempData({...tempData, photoUrl: e.target.value})} required />
            
            <label style={{ color: 'var(--text-secondary)' }}>Navbar Site Title</label>
            <input type="text" className="input-field" value={tempData.siteTitle} onChange={e => setTempData({...tempData, siteTitle: e.target.value})} required />
            
            <label style={{ color: 'var(--text-secondary)' }}>Navbar Logo (Paste Google Drive Link)</label>
            <input type="url" className="input-field" value={tempData.logoUrl} onChange={e => setTempData({...tempData, logoUrl: e.target.value})} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" className="admin-edit-btn" style={{ marginTop: 0 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
