import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function About({ isAdmin, isFullWidth, toggleWidth }) {
  const [aboutText, setAboutText] = useState('Loading...');
  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState('');
  const [title, setTitle] = useState('About Me');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const docRef = ref(db, 'content/about');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setAboutText(val.text || 'Hello! I am a passionate developer...');
          setIsVisible(val.isVisible !== false);
        } else {
          setAboutText('Hello! I am a passionate developer...');
        }

        const titleRef = ref(db, 'content/titles/about');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching about text:", err);
      }
    };
    fetchAbout();
  }, []);

  const handleSave = async () => {
    try {
      await set(ref(db, 'content/about'), { text: tempText, isVisible });
      setAboutText(tempText);
      setIsEditing(false);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !isVisible;
      await set(ref(db, 'content/about'), { text: aboutText, isVisible: nextVisible });
      setIsVisible(nextVisible);
    } catch (err) {
      alert("Error saving visibility: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/about'), tempTitle);
      setTitle(tempTitle);
      setIsEditingTitle(false);
    } catch (err) {
      alert("Error saving title: " + err.message);
    }
  };

  if (!isVisible && !isAdmin) return null;

  const borderStyle = !isVisible && isAdmin ? '1px dashed var(--error-color)' : '1px solid var(--border-color)';
  const opacityStyle = !isVisible && isAdmin ? 0.65 : 1;

  return (
    <div id="about" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {isEditingTitle ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input 
            className="inline-title-input" 
            value={tempTitle}
            onChange={e => setTempTitle(e.target.value)}
            autoFocus
          />
          <button className="btn-primary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }} onClick={saveTitle}>✓</button>
          <button className="admin-edit-btn" style={{ padding: '0.3rem 0.75rem', marginTop: 0, fontSize: '0.8rem' }} onClick={() => setIsEditingTitle(false)}>✗</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          {isAdmin && (
            <span 
              className="edit-title-btn"
              onClick={() => { setTempTitle(title); setIsEditingTitle(true); }}
              title="Edit Section Title"
            >
              ✏️
            </span>
          )}
        </div>
      )}
      <div 
        className="glass-panel" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          minHeight: '350px',
          position: 'relative',
          opacity: opacityStyle,
          border: borderStyle
        }}
      >
        {isAdmin && (
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWidth(); }}
              className="resize-card-btn"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.3rem 0.6rem',
                borderRadius: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'var(--transition-smooth)'
              }}
              title={isFullWidth ? "Contract to Half Width" : "Expand to Full Width"}
            >
              {isFullWidth ? '➡️⬅️ Collapse' : '⬅️➡️ Expand'}
            </button>
            
            <button 
              onClick={toggleVisibility}
              className="visibility-toggle-btn"
              style={{
                background: isVisible ? 'rgba(26, 224, 148, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isVisible ? 'var(--accent-color)' : 'var(--error-color)',
                border: `1px solid ${isVisible ? 'var(--accent-color)' : 'var(--error-color)'}`,
                padding: '0.3rem 0.6rem',
                borderRadius: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'var(--transition-smooth)'
              }}
            >
              {isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
              {isVisible ? '🟢 Public' : '🔴 Hidden'}
            </button>
          </div>
        )}

        {!isEditing ? (
          <>
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              {formatDescription(aboutText)}
            </p>
            {isAdmin && (
              <button 
                className="admin-edit-btn" 
                style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}
                onClick={() => { setTempText(aboutText); setIsEditing(true); }}
              >
                Edit About Section
              </button>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <textarea 
              className="input-field" 
              style={{ flex: 1, minHeight: '150px' }}
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button className="admin-edit-btn" style={{ marginTop: 0 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
