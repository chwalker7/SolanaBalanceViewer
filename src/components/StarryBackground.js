import React, { useRef, useEffect } from 'react';

const StarryBackground = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const starCount = 10000;
      const stars = [];
      for (let i = 0; i < starCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        stars.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.sin(phi) * Math.sin(theta),
          z: Math.cos(phi),
          size: Math.random() * 1.5 + 0.5,
          brightness: Math.random() * 0.5 + 0.5,
        });
      }
      starsRef.current = stars;
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scale = Math.min(centerX, centerY);

      starsRef.current.forEach((star) => {
        // Apply rotation
        let x = star.x;
        let y = star.y;
        let z = star.z;

        // Rotate around Y-axis (horizontal movement)
        const cosY = Math.cos(rotationRef.current.x);
        const sinY = Math.sin(rotationRef.current.x);
        const x2 = x * cosY - z * sinY;
        const z2 = z * cosY + x * sinY;

        // Rotate around X-axis (vertical movement)
        const cosX = Math.cos(rotationRef.current.y);
        const sinX = Math.sin(rotationRef.current.y);
        const y2 = y * cosX - z2 * sinX;
        z = z2 * cosX + y * sinX;
        x = x2;
        y = y2;

        // Project onto 2D plane
        const projectedX = centerX + x * scale;
        const projectedY = centerY + y * scale;

        // Calculate distance from center (0, 0, 1) to determine size and brightness
        const distance = Math.sqrt((x - 0) ** 2 + (y - 0) ** 2 + (z - 1) ** 2);
        const size = Math.max(0.1, (star.size * (2 - distance) / 2));
        const brightness = star.brightness * ((2 - distance) / 2);

        // Draw star
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const updateRotation = () => {
      const targetX = (mouseRef.current.x / canvas.width - 0.5) * Math.PI * 2;
      const targetY = (mouseRef.current.y / canvas.height - 0.5) * Math.PI;
      rotationRef.current.x += (targetX - rotationRef.current.x) * 0.05;
      rotationRef.current.y += (targetY - rotationRef.current.y) * 0.05;
      
      // Limit vertical rotation to prevent flipping
      rotationRef.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationRef.current.y));
    };

    const animate = () => {
      updateRotation();
      drawStars();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    resizeCanvas();
    createStars();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, #1b2735 0%, #090a0f 100%)',
        zIndex: -1,
      }}
    />
  );
};

export default StarryBackground;
