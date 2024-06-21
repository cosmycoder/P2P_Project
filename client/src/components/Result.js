import { Button, Typography } from '@mui/material';
import { notifyVictory } from '../services/GameService';
const Result = ({accounts, maxPlayers, state, imCreator, setView}) => {
    console.log(state.amountWon, maxPlayers);
    const winningMessage = state.winningAddress === accounts[0].toLowerCase()
        ? `🏆 Congratulazioni! Hai vinto ${Number(state.amountWon)} ETH! 🏆`
        : state.winningAddress === '0x0000000000000000000000000000000000000000'
        ? `🫢 Il creatore si è bloccato, la sua quota è stata divisa fra tutti i giocatori (${Number(state.amountWon)/maxPlayers} ETH per ogni giocatore) 🫢`
        : `🙁 Il giocatore ${state.winningAddress} ha vinto ${Number(state.amountWon)} ETH 🙁`;
    // if (state.winningAddress !== accounts[0].toLowerCase()) {
    //     transferEth(contract, accounts, state, ethBet);
    // }
    if (state.winningAddress === accounts[0].toLowerCase() || (!imCreator && state.winningAddress === '0x0000000000000000000000000000000000000000'))
        notifyVictory();



    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Typography className="text-black dark:text-white text-center" variant="h6">{winningMessage}</Typography>
            <Typography className="text-black dark:text-white text-center" variant="h6">Il creatore è stato rimborsato di {state.creatorRefund} ETH</Typography>
            {/* <Typography className="text-black dark:text-white text-center" variant="h6">{`Il creatore è stato rimborsato di ${utils.fromWei(state.creatorRefund, "ether")} ETH`}</Typography> */}
            <div className="">
                <Button
                    className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
                    hover:bg-blue-500 text-white items-center shadow-xl
                    transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
                    variant="outlined"
                    onClick={() => setView('')}
                >
                    Torna alla home
                </Button>
            </div>
        </div>
    );
};

export default Result;
