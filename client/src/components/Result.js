import { Button, Typography } from "@mui/material";
import { transferEth } from "../services/GameService";
const Result = ({contract, accounts, state, ethBet, setView}) => {
    const winningMessage = state.winningAddress === accounts[0].toLowerCase()
        ? `🏆 Congratulazioni! Hai vinto ${state.amountWon} ETH! 🏆`
        : `🙁 Il giocatore ${state.winningAddress} ha vinto ${state.amountWon} ETH 🙁`
    // if (state.winningAddress !== accounts[0].toLowerCase()) {
    //     transferEth(contract, accounts, state, ethBet);
    // }
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <Typography className="text-black dark:text-white text-center" variant="h6">{winningMessage}</Typography>
            <div className="">
                <Button
                className="dark:bg-blue-500 dark:hover:bg-blue-600 bg-blue-400
                hover:bg-blue-500 text-white items-center shadow-xl
                transition duration-300 dark:disabled:bg-gray-500 disabled:bg-gray-300"
                variant="outlined"
                onClick={() => setView("")}
                >
                    Torna alla home
                </Button>
            </div>
        </div>
    );
};

export default Result;
