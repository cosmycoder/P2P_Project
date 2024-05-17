import { Button } from "@mui/material"; 
import useEth from "../contexts/EthContext/useEth";


const JoinRandomGame = ({setView}) => {
	const { state: { contract, accounts } } = useEth();

	const joinRandomGame = () => {
		contract.methods.joinGame(0).send({ from: accounts[0], gas: 20000000 }).then((logArray) => {
			console.log(parseInt(logArray.events.GameJoined.returnValues._gameId));
		});
	}

	return (
		<div className="flex justify-center items-center h-screen">
			<div  className="grid grid-cols-2 gap-4">
				<Button variant="contained" onClick={() => {joinRandomGame()}}>Unisciti a una stanza random</Button>
				<Button variant="outlined" onClick={() => {setView("")}}>Torna indietro</Button>
			</div>
		</div>
	)
}

export default JoinRandomGame;