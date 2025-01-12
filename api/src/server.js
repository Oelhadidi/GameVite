import chalk from "chalk";
import fastify from "fastify";
import fastifyBcrypt from "fastify-bcrypt";
import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyJWT from "@fastify/jwt";
import { usersRoutes } from "./routes/users.js";
import { gamesRoutes } from "./routes/games.js";
import { matchRecordRoutes } from "./routes/matchRecord.js";
import { sequelize } from "./bdd.js";
import socketioServer from "fastify-socket.io";
import dotenv from "dotenv";

dotenv.config();

// Initialize Fastify
let blacklistedTokens = [];
const app = fastify();
const port = parseInt(process.env.DB_PORT) || 3000;
// Set up plugins
await app
  .register(fastifyBcrypt, { saltWorkFactor: 12 })
  .register(cors, { origin: "*", methods: ["GET", "POST"] })
  .register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Documentation de l'API JDR LOTR",
        description: "API développée pour un exercice avec React avec Fastify et Sequelize",
        version: "0.1.0",
      },
    },
  })
  .register(socketioServer, {
    cors: {
      origin: "*",
    },
  })
  .register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    theme: { title: "Docs - JDR LOTR API" },
    uiConfig: { docExpansion: "list", deepLinking: false },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })
  .register(fastifyJWT, {
    secret: "unanneaupourlesgouvernertous",
  });

// Function to decode and verify token
app.decorate("authenticate", async (request, reply) => {
  try {
    const token = request.headers["authorization"].split(" ")[1];
    if (blacklistedTokens.includes(token)) {
      return reply.status(401).send({ error: "Token invalid or expired" });
    }
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Routes setup
usersRoutes(app);
gamesRoutes(app);
matchRecordRoutes(app);

// Test DB connection
try {
  await sequelize.authenticate();
  console.log(chalk.grey("Connected to the MySQL database!"));
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

/**
 * SOCKET.IO Logic
 */

// Store for players and game states per room
let players = {}; // To track which players are in which rooms
let gameStates = {}; // To track game state per room
let restartVotes = {};

// Socket.IO setup
app.ready().then(() => {
  app.io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Handle player joining a room
    socket.on('joinRoom', ({ id, username, roomCode }) => {
      // Check how many players are in the room
      const roomPlayers = Object.values(players).filter(player => player.roomCode === roomCode);

      // If the room is full, emit the "roomFull" event
      if (roomPlayers.length >= 2) {
        socket.emit('roomFull', { message: 'This room is full, please join another room.' });
        return;
      }

      // Add player to the room
      socket.join(roomCode);
      players[socket.id] = { id, username, roomCode };
      console.log(`${username} joined room ${roomCode}`);

      // Initialize the game state for the room if it doesn't exist
      if (!gameStates[roomCode]) {
        gameStates[roomCode] = {
          board: Array(6).fill(null).map(() => Array(7).fill(null)), // Empty 6x7 board
          currentPlayer: 1, // Player 1 starts
          winner: null, // No winner yet
        };
      }

      // If two players are in the room, start the game
      const updatedRoomPlayers = Object.values(players).filter(player => player.roomCode === roomCode);
      if (updatedRoomPlayers.length === 2) {
        const [firstPlayer, secondPlayer] = updatedRoomPlayers;
        app.io.to(roomCode).emit('gameReady', { firstPlayer: firstPlayer.username, secondPlayer: secondPlayer.username, firstPlayerId: firstPlayer.id, secondPlayerId: secondPlayer.id });
      }
    });

    // Handle player move
    socket.on('makeMove', ({ board, nextPlayer, roomCode }) => {
      console.log('Move made:', board, 'Next player:', nextPlayer);
      if (gameStates[roomCode]) {
        gameStates[roomCode].board = board;
        gameStates[roomCode].currentPlayer = nextPlayer;
        app.io.to(roomCode).emit('opponentMove', { board, nextPlayer });
      }
    });

    // Handle game won
    socket.on('gameWon', ({ winner, roomCode, winningCells }) => {
      console.log('Game won by:', winner);
      if (gameStates[roomCode]) {
        gameStates[roomCode].winner = winner;
        gameStates[roomCode].winningCells = winningCells;
        app.io.to(roomCode).emit('gameWon', winner, winningCells);
      }
    });

    // Handle game reset
    socket.on('resetGame', (roomCode) => {
      if (gameStates[roomCode]) {
        gameStates[roomCode].board = Array(6).fill(null).map(() => Array(7).fill(null));
        gameStates[roomCode].currentPlayer = 1;
        gameStates[roomCode].winner = null;
        app.io.to(roomCode).emit('gameReset');
      }
    });


    // Handle restart game request
  socket.on('requestRestart', (roomCode) => {
    // Initialize room's restartVotes if it doesn't exist
    if (!restartVotes[roomCode]) {
      restartVotes[roomCode] = new Set(); // Using a Set to ensure unique player votes
    }

    // Add player’s socket.id to restartVotes for the room
    restartVotes[roomCode].add(socket.id);

    // Check if both players have requested a restart
    const roomPlayers = Object.keys(players).filter(playerSocketId => players[playerSocketId].roomCode === roomCode);
    
    // Set restart pending and disable moves if one player has requested a restart
    if (!gameStates[roomCode].restartPending) {
      gameStates[roomCode].restartPending = true;
      app.io.to(roomCode).emit('disableBoard'); // Tell clients to disable moves
    }


    if (restartVotes[roomCode].size === roomPlayers.length) {
      // Reset the game state
      if (gameStates[roomCode]) {
        gameStates[roomCode].board = Array(6).fill(null).map(() => Array(7).fill(null));
        gameStates[roomCode].currentPlayer = 1;
        gameStates[roomCode].winner = null;
      }

      // Notify players in the room about the game reset
      app.io.to(roomCode).emit('gameReset');

      // Clear restart votes for this room
      restartVotes[roomCode].clear();
    } else {
      // Inform the room that one player has requested a restart
      app.io.to(roomCode).emit('restartRequested', { message: 'Waiting for both players to agree on restart.' });
    }
  });

    // Handle player disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      const player = players[socket.id];
      if (player) {
        const roomCode = player.roomCode;
        delete players[socket.id];
        const roomPlayers = Object.values(players).filter(player => player.roomCode === roomCode);
        if (roomPlayers.length < 2) {
          app.io.to(roomCode).emit('playerDisconnected');
        }
      }
    });
  });
});

/**********
 * START SERVER
 **********/
const start = async () => {
  try {
    await sequelize
      .sync({ alter: true })
      .then(() => {
        console.log(chalk.green("Database synchronized."));
      })
      .catch((error) => {
        console.error("Database synchronization error:", error);
      });

    await app.listen(port, () =>{
      console.log(`App Lsitening on port ${port}`)
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
