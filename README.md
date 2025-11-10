# Tetris Cyber - Security Battle

Juego de Tetris 1v1 con temática de ciberseguridad. Los jugadores controlan equipos Blue Team (defensa) y Red Team (ataque) con habilidades especiales.

## 🚀 Estructura del Proyecto

El proyecto ha sido refactorizado de una arquitectura monolítica a una arquitectura modular:

```
tetrisjs/
├── css/
│   └── style.css           # Estilos del juego (tema cyberpunk)
├── js/
│   ├── constants.js        # Constantes y configuración del juego
│   ├── Piece.js            # Clase que representa una pieza de Tetris
│   ├── Board.js            # Clase que gestiona el tablero de cada jugador
│   ├── Game.js             # Lógica principal del juego y game loop
│   ├── UI.js               # Gestión de la interfaz de usuario
│   └── main.js             # Punto de entrada y inicialización
├── index.html              # HTML principal
└── README.md               # Este archivo
```

## 🎮 Características

### Modos de Juego
- **1 vs 1 Batalla Local**: Dos jugadores en el mismo dispositivo

### Controles

#### Jugador 1 (Blue/Red dependiendo del sorteo)
- **Teclado**: `WASD` (movimiento) + `Shift+Space` (hard drop) + `1234` (habilidades)
- **Gamepad 1**: Joystick/D-pad + X (hard drop) + △▢○R1 (habilidades)

#### Jugador 2 (Red/Blue dependiendo del sorteo)
- **Teclado**: `Flechas` (movimiento) + `Space` (hard drop) + `7890` (habilidades)
- **Gamepad 2**: Joystick/D-pad + X (hard drop) + △▢○R1 (habilidades)

### Sistema de Habilidades

#### Red Team (Ataque)
| Habilidad | Costo | Cooldown | Efecto |
|-----------|-------|----------|--------|
| **DDOS Attack** | 3 CPU | 15s | Caída instantánea de piezas enemigas por 5s |
| **Malware Inject** | 4 CPU | 20s | Convierte next piece enemiga en malware |
| **Spoof Queue** | 2 CPU | 10s | Muestra next piece falsa al enemigo |
| **Ransomware** | 5 CPU | 25s | Bloquea hard drop enemigo |

#### Blue Team (Defensa)
| Habilidad | Costo | Cooldown | Efecto |
|-----------|-------|----------|--------|
| **Firewall** | 3 CPU | 15s | Bloquea siguiente ataque Tetris |
| **Patch Vulnerability** | 4 CPU | 20s | Elimina 2 líneas del fondo |
| **Decrypt** | 2 CPU | 10s | Cancela Spoof o Ransom activo |
| **Honeypot** | 5 CPU | 25s | Convierte siguiente malware en pieza I |

### Sistema de Recursos
- **CPU**: Se genera al completar líneas (1 CPU cada 2 líneas)
- **Tetris Attack**: Completar 4 líneas envía 4 líneas de basura al oponente

## 💻 Tecnologías

- **HTML5**: Estructura
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica del juego
- **Canvas API**: Renderizado gráfico
- **Gamepad API**: Soporte para controles físicos

## 🎯 Cómo Jugar

1. Abre `index.html` en un navegador web moderno
2. Haz clic en "INICIAR JUEGO"
3. Selecciona "1 VS 1 - Batalla Local"
4. Espera el sorteo de equipos
5. El primer jugador elige su equipo (Blue o Red)
6. ¡A jugar!


Este proyecto es de código abierto y está disponible para uso educativo.


