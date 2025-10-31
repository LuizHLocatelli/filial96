import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

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

  // Game constants - Memoizados para melhor performance
  const GAME_CONSTANTS = useMemo(() => ({
    GRAVITY: 0.3,
    JUMP_STRENGTH: -6.5,
    BIRD_SIZE: 42,
    PIPE_WIDTH: 75,
    PIPE_GAP: 220,
    PIPE_SPEED: 1.5,
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    GROUND_HEIGHT: 80,
    HITBOX_MARGIN: 8,
    PIPE_SPAWN_INTERVAL: 120,
    MIN_PIPE_HEIGHT: 100,
  }), []);

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
      birdRef.current.velocity = GAME_CONSTANTS.JUMP_STRENGTH;
    } else if (!gameOver) {
      birdRef.current.velocity = GAME_CONSTANTS.JUMP_STRENGTH;
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
  }, [gameStarted, gameOver, GAME_CONSTANTS.JUMP_STRENGTH]);

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
    const { BIRD_SIZE, CANVAS_HEIGHT, GROUND_HEIGHT, PIPE_WIDTH, PIPE_GAP, HITBOX_MARGIN } = GAME_CONSTANTS;

    // Check ground collision
    if (bird.y + BIRD_SIZE >= CANVAS_HEIGHT - GROUND_HEIGHT || bird.y <= 0) {
      return true;
    }

    // Check pipe collision with better hitbox
    for (let i = 0; i < pipes.length; i++) {
      const pipe = pipes[i];
      if (
        bird.x + BIRD_SIZE - HITBOX_MARGIN > pipe.x &&
        bird.x + HITBOX_MARGIN < pipe.x + PIPE_WIDTH &&
        (bird.y + HITBOX_MARGIN < pipe.topHeight || bird.y + BIRD_SIZE - HITBOX_MARGIN > pipe.topHeight + PIPE_GAP)
      ) {
        return true;
      }
    }

    return false;
  }, [GAME_CONSTANTS]);

  // Função de desenho de nuvem otimizada
  const drawCloud = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, width * 0.3, 0, Math.PI * 2);
    ctx.arc(x + width * 0.3, y - width * 0.1, width * 0.35, 0, Math.PI * 2);
    ctx.arc(x + width * 0.6, y, width * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Função de desenho da personagem otimizada
  const drawBird = useCallback((ctx: CanvasRenderingContext2D, bird: Bird) => {
    const { BIRD_SIZE } = GAME_CONSTANTS;

    ctx.save();
    ctx.translate(bird.x + BIRD_SIZE / 2, bird.y + BIRD_SIZE / 2);
    ctx.rotate(bird.rotation * 0.3);

    // Pescoço (para suavizar a transição)
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.ellipse(0, 2, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo (blusa rosa) - desenhado antes da cabeça para ficar atrás
    ctx.fillStyle = '#FF69B4';
    ctx.beginPath();
    ctx.ellipse(0, 10, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Detalhes da blusa (gola)
    ctx.strokeStyle = '#FF1493';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 3, 6, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // Cabelo preto - parte de trás (desenhado antes da cabeça)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, -10, 14, 0, Math.PI);
    ctx.fill();

    // Cabelo comprido dos lados (atrás)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-13, -10);
    ctx.quadraticCurveTo(-15, 0, -12, 10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13, -10);
    ctx.quadraticCurveTo(15, 0, 12, 10);
    ctx.lineTo(10, 10);
    ctx.lineTo(10, -8);
    ctx.closePath();
    ctx.fill();

    // Cabeça (pele clara) - formato oval mais feminino
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.ellipse(0, -10, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E8A598';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Franja (mais delicada)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-11, -16);
    ctx.quadraticCurveTo(-7, -20, -3, -17);
    ctx.quadraticCurveTo(0, -21, 3, -17);
    ctx.quadraticCurveTo(7, -20, 11, -16);
    ctx.quadraticCurveTo(12, -12, 11, -10);
    ctx.lineTo(-11, -10);
    ctx.quadraticCurveTo(-12, -12, -11, -16);
    ctx.closePath();
    ctx.fill();

    // Sobrancelhas delicadas
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Sobrancelha esquerda
    ctx.moveTo(-8, -14);
    ctx.quadraticCurveTo(-5, -15, -2, -14);
    // Sobrancelha direita
    ctx.moveTo(2, -14);
    ctx.quadraticCurveTo(5, -15, 8, -14);
    ctx.stroke();

    // Olhos maiores e expressivos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-4, -10, 3.5, 0, Math.PI * 2);
    ctx.arc(4, -10, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Contorno dos olhos
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Pupilas
    ctx.fillStyle = '#4A2511';
    ctx.beginPath();
    ctx.arc(-3.5, -10, 2, 0, Math.PI * 2);
    ctx.arc(4.5, -10, 2, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos (duplo para mais vida)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-2.5, -11, 1.2, 0, Math.PI * 2);
    ctx.arc(5.5, -11, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-4, -9.5, 0.6, 0, Math.PI * 2);
    ctx.arc(4, -9.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Cílios
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Cílios esquerdo
    ctx.moveTo(-6, -11);
    ctx.lineTo(-7, -12);
    ctx.moveTo(-5, -12);
    ctx.lineTo(-5.5, -13);
    ctx.moveTo(-3, -12);
    ctx.lineTo(-3, -13);
    // Cílios direito
    ctx.moveTo(6, -11);
    ctx.lineTo(7, -12);
    ctx.moveTo(5, -12);
    ctx.lineTo(5.5, -13);
    ctx.moveTo(3, -12);
    ctx.lineTo(3, -13);
    ctx.stroke();

    // Nariz delicado
    ctx.strokeStyle = '#E8A598';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(1, -6);
    ctx.stroke();

    // Boca sorridente (sem parecer barba)
    ctx.strokeStyle = '#FF6B9D';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -5, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Bochecha rosa (blush)
    ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-6, -7, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -7, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Braços
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.ellipse(-11, 12, 3, 9, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, 12, 3, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Contorno dos braços
    ctx.strokeStyle = '#E8A598';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-11, 12, 3, 9, -0.3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(11, 12, 3, 9, 0.3, 0, Math.PI * 2);
    ctx.stroke();

    // Mãos
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.arc(-11, 20, 2.5, 0, Math.PI * 2);
    ctx.arc(11, 20, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pernas (calça jeans)
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.ellipse(-4, 25, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 25, 3.5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Detalhes do jeans (costuras)
    ctx.strokeStyle = '#2E4C8E';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-4, 20);
    ctx.lineTo(-4, 30);
    ctx.moveTo(4, 20);
    ctx.lineTo(4, 30);
    ctx.stroke();

    // Sapatos (tênis rosa)
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.ellipse(-4, 31, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 31, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Detalhes dos sapatos
    ctx.strokeStyle = '#C71585';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-4, 31, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(4, 31, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Cadarço dos tênis
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-5, 30);
    ctx.lineTo(-3, 30);
    ctx.moveTo(3, 30);
    ctx.lineTo(5, 30);
    ctx.stroke();

    ctx.restore();
  }, [GAME_CONSTANTS]);

  // Função de desenho dos canos otimizada com cache de gradiente
  const drawPipe = useCallback((ctx: CanvasRenderingContext2D, pipe: Pipe) => {
    const { PIPE_WIDTH, CANVAS_HEIGHT } = GAME_CONSTANTS;

    // Cria gradiente apenas uma vez por frame
    const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
    pipeGradient.addColorStop(0, '#4CAF50');
    pipeGradient.addColorStop(0.5, '#66BB6A');
    pipeGradient.addColorStop(1, '#4CAF50');

    const capHeight = 30;

    // Cano superior
    ctx.fillStyle = pipeGradient;
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

    // Borda/cap do cano superior
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(pipe.x - 5, pipe.topHeight - capHeight, PIPE_WIDTH + 10, capHeight);
    ctx.strokeRect(pipe.x - 5, pipe.topHeight - capHeight, PIPE_WIDTH + 10, capHeight);

    // Brilho no cano superior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(pipe.x + 5, 0, 15, pipe.topHeight - capHeight);

    // Cano inferior
    ctx.fillStyle = pipeGradient;
    ctx.fillRect(pipe.x, pipe.topHeight + pipe.gap, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - pipe.gap);

    ctx.strokeStyle = '#2E7D32';
    ctx.strokeRect(pipe.x, pipe.topHeight + pipe.gap, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - pipe.gap);

    // Borda/cap do cano inferior
    ctx.fillStyle = '#388E3C';
    ctx.fillRect(pipe.x - 5, pipe.topHeight + pipe.gap, PIPE_WIDTH + 10, capHeight);
    ctx.strokeRect(pipe.x - 5, pipe.topHeight + pipe.gap, PIPE_WIDTH + 10, capHeight);

    // Brilho no cano inferior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(pipe.x + 5, pipe.topHeight + pipe.gap + capHeight, 15, CANVAS_HEIGHT - pipe.topHeight - pipe.gap - capHeight);
  }, [GAME_CONSTANTS]);

  // Função de desenho do chão otimizada
  const drawGround = useCallback((ctx: CanvasRenderingContext2D) => {
    const { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT } = GAME_CONSTANTS;

    // Grama com gradiente
    const grassGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    grassGradient.addColorStop(0, '#7EC850');
    grassGradient.addColorStop(0.5, '#5FA030');
    grassGradient.addColorStop(1, '#4A7C25');

    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);

    // Detalhes da grama (otimizado)
    ctx.strokeStyle = '#4A7C25';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < CANVAS_WIDTH; i += 20) {
      const offset = (groundOffsetRef.current + i) % 20;
      ctx.moveTo(i - offset, CANVAS_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(i - offset + 5, CANVAS_HEIGHT - GROUND_HEIGHT + 10);
      ctx.moveTo(i - offset + 10, CANVAS_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(i - offset + 15, CANVAS_HEIGHT - GROUND_HEIGHT + 8);
    }
    ctx.stroke();

    // Terra
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);

    // Linhas horizontais na terra (otimizado)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const y = CANVAS_HEIGHT - 25 + i * 8;
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();
  }, [GAME_CONSTANTS]);

  // Game loop otimizado
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted || gameOver) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false para melhor performance
    if (!ctx) return;

    const {
      GRAVITY, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT,
      PIPE_GAP, PIPE_SPEED, PIPE_SPAWN_INTERVAL, MIN_PIPE_HEIGHT
    } = GAME_CONSTANTS;

    // Update bird physics
    birdRef.current.velocity += GRAVITY;
    birdRef.current.y += birdRef.current.velocity;
    birdRef.current.rotation = Math.min(Math.max(birdRef.current.velocity * 0.05, -0.5), 0.8);

    // Update ground offset
    groundOffsetRef.current = (groundOffsetRef.current + PIPE_SPEED) % 20;

    // Generate pipes
    if (frameRef.current % PIPE_SPAWN_INTERVAL === 0) {
      const maxHeight = CANVAS_HEIGHT - GROUND_HEIGHT - PIPE_GAP - MIN_PIPE_HEIGHT;
      const topHeight = Math.random() * (maxHeight - MIN_PIPE_HEIGHT) + MIN_PIPE_HEIGHT;
      pipesRef.current.push({
        x: CANVAS_WIDTH,
        topHeight,
        gap: PIPE_GAP,
        passed: false,
      });
    }

    // Update pipes (otimizado com filter direto)
    let scoreIncreased = false;
    pipesRef.current = pipesRef.current.filter((pipe) => {
      pipe.x -= PIPE_SPEED;

      if (!pipe.passed && pipe.x + GAME_CONSTANTS.PIPE_WIDTH < birdRef.current.x) {
        pipe.passed = true;
        scoreIncreased = true;
      }

      return pipe.x + GAME_CONSTANTS.PIPE_WIDTH > 0;
    });

    if (scoreIncreased) {
      setScore((prev) => prev + 1);
    }

    // Update clouds
    for (let i = 0; i < cloudsRef.current.length; i++) {
      const cloud = cloudsRef.current[i];
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CANVAS_WIDTH;
      }
    }

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
    for (let i = 0; i < cloudsRef.current.length; i++) {
      const cloud = cloudsRef.current[i];
      drawCloud(ctx, cloud.x, cloud.y, cloud.width);
    }

    // Draw pipes
    for (let i = 0; i < pipesRef.current.length; i++) {
      drawPipe(ctx, pipesRef.current[i]);
    }

    // Draw ground
    drawGround(ctx);

    // Draw bird
    drawBird(ctx, birdRef.current);

    // Draw score with shadow (otimizado)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    const scoreText = score.toString();
    ctx.strokeText(scoreText, CANVAS_WIDTH / 2, 70);
    ctx.fillText(scoreText, CANVAS_WIDTH / 2, 70);

    ctx.shadowColor = 'transparent';

    frameRef.current++;
  }, [gameStarted, gameOver, score, highScore, checkCollision, drawCloud, drawPipe, drawGround, drawBird, GAME_CONSTANTS]);

  // Animation loop otimizado
  useEffect(() => {
    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  // Draw initial screen (otimizado)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameStarted || gameOver) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT } = GAME_CONSTANTS;

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw clouds
    for (let i = 0; i < cloudsRef.current.length; i++) {
      const cloud = cloudsRef.current[i];
      drawCloud(ctx, cloud.x, cloud.y, cloud.width);
    }

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
  }, [gameStarted, gameOver, highScore, drawCloud, drawGround, drawBird, GAME_CONSTANTS]);

  // Draw game over screen (otimizado)
  useEffect(() => {
    if (!gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { CANVAS_WIDTH, CANVAS_HEIGHT } = GAME_CONSTANTS;

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
  }, [gameOver, score, highScore, GAME_CONSTANTS]);

  // Estilos memoizados
  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    touchAction: 'none' as const,
    userSelect: 'none' as const,
  }), []);

  const titleStyle = useMemo(() => ({
    color: '#fff',
    fontSize: '42px',
    fontWeight: 'bold' as const,
    fontFamily: 'Arial, sans-serif',
    textShadow: '4px 4px 8px rgba(0, 0, 0, 0.5)',
    margin: '0',
  }), []);

  const canvasStyle = useMemo(() => ({
    border: '6px solid #fff',
    borderRadius: '16px',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.6)',
    maxWidth: '100%',
    height: 'auto',
    cursor: 'pointer',
    backgroundColor: '#87CEEB',
  }), []);

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={titleStyle}>Flappy Bruna</h1>
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_CONSTANTS.CANVAS_WIDTH}
        height={GAME_CONSTANTS.CANVAS_HEIGHT}
        style={canvasStyle}
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
