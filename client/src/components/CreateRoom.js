import { Button, CircularProgress, iconButtonClasses } from "@mui/material";
import useEth from "../contexts/EthContext/useEth";
import { useEffect, useState } from "react";
import Board from "./Board";
import toast from "react-hot-toast";
import { generateMerkleTree, generateCard, getMatrix } from "../services/TableService";

const CreateRoom = ({setView}) => {
	const mockTable = [
		[67, 24, 45, 82, 13],
		[91, 56, 78, 33, 42],
		[10, 99, "🆓", 29, 54],
		[73, 17, 88, 36, 25],
		[47, 59, 3, 80, 66]
	]

	const { state: { contract, accounts } } = useEth();
	const [maxPlayers, setMaxPlayers] = useState("");
	const [ethBet, setEthBet] = useState("");
	const [gameId, setGameId] = useState();
	const [waiting, setWaiting] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [card, setCard] = useState();
    const [cardMatrix, setCardMatrix] = useState();
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
        setCard(_card);
        setCardMatrix(getMatrix(_card));
        let merkleTree = generateMerkleTree(_card);
        console.log(merkleTree[merkleTree.length - 1][0]);
		contract.methods.createGame(_maxPlayers, _ethBet, `0x${merkleTree[merkleTree.length - 1][0]}`).send({ from: accounts[0], gas: 1000000 }).then((logArray) => {
			console.log(logArray)
			setGameId(parseInt(logArray.events.GameCreated.returnValues._gameId));
			setWaiting(true);
			toast.success("Gioco creato con successo!");
		}).catch((error) => {
			console.log(error);
			toast.error(`Error creating a game ${String(error)}`);
		});

		// contract._events.allEvents((evt, err) => {
        //     console.log(evt, err)
        // })
		// console.log(contract.events.GameStarted())

		// contract.events.GameStarted().then((event) => {
		// 	console.log(event);
		// }).catch((error) => {
		// 	toast.error(`Error waiting for the game to start ${String(error)}`)
		// });
		// contract.methods.joinGame(gameId).send({ from: accounts[0], gas: 1000000 }).then((logArray) => {
		// 	// handle more logic to print board
		// });
	}
    useEffect(() => {
        try {
            contract._events.GameStarted().on('data', event => {
                // console.log('Event received:', event);
                // console.log(event.returnValues);
                setGameStarted(true)
            }).on('error', console.error);
        } catch {}
    }, [contract]);
	return (
		<div className="flex justify-center items-center h-screen">
			{!waiting ? (<div className="grid grid-rows-2 gap-4">
				<input placeholder="Massimo numero di giocatori" className="text-field" value={maxPlayers} onChange={(e) => {if (e.target.value === "" || re.test(e.target.value)) setMaxPlayers(e.target.value)}} id="outlined-basic" label="Massimo numero di giocatori" variant="outlined" />
				<input placeholder="ETH da scommettere" className="text-field" value={ethBet} onChange={(e) => {if (e.target.value === "" || re.test(e.target.value)) setEthBet(e.target.value)}} id="outlined-basic" label="ETH da scommettere" variant="outlined" />
				<div  className="grid grid-cols-2 gap-4">
					<Button
						className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
								   hover:bg-blue-500 text-white items-center shadow-xl
									transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
						disabled={maxPlayers === "" || ethBet === ""}
						variant="contained"
						onClick={() => {createGame()}}>
							Scommetti
					</Button>

					<Button
						className="dark:border-blue-500 dark:hover:border-blue-600
									dark:text-blue-500 dark:hover:text-blue-600
									border-blue-400 hover:border-blue-500
									text-blue-400 hover:text-blue-500
									 items-center shadow-xl
									transition duration-300"
						variant="outlined"
						onClick={() => {setView("")}}>
							Torna indietro
					</Button>

				</div>
			</div>) : !gameStarted ? (
				<div className="grid grid-rows-2 gap-4">
					<h1 className="text-center text-2xl text-black dark:text-white">{`Stanza numero ${gameId}`}</h1>
					<h1 className="text-center text-2xl text-black dark:text-white">{"Aspetto che altri giocatori si connettano!"}</h1>
					<CircularProgress className="m-auto"/>
				</div>
			) : (
                <Board size={5} table={cardMatrix}/>
			)
			// 	... <Board size={5} table={mockTable}/>
		}
		</div>
	)
}

export default CreateRoom;
