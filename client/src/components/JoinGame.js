import React, { useState } from "react";
import { Button, Typography, CircularProgress, TextField } from "@mui/material";
import useEth from "../contexts/EthContext/useEth";

const JoinGame = ({ setView }) => {
  const { state: { contract, accounts } } = useEth();
  const [gameId, setGameId] = useState("");
  const [ethBet, setEthBet] = useState(0);
  const [maxJoiners, setMaxJoiners] = useState(0);
  const [totalJoiners, setTotalJoiners] = useState(0);
  const [infoFetched, setInfoFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [error, setError] = useState(""); 

  const joinGame = () => {
    setLoading(true);
    contract.methods.joinGame(parseInt(gameId)).send({ from: accounts[0], gas: 20000000 }).then((logArray) => {
      console.log(parseInt(logArray.events.GameJoined.returnValues._gameId));
      setLoading(false);
      setWaitingForPlayers(true);
    }).catch((error) => {
      console.error("Error joining game:", error);
      setLoading(false);
    });
  };

  const getInfoGame = () => {
    setLoading(true);
    contract.methods.getInfoGame(parseInt(gameId)).send({ from: accounts[0], gas: 20000000 }).then((logArray) => {
      console.log(parseInt(logArray.events.GetInfo.returnValues._gameId));
      setEthBet(parseInt(logArray.events.GetInfo.returnValues._ethAmount));
      setMaxJoiners(parseInt(logArray.events.GetInfo.returnValues._maxjoiners));
      setTotalJoiners(parseInt(logArray.events.GetInfo.returnValues._totalJoiners));
      setInfoFetched(true);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching game info:", error);
      setLoading(false);
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      {waitingForPlayers ? (
        <div className="grid grid-rows-2 gap-4">
          <h1 className="text-center text-2xl text-white">Aspetto che altri giocatori si connettano!</h1>
          <CircularProgress className="m-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {!infoFetched ? (
            <div className="grid grid-cols-1 gap-4">
              <TextField
                value={gameId}
                onChange={(e) => {
                  setError("");
                  setGameId(e.target.value);
                }}
                id="outlined-basic"
                label="Game ID"
                variant="outlined"
                error={!!error}
                helperText={error}
              />
              <Button variant="contained" onClick={getInfoGame} disabled={loading || gameId.trim() === ""|| gameId ==="0"}>
                {loading ? 'Loading...' : 'Fetch Game Info'}
              </Button>
              <Button variant="outlined" onClick={() => setView("")}>Back</Button>
            </div>
          ) : (
            <div>
              <Typography variant="h6">Game ID: {gameId}</Typography>
              <Typography variant="h6">ETH Bet: {ethBet}</Typography>
              <Typography variant="h6">Max Joiners: {maxJoiners}</Typography>
              <Typography variant="h6">Total Joiners: {totalJoiners}</Typography>
              <div className="grid grid-cols-2 gap-4">
              <Button
							variant="contained"
							onClick={joinGame}
							className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
							hover:bg-blue-500 text-white items-center shadow-xl
							 transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
							disabled={gameId.trim() === ""||loading || gameId === "0"}
						  >
							  {loading ? 'Joining...' : 'Join Game'}
						  </Button>
            
              <Button
						    className="dark:border-blue-500 dark:hover:border-blue-600
						    dark:text-blue-500 dark:hover:text-blue-600
						    border-blue-400 hover:border-blue-500
						    text-blue-400 hover:text-blue-500
						    items-center shadow-xl
						    transition duration-300"
						    variant="outlined" onClick={() => setInfoFetched(false)}>Torna indietro</Button>
      
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinGame;
