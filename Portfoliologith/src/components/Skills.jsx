import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function Skills({ isAdmin, isFullWidth, toggleWidth }) {
  const [skillsDescription, setSkillsDescription] = useState('Proficient in modern web development technologies including frontend libraries, backend databases, and cloud deployments.');
  const [isVisible, setIsVisible] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState(skillsDescription);
  const [title, setTitle] = useState('Skill Set');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const docRef = ref(db, 'content/skills');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setSkillsDescription(val.text || val.description || 'Proficient in modern web development technologies including frontend libraries, backend databases, and cloud deployments.');
          setIsVisible(val.isVisible !== false);
        }

        const titleRef = ref(db, 'content/titles/skills');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };
    fetchSkills();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await set(ref(db, 'content/skills'), {
        text: tempDescription,
        isVisible: isVisible
      });
      setSkillsDescription(tempDescription);
      setIsEditing(false);
    } catch (err) {
      alert("Error saving skills description: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/skills'), tempTitle);
      setTitle(tempTitle);
      setIsEditingTitle(false);
    } catch (err) {
      alert("Error saving title: " + err.message);
    }
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !isVisible;
      await set(ref(db, 'content/skills'), {
        text: skillsDescription,
        isVisible: nextVisible
      });
      setIsVisible(nextVisible);
    } catch (err) {
      alert("Error toggling visibility: " + err.message);
    }
  };

  if (!isVisible && !isAdmin) return null;

  const borderStyle = !isVisible && isAdmin ? '1px dashed var(--error-color)' : '1px solid var(--border-color)';
  const opacityStyle = !isVisible && isAdmin ? 0.65 : 1;

  return (
    <div id="skills" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          minHeight: '350px', 
          justifyContent: 'center',
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
            <p style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
              {formatDescription(skillsDescription)}
            </p>
            {isAdmin && (
              <button 
                className="admin-edit-btn" 
                style={{ alignSelf: 'flex-start', marginTop: '1.5rem' }} 
                onClick={() => {
                  setTempDescription(skillsDescription);
                  setIsEditing(true);
                }}
              >
                Edit Skills Description
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', height: '100%' }}>
            <h4 style={{ color: 'var(--accent-color)', fontSize: '0.95rem', textTransform: 'uppercase' }}>Edit Skills Description</h4>
            <textarea 
              className="input-field" 
              style={{ flex: 1, minHeight: '150px' }}
              required
              value={tempDescription} 
              onChange={e => setTempDescription(e.target.value)} 
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}>Save</button>
              <button type="button" className="admin-edit-btn" style={{ marginTop: 0 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
