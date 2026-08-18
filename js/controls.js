/**
 * Input Controls System with Ultra-Responsive Multi-Touch Support & Haptics
 */
class InputManager {
  constructor(player, game) {
    this.player = player;
    this.game = game;

    this.touchStartX = 0;
    this.touchStartY = 0;

    this.initKeyboard();
    this.initTouchButtons();
    this.initSwipeGestures();
  }

  // Keyboard Event Listeners
  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (this.game.state !== 'PLAYING') {
        if (e.code === 'Space' || e.code === 'Enter') {
          if (this.game.state === 'START') this.game.start();
          else if (this.game.state === 'GAMEOVER') this.game.restart();
        }
        return;
      }

      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.player.moveLeft();
          this.vibrate(15);
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.player.moveRight();
          this.vibrate(15);
          break;
        case 'KeyW':
        case 'ArrowUp':
        case 'Space':
          this.player.jump();
          this.vibrate(20);
          break;
        case 'KeyS':
        case 'ArrowDown':
        case 'ShiftLeft':
        case 'ShiftRight':
          this.game.triggerBoost(true);
          break;
        case 'Escape':
        case 'KeyP':
          this.game.togglePause();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.game.triggerBoost(false);
      }
    });
  }

  // Mobile Multi-Touch Buttons (Instant Zero-Latency Response)
  initTouchButtons() {
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnJump = document.getElementById('touch-jump');
    const btnBoost = document.getElementById('touch-boost');

    const bindButton = (element, onStart, onEnd = null) => {
      if (!element) return;

      const handleTouchStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('active');
        onStart();
      };

      const handleTouchEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('active');
        if (onEnd) onEnd();
      };

      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
      element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

      element.addEventListener('mousedown', (e) => {
        element.classList.add('active');
        onStart();
      });

      element.addEventListener('mouseup', (e) => {
        element.classList.remove('active');
        if (onEnd) onEnd();
      });

      element.addEventListener('mouseleave', (e) => {
        element.classList.remove('active');
        if (onEnd) onEnd();
      });
    };

    // ◀ Left Steer
    bindButton(btnLeft, () => {
      if (this.game.state === 'PLAYING') {
        this.player.moveLeft();
        this.vibrate(15);
      }
    });

    // ▶ Right Steer
    bindButton(btnRight, () => {
      if (this.game.state === 'PLAYING') {
        this.player.moveRight();
        this.vibrate(15);
      }
    });

    // ⏫ Jump Action (Supports Double Jump!)
    bindButton(btnJump, () => {
      if (this.game.state === 'PLAYING') {
        this.player.jump();
        this.vibrate(22);
      }
    });

    // ⚡ Boost Action
    bindButton(
      btnBoost,
      () => {
        if (this.game.state === 'PLAYING') {
          this.game.triggerBoost(true);
          this.vibrate(30);
        }
      },
      () => {
        if (this.game.state === 'PLAYING') {
          this.game.triggerBoost(false);
        }
      }
    );
  }

  // Swipe Gestures
  initSwipeGestures() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      if (this.game.state !== 'PLAYING' || e.changedTouches.length === 0) return;

      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;
      const threshold = 30;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
          this.player.moveRight();
          this.vibrate(15);
        } else if (deltaX < -threshold) {
          this.player.moveLeft();
          this.vibrate(15);
        }
      } else {
        if (deltaY < -threshold) {
          this.player.jump();
          this.vibrate(20);
        } else if (deltaY > threshold) {
          this.player.vy = -20;
        }
      }
    }, { passive: true });
  }

  vibrate(ms = 20) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }
}
