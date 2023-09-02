import { useState } from 'react';
import './App.css';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import Room from './components/room/Room';
import { playerType } from './shared/model';

function App() {
  const [roomInput, setRoomInput] = useState('');
  const rand = (4000 + Math.floor(Math.random() * 1000)).toString();
  const [roomCode, setRoomCode] = useState(rand.toString());
  const [room, setRoom] = useState<any | null>(null);
  const [sharedDoc, setSharedDoc] = useState<Y.Doc | null>(null);
  const [playerType, setPlayerType] = useState<playerType>('host');

  // Function to create a new room
  const createRoom = async () => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider('sentence-game', ydoc, {
      password: roomCode,
    });
    setSharedDoc(ydoc);
    setRoom(provider);
  };

  // Function to join an existing room
  const joinRoom = async () => {
    const ydoc = new Y.Doc();
    const provider = new WebrtcProvider('sentence-game', ydoc, {
      password: roomInput,
    });
    setRoomCode(roomInput);
    setSharedDoc(ydoc);
    setRoom(provider);
    setPlayerType('participant');
  };

  return (
    <div className="App">
      <h2>Ray Sentence Game</h2>
      {room ? (
        <Room player={playerType} yDoc={sharedDoc} roomCode={roomCode} />
      ) : (
        <div>
          <button onClick={createRoom}>Create Room</button>
          <h3>OR</h3>
          <input
          style={{fontSize:'.8em'}}
            inputMode="numeric"
            type="text"
            placeholder="Enter Room Code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      )}
    </div>
  );
}

export default App;
