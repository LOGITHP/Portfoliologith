import { useState, useEffect } from 'react';
import { ref, get, set, push, remove } from 'firebase/database';
import { db } from '../firebase';
import { convertDriveLink } from '../utils/driveLinkConverter';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function GallerySection({ id, title: propTitle, isAdmin }) {
  const [items, setItems] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', imageUrl: '', description: '' });
  const [title, setTitle] = useState(propTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  // Lightbox state
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    activeIndex: 0,
    title: '',
    description: ''
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const colRef = ref(db, id);
        const snapshot = await get(colRef);
        if (snapshot.exists()) {
          const data = [];
          snapshot.forEach(child => {
            data.push({ id: child.key, ...child.val() });
          });
          setItems(data);
        }

        // Fetch visibility status
        const visRef = ref(db, `content/visibility/${id}`);
        const visSnap = await get(visRef);
        if (visSnap.exists()) {
          setIsVisible(visSnap.val() !== false);
        }

        // Fetch custom title
        const titleRef = ref(db, `content/titles/${id}`);
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        } else {
          setTitle(propTitle);
        }
      } catch (err) {
        console.error(`Error fetching ${id}:`, err);
      }
    };
    fetchItems();
  }, [id, propTitle]);

  // Image preloading to eliminate lag
  useEffect(() => {
    if (lightbox.isOpen && lightbox.images && lightbox.images.length > 0) {
      lightbox.images.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [lightbox.isOpen, lightbox.images]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalItem = {
        ...newItem,
        imageUrl: convertDriveLink(newItem.imageUrl)
      };
      if (editingItemId) {
        const itemRef = ref(db, `${id}/${editingItemId}`);
        await set(itemRef, finalItem);
        setItems(items.map(item => item.id === editingItemId ? { id: editingItemId, ...finalItem } : item));
      } else {
        const colRef = ref(db, id);
        const newRef = push(colRef);
        await set(newRef, finalItem);
        setItems([...items, { id: newRef.key, ...finalItem }]);
      }
      setNewItem({ title: '', imageUrl: '', description: '' });
      setEditingItemId(null);
      setIsAdding(false);
    } catch (err) {
      alert("Error saving item: " + err.message);
    }
  };

  const startEdit = (item) => {
    setNewItem({
      title: item.title || '',
      imageUrl: item.imageUrl || '',
      description: item.description || ''
    });
    setEditingItemId(item.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setNewItem({ title: '', imageUrl: '', description: '' });
    setEditingItemId(null);
    setIsAdding(false);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      await remove(ref(db, `${id}/${itemId}`));
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const openLightbox = (imageUrlStr, itemTitle, itemDesc) => {
    if (!imageUrlStr) return;
    const urls = convertDriveLink(imageUrlStr).split(',').map(u => u.trim()).filter(Boolean);
    setLightbox({
      isOpen: true,
      images: urls,
      activeIndex: 0,
      title: itemTitle,
      description: itemDesc
    });
  };

  const renderThumbnail = (imageUrlStr) => {
    if (!imageUrlStr) return null;
    const urls = convertDriveLink(imageUrlStr).split(',').map(u => u.trim()).filter(Boolean);
    return (
      <img 
        src={urls[0]} 
        alt="Thumbnail" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        className="thumbnail-zoom" 
      />
    );
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !isVisible;
      await set(ref(db, `content/visibility/${id}`), nextVisible);
      setIsVisible(nextVisible);
    } catch (err) {
      alert("Error saving visibility: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, `content/titles/${id}`), tempTitle);
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
    <div id={id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '350px', 
          gap: '1rem',
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
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 10
            }}
          >
            {isVisible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
            {isVisible ? '🟢 Public' : '🔴 Hidden'}
          </button>
        )}

        {isAdmin && !isAdding && (
          <button className="admin-edit-btn" style={{ alignSelf: 'flex-start', margin: isAdmin ? '1.5rem 0 0 0' : 0 }} onClick={() => { setIsAdding(true); setEditingItemId(null); }}>
            + Add New {title}
          </button>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', margin: 0 }}>
              {editingItemId ? `Edit ${title} Details` : `Add New ${title}`}
            </h4>
            <input 
              type="text" className="input-field" placeholder="Item Name (e.g. Self-powered Sprinkler)" required 
              value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})}
            />
            <textarea 
              className="input-field" placeholder="Description & Details (Touch/click item card to view this text)" required rows="3"
              value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})}
            ></textarea>
            <textarea 
              className="input-field" placeholder="Drive Image URLs (Separate with commas for multiple photos)" required rows="2"
              value={newItem.imageUrl} onChange={e => setNewItem({...newItem, imageUrl: e.target.value})}
            ></textarea>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {editingItemId ? 'Update' : 'Save'}
              </button>
              <button type="button" className="admin-edit-btn" style={{ marginTop: 0 }} onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        )}

        {/* Scrollable Container Wrapper */}
        <div className="scroll-wrapper">
          <div className="widget-scroll-container" style={{ 
            flex: 1, 
            overflowY: 'auto', 
            maxHeight: '380px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            paddingRight: '4px',
            paddingBottom: '30px'
          }}>
            {items.map(item => (
              <div 
                key={item.id} 
                className="list-item-hover" 
                style={{ 
                  borderRadius: '0.5rem', 
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0,0,0,0.1)'
                }}
                onClick={() => openLightbox(item.imageUrl, item.title, item.description)}
                title="Click/touch to view details and certificates"
              >
                {/* Thumbnail aligned top-left */}
                {item.imageUrl && (
                  <div style={{ width: '60px', height: '60px', flexShrink: 0, overflow: 'hidden', borderRadius: '0.35rem', border: '1px solid var(--border-color)' }}>
                    {renderThumbnail(item.imageUrl)}
                  </div>
                )}
                
                {/* Title ONLY */}
                <div style={{ flex: 1 }}>
                  {item.title && <h4 style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{item.title}</h4>}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => startEdit(item)}
                      style={{ 
                        background: 'var(--accent-color)', color: '#10141b', border: 'none', 
                        borderRadius: '0.4rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ 
                        background: 'var(--error-color)', color: 'white', border: 'none', 
                        borderRadius: '0.4rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' 
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No items found.</p>}
          </div>

          {/* Scroll Down Indication */}
          {items.length > 3 && (
            <>
              <div className="scroll-fade-overlay"></div>
              <div className="scroll-arrow-indicator">&#9660;</div>
            </>
          )}
        </div>
      </div>

      {/* Item Detail popup Modal */}
      {lightbox.isOpen && (
        <div className="lightbox-overlay" onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}>&times;</button>
            
            <div className="lightbox-body">
              {/* Left Side: Image Display & Nav */}
              <div className="lightbox-media-container">
                {/* Prev Image */}
                {lightbox.images.length > 1 && (
                  <button 
                    className="lightbox-nav-btn lightbox-prev" 
                    onClick={() => setLightbox(prev => ({
                      ...prev,
                      activeIndex: (prev.activeIndex - 1 + prev.images.length) % prev.images.length
                    }))}
                  >
                    &#8249;
                  </button>
                )}

                {/* Main Image Slide */}
                <a 
                  href={lightbox.images[lightbox.activeIndex]} 
                  target="_blank" 
                  rel="noreferrer" 
                  title="Click to zoom / view full image"
                  style={{ display: 'flex', width: '100%', height: '100%', maxHeight: '420px', justifyContent: 'center', alignItems: 'center' }}
                >
                  <img 
                    src={lightbox.images[lightbox.activeIndex]} 
                    alt={`Preview ${lightbox.activeIndex}`} 
                    className="lightbox-img-sideways zoomable-image" 
                  />
                </a>

                {/* Next Image */}
                {lightbox.images.length > 1 && (
                  <button 
                    className="lightbox-nav-btn lightbox-next" 
                    onClick={() => setLightbox(prev => ({
                      ...prev,
                      activeIndex: (prev.activeIndex + 1) % prev.images.length
                    }))}
                  >
                    &#8250;
                  </button>
                )}

                {/* Image Count Indicator */}
                {lightbox.images.length > 1 && (
                  <div className="lightbox-image-counter" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginTop: '0.8rem', fontWeight: 'bold', zIndex: 10 }}>
                    {lightbox.activeIndex + 1} of {lightbox.images.length}
                  </div>
                )}
              </div>

              {/* Right Side: Detail Content (Title & Description) */}
              <div className="lightbox-details-container">
                <h4 style={{ color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {lightbox.title}
                </h4>
                 {lightbox.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {formatDescription(lightbox.description)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
