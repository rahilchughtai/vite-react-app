// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useEffect, useState } from 'react';
import { playerType } from '../../shared/model';
import './style.css';
import { socket } from '../../socket';

interface RoomProps {
  roomCode: number;

  player: playerType;
}
interface SentenceData {
  fragment: string;
  player: playerType;
}
const Room = ({ roomCode, player }: RoomProps) => {
  const [fragments, setFragments] = useState<SentenceData[]>([]);
  const [playerJoined, setPlayerJoined] = useState(player === 'participant');

  const questions = [
    'Who?',
    'What are they doing?',
    'In what way/manner?',
    'Where?',
    'Why?',
  ];
  const index = fragments.length;
  const finished = fragments.length === questions.length;
  const isMyTurn = fragments.length % 2 === (player === 'host' ? 0 : 1);
  useEffect(() => {
    function onJoin() {
      console.log('player joined!');
      setPlayerJoined(true);
    }

    function onFragment(fragmentData: any) {
      const { fragment, playerType } = fragmentData;
      if (playerType === player) {
        return;
      }
      console.log('received fragment from other player!');
      addFragment({ fragment, player: playerType });
    }

    socket.on('player-join', onJoin);
    socket.on('fragment-added', onFragment);

    return () => {
      socket.off('player-join', onJoin);
      socket.off('fragment-added', onFragment);
    };
  }, []);

  const addFragment = (fragmentData: SentenceData) => {
    const { fragment, player: playerType } = fragmentData;
    setFragments((f) => [...f, { fragment, player: playerType }]);
  };
  const COLORS = ['magenta', 'cyan', '#79155B', '#C23373', '#F6635C'];

  const getColor = (index: number) => {
    const order = player === 'host' ? 0 : 1;
    const myColors = COLORS.filter((_, index) => index % 2 === order);
    console.log(order);

    return myColors[index];
  };

  const [fragmentInput, setFragmentInput] = useState('');

  const buttonAdd = () => {
    addFragment({ fragment: fragmentInput, player: player });
    socket.emit('fragment-send', roomCode, fragmentInput, player);
  };

  const resetClick = () => {
    setFragments([]);
  };
  return (
    <>
      <h5>You are a {player}</h5>
      <h5>
        Your Room Code: <span style={{ color: 'magenta' }}> {roomCode} </span>{' '}
      </h5>

      {playerJoined ? (
        <>
          <div className="game">
            <h3>Your words:</h3>

            {fragments
              .filter((frag) => frag.player === player)
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
