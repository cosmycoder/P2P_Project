import { Button } from "@mui/material"; 
import useEth from "../contexts/EthContext/useEth";


const JoinRandomGame = ({setView}) => {
	const { state: { contract, accounts } } = useEth();

	const joinRandomGame = () => {
		contract.methods.joinGame(0).send({ from: accounts[0], gas: 20000000 }).then((logArray) => {
			console.log(parseInt(logArray.events.GameCreated.returnValues));
		});
	}

	return (
		<div className="flex justify-center items-center h-screen">
			<div  className="grid grid-cols-2 gap-4">
				<Button 
					className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
					hover:bg-blue-500 text-white items-center shadow-xl
					transition duration-300" 
					variant="contained"
					onClick={() => {joinRandomGame()}}>
						Unisciti a una stanza random
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
		</div>
	)
}

export default JoinRandomGame;