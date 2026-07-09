import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function Education({ isAdmin, isFullWidth, toggleWidth }) {
  const [eduData, setEduData] = useState({
    description: 'Loading education details...',
    isVisible: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState('');
  const [title, setTitle] = useState('Education & Academic Performance');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const docRef = ref(db, 'content/education');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setEduData({
            description: val.description || 'Add your educational milestones and academic performances here.',
            isVisible: val.isVisible !== false
          });
        } else {
          setEduData({
            description: 'Add your educational milestones and academic performances here.',
            isVisible: true
          });
        }

        const titleRef = ref(db, 'content/titles/education');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching education:", err);
      }
    };
    fetchEducation();
  }, []);

  const handleSave = async () => {
    try {
      const updated = {
        ...eduData,
        description: tempText
      };
      await set(ref(db, 'content/education'), updated);
      setEduData(updated);
      setIsEditing(false);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/education'), tempTitle);
      setTitle(tempTitle);
      setIsEditingTitle(false);
    } catch (err) {
      alert("Error saving title: " + err.message);
    }
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const updated = {
        ...eduData,
        isVisible: !eduData.isVisible
      };
      await set(ref(db, 'content/education'), updated);
      setEduData(updated);
    } catch (err) {
      alert("Error toggling visibility: " + err.message);
    }
  };

  // If hidden and user is not admin, do not render
  if (!eduData.isVisible && !isAdmin) {
    return null;
  }

  const borderStyle = !eduData.isVisible && isAdmin ? '1px dashed var(--error-color)' : '1px solid var(--border-color)';
  const opacityStyle = !eduData.isVisible && isAdmin ? 0.65 : 1;

  return (
    <div id="education" style={{ display: 'flex', flexDirection: 'column' }}>
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
          position: 'relative', 
          opacity: opacityStyle, 
          border: borderStyle,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1rem',
          minHeight: '150px'
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
                background: eduData.isVisible ? 'rgba(26, 224, 148, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: eduData.isVisible ? 'var(--accent-color)' : 'var(--error-color)',
                border: `1px solid ${eduData.isVisible ? 'var(--accent-color)' : 'var(--error-color)'}`,
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
              {eduData.isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
              {eduData.isVisible ? '🟢 Public' : '🔴 Hidden'}
            </button>
          </div>
        )}

        {!isEditing ? (
          <>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginRight: isAdmin ? '80px' : '0', lineHeight: '1.6' }}>
              {formatDescription(eduData.description)}
            </p>
            
            {isAdmin && (
              <button 
                className="admin-edit-btn" 
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                onClick={() => { 
                  setTempText(eduData.description); 
                  setIsEditing(true); 
                }}
              >
                Edit Education Details
              </button>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Education & Academic Details:</label>
            <textarea 
              className="input-field" 
              rows="5"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              placeholder="List your degree, major, CGPA/GPA, and achievements..."
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button className="admin-edit-btn" style={{ marginTop: 0 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
