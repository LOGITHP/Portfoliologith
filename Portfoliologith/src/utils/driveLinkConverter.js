export function convertDriveLink(url) {
  if (!url) return url;
  
  // Split by comma to handle multiple images
  const urls = url.split(',').map(u => u.trim()).filter(Boolean);
  
  const converted = urls.map(u => {
    // 1. Check for /file/d/ID format (trailing slash is optional)
    const fileDRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const fileDMatch = u.match(fileDRegex);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w1000`;
    }
    
    // 2. Check for query parameter id=ID (like ?id=... or &id=...)
    const idRegex = /[?&]id=([a-zA-Z0-9_-]+)/;
    const idMatch = u.match(idRegex);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
    
    // If it's not a google drive link or already a direct link, just return it as-is
    return u;
  });
  
  // Re-join with commas
  return converted.join(', ');
}
