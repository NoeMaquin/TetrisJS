// GAME OBJECT
const Game = {
  boards: { blue: null, red: null },
  players: { player1: null, player2: null },
  gameLoop: null,
  dropInterval: CONSTANTS.INITIAL_SPEED,
  lastDropTime: 0,
  isPaused: false,
  gamepads: { player1: null, player2: null },
  gamepadIndices: { player1: null, player2: null },
  buttonStates: { player1: {}, player2: {} },

  init(firstPlayer, selectedTeam) {
    console.log("🎮 Iniciando juego...");

    // Limpiar cualquier juego anterior
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    // Resetear estados
    this.isPaused = false;
    this.lastDropTime = 0;
    this.buttonStates = { player1: {}, player2: {} };

    if (firstPlayer === "Jugador 1") {
      this.players.player1 = selectedTeam;
      this.players.player2 = selectedTeam === "blue" ? "red" : "blue";
    } else {
      this.players.player2 = selectedTeam;
      this.players.player1 = selectedTeam === "blue" ? "red" : "blue";
    }

    this.boards.blue = new Board("blue");
    this.boards.red = new Board("red");

    this.boards.blue.spawnPiece();
    this.boards.red.spawnPiece();

    this.setupAbilities();
    this.setupControls();
    this.setupGamepads();
    this.draw();
    this.start();
  },

  setupGamepads() {
    // Detectar gamepads ya conectados
    const gamepads = navigator.getGamepads();
    let connectedCount = 0;

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        if (connectedCount === 0) {
          this.gamepadIndices.player1 = i;
          console.log(`🎮 Gamepad 1 (Player 1): ${gamepads[i].id}`);
          connectedCount++;
        } else if (connectedCount === 1) {
          this.gamepadIndices.player2 = i;
          console.log(`🎮 Gamepad 2 (Player 2): ${gamepads[i].id}`);
          connectedCount++;
        }
      }
    }

    if (connectedCount === 2) {
      this.showStatus(
        "🎮 2 Controles detectados! Ambos jugadores usan mandos"
      );
    } else if (connectedCount === 1) {
      this.showStatus(
        "🎮 1 Control detectado! Player 1: Teclado, Player 2: Mando"
      );
    }

    // Detectar cuando se conecta un gamepad
    window.addEventListener("gamepadconnected", (e) => {
      console.log(
        "🎮 Gamepad conectado:",
        e.gamepad.id,
        "Index:",
        e.gamepad.index
      );

      if (this.gamepadIndices.player1 === null) {
        this.gamepadIndices.player1 = e.gamepad.index;
        this.showStatus(`🎮 Control Player 1 conectado!`);
      } else if (this.gamepadIndices.player2 === null) {
        this.gamepadIndices.player2 = e.gamepad.index;
        this.showStatus(`🎮 Control Player 2 conectado!`);
      }
    });

    window.addEventListener("gamepaddisconnected", (e) => {
      console.log("🎮 Gamepad desconectado:", e.gamepad.index);

      if (this.gamepadIndices.player1 === e.gamepad.index) {
        this.gamepadIndices.player1 = null;
        this.showStatus("⚠️ Control Player 1 desconectado - Usa teclado");
      } else if (this.gamepadIndices.player2 === e.gamepad.index) {
        this.gamepadIndices.player2 = null;
        this.showStatus("⚠️ Control Player 2 desconectado - Usa teclado");
      }
    });
  },

  pollGamepad(playerNum, board) {
    const gamepadIndex = this.gamepadIndices[`player${playerNum}`];
    if (
      gamepadIndex === null ||
      this.isPaused ||
      !board ||
      board.gameOver
    )
      return;

    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[gamepadIndex];

    if (!gamepad) return;

    const buttonState = this.buttonStates[`player${playerNum}`];
    const DEADZONE = 0.5;

    let actionTaken = false;

    // Joystick izquierdo horizontal
    if (gamepad.axes[0] < -DEADZONE && !buttonState["axisLeft"]) {
      buttonState["axisLeft"] = true;
      board.moveHorizontal(-1);
      actionTaken = true;
      console.log(`Player ${playerNum}: Mover izquierda (axis)`);
    } else if (gamepad.axes[0] > -DEADZONE) {
      buttonState["axisLeft"] = false;
    }

    if (gamepad.axes[0] > DEADZONE && !buttonState["axisRight"]) {
      buttonState["axisRight"] = true;
      board.moveHorizontal(1);
      actionTaken = true;
      console.log(`Player ${playerNum}: Mover derecha (axis)`);
    } else if (gamepad.axes[0] < DEADZONE) {
      buttonState["axisRight"] = false;
    }

    // Joystick izquierdo vertical (abajo)
    if (gamepad.axes[1] > DEADZONE && !buttonState["axisDown"]) {
      buttonState["axisDown"] = true;
      board.moveDown();
      actionTaken = true;
      console.log(`Player ${playerNum}: Mover abajo (axis)`);
    } else if (gamepad.axes[1] < DEADZONE) {
      buttonState["axisDown"] = false;
    }

    // Joystick izquierdo vertical (arriba para rotar)
    if (gamepad.axes[1] < -DEADZONE && !buttonState["axisUp"]) {
      buttonState["axisUp"] = true;
      board.rotate();
      actionTaken = true;
      console.log(`Player ${playerNum}: Rotar (axis)`);
    } else if (gamepad.axes[1] > -DEADZONE) {
      buttonState["axisUp"] = false;
    }

    // D-pad Izquierda (botón 14)
    if (
      gamepad.buttons[14] &&
      gamepad.buttons[14].pressed &&
      !buttonState["dpadLeft"]
    ) {
      buttonState["dpadLeft"] = true;
      board.moveHorizontal(-1);
      actionTaken = true;
      console.log(`Player ${playerNum}: Mover izquierda (D-pad)`);
    } else if (!gamepad.buttons[14] || !gamepad.buttons[14].pressed) {
      buttonState["dpadLeft"] = false;
    }

    // D-pad Derecha (botón 15)
    if (
      gamepad.buttons[15] &&
      gamepad.buttons[15].pressed &&
      !buttonState["dpadRight"]
    ) {
      buttonState["dpadRight"] = true;
      board.moveHorizontal(1);
      actionTaken = true;
      console.log(`Player ${playerNum}: Mover derecha (D-pad)`);
    } else if (!gamepad.buttons[15] || !gamepad.buttons[15].pressed) {
      buttonState["dpadRight"] = false;
    }

    // D-pad Abajo (botón 13)
    if (
      gamepad.buttons[13] &&
      gamepad.buttons[13].pressed &&
      !buttonState["dpadDown"]
    ) {
      buttonState["dpadDown"] = true;
      board.moveDown();
      actionTaken = true;
      console.log(`Player ${playerNum}: Mover abajo (D-pad)`);
    } else if (!gamepad.buttons[13] || !gamepad.buttons[13].pressed) {
      buttonState["dpadDown"] = false;
    }

    // D-pad Arriba (botón 12) - Rotar
    if (
      gamepad.buttons[12] &&
      gamepad.buttons[12].pressed &&
      !buttonState["dpadUp"]
    ) {
      buttonState["dpadUp"] = true;
      board.rotate();
      actionTaken = true;
      console.log(`Player ${playerNum}: Rotar (D-pad)`);
    } else if (!gamepad.buttons[12] || !gamepad.buttons[12].pressed) {
      buttonState["dpadUp"] = false;
    }

    // Botón X (botón 0) - Hard Drop
    if (
      gamepad.buttons[0] &&
      gamepad.buttons[0].pressed &&
      !buttonState["btnX"]
    ) {
      buttonState["btnX"] = true;
      board.hardDrop();
      actionTaken = true;
      console.log(`Player ${playerNum}: Hard Drop`);
    } else if (!gamepad.buttons[0] || !gamepad.buttons[0].pressed) {
      buttonState["btnX"] = false;
    }

    // L1 (botón 4) - Rotar alternativo
    if (
      gamepad.buttons[4] &&
      gamepad.buttons[4].pressed &&
      !buttonState["btnL1"]
    ) {
      buttonState["btnL1"] = true;
      board.rotate();
      actionTaken = true;
      console.log(`Player ${playerNum}: Rotar (L1)`);
    } else if (!gamepad.buttons[4] || !gamepad.buttons[4].pressed) {
      buttonState["btnL1"] = false;
    }

    // HABILIDADES - Determinar equipo del jugador
    const team = board.team;
    const opponent = this.boards[team === "blue" ? "red" : "blue"];

    if (team === "blue") {
      // BLUE TEAM - Habilidades defensivas
      // Triángulo (3) - Firewall (3 CPU)
      if (
        gamepad.buttons[3] &&
        gamepad.buttons[3].pressed &&
        !buttonState["btnTriangle"]
      ) {
        buttonState["btnTriangle"] = true;
        if (board.cpu >= 3) {
          this.activateFirewall(board);
          actionTaken = true;
        } else {
          this.showStatus("BLUE: Necesitas 3 CPU para Firewall");
        }
      } else if (!gamepad.buttons[3] || !gamepad.buttons[3].pressed) {
        buttonState["btnTriangle"] = false;
      }

      // Cuadrado (2) - Patch (4 CPU)
      if (
        gamepad.buttons[2] &&
        gamepad.buttons[2].pressed &&
        !buttonState["btnSquare"]
      ) {
        buttonState["btnSquare"] = true;
        if (board.cpu >= 4) {
          this.activatePatch(board);
          actionTaken = true;
        } else {
          this.showStatus("BLUE: Necesitas 4 CPU para Patch");
        }
      } else if (!gamepad.buttons[2] || !gamepad.buttons[2].pressed) {
        buttonState["btnSquare"] = false;
      }

      // Círculo (1) - Decrypt (2 CPU)
      if (
        gamepad.buttons[1] &&
        gamepad.buttons[1].pressed &&
        !buttonState["btnCircle"]
      ) {
        buttonState["btnCircle"] = true;
        if (board.cpu >= 2) {
          this.activateDecrypt(board);
          actionTaken = true;
        } else {
          this.showStatus("BLUE: Necesitas 2 CPU para Decrypt");
        }
      } else if (!gamepad.buttons[1] || !gamepad.buttons[1].pressed) {
        buttonState["btnCircle"] = false;
      }

      // R1 (5) - Honeypot (5 CPU)
      if (
        gamepad.buttons[5] &&
        gamepad.buttons[5].pressed &&
        !buttonState["btnR1"]
      ) {
        buttonState["btnR1"] = true;
        if (board.cpu >= 5) {
          this.activateHoneypot(board);
          actionTaken = true;
        } else {
          this.showStatus("BLUE: Necesitas 5 CPU para Honeypot");
        }
      } else if (!gamepad.buttons[5] || !gamepad.buttons[5].pressed) {
        buttonState["btnR1"] = false;
      }
    } else {
      // RED TEAM - Habilidades ofensivas
      // Triángulo (3) - DDOS (3 CPU)
      if (
        gamepad.buttons[3] &&
        gamepad.buttons[3].pressed &&
        !buttonState["btnTriangle"]
      ) {
        buttonState["btnTriangle"] = true;
        if (board.cpu >= 3) {
          this.activateDDOS(board, opponent);
          actionTaken = true;
        } else {
          this.showStatus("RED: Necesitas 3 CPU para DDOS");
        }
      } else if (!gamepad.buttons[3] || !gamepad.buttons[3].pressed) {
        buttonState["btnTriangle"] = false;
      }

      // Cuadrado (2) - Malware (4 CPU)
      if (
        gamepad.buttons[2] &&
        gamepad.buttons[2].pressed &&
        !buttonState["btnSquare"]
      ) {
        buttonState["btnSquare"] = true;
        if (board.cpu >= 4) {
          this.activateMalware(board, opponent);
          actionTaken = true;
        } else {
          this.showStatus("RED: Necesitas 4 CPU para Malware");
        }
      } else if (!gamepad.buttons[2] || !gamepad.buttons[2].pressed) {
        buttonState["btnSquare"] = false;
      }

      // Círculo (1) - Spoof (2 CPU)
      if (
        gamepad.buttons[1] &&
        gamepad.buttons[1].pressed &&
        !buttonState["btnCircle"]
      ) {
        buttonState["btnCircle"] = true;
        if (board.cpu >= 2) {
          this.activateSpoof(board, opponent);
          actionTaken = true;
        } else {
          this.showStatus("RED: Necesitas 2 CPU para Spoof");
        }
      } else if (!gamepad.buttons[1] || !gamepad.buttons[1].pressed) {
        buttonState["btnCircle"] = false;
      }

      // R1 (5) - Ransom (5 CPU)
      if (
        gamepad.buttons[5] &&
        gamepad.buttons[5].pressed &&
        !buttonState["btnR1"]
      ) {
        buttonState["btnR1"] = true;
        if (board.cpu >= 5) {
          this.activateRansom(board, opponent);
          actionTaken = true;
        } else {
          this.showStatus("RED: Necesitas 5 CPU para Ransom");
        }
      } else if (!gamepad.buttons[5] || !gamepad.buttons[5].pressed) {
        buttonState["btnR1"] = false;
      }
    }

    // Redibujar si hubo alguna acción
    if (actionTaken) {
      this.draw();
    }
  },

  setupAbilities() {
    // Configurar habilidades Blue Team
    const abilitiesBlue = document.getElementById("abilitiesBlue");
    abilitiesBlue.innerHTML = "";
    ABILITIES.blue.forEach((ability) => {
      const div = document.createElement("div");
      div.className = "ability";
      div.id = `ability-blue-${ability.id}`;
      div.innerHTML = `
                <div class="ability-info">
                    <span class="ability-name">${ability.name}</span>
                    <span class="ability-cost">Costo: ${ability.cost} CPU</span>
                </div>
                <span class="ability-key">${ability.key}</span>
            `;
      abilitiesBlue.appendChild(div);
    });

    // Configurar habilidades Red Team
    const abilitiesRed = document.getElementById("abilitiesRed");
    abilitiesRed.innerHTML = "";
    ABILITIES.red.forEach((ability) => {
      const div = document.createElement("div");
      div.className = "ability";
      div.id = `ability-red-${ability.id}`;
      div.innerHTML = `
                <div class="ability-info">
                    <span class="ability-name">${ability.name}</span>
                    <span class="ability-cost">Costo: ${ability.cost} CPU</span>
                </div>
                <span class="ability-key">${ability.key}</span>
            `;
      abilitiesRed.appendChild(div);
    });
  },

  setupControls() {
    // Remover listeners anteriores si existen
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
    }

    this.keydownHandler = (e) => {
      if (this.isPaused) return;

      const p1Board = this.boards[this.players.player1];
      const p2Board = this.boards[this.players.player2];

      if (!p1Board || !p2Board) return;

      // Player 1 (WASD)
      if (e.key === "a" || e.key === "A") p1Board.moveHorizontal(-1);
      if (e.key === "d" || e.key === "D") p1Board.moveHorizontal(1);
      if (e.key === "s" || e.key === "S") p1Board.moveDown();
      if (e.key === "w" || e.key === "W") p1Board.rotate();
      if (e.key === " " && e.shiftKey) {
        e.preventDefault();
        p1Board.hardDrop();
      }

      // Player 2 (Arrows)
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        p2Board.moveHorizontal(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        p2Board.moveHorizontal(1);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        p2Board.moveDown();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        p2Board.rotate();
      }
      if (e.key === " " && !e.shiftKey) {
        e.preventDefault();
        p2Board.hardDrop();
      }

      // Habilidades
      this.handleAbilityKey(e.key);

      this.draw();

      if (p1Board.gameOver || p2Board.gameOver) {
        this.endGame();
      }
    };

    document.addEventListener("keydown", this.keydownHandler);
  },

  handleAbilityKey(key) {
    // Verificar que los boards existen
    if (!this.boards.blue || !this.boards.red) return;

    const blueBoard = this.boards.blue;
    const redBoard = this.boards.red;

    console.log(
      `Tecla presionada: ${key}, Blue CPU: ${blueBoard.cpu}, Red CPU: ${redBoard.cpu}`
    );

    // Blue Team abilities (1,2,3,4)
    if (key === "1") {
      console.log("Intento activar Firewall");
      if (blueBoard.cpu >= 3) {
        this.activateFirewall(blueBoard);
      } else {
        this.showStatus(
          "BLUE: CPU insuficiente para Firewall (necesita 3)"
        );
      }
    } else if (key === "2") {
      console.log("Intento activar Patch");
      if (blueBoard.cpu >= 4) {
        this.activatePatch(blueBoard);
      } else {
        this.showStatus("BLUE: CPU insuficiente para Patch (necesita 4)");
      }
    } else if (key === "3") {
      console.log("Intento activar Decrypt");
      if (blueBoard.cpu >= 2) {
        this.activateDecrypt(blueBoard);
      } else {
        this.showStatus(
          "BLUE: CPU insuficiente para Decrypt (necesita 2)"
        );
      }
    } else if (key === "4") {
      console.log("Intento activar Honeypot");
      if (blueBoard.cpu >= 5) {
        this.activateHoneypot(blueBoard);
      } else {
        this.showStatus(
          "BLUE: CPU insuficiente para Honeypot (necesita 5)"
        );
      }
    }

    // Red Team abilities (7,8,9,0)
    if (key === "7") {
      console.log("Intento activar DDOS");
      if (redBoard.cpu >= 3) {
        this.activateDDOS(redBoard, blueBoard);
      } else {
        this.showStatus("RED: CPU insuficiente para DDOS (necesita 3)");
      }
    } else if (key === "8") {
      console.log("Intento activar Malware");
      if (redBoard.cpu >= 4) {
        this.activateMalware(redBoard, blueBoard);
      } else {
        this.showStatus(
          "RED: CPU insuficiente para Malware (necesita 4)"
        );
      }
    } else if (key === "9") {
      console.log("Intento activar Spoof");
      if (redBoard.cpu >= 2) {
        this.activateSpoof(redBoard, blueBoard);
      } else {
        this.showStatus("RED: CPU insuficiente para Spoof (necesita 2)");
      }
    } else if (key === "0") {
      console.log("Intento activar Ransom");
      if (redBoard.cpu >= 5) {
        this.activateRansom(redBoard, blueBoard);
      } else {
        this.showStatus("RED: CPU insuficiente para Ransom (necesita 5)");
      }
    }
  },

  // RED TEAM ABILITIES
  activateDDOS(attacker, target) {
    console.log("Activando DDOS...");
    attacker.cpu -= 3;
    target.ddosActive = true;
    target.overlay.textContent = "DDOS ATTACK!";
    target.overlay.classList.add("active");

    this.showStatus("RED TEAM: DDOS Attack activado!");
    this.setAbilityCooldown("red", "ddos", 15000);

    if (target.ddosTimer) clearTimeout(target.ddosTimer);
    target.ddosTimer = setTimeout(() => {
      target.ddosActive = false;
      target.overlay.classList.remove("active");
      console.log("DDOS terminado");
    }, 5000);
  },

  activateMalware(attacker, target) {
    console.log("Activando Malware...");
    attacker.cpu -= 4;

    // Convertir siguiente pieza en malware
    if (target.honeypotActive) {
      target.honeypotActive = false;
      target.nextPiece = new Piece("I");
      this.showStatus(
        "BLUE TEAM: Honeypot convirtió malware en pieza I!"
      );
    } else {
      target.nextPiece = new Piece("MALWARE");
      this.showStatus("RED TEAM: Malware inyectado!");
    }

    this.setAbilityCooldown("red", "malware", 20000);
  },

  activateSpoof(attacker, target) {
    console.log("Activando Spoof...");
    attacker.cpu -= 2;
    target.spoofActive = true;

    this.showStatus("RED TEAM: Queue spoofed!");
    this.setAbilityCooldown("red", "spoof", 10000);

    if (target.spoofTimer) clearTimeout(target.spoofTimer);
    target.spoofTimer = setTimeout(() => {
      target.spoofActive = false;
      console.log("Spoof terminado");
    }, 15000);
  },

  activateRansom(attacker, target) {
    console.log("Activando Ransom...");
    attacker.cpu -= 5;
    target.ransomActive = true;
    target.overlay.textContent = "RANSOMWARE!";
    target.overlay.classList.add("active");

    this.showStatus("RED TEAM: Hold bloqueado hasta limpiar 2 líneas!");
    this.setAbilityCooldown("red", "ransom", 25000);
  },

  // BLUE TEAM ABILITIES
  activateFirewall(board) {
    console.log("Activando Firewall...");
    board.cpu -= 3;
    board.firewallActive = true;
    board.overlay.textContent = "FIREWALL UP";
    board.overlay.classList.add("active");

    this.showStatus("BLUE TEAM: Firewall activado!");
    this.setAbilityCooldown("blue", "firewall", 15000);

    setTimeout(() => {
      if (board.firewallActive) {
        board.firewallActive = false;
        board.overlay.classList.remove("active");
        console.log("Firewall expiró");
      }
    }, 10000);
  },

  activatePatch(board) {
    console.log("Activando Patch...");
    board.cpu -= 4;
    board.removeBottomLines(2);

    this.showStatus(
      "BLUE TEAM: Vulnerabilidad parcheada! 2 líneas eliminadas"
    );
    this.setAbilityCooldown("blue", "patch", 20000);
    this.draw(); // Redibujar inmediatamente
  },

  activateDecrypt(board) {
    console.log("Activando Decrypt...");
    board.cpu -= 2;

    // Cancelar spoof o ransom
    if (board.spoofActive) {
      board.spoofActive = false;
      clearTimeout(board.spoofTimer);
      this.showStatus("BLUE TEAM: Spoof cancelado!");
    } else if (board.ransomActive) {
      board.ransomActive = false;
      board.overlay.classList.remove("active");
      this.showStatus("BLUE TEAM: Ransom descifrado!");
    } else {
      this.showStatus("BLUE TEAM: No hay ataques que cancelar");
    }

    this.setAbilityCooldown("blue", "decrypt", 10000);
  },

  activateHoneypot(board) {
    console.log("Activando Honeypot...");
    board.cpu -= 5;
    board.honeypotActive = true;

    this.showStatus("BLUE TEAM: Honeypot activo!");
    this.setAbilityCooldown("blue", "honeypot", 25000);
  },

  setAbilityCooldown(team, abilityId, duration) {
    const element = document.getElementById(
      `ability-${team}-${abilityId}`
    );
    if (element) {
      element.classList.add("cooling");
      console.log(`Cooldown iniciado para ${team}-${abilityId}`);

      setTimeout(() => {
        element.classList.remove("cooling");
        console.log(`Cooldown terminado para ${team}-${abilityId}`);
      }, duration);
    } else {
      console.warn(
        `No se encontró elemento ability-${team}-${abilityId}`
      );
    }
  },

  showStatus(message) {
    const statusEl = document.getElementById("statusMessage");
    statusEl.textContent = message;
    statusEl.classList.add("show");

    setTimeout(() => {
      statusEl.classList.remove("show");
    }, 2000);
  },

  start() {
    this.lastDropTime = Date.now();
    this.gameLoop = setInterval(() => {
      if (!this.isPaused) {
        const currentTime = Date.now();

        // Polling de ambos gamepads
        const p1Board = this.boards[this.players.player1];
        const p2Board = this.boards[this.players.player2];

        this.pollGamepad(1, p1Board);
        this.pollGamepad(2, p2Board);

        if (currentTime - this.lastDropTime > this.dropInterval) {
          this.boards.blue.moveDown();
          this.boards.red.moveDown();
          this.lastDropTime = currentTime;
          this.draw();

          if (this.boards.blue.gameOver || this.boards.red.gameOver) {
            this.endGame();
          }
        }

        // Update boards
        this.boards.blue.update();
        this.boards.red.update();
        this.draw();
      }
    }, 16);
  },

  draw() {
    this.boards.blue.draw();
    this.boards.red.draw();
  },

  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById("btnPause");
    btn.textContent = this.isPaused ? "REANUDAR" : "PAUSA";
  },

  endGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    // Limpiar todos los timers
    if (this.boards.blue) {
      if (this.boards.blue.ddosTimer)
        clearTimeout(this.boards.blue.ddosTimer);
      if (this.boards.blue.spoofTimer)
        clearTimeout(this.boards.blue.spoofTimer);
    }
    if (this.boards.red) {
      if (this.boards.red.ddosTimer)
        clearTimeout(this.boards.red.ddosTimer);
      if (this.boards.red.spoofTimer)
        clearTimeout(this.boards.red.spoofTimer);
    }

    this.isPaused = true;
    const winner = this.boards.blue.gameOver ? "RED TEAM" : "BLUE TEAM";
    const blueScore = this.boards.blue ? this.boards.blue.score : 0;
    const redScore = this.boards.red ? this.boards.red.score : 0;

    setTimeout(() => {
      alert(
        `🏆 GAME OVER!\n\n${winner} GANA!\n\nBLUE: ${blueScore}\nRED: ${redScore}`
      );
      this.quit();
    }, 100);
  },

  quit() {
    clearInterval(this.gameLoop);

    // Limpiar todos los timers activos
    if (this.boards.blue) {
      if (this.boards.blue.ddosTimer)
        clearTimeout(this.boards.blue.ddosTimer);
      if (this.boards.blue.spoofTimer)
        clearTimeout(this.boards.blue.spoofTimer);
    }
    if (this.boards.red) {
      if (this.boards.red.ddosTimer)
        clearTimeout(this.boards.red.ddosTimer);
      if (this.boards.red.spoofTimer)
        clearTimeout(this.boards.red.spoofTimer);
    }

    // Resetear estados
    this.boards.blue = null;
    this.boards.red = null;
    this.isPaused = false;
    this.lastDropTime = 0;
    this.gameLoop = null;

    UI.showStart();
  },
};
