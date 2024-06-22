
import toast from 'react-hot-toast';

import { generateMerkleProof } from './TableService';
import { utils } from 'web3';
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
                gameStarted : false,
                gameEnded : true,
                amountWon : utils.fromWei(logArray.events.GameEnded.returnValues._amountWonWei, 'ether'),
                winningAddress : logArray.events.GameEnded.returnValues._winner.toLowerCase(),
                creatorRefund : utils.fromWei(logArray.events.GameEnded.returnValues._creatorRefundWei, 'ether'),
                winningReason : logArray.events.GameEnded.returnValues._reason,
                creatorWon : logArray.events.GameEnded.returnValues._creatorWon,
            }));
        } else if (logArray.events.NotBingo) {
            toast.error('Non hai fatto bingo!');
        }
    }).catch((error) => {
        console.log(error);
        toast.error(`Error submitting card ${String(error)}`);
    });
};

export const notifyEvent = () => {
    const audio = new Audio('/number_extracted.mp3'); // Path to your sound file
    audio.play();
};

export const notifyVictory = () => {
    const audio = new Audio('/victory.mp3'); // Path to your sound file
    audio.play();
};
