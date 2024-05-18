import { Button, TextField, CircularProgress } from "@mui/material"; 
import useEth from "../contexts/EthContext/useEth";
import { useState } from "react";


const CreateRoom = ({setView}) => {
	const { state: { contract, accounts } } = useEth();
	const [maxPlayers, setMaxPlayers] = useState(2);
	const [ethBet, setEthBet] = useState(1);
	const [gameId, setGameId] = useState();
	const [waiting, setWaiting] = useState(false)
	const re = /^[0-9\b]+$/;
	const createGame = () => {
		const _maxPlayers = parseInt(maxPlayers);
		const _ethBet = parseInt(ethBet);
		contract.methods.createGame(_maxPlayers, _ethBet).send({ from: accounts[0], gas: 1000000 }).then((logArray) => {
			setGameId(parseInt(logArray.events.GameCreated.returnValues._gameId));
			console.log(parseInt(logArray.events.GameCreated.returnValues._gameId));
			//console.log(parseInt(logArray.events.GameCreated.returnValues._maxJoiners));
			//console.log(parseInt(logArray.events.GameCreated.returnValues._totalJoiners));
			setWaiting(true);
		});
	}
	return (
		<div className="flex justify-center items-center h-screen">
			{!waiting ? (<div className="grid grid-rows-2 gap-4">
				<TextField value={maxPlayers} onChange={(e) => {if (e.target.value === "" || re.test(e.target.value)) setMaxPlayers(e.target.value)}} id="outlined-basic" label="Massimo numero di giocatori" variant="outlined" />
				<TextField value={ethBet} onChange={(e) => {if (e.target.value === "" || re.test(e.target.value)) setEthBet(e.target.value)}} id="outlined-basic" label="ETH da scommettere" variant="outlined" />
				<div  className="grid grid-cols-2 gap-4">
					<Button variant="contained" onClick={() => {createGame()}}>Scommetti</Button>
					<Button variant="outlined" onClick={() => {setView("")}}>Torna indietro</Button>

				</div>
			</div>) :
			(
				<div className="grid grid-rows-2 gap-4">
					<h1 className="text-center text-2xl text-white">{`Stanza numero ${gameId}`}</h1>
					<h1 className="text-center text-2xl text-white">{"Aspetto che altri giocatori si connettano!"}</h1>
					<CircularProgress className="m-auto"/>
				</div>
			)
			
		}
		</div>
	)
}

export default CreateRoom;