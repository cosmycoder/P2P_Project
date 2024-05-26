const winningCombinations = {
    ROW1: [0, 1, 2, 3, 4],
    ROW2: [5, 6, 7, 8, 9],
    ROW3: [10, 11, 12, 13],
    ROW4: [14, 15, 16, 17, 18],
    ROW5: [19, 20, 21, 22, 23],

    COL1: [0, 5, 10, 14, 19],
    COL2: [1, 6, 11, 15, 20],
    COL3: [2, 7, 16, 21],
    COL4: [3, 8, 12, 17, 22],
    COL5: [4, 9, 13, 18, 23],

    DIAG1: [0, 6, 17, 23],
    DIAG2: [4, 8, 15, 19],
};

export function isWinningCombination(card) {
    for (const combination in winningCombinations) {
        const indexes = winningCombinations[combination];
        if (indexes.every(index => card[index])) {
            return true;
        }
    }
    return false;
}

