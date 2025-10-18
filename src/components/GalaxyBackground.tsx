'use client';

import { useEffect, useRef } from 'react';

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Create floating particles
    const createStars = () => {
      const starCount = 20;
      const stars = [];

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.opacity = `${Math.random() * 0.7 + 0.3}`;
        stars.push(star);
        container.appendChild(star);
      }

      return stars;
    };

    const stars = createStars();

    return () => {
      stars.forEach(star => star.remove());
    };
  }, []);

  return (
    <div 
      ref={canvasRef} 
      className="stars"
      aria-hidden="true"
    />
  );
}

