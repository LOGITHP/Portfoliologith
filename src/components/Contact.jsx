import { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase';
import { FaEnvelope, FaPhone, FaWhatsapp, FaLinkedin, FaEye, FaEyeSlash } from 'react-icons/fa';

const getValidUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export default function Contact({ isAdmin }) {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    linkedin: '',
    isVisible: true
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState(contactInfo);
  const [title, setTitle] = useState('Contact Me');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const docRef = ref(db, 'content/contact');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          setContactInfo({
            email: val.email || '',
            phone: val.phone || '',
            whatsapp: val.whatsapp || '',
            linkedin: val.linkedin || '',
            isVisible: val.isVisible !== false
          });
        }

        // Fetch custom title
        const titleRef = ref(db, 'content/titles/contact');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching contact:", err);
      }
    };
    fetchContact();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = { ...tempInfo, isVisible: contactInfo.isVisible };
      await set(ref(db, 'content/contact'), updated);
      setContactInfo(updated);
      setIsEditing(false);
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/contact'), tempTitle);
      setTitle(tempTitle);
      setIsEditingTitle(false);
    } catch (err) {
      alert("Error saving title: " + err.message);
    }
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !contactInfo.isVisible;
      const updated = { ...contactInfo, isVisible: nextVisible };
      await set(ref(db, 'content/contact'), updated);
      setContactInfo(updated);
    } catch (err) {
      alert("Error toggling visibility: " + err.message);
    }
  };

  if (!contactInfo.isVisible && !isAdmin) return null;

  const borderStyle = !contactInfo.isVisible && isAdmin ? '1px dashed var(--error-color)' : '1px solid var(--border-color)';
  const opacityStyle = !contactInfo.isVisible && isAdmin ? 0.65 : 1;

  return (
    <div id="contact" style={{ display: 'flex', flexDirection: 'column' }}>
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
        <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {title}
          {isAdmin && (
            <span 
              className="edit-title-btn"
              onClick={() => { setTempTitle(title); setIsEditingTitle(true); }}
            >
              ✏️
            </span>
          )}
        </h2>
      )}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.25rem', 
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
              background: contactInfo.isVisible ? 'rgba(26, 224, 148, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: contactInfo.isVisible ? 'var(--accent-color)' : 'var(--error-color)',
              border: `1px solid ${contactInfo.isVisible ? 'var(--accent-color)' : 'var(--error-color)'}`,
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
            {contactInfo.isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
            {contactInfo.isVisible ? '🟢 Public' : '🔴 Hidden'}
          </button>
        )}

        {!isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem', textAlign: 'center', marginTop: isAdmin ? '1.5rem' : '0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <FaEnvelope size={20} color="var(--accent-color)" />
              <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</h5>
              {contactInfo.email ? <a href={`mailto:${contactInfo.email}`} style={{ color: 'white', textDecoration: 'none', fontSize: '0.8rem' }}>{contactInfo.email}</a> : <span style={{ fontSize: '0.8rem' }}>-</span>}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <FaPhone size={20} color="var(--accent-color)" />
              <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</h5>
              {contactInfo.phone ? <a href={`tel:${contactInfo.phone}`} style={{ color: 'white', textDecoration: 'none', fontSize: '0.8rem' }}>{contactInfo.phone}</a> : <span style={{ fontSize: '0.8rem' }}>-</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <FaWhatsapp size={20} color="#25D366" />
              <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</h5>
              {contactInfo.whatsapp ? <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '0.8rem' }}>{contactInfo.whatsapp}</a> : <span style={{ fontSize: '0.8rem' }}>-</span>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <FaLinkedin size={20} color="#0077B5" />
              <h5 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LinkedIn</h5>
              {contactInfo.linkedin ? <a href={getValidUrl(contactInfo.linkedin)} target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'none', fontSize: '0.8rem' }}>View Profile</a> : <span style={{ fontSize: '0.8rem' }}>-</span>}
            </div>

            {isAdmin && (
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button className="admin-edit-btn" onClick={() => {
                  setTempInfo(contactInfo);
                  setIsEditing(true);
                }}>Edit Contact Details</button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '450px', margin: '0 auto', marginTop: isAdmin ? '1.5rem' : '0' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Email Address</label>
            <input type="email" className="input-field" value={tempInfo.email} onChange={e => setTempInfo({...tempInfo, email: e.target.value})} />
            
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Phone Number</label>
            <input type="text" className="input-field" value={tempInfo.phone} onChange={e => setTempInfo({...tempInfo, phone: e.target.value})} />
            
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>WhatsApp Number</label>
            <input type="text" className="input-field" value={tempInfo.whatsapp} onChange={e => setTempInfo({...tempInfo, whatsapp: e.target.value})} />
            
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>LinkedIn URL</label>
            <input type="text" className="input-field" value={tempInfo.linkedin} onChange={e => setTempInfo({...tempInfo, linkedin: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Save Contact Info</button>
              <button type="button" className="admin-edit-btn" style={{ marginTop: 0 }} onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
