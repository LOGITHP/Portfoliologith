import { useEffect, useRef } from 'react';

const StarryBackground = ({ background = 'default' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let stars = [];
    let trailParticles = [];
    let shootingStars = [];
    const numStars = 700; // Increased star density
    
    let mouse = {
      x: width / 2,
      y: height / 2,
      lastX: width / 2,
      lastY: height / 2,
      active: false
    };

    // Configure star and spark colors based on theme/background mode
    let starColors = [];
    let defaultStreakColors = [];
    let getTrailColor = () => '26, 224, 148';

    switch (background) {
      case 'nature':
        starColors = [
          '255, 255, 255', // Bright White
          '245, 158, 11',  // Amber Gold
          '251, 146, 60',  // Warm Orange
          '163, 230, 53',  // Soft Leaf Green
          '253, 224, 71'   // Yellow
        ];
        defaultStreakColors = ['245, 158, 11', '163, 230, 53'];
        getTrailColor = () => {
          const r = Math.random();
          if (r > 0.6) return '245, 158, 11';
          if (r > 0.3) return '163, 230, 53';
          return '255, 255, 255';
        };
        break;
      case 'tech':
        starColors = [
          '255, 255, 255', // Bright White
          '255, 0, 127',   // Neon Pink/Magenta
          '56, 189, 248',  // Electric Cyan
          '168, 85, 247',  // Cyber Purple
          '0, 245, 255'    // Matrix Neon Blue
        ];
        defaultStreakColors = ['255, 0, 127', '56, 189, 248'];
        getTrailColor = () => {
          const r = Math.random();
          if (r > 0.6) return '255, 0, 127';
          if (r > 0.3) return '56, 189, 248';
          return '168, 85, 247';
        };
        break;
      case 'ocean':
        starColors = [
          '255, 255, 255', // Bright White
          '6, 182, 212',   // Aquatic Cyan
          '14, 165, 233',  // Sea Sky Blue
          '3, 105, 161',   // Deep Ocean Blue
          '129, 140, 248'  // Soft Marine Indigo
        ];
        defaultStreakColors = ['6, 182, 212', '14, 165, 233'];
        getTrailColor = () => {
          const r = Math.random();
          if (r > 0.6) return '6, 182, 212';
          if (r > 0.3) return '14, 165, 233';
          return '255, 255, 255';
        };
        break;
      case 'forest':
        starColors = [
          '255, 255, 255', // Bright White
          '16, 185, 129',  // Emerald Green
          '34, 197, 94',   // Forest Green
          '132, 204, 22',  // Moss Lime Green
          '234, 179, 8'    // Sage Amber Gold
        ];
        defaultStreakColors = ['16, 185, 129', '234, 179, 8'];
        getTrailColor = () => {
          const r = Math.random();
          if (r > 0.6) return '16, 185, 129';
          if (r > 0.3) return '234, 179, 8';
          return '132, 204, 22';
        };
        break;
      case 'galaxy':
        starColors = [
          '255, 255, 255', // Bright White
          '168, 85, 247',  // Nebula Violet
          '236, 72, 153',  // Deep Space Pink
          '249, 115, 22',  // Cosmic Orange
          '99, 102, 241'   // Indigo Star
        ];
        defaultStreakColors = ['168, 85, 247', '236, 72, 153'];
        getTrailColor = () => {
          const r = Math.random();
          if (r > 0.6) return '168, 85, 247';
          if (r > 0.3) return '236, 72, 153';
          return '249, 115, 22';
        };
        break;
      case 'custom':
      default:
        starColors = [
          '255, 255, 255', // Bright White
          '26, 224, 148',  // Mint Green
          '56, 189, 248',  // Sky Cyan
          '192, 132, 252',  // Lavender Purple
          '254, 240, 138'  // Pastel Yellow
        ];
        defaultStreakColors = ['26, 224, 148', '56, 189, 248'];
        getTrailColor = () => {
          const r = Math.random();
          if (r > 0.8) return '255, 255, 255';
          if (r > 0.6) return '56, 189, 248';
          if (r > 0.4) return '192, 132, 252';
          return '26, 224, 148';
        };
        break;
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Calculate distance moved
      const dist = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY);
      if (dist > 2) {
        // Emit colorful sparks matching background style
        const count = Math.min(Math.floor(dist / 4), 4);
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.5 + 0.5;
          const color = getTrailColor();
          
          trailParticles.push({
            x: mouse.x,
            y: mouse.y,
            vx: Math.cos(angle) * speed + (mouse.x - mouse.lastX) * 0.15,
            vy: Math.sin(angle) * speed + (mouse.y - mouse.lastY) * 0.15,
            size: Math.random() * 2.5 + 1.2,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.015,
            color: color
          });
        }
      }
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      const colorIndex = Math.floor(Math.random() * starColors.length);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.max(width, height) * 0.8;
      
      stars.push({
        radius: background === 'ocean' ? Math.random() * 3.8 + 1.2 : (background === 'forest' ? Math.random() * 2.2 + 0.8 : Math.random() * 1.8 + 0.3),
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        speed: Math.random() * 0.08 + 0.02,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[colorIndex],
        x: 0,
        y: 0,
        // Galaxy specific properties
        angle: angle,
        distance: distance,
        orbitSpeed: (Math.random() * 0.0006 + 0.0001) * (150 / (distance + 40)) // speed falls off with distance
      });
    }

    // Spawn a shooting star
    const spawnShootingStar = () => {
      const side = Math.random() > 0.5;
      const startX = side ? Math.random() * width * 0.6 : 0;
      const startY = side ? 0 : Math.random() * height * 0.6;
      const speed = Math.random() * 8 + 6;
      const angle = Math.PI / 6 + Math.random() * (Math.PI / 12); // around 30-45 degrees down-right

      const randColor = Math.random();
      let color = defaultStreakColors[0];
      if (randColor > 0.7) color = '255, 255, 255';
      else if (randColor > 0.45 && defaultStreakColors[1]) color = defaultStreakColors[1];

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 80 + 50,
        alpha: 1,
        color: color,
        thickness: Math.random() * 1.5 + 1
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 1. Draw and update stars with custom physics
      stars.forEach(star => {
        let targetX = star.baseX;
        let targetY = star.baseY;

        // Apply physics
        if (background === 'galaxy') {
          star.angle += star.orbitSpeed;
          star.baseX = width / 2 + Math.cos(star.angle) * star.distance;
          star.baseY = height / 2 + Math.sin(star.angle) * star.distance;
          targetX = star.baseX;
          targetY = star.baseY;
        } else if (background === 'nature') {
          // Pollen falling down, swaying
          star.baseY += star.speed * 8 + 0.15;
          star.baseX += Math.sin(star.twinklePhase) * 0.25;
          
          if (star.baseY > height) {
            star.baseY = 0;
            star.baseX = Math.random() * width;
          }
          targetX = star.baseX;
          targetY = star.baseY;
        } else if (background === 'tech') {
          // Pixel digital stream
          star.baseY += star.speed * 28;
          if (star.baseY > height) {
            star.baseY = 0;
            star.baseX = Math.random() * width;
          }
          targetX = star.baseX;
          targetY = star.baseY;
        } else if (background === 'ocean') {
          // Bubbles rising up, swaying
          star.baseY -= star.speed * 7 + 0.1;
          star.baseX += Math.sin(star.twinklePhase) * 0.35;
          
          if (star.baseY < 0) {
            star.baseY = height;
            star.baseX = Math.random() * width;
          }
          targetX = star.baseX;
          targetY = star.baseY;
        } else if (background === 'forest') {
          // Fireflies random walk
          star.baseX += (Math.random() - 0.5) * 0.8;
          star.baseY += (Math.random() - 0.5) * 0.8;
          
          // Boundary wrap
          if (star.baseX > width) star.baseX = 0;
          if (star.baseX < 0) star.baseX = width;
          if (star.baseY > height) star.baseY = 0;
          if (star.baseY < 0) star.baseY = height;
          
          targetX = star.baseX;
          targetY = star.baseY;
        } else {
          // Default starry drift
          star.baseX += star.speed * 0.35;
          star.baseY += star.speed * 0.1;
          
          if (star.baseX > width) star.baseX = 0;
          if (star.baseX < 0) star.baseX = width;
          if (star.baseY > height) star.baseY = 0;
          if (star.baseY < 0) star.baseY = height;
          
          targetX = star.baseX;
          targetY = star.baseY;
        }

        // Apply cursor gravity warp/repel
        let dist = 9999;
        let dx = 0;
        let dy = 0;
        if (mouse.active) {
          dx = mouse.x - targetX;
          dy = mouse.y - targetY;
          dist = Math.hypot(dx, dy);

          if (background === 'galaxy') {
            // Galaxy mini black hole pull
            if (dist < 200) {
              const pullForce = (200 - dist) / 200;
              targetX += (dx / dist) * pullForce * 40;
              targetY += (dy / dist) * pullForce * 40;
            }
          } else if (background === 'nature') {
            // Nature wind push away
            if (dist < 150) {
              const pushForce = (150 - dist) / 150;
              targetX -= (dx / dist) * pushForce * 30;
              targetY -= (dy / dist) * pushForce * 30;
            }
          } else if (background === 'tech') {
            // Tech draw connections (drawn below)
          } else if (background === 'ocean') {
            // Ocean bubble deflect
            if (dist < 160) {
              const pushForce = (160 - dist) / 160;
              targetX -= (dx / dist) * pushForce * 25;
              targetY -= (dy / dist) * pushForce * 25;
            }
          } else if (background === 'forest') {
            // Fireflies avoid cursor slightly
            if (dist < 100) {
              const pushForce = (100 - dist) / 100;
              targetX -= (dx / dist) * pushForce * 15;
              targetY -= (dy / dist) * pushForce * 15;
            }
          } else {
            // Default gravity warp
            if (dist < 180) {
              const pullForce = (180 - dist) / 180;
              targetX += (dx / dist) * pullForce * 15;
              targetY += (dy / dist) * pullForce * 15;
            }
          }
        }

        star.x = targetX;
        star.y = targetY;

        // Draw particle
        star.twinklePhase += star.twinkleSpeed;
        const opacity = Math.sin(star.twinklePhase) * 0.4 + 0.6;

        ctx.beginPath();
        
        if (background === 'tech') {
          // Square pixels for tech
          ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
          ctx.fillRect(star.x - star.radius, star.y - star.radius, star.radius * 2, star.radius * 2);
          
          // Draw connection lines to mouse in tech theme
          if (mouse.active && dist < 120) {
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(star.x, star.y);
            ctx.strokeStyle = `rgba(${star.color}, ${(120 - dist) / 120 * 0.22})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        } else if (background === 'ocean') {
          // Hollow circles representing water bubbles
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${star.color}, ${opacity * 0.85})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          
          // Bubble gloss highlight
          ctx.beginPath();
          ctx.arc(star.x - star.radius * 0.35, star.y - star.radius * 0.35, 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
          ctx.fill();
        } else if (background === 'forest') {
          // Glowing fireflies
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
          
          // Soft shadow glow
          ctx.shadowBlur = star.radius * 4;
          ctx.shadowColor = `rgba(${star.color}, ${opacity * 0.8})`;
          ctx.fill();
          ctx.shadowBlur = 0; // Reset
        } else {
          // Default circle
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.color}, ${opacity})`;
          ctx.fill();
        }
      });

      // 2. Draw and update shooting stars
      if (Math.random() < 0.008 && shootingStars.length < 3) {
        spawnShootingStar();
      }

      shootingStars.forEach((star, idx) => {
        star.x += star.vx;
        star.y += star.vy;
        star.alpha -= 0.015;

        if (star.alpha <= 0 || star.x > width || star.y > height) {
          shootingStars.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.vx * 3, star.y - star.vy * 3);
        ctx.strokeStyle = `rgba(${star.color}, ${star.alpha})`;
        ctx.lineWidth = star.thickness;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${star.color}, ${star.alpha * 0.8})`;
        ctx.stroke();
        
        ctx.shadowBlur = 0; // Reset
      });

      // 3. Draw and update interactive cursor trail particles
      trailParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          trailParticles.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha * 0.6})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [background]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default StarryBackground;
