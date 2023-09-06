import { useEffect, useState } from 'react';
import './App.css';
import { socket } from './socket';

import Room from './components/room/Room';
import { playerType } from './shared/model';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [roomInput, setRoomInput] = useState('');
  const [roomCode, setRoomCode] = useState<number | null>(null);
  const [playerType, setPlayerType] = useState<playerType>('host');

  useEffect(() => {
    function onConnect() {
      console.log('user connected');
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('user disconnected');
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [isConnected]);

  // Function to create a new room
  const createRoom = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit('create-room', (response: any) => {
      if (!response.success) {
        return console.error(response.error);
      }
      setRoomCode(response.roomCode);
      setPlayerType('host');
      console.log(response);
    });
  };

  // Function to join an existing room
  const joinRoom = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.emit('join-room', roomInput, (response: any) => {
      if (!response.success) {
        return console.error(response.error);
      }
      console.log(response);
      setPlayerType('participant');
      setRoomCode(response.roomCode);
    });
  };

  return (
    <div className="App">
      <h2>Ray Sentence Game </h2>
      <p>Connected: {JSON.stringify(isConnected)}</p>
      {roomCode ? (
        <Room playerType={playerType} roomCode={roomCode} />
      ) : (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <h3>OR</h3>
          <input
            style={{ fontSize: '.8em', marginTop: '1em' }}
            inputMode="numeric"
            type="text"
            placeholder="Enter Room Code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          />
          <button style={{ marginTop: '1em' }} onClick={joinRoom}>
            Join Room
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
