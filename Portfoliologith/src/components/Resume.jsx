import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function Resume({ isAdmin, isFullWidth, toggleWidth }) {
  const [resumeData, setResumeData] = useState({
    description: 'Loading resume details...',
    downloadUrl: '',
    isVisible: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({ description: '', downloadUrl: '' });
  const [title, setTitle] = useState('Resume');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const docRef = ref(db, 'content/resume');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setResumeData({
            description: val.description || 'Download my professional resume to see my experience, education, and credentials.',
            downloadUrl: val.downloadUrl || '',
            isVisible: val.isVisible !== false
          });
        } else {
          setResumeData({
            description: 'Download my professional resume to see my experience, education, and credentials.',
            downloadUrl: '',
            isVisible: true
          });
        }

        const titleRef = ref(db, 'content/titles/resume');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
      }
    };
    fetchResume();
  }, []);

  const handleSave = async () => {
    try {
      const updated = {
        ...resumeData,
        description: tempData.description,
        downloadUrl: tempData.downloadUrl
      };
      await set(ref(db, 'content/resume'), updated);
      setResumeData(updated);
      setIsEditing(false);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/resume'), tempTitle);
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
        ...resumeData,
        isVisible: !resumeData.isVisible
      };
      await set(ref(db, 'content/resume'), updated);
      setResumeData(updated);
    } catch (err) {
      alert("Error toggling visibility: " + err.message);
    }
  };

  const getValidUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  // If hidden and user is not admin, do not render
  if (!resumeData.isVisible && !isAdmin) {
    return null;
  }

  const borderStyle = !resumeData.isVisible && isAdmin ? '1px dashed var(--error-color)' : '1px solid var(--border-color)';
  const opacityStyle = !resumeData.isVisible && isAdmin ? 0.65 : 1;

  return (
    <div id="resume" style={{ display: 'flex', flexDirection: 'column' }}>
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
          minHeight: '200px'
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
                background: resumeData.isVisible ? 'rgba(26, 224, 148, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: resumeData.isVisible ? 'var(--accent-color)' : 'var(--error-color)',
                border: `1px solid ${resumeData.isVisible ? 'var(--accent-color)' : 'var(--error-color)'}`,
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
              {resumeData.isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
              {resumeData.isVisible ? '🟢 Public' : '🔴 Hidden'}
            </button>
          </div>
        )}

        {!isEditing ? (
          <>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginRight: isAdmin ? '80px' : '0', lineHeight: '1.6' }}>
              {formatDescription(resumeData.description)}
            </p>
            
            {resumeData.downloadUrl && (
              <div style={{ marginTop: '0.5rem' }}>
                <a 
                  href={getValidUrl(resumeData.downloadUrl)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary" 
                  style={{ 
                    textDecoration: 'none', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '0.85rem', 
                    padding: '0.6rem 1.2rem' 
                  }}
                >
                  <FaDownload /> Download Resume
                </a>
              </div>
            )}

            {isAdmin && (
              <button 
                className="admin-edit-btn" 
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                onClick={() => { 
                  setTempData({ description: resumeData.description, downloadUrl: resumeData.downloadUrl }); 
                  setIsEditing(true); 
                }}
              >
                Edit Resume Section
              </button>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Resume Description:</label>
            <textarea 
              className="input-field" 
              rows="3"
              value={tempData.description}
              onChange={(e) => setTempData({ ...tempData, description: e.target.value })}
            />
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Download URL (Drive link, etc.):</label>
            <input 
              type="text" 
              className="input-field"
              value={tempData.downloadUrl}
              onChange={(e) => setTempData({ ...tempData, downloadUrl: e.target.value })}
              placeholder="e.g. https://drive.google.com/..."
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
