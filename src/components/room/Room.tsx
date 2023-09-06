// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useEffect, useState } from 'react';
import { playerType } from '../../shared/model';
import './style.css';
import { socket } from '../../socket';

interface RoomProps {
  roomCode: number;
  playerType: playerType;
}
interface SentenceData {
  fragment: string;
  playerType: playerType;
}
const Room = ({ roomCode, playerType }: RoomProps) => {
  const [fragments, setFragments] = useState<SentenceData[]>([]);
  const [playerJoined, setPlayerJoined] = useState(playerType === 'participant');

  const questions = [
    'Who?',
    'What are they doing?',
    'In what way/manner?',
    'Where?',
    'Why?',
  ];
  const index = fragments.length;
  const finished = fragments.length === questions.length;
  const isMyTurn = fragments.length % 2 === (playerType === 'host' ? 0 : 1);
  useEffect(() => {
    function onJoin() {
      console.log('player joined!');
      setPlayerJoined(true);
    }

    function onFragment(fragmentData: SentenceData) {
      const { fragment, playerType:fragmentPlayer } = fragmentData;
      if (fragmentPlayer === playerType) {
        return;
      }
      console.log('received fragment from other player!');
      addFragment({ fragment, playerType: fragmentPlayer });
    }

    socket.on('player-join', onJoin);
    socket.on('fragment-added', onFragment);

    return () => {
      socket.off('player-join', onJoin);
      socket.off('fragment-added', onFragment);
    };
  }, [playerType]);

  const addFragment = (fragmentData: SentenceData) => {
    const { fragment,  playerType } = fragmentData;
    setFragments((f) => [...f, { fragment,  playerType }]);
  };
  const COLORS = ['magenta', 'cyan', '#79155B', '#C23373', '#F6635C'];

  const [fragmentInput, setFragmentInput] = useState('');

  const buttonAdd = () => {
    addFragment({ fragment: fragmentInput, playerType });
    socket.emit('fragment-send', roomCode, fragmentInput, playerType);
  };

  const resetClick = () => {
    setFragments([]);
  };
  return (
    <>
      <h5>You are a {playerType}</h5>
      <h5>
        Your Room Code: <span style={{ color: 'magenta' }}> {roomCode} </span>{' '}
      </h5>

      {playerJoined ? (
        <>
          <div className="game">
            <h3>Your words:</h3>

            {fragments
              .filter((frag) => frag.playerType === playerType)
              .map((frags) => (
                <p>{frags.fragment}</p>
              ))}

            {finished && (
              <>
                <h3 style={{ marginTop: '2em' }}>Final Sentence:</h3>

                <p>{fragments.map((frags) => frags.fragment).join(' ')}</p>

                <button style={{ marginTop: '2em' }} onClick={resetClick}>
                  Reset
                </button>
              </>
            )}
            {!finished && (
              <div>
                <h3>Type in a sentence fragment that answers the question!</h3>
                <p
                  style={{
                    fontSize: '1.5em',
                    fontWeight: 'bold',
                    color: COLORS[index],
                  }}
                >
                  {questions[index]}
                </p>
                <input
                  className="fragment-input"
                  style={{ marginRight: '1em', marginBottom: '1em' }}
                  onChange={(e) => setFragmentInput(e.target.value)}
                />
                <button
                  disabled={!isMyTurn || !fragmentInput}
                  onClick={buttonAdd}
                >
                  Add sentence fragment
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <h1>Waiting for another player to join...</h1>
        </>
      )}
    </>
  );
};

export default Room;
