import { Button, TextField, CircularProgress } from "@mui/material";
import useEth from "../contexts/EthContext/useEth";
import { useState } from "react";

const JoinGame = ({ setView }) => {
    const { state: { contract, accounts } } = useEth();
	const [gameId, setGameId] = useState(""); // Inizializza come stringa vuota
	const [waiting, setWaiting] = useState(false);
	const [error, setError] = useState(""); // Stato per l'errore
	const re = /^[0-9\b]+$/;

	const joinGame = () => {
        if (gameId.trim() === "") {
            setError("Il numero della stanza è obbligatorio");
            return;
        }
        const _gameId = parseInt(gameId);
		contract.methods.joinGame(_gameId).send({ from: accounts[0], gas: 1000000 }).then((logArray) => {
			setGameId(parseInt(logArray.events.GameJoined.returnValues._gameId));
			console.log(parseInt(logArray.events.GameJoined.returnValues._gameId));
			setWaiting(true);
		});
	}

	return (
		<div className="flex justify-center items-center h-screen">
			{!waiting ? (
				<div className="grid grid-rows-3 gap-4">
					<TextField
						value={gameId}
						onChange={(e) => {
							setError(""); // Resetta l'errore quando l'utente digita
							if (e.target.value === "" || re.test(e.target.value)) setGameId(e.target.value);
						}}
						id="outlined-basic"
						label="Numero della stanza"
						variant="outlined"
						error={!!error}
						helperText={error}
					/>
					<div className="grid grid-cols-2 gap-4">
						<Button 
							variant="contained" 
							onClick={joinGame}
							disabled={gameId.trim() === ""}
						>
							Unisciti
						</Button>
						<Button variant="outlined" onClick={() => setView("")}>Torna indietro</Button>
					</div>
				</div>
			) : (
				<div className="grid grid-rows-2 gap-4">
					<h1 className="text-center text-2xl text-white">Aspetto che altri giocatori si connettano!</h1>
					<CircularProgress className="m-auto"/>
				</div>
			)}
		</div>
	);
}

export default JoinGame;
