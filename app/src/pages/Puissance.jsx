// import React, { useState, useEffect, useCallback } from 'react';
import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

// Initialisation des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

// Initialize socket connection
const socket = io(API_URL, { autoConnect: false });
const Puissance = () => {
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null))); // Game board
  const [currentPlayer, setCurrentPlayer] = useState(1); // Current player
  const [winner, setWinner] = useState(null); // Game winner
  const [isGameReady, setIsGameReady] = useState(false); // Game ready state
  const [isMyTurn, setIsMyTurn] = useState(false); // Player turn state
  const [roomCode, setRoomCode] = useState(''); // Room code
  const [isRoomJoined, setIsRoomJoined] = useState(false); // Room join state
  const [isRoomFull, setIsRoomFull] = useState(false); // Room full state
  const user = JSON.parse(localStorage.getItem('user')); // User from local storage
  const token = localStorage.getItem('token'); // Token from local storage
  const [players, setPlayers] = useState({ firstPlayerId: null, secondPlayerId: null });
  const [scores, setScores] = useState({ player1Wins: 0, player2Wins: 0 });
  const [isBoardActive, setIsBoardActive] = useState(true);

  if (!user || !token) {
    window.location.href = '/signin';
  }
  // Socket listeners and setup
  useEffect(() => {

    // Fetch match scores once players are set
    const fetchScores = async (player1Id, player2Id) => {
      try {
        const response = await fetch(`${API_URL}/match/record?player1Id=${player1Id}&player2Id=${player2Id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,  // Include your token for authentication if needed
          },
        });
    
        const data = await response.json();
        // Determine which player ID corresponds to the first player in `players`
    if (data.player1Id === player1Id) {
      // data.player1Id matches player1Id, so we assign scores directly
      setScores({ player1Wins: data.player1Wins, player2Wins: data.player2Wins });
    } else {
      // data.player1Id matches player2Id, so we swap the scores
      setScores({ player1Wins: data.player2Wins, player2Wins: data.player1Wins });
    }
      } catch (error) {
        console.error("Error fetching match record:", error);
      }
    };


    if (!user || !token) {
      alert("Please log in to start the game");
      window.location.href = '/signin';
    } else {
      if (!socket.connected) {
        socket.connect();
      }

      // Listen for room full event
      socket.on('roomFull', (data) => {
        setIsRoomFull(true);  // Room is full, update the state
        console.log(data);
      });

      // Listen for restart request notification
      socket.on('restartRequested', (data) => {
        alert(data.message); // Alert players that the other player is waiting for restart confirmation
        setIsBoardActive(false);
      });

      // Listen for game reset
      socket.on('gameReset', () => {
        // Reset the board and other necessary state variables
        setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
        setCurrentPlayer(1); // Set starting player
        setWinner(null); // Clear winner
        setIsBoardActive(true);
      });

      // Disable the board when only one player requests a restart
      socket.on('disableBoard', () => {
        setIsBoardActive(false);
      });

      // Listen for game ready event
      socket.on('gameReady', (gameData) => {
        setIsGameReady(true);
        setIsMyTurn(gameData.firstPlayer === user.username);
        setPlayers({
          firstPlayerId: gameData.firstPlayerId,
          secondPlayerId: gameData.secondPlayerId,
          firstPlayer:gameData.firstPlayer,
          secondPlayer:gameData.secondPlayer,
        });
        fetchScores(gameData.firstPlayerId,gameData.secondPlayerId);
      });

      // Listen for opponent move event
      socket.on('opponentMove', ({ board, nextPlayer }) => {
        setBoard(board);
        setCurrentPlayer(nextPlayer);
        setIsMyTurn(nextPlayer === currentPlayer ? false : true);
      });

      // Listen for game won event
      socket.on('gameWon', (winner) => {
        setWinner(winner);
        console.log(fetchScores(players.firstPlayerId,players.secondPlayerId));
        fetchScores(players.firstPlayerId,players.secondPlayerId);
      });


      return () => {
        // Cleanup listeners when component unmounts
        socket.off('roomFull');
        socket.off('gameReady');
        socket.off('opponentMove');
        socket.off('gameWon');
        socket.off('gameReset');
        socket.off('restartRequested');
        socket.off('disableBoard');
      };
    }
  }, [user, token, currentPlayer, players, winner]);


  // Function to join room
  const joinRoom = () => {
    socket.emit('joinRoom', { id: user.id, username: user.username, roomCode });
    setIsRoomJoined(true);
  };

   // Function to redirect back to lobby
   const goBackToLobby = () => {
    setIsRoomJoined(false); 
    setIsRoomFull(false);
  };

  // Function to check win condition
  const checkWin = (board, player) => {
    const rows = board.length;
    const cols = board[0].length;
    
    // Check horizontal wins
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols - 3; col++) {
        if (
          board[row][col] === player &&
          board[row][col + 1] === player &&
          board[row][col + 2] === player &&
          board[row][col + 3] === player
        ) {
          return [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]; // Return winning cells
        }
      }
    }
  
    // Check vertical wins
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 0; col < cols; col++) {
        if (
          board[row][col] === player &&
          board[row + 1][col] === player &&
          board[row + 2][col] === player &&
          board[row + 3][col] === player
        ) {
          return [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]; // Return winning cells
        }
      }
    }
  
    // Check diagonal wins (left to right)
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 0; col < cols - 3; col++) {
        if (
          board[row][col] === player &&
          board[row + 1][col + 1] === player &&
          board[row + 2][col + 2] === player &&
          board[row + 3][col + 3] === player
        ) {
          return [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]; // Return winning cells
        }
      }
    }
  
    // Check diagonal wins (right to left)
    for (let row = 0; row < rows - 3; row++) {
      for (let col = 3; col < cols; col++) {
        if (
          board[row][col] === player &&
          board[row + 1][col - 1] === player &&
          board[row + 2][col - 2] === player &&
          board[row + 3][col - 3] === player
        ) {
          return [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]]; // Return winning cells
        }
      }
    }
  
    // No win found
    return null;
  };

  const [winningCells, setWinningCells] = useState([]);

  // Function to handle disc drop
  const dropDisc = useCallback((colIndex) => {
    // If the board is inactive (waiting for the second player), do nothing
    if (!isBoardActive || !isMyTurn || winner) return;
  
    // Find the available row for the given column
    const rowIndex = board.map(row => row[colIndex]).lastIndexOf(null);
    if (rowIndex === -1) return;  // If the column is full, do nothing
  
    // Create a copy of the board and update the column
    const newBoard = board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = currentPlayer;
    setBoard(newBoard);
  
    // Check if the current player wins
    const winningCellsResult = checkWin(newBoard, currentPlayer);
    if (winningCellsResult) {
      // Emit the game won event and send data to the backend
      socket.emit('makeMove', { board: newBoard, nextPlayer: currentPlayer === 1 ? 2 : 1, roomCode });
      setWinner(user.username);
      setWinningCells(winningCellsResult);
      
      try {
        // Determine the loser based on player IDs
        const loserId = user.id === players.firstPlayerId ? players.secondPlayerId : players.firstPlayerId;
  
        // Update the match record with the winner and loser
        fetch(`${API_URL}/match/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            winnerId: user.id,
            loserId: loserId,
          }),
        });
  
        // Notify the backend that the game has been won
        socket.emit('gameWon', { winner: user.username, roomCode, winningCells: winningCellsResult });
      } catch (error) {
        console.error("Error updating match record:", error);
      }
    } else {
      // If the game isn't over, just make the move and switch players
      socket.emit('makeMove', { board: newBoard, nextPlayer: currentPlayer === 1 ? 2 : 1, roomCode });
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setIsMyTurn(false);
    }
  }, [isBoardActive, isMyTurn, winner, board, currentPlayer, user.username, roomCode, players.firstPlayerId, players.secondPlayerId]);
  

  // Function to reset the game
  const resetGame = useCallback(() => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    socket.emit('requestRestart', roomCode);  // Notify the server
  }, [roomCode]);

  // Component rendering logic
  return (
    <div className="game-container">
      {/* If the room is full */}
      {isRoomFull && (
        <div className="bg-white rounded-md p-5 flex flex-col items-center text-lg">
          <h2 className="text-red-500">This room is full, please join another room!</h2>
          <button onClick={goBackToLobby} className="mt-2 bg-blue-500 hover:bg-blue-800">Back to Lobby</button>
        </div>
      )}

      {/* If the user has not joined a room yet */}
      {!isRoomFull && !isRoomJoined && (
        <div className="game-container">
          <h1 className='text-white'>Enter Room Code</h1>
          <input
            type="text"
            className='m-4 p-4 rounded-md h-11'
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <button onClick={joinRoom} className='hover:bg-gray-500 hover:text-white'>Join Room</button>
        </div>
      )}

      {/* If the user has joined the room but the game is not ready (waiting for opponent) */}
      {!isRoomFull && isRoomJoined && !isGameReady && (
        <div className="bg-white rounded-md p-5 flex flex-col items-center text-lg">
          <h2 className='text-gray-500'>Waiting for another player to join...</h2>
          <p className="text-gray-700">Room Code: <strong>{roomCode}</strong></p>
          <div className="spinner"></div>
        </div>
      )}

      {/* If the game is ready and in progress */}
      {!isRoomFull && isRoomJoined && isGameReady && (
        <div className={`game-container ${isMyTurn ? 'your-turn' : 'opponent-turn'}`}>
          <h1 className='text-white'>Puissance 4</h1>
          {winner ? (
            <h2>{winner === user.username ? 'You Win!' : 'You Lose!'}</h2>
          ) : (
            <h2>{isMyTurn ? 'Your Turn' : "Opponent's Turn"}</h2>
          )}

           {/* Scores Section */}
          <div className="flex items-center justify-around m-4 p-4 bg-gray-800 rounded-lg text-white">
            <div className="score-card text-center">
              <h3 className="text-lg font-bold">{players.firstPlayer} Wins</h3>
              <p className="text-3xl font-semibold text-blue-400">{scores.player1Wins}</p>
            </div>
            <div className="score-card mx-2 text-center">
              <h3 className="text-lg font-bold">{players.secondPlayer} Wins</h3>
              <p className="text-3xl font-semibold text-yellow-400">{scores.player2Wins}</p>
            </div>
          </div>



          <div className="board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((cell, colIndex) => {
                  const isWinningCell = winningCells.some(
                    ([winRow, winCol]) => winRow === rowIndex && winCol === colIndex
                  );
                  return (
                    <div key={colIndex} className="col" onClick={() => dropDisc(colIndex)}>
                      <div className={`cell ${cell === 1 ? 'red' : cell === 2 ? 'yellow' : ''} ${isWinningCell ? 'winning-cell' : ''}`}></div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {winner && (
            <button onClick={resetGame} className='mt-2 bg-red-500 hover:bg-red-800'>Restart Game</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Puissance;
