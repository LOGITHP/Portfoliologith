import { useState, useEffect } from 'react';
import { ref, get, set, push, remove } from 'firebase/database';
import { db } from '../firebase';
import { convertDriveLink } from '../utils/driveLinkConverter';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { formatDescription } from '../utils/textParser';

export default function Projects({ isAdmin, isFullWidth, toggleWidth }) {
  const [projects, setProjects] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProject, setNewProject] = useState({ title: '', link: '', description: '', screenshotUrl: '' });
  const [title, setTitle] = useState('Projects');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  // Lightbox state
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    activeIndex: 0,
    title: '',
    description: '',
    link: ''
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const colRef = ref(db, 'projects');
        const snapshot = await get(colRef);
        if (snapshot.exists()) {
          const data = [];
          snapshot.forEach(child => {
            data.push({ id: child.key, ...child.val() });
          });
          setProjects(data);
        }

        // Fetch visibility
        const visRef = ref(db, 'content/visibility/projects');
        const visSnap = await get(visRef);
        if (visSnap.exists()) {
          setIsVisible(visSnap.val() !== false);
        }

        // Fetch title
        const titleRef = ref(db, 'content/titles/projects');
        const titleSnap = await get(titleRef);
        if (titleSnap.exists()) {
          setTitle(titleSnap.val());
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

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
      const finalProject = {
        ...newProject,
        screenshotUrl: convertDriveLink(newProject.screenshotUrl)
      };
      if (editingProjectId) {
        const itemRef = ref(db, `projects/${editingProjectId}`);
        await set(itemRef, finalProject);
        setProjects(projects.map(p => p.id === editingProjectId ? { id: editingProjectId, ...finalProject } : p));
      } else {
        const colRef = ref(db, 'projects');
        const newRef = push(colRef);
        await set(newRef, finalProject);
        setProjects([...projects, { id: newRef.key, ...finalProject }]);
      }
      setNewProject({ title: '', link: '', description: '', screenshotUrl: '' });
      setEditingProjectId(null);
      setIsAdding(false);
    } catch (err) {
      alert("Error saving project: " + err.message);
    }
  };

  const startEdit = (proj) => {
    setNewProject({
      title: proj.title || '',
      link: proj.link || '',
      description: proj.description || '',
      screenshotUrl: proj.screenshotUrl || ''
    });
    setEditingProjectId(proj.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setNewProject({ title: '', link: '', description: '', screenshotUrl: '' });
    setEditingProjectId(null);
    setIsAdding(false);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await remove(ref(db, `projects/${itemId}`));
      setProjects(projects.filter(p => p.id !== itemId));
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const openLightbox = (url, projTitle, projDesc, projLink) => {
    if (!url) {
      setLightbox({
        isOpen: true,
        images: [],
        activeIndex: 0,
        title: projTitle,
        description: projDesc,
        link: projLink
      });
      return;
    }
    const urls = convertDriveLink(url).split(',').map(u => u.trim()).filter(Boolean);
    setLightbox({
      isOpen: true,
      images: urls,
      activeIndex: 0,
      title: projTitle,
      description: projDesc,
      link: projLink
    });
  };

  const renderScreenshot = (project) => {
    if (!project.screenshotUrl) return null;
    const urls = convertDriveLink(project.screenshotUrl).split(',').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return null;
    return (
      <img src={urls[0]} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="thumbnail-zoom" />
    );
  };

  const getValidUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const toggleVisibility = async (e) => {
    e.stopPropagation();
    try {
      const nextVisible = !isVisible;
      await set(ref(db, 'content/visibility/projects'), nextVisible);
      setIsVisible(nextVisible);
    } catch (err) {
      alert("Error saving visibility: " + err.message);
    }
  };

  const saveTitle = async () => {
    try {
      await set(ref(db, 'content/titles/projects'), tempTitle);
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
    <div id="projects" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          gap: '1rem',
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

        {isAdmin && !isAdding && (
          <button className="admin-edit-btn" style={{ alignSelf: 'flex-start', margin: isAdmin ? '1.5rem 0 0 0' : 0 }} onClick={() => { setIsAdding(true); setEditingProjectId(null); }}>
            + Add New Project
          </button>
        )}

        {isAdding && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', margin: 0 }}>
              {editingProjectId ? 'Edit Project Details' : 'Add New Project'}
            </h4>
            <input 
              type="text" className="input-field" placeholder="Project Name (e.g. Chat App)" required 
              value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
            />
            <input 
              type="url" className="input-field" placeholder="Project Link (e.g. GitHub or Live URL)" required 
              value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})}
            />
            <input 
              type="url" className="input-field" placeholder="Screenshot Google Drive Link (Optional)" 
              value={newProject.screenshotUrl} onChange={e => setNewProject({...newProject, screenshotUrl: e.target.value})}
            />
            <textarea 
              className="input-field" placeholder="Description & Details (Touch/click item card to view this text)" required rows="3"
              value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
            ></textarea>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                {editingProjectId ? 'Update' : 'Save'}
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
            {projects.map(project => (
              <div 
                key={project.id} 
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
                onClick={() => openLightbox(project.screenshotUrl, project.title, project.description, project.link)}
                title="Click/touch to view project details"
              >
                {/* Screenshot Thumbnail container */}
                {project.screenshotUrl && (
                  <div style={{ width: '60px', height: '60px', flexShrink: 0, overflow: 'hidden', borderRadius: '0.35rem', border: '1px solid var(--border-color)' }}>
                    {renderScreenshot(project)}
                  </div>
                )}
                
                {/* Project Title ONLY */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--accent-color)', fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>{project.title}</h4>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => startEdit(project)}
                      style={{ 
                        background: 'var(--accent-color)', color: '#10141b', border: 'none', 
                        borderRadius: '0.4rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
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
            {projects.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No projects found.</p>}
          </div>

          {/* Scroll Down Indication */}
          {projects.length > 3 && (
            <>
              <div className="scroll-fade-overlay"></div>
              <div className="scroll-arrow-indicator">&#9660;</div>
            </>
          )}
        </div>
      </div>

      {/* Project Detail popup Modal */}
      {lightbox.isOpen && (
        <div className="lightbox-overlay" onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(prev => ({ ...prev, isOpen: false }))}>&times;</button>
            
            <div className="lightbox-body">
              {/* Left Side: Screenshot Display */}
              <div className="lightbox-media-container">
                {lightbox.images.length > 0 ? (
                  <>
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
                        alt="Project Screenshot" 
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
                  </>
                ) : (
                  <div style={{ width: '80%', height: '150px', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    No Screenshot Available
                  </div>
                )}
              </div>

              {/* Right Side: Project Details */}
              <div className="lightbox-details-container">
                <h4 style={{ color: 'var(--accent-color)', fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {lightbox.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '1.25rem' }}>
                  {formatDescription(lightbox.description)}
                </p>
                {lightbox.link && (
                  <div style={{ marginTop: 'auto' }}>
                    <a 
                      href={getValidUrl(lightbox.link)} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-primary" 
                      style={{ textDecoration: 'none', display: 'inline-block', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      Visit Live Project &rarr;
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
