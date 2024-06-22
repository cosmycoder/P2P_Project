import { Button, CircularProgress, useForkRef } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { utils } from 'web3';

import useEth from '../contexts/EthContext/useEth';
import Board from './Board';
import { generateMerkleTree, generateCard, getMatrix , isWinningCombination } from '../services/TableService';
import { notifyEvent, submitWinningCombination } from '../services/GameService';
import Result from './Result';

const CreateRoom = ({setView}) => {
	const { state: { contract, accounts } } = useEth();
	const [maxPlayers, setMaxPlayers] = useState('');
    const [maxJoiners, setMaxJoiners] = useState(0);
	const [ethBet, setEthBet] = useState('');
    const [waiting, setWaiting] = useState(false);
    const accusedIntervalRef = useRef();
    const [gameState, setGameState] = useState({
        gameId: -1,
        gameStarted: false,
        gameEnded: false,
        waiting: false,
        card: [],
        result: [],
        amountWon: 0,
        winningAddress: '',
        creatorRefund: 0,
        creatorWon : null,
        winningReason : null,
    });
    const [cardMatrix, setCardMatrix] = useState([]);
    const [canExtract, setCanExtract] = useState(true);
    const [extractedNumbers, setExtractedNumbers] = useState([]);
    const [isBingo, setIsBingo] = useState(false);
    // const [winningCombination, setWinningCombination] = useState([]);
    const [accused, setAccused] = useState(false);
    const stateRef = useRef(gameState);
    const exNumRef = useRef(extractedNumbers);
    const accusedRef = useRef(accused);
    const re = /^[0-9\b]+$/;

	const createGame = () => {
		const _maxPlayers = parseInt(maxPlayers);
		const _ethBet = parseInt(ethBet);
		// window.ethereum.on("GameCreated", () => {
		// 	console.log("Game started")
		// 	toast('Game started', {
		// 		icon: 'ℹ️'
		// 	});
		// });
        let _card = generateCard();
        // let _card = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
        setGameState(prevState => ({...prevState, card: _card}));
        setCardMatrix(getMatrix(_card));
        let merkleTree = generateMerkleTree(_card);

        console.log(_maxPlayers, _ethBet, `${merkleTree[merkleTree.length - 1][0]}`);
		contract.methods.createGame(_maxPlayers, _ethBet, `${merkleTree[merkleTree.length - 1][0]}`)
            .send({
                    from: accounts[0],
                    gas: 1000000,
                    value: utils.toWei(_ethBet, 'ether')
                })
            .then((logArray) => {
                console.log(logArray);
                setGameState(prevState => ({...prevState, gameId: parseInt(logArray.events.GameCreated.returnValues._gameId)}));
                setWaiting(true);
                toast.success('Gioco creato con successo!');
		}).catch((error) => {
			console.log(error);
			toast.error(`Error creating a game ${String(error)}`);
		});
	};




    const extractNumber = () => {
        contract.methods.extractNumber(gameState.gameId,accused).send({
            from: accounts[0],
            gas: 1000000,
        }).then((logArray) => {
            setExtractedNumbers([...extractedNumbers, logArray.events.NumberExtracted.returnValues.number]);
		}).catch((error) => {
			console.log(error);
			toast.error(`Non sono riuscito a estrarre un nuovo numero ${String(error)}`);
		});
        setCanExtract(false);
        setTimeout(() => {
            setCanExtract(true);
          }, 2000);
    };

    const setResult = (result) => {
        setGameState(prevState => ({...prevState, result: result}));
    };

    const handleEvents = (data) => {
        console.log(data)
        if (data.event === 'GameStarted') {
            console.log('Game Started:', data);
            if (parseInt(data.returnValues._gameId) === stateRef.current.gameId) {
                setGameState(prevState => ({...prevState, gameStarted: true}));
                setWaiting(false);
            }
        } else if (data.event === 'ReceiveAccuse') {
            if (stateRef.current.gameStarted) {
                if (parseInt(data.returnValues._gameId) === stateRef.current.gameId && !accusedRef.current) {
                    toast('Accusa ricevuta!', {icon: 'ℹ️'});
                    setAccused(true);
                    notifyEvent();
                }
            }
        } else if (data.event === 'ConfirmRemovedAccuse') {
            if (stateRef.current.gameStarted) {
                if (parseInt(data.returnValues._gameId) === stateRef.current.gameId && accusedRef.current) {
                    setAccused(false);
                    toast.success('Accusa rimossa con successo');
                    clearInterval(accusedIntervalRef.current);
                }
            }
        } else if (data.event === 'NotBingo') {
            if (
                parseInt(data.returnValues._gameId) === parseInt(stateRef.current.gameId)
                && accounts[0].toLowerCase() !== data.returnValues.player.toLowerCase()
            ) {
                console.log('Not bingo!');
                toast.error('Qualcuno ha chiamato bingo ma non lo era!');
            }
        } else if (data.event === 'GameEnded') {
            console.log(data.returnValues);
            if (parseInt(data.returnValues._gameId) ===  stateRef.current.gameId && data.returnValues._winner.toLowerCase() !== accounts[0].toLowerCase()) {
                toast('Gioco terminato!', {icon: 'ℹ️'});
                setGameState(prevState => ({
                    ...prevState,
                    gameStarted : false,
                    gameEnded : true,
                    amountWon : utils.fromWei(data.returnValues._amountWonWei, 'ether'),
                    winningAddress : data.returnValues._winner.toLowerCase(),
                    creatorRefund : utils.fromWei(data.returnValues._creatorRefundWei, 'ether'),
                    winningReason : data.returnValues._reason,
                    creatorWon : data.returnValues._creatorWon,
                }));
                setAccused(false);
            }
        } else {
            console.log(data);
        }
    }

    useEffect(() => {
        console.log("EVENTS BINDED")

        contract._events.allEvents().on('data', handleEvents)
        return () => {
            console.log("UNBINDEVENTS")
            contract._events.allEvents().off('data', handleEvents);
        }
    }, []);

    useEffect(() => {
        stateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        exNumRef.current = extractedNumbers;
    }, [extractedNumbers]);

    useEffect(() => {
        accusedRef.current = accused;
    }, [accused]);

    useEffect(() => {
        if (gameState.gameStarted && accused){
            accusedIntervalRef.current = setInterval(() => {
                contract.methods.checkAccuse(gameState.gameId).send({
                    from: accounts[0],
                    gas: 1000000,
                }).then((logArray) => {
                    console.log(logArray.events);

                }).catch((error) => {
                    console.log(error);
                    clearInterval(accusedIntervalRef.current);
                    //toast.error(`Error checking accuse ${String(error)}`);
                });
            }, 10000);
            return () => clearInterval(accusedIntervalRef.current);
        }
    }, [accused]);

    useEffect(() => {
        if (!gameState.result) {return;}
        console.log(gameState.result);
        const [bingo, combination] = isWinningCombination(gameState.result);
        if (gameState.result && bingo) {
            console.log('Bingo!');
            toast('Bingo!', {icon: '🥳'});
            setIsBingo(true);
            console.log('Winning combination -> ' + combination);
            // setWinningCombination(combination);
        } else {
            setIsBingo(false);
        }
    }, [gameState.result]);

    useEffect(() => {
        function beforeUnload(e) {
          if (!gameState.gameStarted || gameState.gameEnded) return;
          e.preventDefault();
        }

        window.addEventListener('beforeunload', beforeUnload);

        return () => {
          window.removeEventListener('beforeunload', beforeUnload);
        };
      }, [gameState, gameState.gameStarted, gameState.gameEnded]);

      useEffect(() => {
        function beforeUnload(e) {
          if (!waiting) return;
          e.preventDefault();
        }

        window.addEventListener('beforeunload', beforeUnload);

        return () => {
          window.removeEventListener('beforeunload', beforeUnload);
        };
      }, [waiting]);

	return (
        <div className="flex flex-col">
        {!gameState.gameEnded && gameState.gameStarted && (
          <h1 className="flex text-black dark:text-white justify-center text-2xl">
            {`Numeri estratti: ${extractedNumbers.length > 5 ? extractedNumbers.slice(-5) : extractedNumbers}`}
          </h1>
        )}
        {!gameState.gameEnded && (
          <div className="flex justify-center items-center">
            {!waiting && !gameState.gameStarted ? (
              <CreateGameSection
                maxPlayers={maxPlayers}
                setMaxJoiners={setMaxJoiners}
                setMaxPlayers={setMaxPlayers}
                ethBet={ethBet}
                setEthBet={setEthBet}
                re={re}
                createGame={createGame}
                setView={setView}
              />
            ) : !gameState.gameStarted ? (
              <WaitingForPlayersSection gameId={gameState.gameId} />
            ) : (
              <GameBoardSection
                cardMatrix={cardMatrix}
                setResult={setResult}
                canExtract={canExtract}
                extractNumber={extractNumber}
                isBingo={isBingo}
                submitWinningCombination={submitWinningCombination}
                contract={contract}
                accounts={accounts}
                gameState={gameState}
                setGameState={setGameState}
              />
            )}
          </div>
        )}
        {gameState.gameEnded && (
          <Result
            accounts={accounts}
            maxPlayers={parseInt(maxJoiners)}
            state={gameState}
            imCreator={true}
            setView={setView}
          />
        )}
      </div>
    );
};


const CreateGameSection = ({
    maxPlayers, setMaxJoiners, setMaxPlayers, ethBet, setEthBet, re, createGame, setView
  }) => (
    <div className="grid grid-rows-2 gap-4">
      <input
        placeholder="Massimo numero di giocatori"
        className="text-field"
        value={maxPlayers}
        onChange={(e) => {
          if (e.target.value === '' || re.test(e.target.value)) {
            setMaxPlayers(e.target.value);
            setMaxJoiners(parseInt(e.target.value));
        }
        }}
        id="outlined-basic"
        label="Massimo numero di giocatori"
      />
      <input
        placeholder="ETH da scommettere"
        className="text-field"
        value={ethBet}
        onChange={(e) => {
          if (e.target.value === '' || re.test(e.target.value)) {setEthBet(e.target.value);}
        }}
        id="outlined-basic"
        label="ETH da scommettere"
      />
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
          disabled={maxPlayers === '' || ethBet === ''}
          variant="contained"
          onClick={createGame}
        >
          Scommetti
        </Button>
        <Button
          className="dark:border-blue-500 dark:hover:border-blue-600 dark:text-blue-500 dark:hover:text-blue-600 border-blue-400 hover:border-blue-500 text-blue-400 hover:text-blue-500 items-center shadow-xl transition duration-300"
          variant="outlined"
          onClick={() => setView('')}
        >
          Torna indietro
        </Button>
      </div>
    </div>
  );

  const WaitingForPlayersSection = ({ gameId }) => (
    <div className="grid grid-rows-2 gap-4">
      <h1 className="text-center text-2xl text-black dark:text-white">
        {`Stanza numero ${gameId}`}
      </h1>
      <h1 className="text-center text-2xl text-black dark:text-white">
        Aspetto che altri giocatori si connettano!
      </h1>
      <CircularProgress className="m-auto" />
    </div>
  );

  const GameBoardSection = ({
    cardMatrix, setResult, canExtract, extractNumber, isBingo, submitWinningCombination, contract, accounts, gameState, setGameState
  }) => (
    <div className="flex flex-col gap-4">
      <Board size={5} table={cardMatrix} setResult={setResult} />
      <div className="flex flex-row gap-10 items-center justify-center">
        <Button
          className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
          disabled={!canExtract}
          variant="contained"
          onClick={extractNumber}
        >
          Estrai numero
        </Button>
      </div>
      <Button
        className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
        variant="outlined"
        disabled={!isBingo}
        onClick={() => submitWinningCombination(contract, accounts, gameState, setGameState)}
      >
        Invia risultato
      </Button>
    </div>
  );


export default CreateRoom;
