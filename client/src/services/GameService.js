
import { generateMerkleProof } from "./TableService";
import toast from "react-hot-toast";

export const submitWinningCombination = (
    contract,
    accounts,
    state,
    setState
) => {
    console.log(state)
    const merkleProofs = generateMerkleProof(state.card, state.result);
    contract.methods.submitCard(state.gameId, merkleProofs).send({
        from: accounts[0],
        gas: 1000000,
        gasPrice: 20000000000
    }).then((logArray) => {
        if (logArray.events.GameEnded){
            toast("Gioco terminato!", {icon: 'ℹ️'});
            setState(prevState => ({
                ...prevState,
                gameStarted: false,
                gameEnded: true,
                amountWon: logArray.events.GameEnded.returnValues._amountWon,
                winningAddress: logArray.events.GameEnded.returnValues._winner.toLowerCase(),
            }));
        } else if (logArray.events.NotBingo) {
            toast.error("Non hai fatto bingo!")
        }
    }).catch((error) => {
        console.log(error);
        toast.error(`Error submitting card ${String(error)}`);
    });
}

export const transferEth = (
    contract,
    accounts,
    state,
    ethBet
) => {
    console.log(state)
    contract.methods.payPlayer(state.gameId, state.winningAddress).send({
        from: accounts[0],
        gas: 1000000,
        gasPrice: 20000000000,
        value: ethBet*20000000000
    }).then((logArray) => {
        console.log(logArray);
    }).catch((error) => {
        console.log(error);
        toast.error(`Error paying the winner ${String(error)}`);
    });
}
