import * as Y from 'yjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useState } from 'react';
import { playerType } from '../../shared/model';
import './style.css';
interface RoomProps {
  roomCode: string;
  yDoc: Y.Doc | null;
  player: playerType;
}
interface SentenceData {
  fragment: string;
  player: playerType;
}
const Room = ({ roomCode, yDoc, player }: RoomProps) => {
  console.log(roomCode, yDoc);
  const questions = [
    'Who?',
    'What are they doing?',
    'In what way/manner?',
    'Where?',
    'Why?',
  ];
  const COLORS = ['magenta', 'cyan', '#79155B', '#C23373', '#F6635C'];
  const yArray = yDoc?.getArray<SentenceData>('sentence-array');
  const [sentences, setSentences] = useState<SentenceData[] | undefined>(
    yArray?.toArray()
  );
  const getColor = (index: number) => {
    const order = player === 'host' ? 0 : 1;
    const myColors = COLORS.filter((_, index) => index % 2 === order);
    console.log(order);

    return myColors[index];
  };

  const isMyTurn = () => {
    if (sentences?.length === 0) {
      return player === 'host';
    }
    return sentences?.at(sentences.length - 1)?.player != player;
  };
  const myTurn = isMyTurn();

  let finished = sentences?.length === questions.length;
  const index = sentences?.length || 0;

  const myFragments = sentences
    ?.filter((val) => val.player === player)
    .map((data) => data.fragment);
  const allFragments = sentences?.map((data) => data.fragment);

  const [fragmentInput, setFragmentInput] = useState('');

  yArray?.observe(() => {
    setSentences(yArray.toArray());
  });

  const buttonAdd = () => {
    console.log('hey');
    const fragment = fragmentInput;
    yArray?.insert(yArray.toArray().length, [{ fragment, player }]);
  };

  const resetClick = () => {
    yArray?.delete(0, sentences?.length);
    finished = false;
  };
  return (
    <>
      <h5>You are a {player}</h5>
      <h5>
        Your Room Code: <span style={{ color: 'magenta' }}> {roomCode} </span>{' '}
      </h5>
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
          <button disabled={!myTurn || !fragmentInput} onClick={buttonAdd}>
            Add sentence fragment
          </button>
        </div>
      )}

      <h3>Your words:</h3>
      {myFragments?.map((frag, i) => (
        <p style={{ color: getColor(i) }}>{frag}</p>
      ))}
      {finished && (
        <>
          <h3 style={{ marginTop: '2em' }}>Final Sentence:</h3>
          <div>{allFragments?.join(' ')}</div>
          <button style={{ marginTop: '2em' }} onClick={resetClick}>
            Reset
          </button>
        </>
      )}
    </>
  );
};

export default Room;
