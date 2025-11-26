# 🐍 Snake Game - Insane Edition

A Snake game with dual difficulty modes, power-ups, and dynamic obstacles.

## 🎮 Game Features

### Two Difficulty Modes

**Easy Mode (40x40 Grid)**
- 3 hearts of health
- Progressive speed increases as you score
- Up to 5 obstacles spawn and despawn
- Standard WASD/Arrow key controls
- Health pickups appear after taking damage
- Ghost power-up

**Insane Mode (20x20 Grid)**
- 1 heart only - one hit and you're done
- **REVERSED CONTROLS** 
- Obstacles spawn more frequently and permanently
- Insanely fast speed scaling
- Maximum challenge

### Gameplay Mechanics

- **Health System**: Take damage from obstacles without instant death
- **Healing Pickups**: Restore health after getting hurt, spawns randomly
- **Ghost Power-Up**: Become invincible for 5 seconds
- **Dynamic Obstacles**: blade obstacles that spawn and despawn on Easy mode or stay on Insane mode
- **Progressive Difficulty**: Game speed increases as your score grows
- **High Score Tracking**: Separate high scores for each difficulty mode, stored in browser localStorage
- **Custom Graphics**: Detailed snake sprites with proper head, body segment, and tail orientations

### Sound Effects

- 🍎 **Apple Eating**: PacMan eating sound
- 💔 **Taking Damage**: Classic Minecraft hurt sound "OOF"
- 💚 **Healing**: Minecraft Rare achievement sound
- 💀 **Game Over**: Dramatic end screen sound

## 🕹️ Controls

### Easy Mode
- **W** or **↑**: Move Up
- **S** or **↓**: Move Down
- **A** or **←**: Move Left
- **D** or **→**: Move Right

### Insane Mode (REVERSED!)
- **W** or **↑**: Move Down ⬇️
- **S** or **↓**: Move Up ⬆️
- **A** or **←**: Move Right ➡️
- **D** or **→**: Move Left ⬅️
