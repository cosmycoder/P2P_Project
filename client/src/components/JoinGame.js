import React, { useState, useEffect } from "react";
import { Button, Typography, CircularProgress } from "@mui/material";
import useEth from "../contexts/EthContext/useEth";
import toast from "react-hot-toast";
import Board from "./Board";
import { generateMerkleTree, generateCard, getMatrix, isWinningCombination } from "../services/TableService";
import { submitWinningCombination } from "../services/GameService";
import Result from "./Result";
import web3 from "web3";
const JoinGame = ({ setView, randomGame }) => {
    const mockTable = [
        [67, 24, 45, 82, 13],
        [91, 56, 78, 33, 42],
        [10, 99, "🆓", 29, 54],
        [73, 17, 88, 36, 25],
        [47, 59, 3, 80, 66]
    ]
    const { state: { contract, accounts } } = useEth();
    const [ethBet, setEthBet] = useState(0);
    const [maxJoiners, setMaxJoiners] = useState(0);
    const [totalJoiners, setTotalJoiners] = useState(0);
    const [infoFetched, setInfoFetched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBingo, setIsBingo] = useState(false);
    const [waitingForPlayers, setWaitingForPlayers] = useState(false);
    const [error, setError] = useState("");
    const [winningCombination, setWinningCombination] = useState([]);

    const [gameState, setGameState] = useState({
        gameId: randomGame ? "0" : "",
        gameStarted: false,
        gameEnded: false,
        card: [],
        result: [],
        amountWon: 0,
        winningAddress: "",
        creatorRefund: 0,
    });
    const [cardMatrix, setCardMatrix] = useState();
    // const subscribedToNumbers = false;
    const [extractedNumbers, setExtractedNumbers] = useState([])

    const re = /^[0-9\b]+$/;


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
            value: web3.utils.toWei(ethBet, 'ether')

        })
            .then((logArray) => {
            console.log(parseInt(logArray.events.GameJoined.returnValues._gameId));
            setLoading(false);
            setWaitingForPlayers(true);
            })
            .catch((error) => {
            console.error("Error joining game:", error);
            setLoading(false);
            toast.error("Non posso entrare nel gioco selezionato!")
            setGameState(prevState => ({...prevState, gameId: randomGame ? "0" : ""}));
        });
    };


  const getInfoGame = () => {
    setLoading(true);
    contract.methods.getInfoGame(parseInt(gameState.gameId)).send({
            from: accounts[0],
            gas: 200000000,
            gasLimit: 50000,
        })
      .then((logArray) => {
        console.log(logArray)
        console.log(parseInt(logArray.events.GetInfo.returnValues._gameId));
        if (logArray.events.GetInfo.returnValues._found) {
            setEthBet(parseInt(logArray.events.GetInfo.returnValues._ethAmount));
            setMaxJoiners(parseInt(logArray.events.GetInfo.returnValues._maxjoiners));
            setTotalJoiners(parseInt(logArray.events.GetInfo.returnValues._totalJoiners));
            setInfoFetched(true);
            setLoading(false);
        } else {
            toast.error("Gioco non trovato!");
            setGameState(prevState => ({...prevState, gameId: randomGame ? "0" : ""}));
            setLoading(false);
            setInfoFetched(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching game info:", error);
        setLoading(false);
        toast.error("Non trovo il gioco selezionato!")
        setGameState(prevState => ({...prevState, gameId: randomGame ? "0" : ""}));
    });
  };
    const setResult = (result) => {
        setGameState(prevState => ({...prevState, result: result}));
    }

  const accusePlayer = () => {
    setLoading(true);
    contract.methods.accuse(parseInt(gameState.gameId)).send({
        from: accounts[0],
        gas: 2000000,
        gasPrice: 20000000000
    })
    .then((logArray) => {
        console.log(`Accusation made in game with ID: ${gameState.gameId}`);
        setLoading(false);
        toast.success("Accusation made successfully!");
        /*TODO: disabilita accusation button*/
    })
    .catch((error) => {
        console.error("Error making accusation:", error);
        setLoading(false);
        toast.error("Error making the accusation!");
    });
};
    useEffect(() => {
        try {
            contract._events.GameStarted().on('data', event => {
                setGameState(prevState => ({...prevState, gameStarted: true}));
                setWaitingForPlayers(false);
            }).on('error', console.error);
        } catch {}
    }, [contract, contract._events, contract._events.GameStarted()]);

    useEffect(() => {
        try {
            contract._events.NumberExtracted().on('data', event => {
            if (`${event.returnValues._gameId}` === gameState.gameId)
                setExtractedNumbers([...extractedNumbers, event.returnValues.number]);

            }).on('error', console.error);
        } catch {}
    }, [contract._events.NumberExtracted()]);

    useEffect(() => {
        try {
            if (gameState.gameStarted) {
                contract._events.NotBingo().on('data', event => {
                    if (
                        parseInt(event.returnValues._gameId) === parseInt(gameState.gameId)
                        && accounts[0].toLowerCase() != event.returnValues.player.toLowerCase()
                    ) {
                        console.log("Not bingo!");
                        toast.error("Qualcuno ha chiamato bingo ma non lo era!")
                    }
                }).on('error', console.error);
            }
        } catch {}
    }, [contract._events.NotBingo()]);

    useEffect(() => {
        try {
            if (gameState.gameStarted && !gameState.gameEnded) {
                contract._events.GameEnded().on('data', event => {
                    console.log(event.returnValues)
                    if (`${event.returnValues._gameId}` === gameState.gameId) {
                        toast("Gioco terminato!", {icon: 'ℹ️'});
			            setGameState(prevState => ({
                            ...prevState,
                            gameStarted : false,
                            gameEnded : true,
                            amountWon : event.returnValues._amountWon,
                            winningAddress : event.returnValues._winner.toLowerCase(),
                            creatorRefund : event.returnValues._creatorRefund,
                        }));
                    }
                }).on('error', console.error);
            }
        } catch {}
    }, [contract._events.GameEnded()]);

    useEffect(() => {
        if (!gameState.result) return;
        console.log(gameState.result)
        const [bingo, combination] = isWinningCombination(gameState.result)
        if (gameState.result && bingo) {
            console.log("Bingo!");
            toast("Bingo!", {icon: '🥳'});
            setIsBingo(true);
            setWinningCombination(combination);
        } else {
            setIsBingo(false);
        }
    }, [gameState.result]);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
    {gameState.gameStarted && <h1 className="flex text-black dark:text-white text-center text-2xl">{`Numeri estratti: ${extractedNumbers}`}</h1>}
    {
        !gameState.gameEnded &&
        <div>
        {!gameState.gameStarted ? waitingForPlayers ? (
            <div className="grid grid-rows-2 gap-4">
            <h1 className="text-center text-2xl text-white">Aspetto che altri giocatori si connettano!</h1>
            <CircularProgress className="m-auto" />
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
            {!infoFetched ? (

                <div className="grid grid-cols-1 gap-4">
                { !randomGame &&
                    <input
                    value={gameState.gameId}
                    placeholder="Game ID"
                    className="text-field"
                    onChange={(e) => {
                        //   setError("");
                        if (e.target.value === "" || re.test(e.target.value))
                            setGameState(prevState => ({
                                ...prevState,
                                gameId: e.target.value
                            }));

                    }}
                    id="outlined-basic"
                    label="Game ID"
                    // variant="outlined"
                    // error={!!error}
                    // helperText={error}
                    />

                }
                <Button
                    variant="contained"
                    className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
                                    hover:bg-blue-500 text-white items-center shadow-xl
                                        transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
                    onClick={getInfoGame}
                    disabled={loading || gameState.gameId.trim() === "" || (!randomGame && gameState.gameId === "0")}
                >
                    {loading ? 'Loading...' : 'Fetch Game Info'}
                </Button>
                <Button
                variant="outlined"
                className="dark:border-blue-500 dark:hover:border-blue-600
                                dark:text-blue-500 dark:hover:text-blue-600
                                border-blue-400 hover:border-blue-500
                                text-blue-400 hover:text-blue-500
                                items-center shadow-xl
                                transition duration-300"
                onClick={() => setView("")}>Back</Button>
                </div>
            ) : (
                <div>
                <Typography className="text-black dark:text-white" variant="h6">Game ID: {gameState.gameId}</Typography>
                <Typography className="text-black dark:text-white" variant="h6">ETH Bet: {ethBet}</Typography>
                <Typography className="text-black dark:text-white" variant="h6">Max Joiners: {maxJoiners}</Typography>
                <Typography className="text-black dark:text-white" variant="h6">Total Joiners: {totalJoiners}</Typography>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                    variant="contained"
                    onClick={joinGame}
                    className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
                    disabled={gameState.gameId.trim() === "" || loading || gameState.gameId === "0"}
                    >
                    {loading ? 'Joining...' : 'Join Game'}
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
            )}
            </div>
        ) : (
            <div className="flex flex-col gap-4">

            <div className="flex flex-col items-center">
        <Board size={5} table={cardMatrix} setResult={setResult}/>
        <div className="fixed bottom-4 right-4">
          <Button
            variant="contained"
            onClick={accusePlayer}
            className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400 hover:bg-blue-500 text-white items-center shadow-xl transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Accuse Player'}
          </Button>
        </div>
        </div>
            <Button
                className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
                hover:bg-blue-500 text-white items-center shadow-xl
                transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
                variant="outlined"
                disabled={!isBingo}
                onClick={
                    () => {
                        submitWinningCombination(
                            contract,
                            accounts,
                            gameState,
                            setGameState
                        );
                    }
                }
                >
                    Invia risultato
            </Button>

        </div>
        )}
        </div>
    }
    <div className="flex flex-col justify-center items-center" >
    {gameState.gameEnded && <Result contract={contract} accounts={accounts} state={gameState} ethBet={ethBet} setView={setView}/>}
    </div>
    </div>
  );
};

export default JoinGame;
