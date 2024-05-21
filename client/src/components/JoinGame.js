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
							className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
							hover:bg-blue-500 text-white items-center shadow-xl
							 transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
							disabled={gameId.trim() === ""}
						>
							Unisciti
						</Button>
						<Button
						className="dark:border-blue-500 dark:hover:border-blue-600
						dark:text-blue-500 dark:hover:text-blue-600
						border-blue-400 hover:border-blue-500
						text-blue-400 hover:text-blue-500
						 items-center shadow-xl
						transition duration-300"
						variant="outlined" onClick={() => setView("")}>Torna indietro</Button>
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
