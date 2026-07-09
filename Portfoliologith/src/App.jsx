import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from './firebase';
import { convertDriveLink } from './utils/driveLinkConverter';
import Navbar from './components/Navbar';
import StarryBackground from './components/StarryBackground';
import Hero from './components/Hero';
import AdminLogin from './components/AdminLogin';
import About from './components/About';
import Skills from './components/Skills';
import GallerySection from './components/GallerySection';
import Projects from './components/Projects';
import Interests from './components/Interests';
import Contact from './components/Contact';
import Resume from './components/Resume';
import SettingsPanel from './components/SettingsPanel';
import Education from './components/Education';
import './index.css';

const defaultLayout = [
  { id: 'about', title: 'About Me', width: 'half' },
  { id: 'resume', title: 'Resume', width: 'half' },
  { id: 'education', title: 'Education & Academic Performance', width: 'half' },
  { id: 'skills', title: 'Skill Set', width: 'half' },
  { id: 'achievements', title: 'Achievements', width: 'half' },
  { id: 'patents', title: 'Patents', width: 'half' },
  { id: 'projects', title: 'Projects', width: 'half' },
  { id: 'interests', title: 'Interests & Learning', width: 'full' },
  { id: 'participations', title: 'Participations & Details', width: 'full' },
  { id: 'contact', title: 'Contact Me', width: 'full' }
];

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'default',
    background: 'default',
    customBackgroundUrl: '',
    layout: []
  });

  useEffect(() => {
    setIsAdmin(false);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = ref(db, 'content/settings');
        const snapshot = await get(docRef);
        if (snapshot.exists()) {
          const val = snapshot.val();
          const loaded = {
            theme: val.theme || 'default',
            background: val.background || 'default',
            customBackgroundUrl: val.customBackgroundUrl || '',
            layout: val.layout || []
          };
          setSettings(loaded);
          document.body.setAttribute('data-theme', loaded.theme);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleAdminTrigger = () => {
    setShowAdminLogin(true);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      const convertedUrl = convertDriveLink(newSettings.customBackgroundUrl);
      const dataToSave = {
        ...newSettings,
        customBackgroundUrl: convertedUrl
      };
      await set(ref(db, 'content/settings'), dataToSave);
      setSettings(dataToSave);
      document.body.setAttribute('data-theme', dataToSave.theme);
    } catch (err) {
      alert("Error saving settings: " + err.message);
    }
  };

  const [draggedCardIndex, setDraggedCardIndex] = useState(null);

  const handleCardDragStart = (e, index) => {
    if (!isAdmin) return;
    setDraggedCardIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragOver = (e, index) => {
    e.preventDefault();
    if (!isAdmin || draggedCardIndex === null || draggedCardIndex === index) return;
    
    const newLayout = [...layoutOrder];
    const draggedItem = newLayout[draggedCardIndex];
    newLayout.splice(draggedCardIndex, 1);
    newLayout.splice(index, 0, draggedItem);
    
    setDraggedCardIndex(index);
    setSettings(prev => ({
      ...prev,
      layout: newLayout
    }));
  };

  const handleCardDragEnd = async () => {
    if (!isAdmin) return;
    setDraggedCardIndex(null);
    try {
      await set(ref(db, 'content/settings/layout'), layoutOrder);
    } catch (err) {
      console.error("Error saving layout after drag:", err);
    }
  };

  const toggleCardWidth = async (id) => {
    const newLayout = layoutOrder.map(item => {
      if (item.id === id) {
        return { ...item, width: item.width === 'full' ? 'half' : 'full' };
      }
      return item;
    });
    setSettings(prev => ({ ...prev, layout: newLayout }));
    try {
      await set(ref(db, 'content/settings/layout'), newLayout);
    } catch (err) {
      console.error("Error toggling card width:", err);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm("Are you sure you want to reset all themes, backgrounds, and layouts to default settings?")) {
      const defaults = {
        theme: 'default',
        background: 'default',
        customBackgroundUrl: '',
        layout: defaultLayout
      };
      try {
        await set(ref(db, 'content/settings'), defaults);
        setSettings(defaults);
        document.body.setAttribute('data-theme', 'default');
        alert("Settings successfully reset to defaults!");
      } catch (err) {
        alert("Error resetting defaults: " + err.message);
      }
    }
  };

  const layoutOrder = settings.layout && settings.layout.length > 0 ? settings.layout : defaultLayout;

  const layoutComponents = {
    about: <About isAdmin={isAdmin} />,
    resume: <Resume isAdmin={isAdmin} />,
    education: <Education isAdmin={isAdmin} />,
    skills: <Skills isAdmin={isAdmin} />,
    achievements: <GallerySection id="achievements" title="Achievements" isAdmin={isAdmin} />,
    patents: <GallerySection id="patents" title="Patents" isAdmin={isAdmin} />,
    projects: <Projects isAdmin={isAdmin} />,
    interests: <Interests isAdmin={isAdmin} />,
    participations: <GallerySection id="participations" title="Participations & Details" isAdmin={isAdmin} />,
    contact: <Contact isAdmin={isAdmin} />
  };

  return (
    <div className="app-container">
      {/* Custom Background Image Overlay if custom background is selected */}
      {settings.background === 'custom' && settings.customBackgroundUrl && (
        <div 
          className="custom-bg-overlay"
          style={{
            backgroundImage: `url(${convertDriveLink(settings.customBackgroundUrl)})`
          }}
        />
      )}

      {/* Liquid Glass Background Blobs */}
      <div className="liquid-blob-container" data-background={settings.background}>
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
        <div className="liquid-blob blob-4"></div>
      </div>
      
      <StarryBackground background={settings.background} />
      <Navbar onAdminTrigger={handleAdminTrigger} isAdmin={isAdmin} setIsAdmin={setIsAdmin} onResetDefaults={handleResetDefaults} />
      
      {showAdminLogin && (
        <AdminLogin 
          onSuccess={handleLoginSuccess} 
          onClose={() => setShowAdminLogin(false)} 
        />
      )}

      <main className="container" style={{ marginTop: '7.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
        
        {isAdmin && (
          <SettingsPanel 
            settings={settings}
            onSave={handleSaveSettings}
          />
        )}

        <div className="dashboard-grid" style={{ alignItems: 'start' }}>
          {/* Hero section is pinned at order -1 to lead the layout on top */}
          <div className="grid-item-half" style={{ order: -1 }}>
            <Hero isAdmin={isAdmin} />
          </div>

          {layoutOrder.map((item, idx) => {
            const comp = layoutComponents[item.id];
            if (!comp) return null;
            const isFull = item.width === 'full';
            
            // Dynamically clone and inject props
            const compWithProps = React.cloneElement(comp, {
              isFullWidth: isFull,
              toggleWidth: () => toggleCardWidth(item.id)
            });

            return (
              <div 
                key={item.id} 
                className={isFull ? 'grid-item-full' : 'grid-item-half'}
                style={{ 
                  order: idx,
                  opacity: draggedCardIndex === idx ? 0.45 : 1,
                  cursor: isAdmin ? 'grab' : 'default',
                  transition: 'opacity 0.2s, transform 0.2s'
                }}
                draggable={isAdmin}
                onDragStart={(e) => handleCardDragStart(e, idx)}
                onDragOver={(e) => handleCardDragOver(e, idx)}
                onDragEnd={handleCardDragEnd}
              >
                {compWithProps}
              </div>
            );
          })}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid var(--border-color)', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p>&copy; {new Date().getFullYear()} - LOGITH P</p>
      </footer>
    </div>
  );
}

export default App;
