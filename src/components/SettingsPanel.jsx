import { useState, useEffect } from 'react';

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

export default function SettingsPanel({ settings, onSave }) {
  const [selectedTheme, setSelectedTheme] = useState(settings.theme || 'default');
  const [selectedBackground, setSelectedBackground] = useState(settings.background || 'default');
  const [customBgUrl, setCustomBgUrl] = useState(settings.customBackgroundUrl || '');
  const [layout, setLayout] = useState(settings.layout || defaultLayout);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Synchronize internal state when props load
  useEffect(() => {
    if (settings) {
      setSelectedTheme(settings.theme || 'default');
      setSelectedBackground(settings.background || 'default');
      setCustomBgUrl(settings.customBackgroundUrl || '');
      if (settings.layout && settings.layout.length > 0) {
        setLayout(settings.layout);
      } else {
        setLayout(defaultLayout);
      }
    }
  }, [settings]);

  const themes = [
    { id: 'default', name: 'Space Mint', icon: '🟢', desc: 'Sleek dark space green & cyan glows' },
    { id: 'nature', name: 'Autumn Gold', icon: '🍂', desc: 'Rich amber-gold & organic green accents' },
    { id: 'tech', name: 'Cyber Neon', icon: '💗', desc: 'Vibrant cyberpunk neon pink & blue lights' },
    { id: 'ocean', name: 'Abyss Teal', icon: '🌊', desc: 'Calming deep cyan & marine aquatic hues' },
    { id: 'forest', name: 'Woodland', icon: '🌲', desc: 'Earthy pine-green & lime moss accents' },
    { id: 'galaxy', name: 'Nebula Purple', icon: '🌌', desc: 'Mystical star violet & deep indigo highlights' }
  ];

  const backgrounds = [
    { id: 'default', name: 'Starfield Space', icon: '✨', desc: 'Interactive starry space & multi-colored blobs' },
    { id: 'nature', name: 'Gold-Green Dust', icon: '🌾', desc: 'Harvest amber sparkles & warm nature blobs' },
    { id: 'tech', name: 'Grid Cyber Dust', icon: '👾', desc: 'Cyan-pink pixels & active tech plasma blobs' },
    { id: 'ocean', name: 'Deep Sea Bubble', icon: '🫧', desc: 'Deep aquatic blue sparks & aqua bubble blobs' },
    { id: 'forest', name: 'Forest Fireflies', icon: '💡', desc: 'Emerald drifting fireflies & woodland blobs' },
    { id: 'galaxy', name: 'Cosmic Dust', icon: '🪐', desc: 'Purple-orange cosmic dust & nebula stellar blobs' },
    { id: 'custom', name: 'Custom Image URL', icon: '🖼️', desc: 'Paste a custom image URL (Google Drive supported)' }
  ];

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newLayout = [...layout];
    const draggedItem = newLayout[draggedIndex];
    newLayout.splice(draggedIndex, 1);
    newLayout.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setLayout(newLayout);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleWidthToggle = (index) => {
    const newLayout = [...layout];
    newLayout[index].width = newLayout[index].width === 'full' ? 'half' : 'full';
    setLayout(newLayout);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      theme: selectedTheme,
      background: selectedBackground,
      customBackgroundUrl: customBgUrl,
      layout: layout
    });
  };

  return (
    <div className="glass-panel" style={{ width: '100%', marginBottom: '1.5rem', border: '1px solid rgba(26, 224, 148, 0.3)' }}>
      <h2 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        Portfolio Appearance Settings (Admin Mode)
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div>
          <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1. Select Color Theme
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {themes.map(t => {
              const isSelected = selectedTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className="list-item-hover"
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? '0 0 15px var(--accent-glow)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                    <span>{t.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. Select Background Particles & Blobs
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {backgrounds.map(b => {
              const isSelected = selectedBackground === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBackground(b.id)}
                  className="list-item-hover"
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? '0 0 15px var(--accent-glow)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <span style={{ fontSize: '1.2rem' }}>{b.icon}</span>
                    <span>{b.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {selectedBackground === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Custom Background Image URL (Direct link or Google Drive link)
            </label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://drive.google.com/file/d/... or direct image link"
              value={customBgUrl}
              onChange={e => setCustomBgUrl(e.target.value)}
              required={selectedBackground === 'custom'}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Note: The selected color theme accents and starry particles will still float on top of this background image.
            </span>
          </div>
        )}

        <div>
          <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.75rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            3. Rearrange Section Layout & Widths (Drag to Reorder)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Grab any item using the ☰ handle and drag it up/down to rearrange your portfolio layout. Toggle the width mode to customize layout size.
          </p>
          <div className="drag-item-container">
            {layout.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.4rem',
                  background: draggedIndex === idx ? 'rgba(26, 224, 148, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                  border: draggedIndex === idx ? '1px dashed var(--accent-color)' : '1px solid var(--border-color)',
                  cursor: 'grab',
                  transition: 'background 0.2s, border 0.2s',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--accent-color)', cursor: 'grab', fontSize: '1.1rem' }}>☰</span>
                  <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                    {item.id === 'about' ? 'About Me' : item.id === 'resume' ? 'Resume' : item.id === 'education' ? 'Education' : item.id === 'skills' ? 'Skills' : item.id}
                  </span>
                </div>
                <button
                  type="button"
                  className="admin-edit-btn"
                  style={{
                    marginTop: 0,
                    background: item.width === 'full' ? 'var(--accent-glow)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: item.width === 'full' ? 'var(--accent-color)' : 'var(--border-color)',
                    color: item.width === 'full' ? 'var(--accent-color)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem'
                  }}
                  onClick={() => handleWidthToggle(idx)}
                >
                  {item.width === 'full' ? '↔️ Full Width' : '⬅️➡️ Half Width'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1.25rem', 
          borderRadius: '0.5rem', 
          background: 'rgba(26, 224, 148, 0.05)', 
          border: '1px solid var(--accent-glow)' 
        }}>
          <h5 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📝 Description Formatting Guide
          </h5>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            You can use the following format syntax in any description text area to customize text presentation:
          </p>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <li>Use <code style={{ color: 'var(--accent-color)', background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>==Text to Highlight==</code> to highlight specific sentences, words, or letters with a premium theme-adaptive glow background.</li>
            <li>Use <code style={{ color: 'var(--accent-color)', background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>**Text to Bold**</code> to apply bold text weight.</li>
            <li>Paste links starting with <code style={{ color: 'var(--accent-color)', background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>http://</code> or <code style={{ color: 'var(--accent-color)', background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>https://</code> to automatically make them clickable links.</li>
          </ul>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Save Theme & Appearance
          </button>
        </div>
      </form>
    </div>
  );
}
