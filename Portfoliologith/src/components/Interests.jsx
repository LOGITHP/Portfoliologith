import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function Interests({ isAdmin, isFullWidth, toggleWidth }) {
  const [fields, setFields] = useState([]);
  const [currentLearning, setCurrentLearning] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempFields, setTempFields] = useState('');
  const [tempLearning, setTempLearning] = useState('');
  const [title, setTitle] = useState('Interests & Learning');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const docRef = ref(db, 'content/interests');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setFields(data.interestedFields || []);
          setCurrentLearning(data.currentLearning || '');
          setIsVisible(data.isVisible !== false);
        }

        const titleRef = ref(db, 'content/titles/interests');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching interests:", err);
      }
    };
    fetchInterests();
  }, []);

  const handleSave = async () => {
    try {
      const fieldArray = tempFields.split(',').map(s => s.trim()).filter(Boolean);
      const updated = { 
        interestedFields: fieldArray,
        currentLearning: tempLearning,
        isVisible: isVisible
      };
      await set(ref(db, 'content/interests'), updated);
      
      setFields(fieldArray);
      setCurrentLearning(tempLearning);
      setIsEditing(false);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !isVisible;
      await set(ref(db, 'content/interests'), { 
        interestedFields: fields,
        currentLearning: currentLearning,
        isVisible: nextVisible
      });
      setIsVisible(nextVisible);
    } catch (err) {
      alert("Error saving visibility: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/interests'), tempTitle);
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
    <div id="interests" style={{ display: 'flex', flexDirection: 'column' }}>
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
          <div>
            <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Interested Fields</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {fields.map((field, i) => (
                <span key={i} style={{ 
                  background: 'rgba(96, 177, 53, 0.1)', padding: '0.4rem 0.8rem', 
                  borderRadius: '0.5rem', border: '1px solid rgba(96, 177, 53, 0.3)',
                  fontSize: '0.9rem', color: 'var(--text-primary)'
                }}>
                  {field}
                </span>
              ))}
              {fields.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No fields added yet.</p>}
            </div>

            <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Currently Learning</h4>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {formatDescription(currentLearning) || 'Information goes here'}
              </p>
            </div>

            {isAdmin && <button className="admin-edit-btn" style={{ marginTop: '1.25rem' }} onClick={() => {
              setTempFields(fields.join(', '));
              setTempLearning(currentLearning);
              setIsEditing(true);
            }}>Edit Interests</button>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>Interested Fields (comma separated)</label>
              <input type="text" className="input-field" value={tempFields} onChange={(e) => setTempFields(e.target.value)} />
            </div>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '0.4rem' }}>Currently Learning</label>
              <textarea className="input-field" rows="3" value={tempLearning} onChange={(e) => setTempLearning(e.target.value)} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button className="admin-edit-btn" style={{ marginTop: 0 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
