
import toast from 'react-hot-toast';

import { generateMerkleProof } from './TableService';
export const submitWinningCombination = (
    contract,
    accounts,
    state,
    setState
) => {
    console.log(state);
    const merkleProofs = generateMerkleProof(state.card, state.result);
    contract.methods.submitCard(state.gameId, merkleProofs).send({
        from: accounts[0],
        gas: 100000000,
        gasLimit: 500000000
    }).then((logArray) => {
        if (logArray.events.GameEnded){
            toast('Gioco terminato!', {icon: 'ℹ️'});
            setState(prevState => ({
                ...prevState,
                gameStarted: false,
                gameEnded: true,
                amountWon: logArray.events.GameEnded.returnValues._amountWon,
                winningAddress: logArray.events.GameEnded.returnValues._winner.toLowerCase(),
            }));
        } else if (logArray.events.NotBingo) {
            toast.error('Non hai fatto bingo!');
        }
    }).catch((error) => {
        console.log(error);
        toast.error(`Error submitting card ${String(error)}`);
    });
};

