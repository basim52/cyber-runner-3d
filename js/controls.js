/**
 * Input Controls System (Keyboard, Mobile Touch & Swipe Gestures)
 */
class InputManager {
  constructor(player, game) {
    this.player = player;
    this.game = game;

    this.keys = {
      left: false,
      right: false,
      jump: false,
      boost: false
    };

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

  // Mobile Virtual Touch Buttons
  initTouchButtons() {
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnJump = document.getElementById('touch-jump');
    const btnBoost = document.getElementById('touch-boost');

    const addTouchAction = (element, onStart, onEnd) => {
      if (!element) return;
      
      const startHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.add('active');
        onStart();
      };

      const endHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        element.classList.remove('active');
        if (onEnd) onEnd();
      };

      element.addEventListener('touchstart', startHandler, { passive: false });
      element.addEventListener('touchend', endHandler, { passive: false });
      element.addEventListener('mousedown', startHandler);
      element.addEventListener('mouseup', endHandler);
    };

    addTouchAction(btnLeft, () => {
      if (this.game.state === 'PLAYING') {
        this.player.moveLeft();
        this.vibrate(15);
      }
    });

    addTouchAction(btnRight, () => {
      if (this.game.state === 'PLAYING') {
        this.player.moveRight();
        this.vibrate(15);
      }
    });

    addTouchAction(btnJump, () => {
      if (this.game.state === 'PLAYING') {
        this.player.jump();
        this.vibrate(20);
      }
    });

    addTouchAction(btnBoost, 
      () => {
        if (this.game.state === 'PLAYING') {
          this.game.triggerBoost(true);
        }
      },
      () => {
        if (this.game.state === 'PLAYING') {
          this.game.triggerBoost(false);
        }
      }
    );
  }

  // Swipe Gestures for smooth mobile play
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
      const threshold = 35;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal Swipe
        if (deltaX > threshold) {
          this.player.moveRight();
          this.vibrate(15);
        } else if (deltaX < -threshold) {
          this.player.moveLeft();
          this.vibrate(15);
        }
      } else {
        // Vertical Swipe
        if (deltaY < -threshold) {
          this.player.jump();
          this.vibrate(20);
        } else if (deltaY > threshold) {
          // Slide / Quick down
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
