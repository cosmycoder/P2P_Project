import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';
import { utils } from 'web3';

import useEth from '../contexts/EthContext/useEth';
import Board from './Board';
import { generateMerkleTree, generateCard, getMatrix, isWinningCombination } from '../services/TableService';
import { submitWinningCombination, notifyEvent } from '../services/GameService';
import Result from './Result';

const JoinGame = ({ setView, randomGame }) => {
    const { state: { contract, accounts } } = useEth();
    const [ethBet, setEthBet] = useState(0);
    const [maxJoiners, setMaxJoiners] = useState(0);
    const [totalJoiners, setTotalJoiners] = useState(0);
    const [infoFetched, setInfoFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBingo, setIsBingo] = useState(false);
    const [waitingForPlayers, setWaitingForPlayers] = useState(false);
    const [accusePending, setAccusePending] = useState(false);
    const [gameState, setGameState] = useState({
        gameId: randomGame ? '0' : '',
        gameStarted: false,
        gameEnded: false,
        card: [],
        result: [],
        amountWon: 0,
        winningAddress: '',
        creatorRefund: 0,
        creatorWon : null,
        winningReason : null,
    });
    const [extractedNumbers, setExtractedNumbers] = useState([]);
    const stateRef = useRef(gameState);
    const exNumRef = useRef(extractedNumbers);

    const [cardMatrix, setCardMatrix] = useState();
    // const subscribedToNumbers = false;
    const re = /^[0-9\b]+$/;


    const handleEvents = (data) => {
        if (data.event === 'GameStarted') {
            if (`${data.returnValues._gameId}` === stateRef.current.gameId) {
                setGameState(prevState => ({...prevState, gameStarted: true}));
                setWaitingForPlayers(false);
            }
        } else if (data.event === 'NumberExtracted') {
            if (`${data.returnValues._gameId}` === stateRef.current.gameId && !exNumRef.current.includes(data.returnValues.number)) {
                setExtractedNumbers([...exNumRef.current, data.returnValues.number]);
                notifyEvent();
                console.log("once")
            }
        } else if (data.event === 'ReceiveAccuse') {
            if (stateRef.current.gameStarted) {
                if (`${data.returnValues._gameId}` === stateRef.current.gameId)
                    setAccusePending(true);

            }
        } else if (data.event === 'ConfirmRemovedAccuse') {
            if (stateRef.current.gameStarted) {
                if (`${data.returnValues._gameId}` === stateRef.current.gameId) {
                    setAccusePending(false);
                }
            }
        } else if (data.event === 'NotBingo') {
            if (
                parseInt(data.returnValues._gameId) === parseInt(stateRef.current.gameId)
                && accounts[0].toLowerCase() !== data.returnValues.player.toLowerCase()
            ) {
                toast.error('Qualcuno ha chiamato bingo ma non lo era!');
            }
        } else if (data.event === 'GameEnded') {
            if (`${data.returnValues._gameId}` === stateRef.current.gameId && data.returnValues._winner.toLowerCase() !== accounts[0].toLowerCase()) {
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
            }
        } else {
            console.log(data);
        }
    }


    useEffect(() => {
        contract._events.allEvents().on('data', handleEvents)
        return () => {
            contract._events.allEvents().off('data', handleEvents);
        }
    }, []);

    useEffect(() => {
        stateRef.current = gameState;
    }, [gameState]);

    useEffect(() => {
        exNumRef.current = extractedNumbers;
    }, [extractedNumbers]);

    const joinGame = () => {
        setLoading(true);
        let _card = generateCard();
        setGameState(prevState => ({...prevState, card: _card}));
        setCardMatrix(getMatrix(_card));
        let merkleTree = generateMerkleTree(_card);
        contract.methods.joinGame(parseInt(gameState.gameId), `${merkleTree[merkleTree.length - 1][0]}`).send({
            from: accounts[0],
            gas: 20000000,
            // gasLimit: 180000,
            value: utils.toWei(ethBet, 'ether')

        })
        .then((logArray) => {
            setLoading(false);
            setWaitingForPlayers(true);
        })
        .catch((error) => {
            console.error('Error joining game:', error);
            setLoading(false);
            toast.error('Non posso entrare nel gioco selezionato!');
            setGameState(prevState => ({...prevState, gameId: randomGame ? '0' : ''}));
            setView("");
        });
    };

    const getInfoGame = () => {
        setLoading(true);
        const seed = Math.floor(Math.random() * 10000000);
        let id = gameState.gameId
        if (randomGame && gameState.gameId !== '0') {
            setGameState(prevState => ({...prevState, gameId:  '0'}));
            id = '0'
        }

        contract.methods.getInfoGame(parseInt(id), seed).send({
                from: accounts[0],
                gas: 200000000,
            })
        .then((logArray) => {
            if (logArray.events.GetInfo.returnValues._found) {
                setGameState(prevState => ({...prevState, gameId: `${logArray.events.GetInfo.returnValues._gameId}`}));
                setEthBet(parseInt(logArray.events.GetInfo.returnValues._ethAmount));
                setMaxJoiners(parseInt(logArray.events.GetInfo.returnValues._maxjoiners));
                setTotalJoiners(parseInt(logArray.events.GetInfo.returnValues._totalJoiners));
                setInfoFetched(true);
                setLoading(false);
            } else {
                if (randomGame) {
                    toast.error('Non ci sono giochi disponibili!');

                } else {
                    toast.error('Gioco non trovato!');
                }
                setGameState(prevState => ({...prevState, gameId: randomGame ? '0' : ''}));
                setLoading(false);
                setInfoFetched(false);
            }
        })
        .catch((error) => {
            console.error('Error fetching game info:', error);
            setLoading(false);
            toast.error('Non trovo il gioco selezionato!');
            setGameState(prevState => ({...prevState, gameId: randomGame ? '0' : ''}));
        });
    };
    const setResult = (result) => {
        setGameState(prevState => ({...prevState, result: result}));
    };

    const accusePlayer = () => {
        setLoading(true);
        contract.methods.accuse(parseInt(gameState.gameId)).send({
            from: accounts[0],
            gas: 2000000,
        })
        .then((logArray) => {
            setLoading(false);
            toast.success('Creatore accusato con successo!');
        })
        .catch((error) => {
            console.error('Error making accusation:', error);
            setLoading(false);
            toast.error('Non ho potuto accusare il creatore!');
        });
    };







    useEffect(() => {
        if (!gameState.result) {return;}
        const [bingo, combination] = isWinningCombination(gameState.result);
        if (gameState.result && bingo) {
            console.log('Bingo!');
            toast('Bingo!', {icon: '🥳'});
            setIsBingo(true);
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
      }, [gameState.gameStarted, gameState.gameEnded]);

  return (
        <div className="flex flex-col justify-center items-center">
          {gameState.gameStarted && (
            <h1 className="flex text-black dark:text-white text-center text-2xl">
              {`Numeri estratti: ${extractedNumbers.length > 5 ? extractedNumbers.slice(-5) : extractedNumbers}`}
            </h1>
          )}
          {!gameState.gameEnded && (
            <div>
              {!gameState.gameStarted ? (
                waitingForPlayers ? (
                  <LoadingScreen />
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {!infoFetched ? (
                      <InputSection
                        gameState={gameState}
                        re={re}
                        setGameState={setGameState}
                        randomGame={randomGame}
                        loading={loading}
                        getInfoGame={getInfoGame}
                        setView={setView}
                      />
                    ) : (
                      <GameInfo
                        gameState={gameState}
                        ethBet={ethBet}
                        maxJoiners={maxJoiners}
                        totalJoiners={totalJoiners}
                        loading={loading}
                        joinGame={joinGame}
                        setInfoFetched={setInfoFetched}
                      />
                    )}
                  </div>
                )
              ) : (
                <GameBoard
                  cardMatrix={cardMatrix}
                  setResult={setResult}
                  loading={loading}
                  accusePending={accusePending}
                  accusePlayer={accusePlayer}
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
          <div className="flex flex-col justify-center items-center">
            {gameState.gameEnded && (
              <Result
                accounts={accounts}
                maxPlayers={parseInt(maxJoiners)}
                state={gameState}
                imCreator={false}
                setView={setView}
              />
            )}
          </div>
        </div>
  );
};

const LoadingScreen = () => (
    <div className="grid grid-rows-2 gap-4">
      <h1 className="text-center text-2xl text-white">Aspetto che altri giocatori si connettano!</h1>
      <CircularProgress className="m-auto" />
    </div>
  );

  const InputSection = ({ gameState, re, setGameState, randomGame, loading, getInfoGame, setView }) => (
    <div className="grid grid-cols-1 gap-4">
      {!randomGame && (
        <input
          value={gameState.gameId}
          placeholder="ID stanza"
          className="text-field"
          onChange={(e) => {
            if (e.target.value === '' || re.test(e.target.value))
              {setGameState(prevState => ({
                ...prevState,
                gameId: e.target.value
              }));}
          }}
          id="outlined-basic"
          label="Game ID"
        />
      )}
      <Button
        variant="contained"
        className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
        onClick={getInfoGame}
        disabled={loading || gameState.gameId.trim() === '' || (!randomGame && gameState.gameId === '0')}
      >
        {loading ? 'Loading...' : 'Fetch Game Info'}
      </Button>
      <Button
        variant="outlined"
        className="dark:border-blue-500 dark:hover:border-blue-600 dark:text-blue-500 dark:hover:text-blue-600 border-blue-400 hover:border-blue-500 text-blue-400 hover:text-blue-500 items-center shadow-xl transition duration-300"
        onClick={() => setView('')}
      >
        Back
      </Button>
    </div>
  );

  const GameInfo = ({ gameState, ethBet, maxJoiners, totalJoiners, loading, joinGame, setInfoFetched }) => (
    <div className="flex flex-col justify-center items-center">
        <div className='dark:border-slate-800 dark:bg-slate-600 bg-slate-100
                       border-slate-200  border-2 mb-20 pt-5 pb-5 pl-10 pr-10 gap-3 rounded-3xl shadow-lg m-2'>
        <Typography
            className="text-center text-black dark:text-white"
            variant="h6"
        >
            🚪 ID stanza: {gameState.gameId}
        </Typography>
        <Typography className="text-center text-black dark:text-white"
                    variant="h6">
                💰 Puntata: {ethBet} ETH
        </Typography>
        <Typography className="text-center text-black dark:text-white"
                    variant="h6">
                👨‍👩‍👧‍👦 Giocatori in partita: {totalJoiners}/{maxJoiners}
        </Typography>
        </div>
        <div className="grid grid-cols-2 gap-4">
        <Button
            variant="contained"
            onClick={joinGame}
            className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
            disabled={gameState.gameId.trim() === '' || loading || gameState.gameId === '0'}
        >
            {loading ? 'Joining...' : 'Entra nella stanza'}
        </Button>
        <Button
            className="dark:border-blue-500 dark:hover:border-blue-600 dark:text-blue-500 dark:hover:text-blue-600 border-blue-400 hover:border-blue-500 text-blue-400 hover:text-blue-500 items-center shadow-xl transition duration-300"
            variant="outlined"
            onClick={() => setInfoFetched(false)}
        >
            Torna indietro
        </Button>
        </div>
    </div>
  );

  const GameBoard = ({ cardMatrix, setResult, loading, accusePending, accusePlayer, isBingo, submitWinningCombination, contract, accounts, gameState, setGameState }) => (
    <div className="flex flex-col gap-4">
        <Board size={5} table={cardMatrix} setResult={setResult} />
        <div className="flex flex-row gap-10 items-center justify-center">
            <Button
                className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
                variant="contained"
                onClick={accusePlayer}
                disabled={loading || accusePending}
            >
            {loading ? 'Loading...' : 'Accusa creatore'}
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

export default JoinGame;
