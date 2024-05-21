import React, { useState } from "react";
import { Button, Typography, CircularProgress } from "@mui/material";
import useEth from "../contexts/EthContext/useEth";

const JoinRandomGame = ({ setView }) => {
  const { state: { contract, accounts } } = useEth();
  const [gameId, setGameId] = useState(0);
  const [ethBet, setEthBet] = useState(0);
  const [maxJoiners, setMaxJoiners] = useState(0);
  const [totalJoiners, setTotalJoiners] = useState(0);
  const [infoFetched, setInfoFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);

  const joinRandomGame = () => {
    setLoading(true);
    contract.methods.joinGame(0).send({ from: accounts[0], gas: 20000000 }).then((logArray) => {
      console.log(parseInt(logArray.events.GameJoined.returnValues._gameId));
      setLoading(false);
      setWaitingForPlayers(true); // Show waiting message after joining
    }).catch((error) => {
      console.error("Error joining game:", error);
      setLoading(false);
    });
  };

  const getInfoGame = () => {
    setLoading(true);
    contract.methods.getInfoGame(0).send({ from: accounts[0], gas: 20000000 }).then((logArray) => {
      console.log(parseInt(logArray.events.GetInfo.returnValues._gameId));
      setGameId(parseInt(logArray.events.GetInfo.returnValues._gameId));
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
          {infoFetched ? (
            <div>
              <Typography variant="h6">Game ID: {gameId}</Typography>
              <Typography variant="h6">ETH Bet: {ethBet}</Typography>
              <Typography variant="h6">Max Joiners: {maxJoiners}</Typography>
              <Typography variant="h6">Total Joiners: {totalJoiners}</Typography>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="contained" onClick={joinRandomGame} disabled={loading || gameId === 0}>
                  {loading ? 'Joining...' : 'Join Game'}
                </Button>
                <Button variant="outlined" onClick={() => setInfoFetched(false)}>Back</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <Button variant="contained" onClick={getInfoGame} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Game Info'}
              </Button>
              <Button variant="outlined" onClick={() => setView("")}>Back</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JoinRandomGame;
