import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Bird {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
  passed: boolean;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  width: number;
}

const FlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game state refs
  const birdRef = useRef<Bird>({ x: 100, y: 250, velocity: 0, rotation: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const frameRef = useRef<number>(0);
  const animationRef = useRef<number>();
  const groundOffsetRef = useRef<number>(0);

  // Game constants - Ajustados para facilitar MUITO
  const GRAVITY = 0.3; // Reduzido ainda mais
  const JUMP_STRENGTH = -6.5; // Reduzido ainda mais
  const BIRD_SIZE = 42; // Aumentado ainda mais
  const PIPE_WIDTH = 75; // Aumentado ainda mais
  const PIPE_GAP = 220; // Aumentado significativamente
  const PIPE_SPEED = 1.5; // Reduzido significativamente
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const GROUND_HEIGHT = 80;

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyBrunaHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    // Initialize clouds
    cloudsRef.current = [
      { x: 50, y: 80, speed: 0.3, width: 60 },
      { x: 200, y: 120, speed: 0.2, width: 80 },
      { x: 350, y: 60, speed: 0.25, width: 70 },
      { x: 150, y: 160, speed: 0.35, width: 65 },
    ];
  }, []);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (!gameOver) {
      birdRef.current.velocity = JUMP_STRENGTH;
    } else {
      // Restart game
      birdRef.current = { x: 100, y: 250, velocity: 0, rotation: 0 };
      pipesRef.current = [];
      frameRef.current = 0;
      groundOffsetRef.current = 0;
      setScore(0);
      setGameOver(false);
      setGameStarted(false);
    }
  }, [gameStarted, gameOver]);

  // Handle keyboard and touch input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        jump();
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    const handleClick = () => {
      jump();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('click', handleClick);
    };
  }, [jump]);

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Check ground collision
    if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT || bird.y <= 0) {
      return true;
    }

    // Check pipe collision with better hitbox
    for (const pipe of pipes) {
      const hitboxMargin = 8; // Margem de erro aumentada para tornar muito mais fácil
      if (
        bird.x + BIRD_SIZE - hitboxMargin > pipe.x &&
        bird.x + hitboxMargin < pipe.x + PIPE_WIDTH &&
        (bird.y + hitboxMargin < pipe.topHeight || bird.y + BIRD_SIZE - hitboxMargin > pipe.topHeight + PIPE_GAP)
      ) {
        return true;
      }
    }

    return false;
  }, []);

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, width * 0.3, 0, Math.PI * 2);
    ctx.arc(x + width * 0.3, y - width * 0.1, width * 0.35, 0, Math.PI * 2);
    ctx.arc(x + width * 0.6, y, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBird = (ctx: CanvasRenderingContext2D, bird: Bird) => {
    ctx.save();
    ctx.translate(bird.x + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2);
    ctx.rotate(bird.rotation * 0.3); // Rotação mais suave para personagem

    // Cabeça (pele clara)
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.arc(0, -8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E8A598';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cabelo preto - parte de trás
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, -8, 13, 0, Math.PI);
    ctx.fill();

    // Franja
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-12, -12);
    ctx.quadraticCurveTo(-8, -18, -4, -14);
    ctx.quadraticCurveTo(0, -18, 4, -14);
    ctx.quadraticCurveTo(8, -18, 12, -12);
    ctx.lineTo(12, -8);
    ctx.lineTo(-12, -8);
    ctx.closePath();
    ctx.fill();

    // Cabelo comprido dos lados
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.quadraticCurveTo(-14, 0, -10, 8);
    ctx.lineTo(-8, 8);
    ctx.lineTo(-8, -5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, -8);
    ctx.quadraticCurveTo(14, 0, 10, 8);
    ctx.lineTo(8, 8);
    ctx.lineTo(8, -5);
    ctx.closePath();
    ctx.fill();

    // Olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-4, -8, 3, 0, Math.PI * 2);
    ctx.arc(4, -8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-3, -8, 2, 0, Math.PI * 2);
    ctx.arc(5, -8, 2, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-2.5, -9, 1, 0, Math.PI * 2);
    ctx.arc(5.5, -9, 1, 0, Math.PI * 2);
    ctx.fill();

    // Boca
    ctx.strokeStyle = '#C67171';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -4, 3, 0, Math.PI);
    ctx.stroke();

    // Corpo (blusa rosa)
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(0, 8, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Detalhes da blusa
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 5);
    ctx.lineTo(8, 5);
    ctx.stroke();

    // Braços
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    // Braço esquerdo
    ctx.ellipse(-10, 10, 3, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Braço direito
    ctx.beginPath();
    ctx.ellipse(10, 10, 3, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Contorno dos braços
    ctx.strokeStyle = '#E8A598';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-10, 10, 3, 8, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(10, 10, 3, 8, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Pernas/pés
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.ellipse(-4, 22, 3, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 22, 3, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sapatos
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(-4, 28, 4, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 28, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawPipe = (ctx: CanvasRenderingContext2D, pipe: Pipe) => {
    // Gradiente para os canos
    const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
    pipeGradient.addColorStop(0, '#4CAF50');
    pipeGradient.addColorStop(0.5, '#66BB6A');
    pipeGradient.addColorStop(1, '#4CAF50');

    // Cano superior
    ctx.fillStyle = pipeGradient;
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

    // Detalhes do cano superior
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

    // Borda/cap do cano superior
    const capHeight = 30;
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - capHeight, PIPE_WIDTH + 10, capHeight);
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x - 5, pipe.topHeight - capHeight, PIPE_WIDTH + 10, capHeight);

    // Brilho no cano superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(pipe.x + 5, 0, 15, pipe.topHeight - capHeight);

    // Cano inferior
    ctx.fillStyle = pipeGradient;
    ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP);

    // Detalhes do cano inferior
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP);

    // Borda/cap do cano inferior
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, capHeight);
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, capHeight);

    // Brilho no cano inferior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(pipe.x + 5, pipe.topHeight + PIPE_GAP + capHeight, 15, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP - capHeight);
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    // Grama
    const grassGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    grassGradient.addColorStop(0, '#7EC850');
    grassGradient.addColorStop(0.5, '#5FA030');
    grassGradient.addColorStop(1, '#4A7C25');

    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

    // Detalhes da grama (padrão repetitivo)
    ctx.strokeStyle = '#4A7C25';
    ctx.lineWidth = 2;
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      const offset = (groundOffsetRef.current + i) % 20;
      ctx.beginPath();
      ctx.moveTo(i - offset, CANVAS_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(i - offset + 5, CANVAS_HEIGHT - GROUND_HEIGHT + 10);
      ctx.moveTo(i - offset + 10, CANVAS_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(i - offset + 15, CANVAS_HEIGHT - GROUND_HEIGHT + 8);
      ctx.stroke();
    }

    // Terra
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);

    // Linhas horizontais na terra
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 25 + i * 8);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 25 + i * 8);
      ctx.stroke();
    }
  };

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!gameStarted || gameOver) {
      return;
    }

    // Update bird physics
    birdRef.current.velocity += GRAVITY;
    birdRef.current.y += birdRef.current.velocity;

    // Update bird rotation based on velocity
    birdRef.current.rotation = Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.8);

    // Update ground offset for animation
    groundOffsetRef.current = (groundOffsetRef.current + PIPE_SPEED) % 20;

    // Generate pipes - muito mais espaçados
    if (frameRef.current % 120 === 0) { // Aumentado para 120 frames
      const minHeight = 100; // Aumentado ainda mais
      const maxHeight = CANVAS_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 100; // Ajustado
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
      pipesRef.current.push({
        x: CANVAS_WIDTH,
        topHeight,
        gap: PIPE_GAP,
        passed: false,
      });
    }

    // Update pipes
    pipesRef.current = pipesRef.current.filter((pipe) => {
      pipe.x -= PIPE_SPEED;

      // Check if bird passed the pipe
      if (!pipe.passed && pipe.x + PIPE_WIDTH < birdRef.current.x) {
        pipe.passed = true;
        setScore((prev) => prev + 1);
      }

      return pipe.x + PIPE_WIDTH > 0;
    });

    // Update clouds
    cloudsRef.current.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CANVAS_WIDTH;
      }
    });

    // Check collision
    if (checkCollision(birdRef.current, pipesRef.current)) {
      setGameOver(true);
      const currentScore = score;
      if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('flappyBrunaHighScore', currentScore.toString());
      }
      return;
    }

    // Clear canvas with sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds
    cloudsRef.current.forEach((cloud) => {
      drawCloud(ctx, cloud.x, cloud.y, cloud.width);
    });

    // Draw pipes
    pipesRef.current.forEach((pipe) => {
      drawPipe(ctx, pipe);
    });

    // Draw ground
    drawGround(ctx);

    // Draw bird
    drawBird(ctx, birdRef.current);

    // Draw score with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeText(score.toString(), CANVAS_WIDTH / 2, 70);
    ctx.fillText(score.toString(), CANVAS_WIDTH / 2, 70);

    ctx.shadowColor = 'transparent';

    frameRef.current++;
  }, [gameStarted, gameOver, score, highScore, checkCollision]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Draw initial screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!gameStarted && !gameOver) {
      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
      skyGradient.addColorStop(0, '#87CEEB');
      skyGradient.addColorStop(1, '#B0E0E6');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw clouds
      cloudsRef.current.forEach((cloud) => {
        drawCloud(ctx, cloud.x, cloud.y, cloud.width);
      });

      // Draw ground
      drawGround(ctx);

      // Draw bird
      drawBird(ctx, birdRef.current);

      // Draw title with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 6;
      ctx.strokeText('Flappy Bruna', CANVAS_WIDTH / 2, 100);
      ctx.fillText('Flappy Bruna', CANVAS_WIDTH / 2, 100);

      // Draw instructions
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px Arial';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.strokeText('Clique ou pressione', CANVAS_WIDTH / 2, 380);
      ctx.fillText('Clique ou pressione', CANVAS_WIDTH / 2, 380);
      ctx.strokeText('ESPAÇO para começar', CANVAS_WIDTH / 2, 410);
      ctx.fillText('ESPAÇO para começar', CANVAS_WIDTH / 2, 410);

      // Draw high score
      if (highScore > 0) {
        ctx.font = 'bold 28px Arial';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.fillStyle = '#FFD700';
        ctx.strokeText(`🏆 Recorde: ${highScore}`, CANVAS_WIDTH / 2, 460);
        ctx.fillText(`🏆 Recorde: ${highScore}`, CANVAS_WIDTH / 2, 460);
      }

      ctx.shadowColor = 'transparent';
    }
  }, [gameStarted, gameOver, highScore]);

  // Draw game over screen
  useEffect(() => {
    if (gameOver) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Semi-transparent overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Game Over panel
      ctx.fillStyle = '#FFF8DC';
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 5;
      const panelX = 50;
      const panelY = 150;
      const panelWidth = 300;
      const panelHeight = 250;
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

      // Game Over text with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = 4;
      ctx.strokeText('Tu é bem ruim', CANVAS_WIDTH / 2, 220);
      ctx.fillText('Tu é bem ruim', CANVAS_WIDTH / 2, 220);

      // Score panel
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px Arial';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(`Pontuação: ${score}`, CANVAS_WIDTH / 2, 280);
      ctx.fillText(`Pontuação: ${score}`, CANVAS_WIDTH / 2, 280);

      // High score with medal
      const isNewRecord = score >= highScore && score > 0;
      ctx.fillStyle = isNewRecord ? '#FFD700' : '#C0C0C0';
      ctx.strokeText(`🏆 Recorde: ${highScore}`, CANVAS_WIDTH / 2, 325);
      ctx.fillText(`🏆 Recorde: ${highScore}`, CANVAS_WIDTH / 2, 325);

      // New record message
      if (isNewRecord) {
        ctx.fillStyle = '#32CD32';
        ctx.font = 'bold 20px Arial';
        ctx.strokeText('🎉 NOVO RECORDE! 🎉', CANVAS_WIDTH / 2, 355);
        ctx.fillText('🎉 NOVO RECORDE! 🎉', CANVAS_WIDTH / 2, 355);
      }

      // Restart instructions
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Arial';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText('Clique para jogar novamente', CANVAS_WIDTH / 2, 380);
      ctx.fillText('Clique para jogar novamente', CANVAS_WIDTH / 2, 380);

      ctx.shadowColor = 'transparent';
    }
  }, [gameOver, score, highScore]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: '#fff',
            fontSize: '42px',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
            margin: '0',
          }}
        >
          Flappy Bruna
        </h1>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          border: '6px solid #fff',
          borderRadius: '16px',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
          maxWidth: '100%',
          height: 'auto',
          cursor: 'pointer',
          backgroundColor: '#87CEEB',
        }}
      />

      <div
        style={{
          marginTop: '25px',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
        }}
      >
        <div
          style={{
            color: '#333',
            fontSize: '15px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.8',
          }}
        >
          <p style={{ margin: '8px 0', fontWeight: 'bold', fontSize: '16px' }}>
            Controles
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Desktop:</strong> Pressione <kbd style={{ padding: '2px 8px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px' }}>ESPAÇO</kbd> para pular
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Mobile:</strong> Toque na tela para pular
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlappyBird;
