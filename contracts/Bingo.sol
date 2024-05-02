// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.19;
contract Bingo {
    struct info {
        address creator;
        address[] joiners;
        uint maxJoiners;
        uint totalJoiners;
        uint ethBalance;
        uint betAmount;
        bytes32 creatorMerkleRoot;
        mapping(address => bytes32) joinerMerkleRoots; //TODO: implementa piu persone
        uint accusationTime;
        address accuser;
    }
    uint256 public gameId = 0; // Game ID counter
    mapping(uint256 => info) public gameList; // Mapping of game ID to game info
    uint256[] public elencoGiochiDisponibili;    // List of available game IDs

    error OutputError(string myError); // event: error output
    event GameCreated(uint256 indexed _gameId); //  Event to log game creation
    
    
    //TODO: implementa piu persone
    event GameJoined(
        uint256 indexed _gameId,
        address _creator,
        address _joiner, 
        uint256 _maxjoiners,
        uint256 _totalJoiners,
        uint256 _ethAmount
    );
    event GameStarted(
        uint256 indexed _gameId
            
    );
    event Checkvalue(
        uint256 indexed _gameId,
        address _address,
        uint256 _row,
        uint256 _col
    );
    //TODO: AGGIUNGI DIVERSI LOSERS
    event GameEnded(
        uint256 indexed _gameId,
        address _winner,
        address _loser,
        uint256 _reason
        );

    event ResolveAccuse(
        uint256 indexed _gameId,
        address _accuser
    );

    event AmountEthResponse(
        address _sender,
        uint256 _amount,
        uint256 indexed _gameId,
        uint256 _response
    );

    event GameEnded(uint256 indexed _gameId, address _winner);
    event GameCancelled(uint256 indexed _gameId);


    constructor() {
        // Add constructor code
    }
    
    function createGame(uint _maxJoiners, uint _betAmount) public payable {
        require(_maxJoiners > 0, "Max joiners must be greater than 0");
        require(_betAmount > 0, "Bet amount must be greater than 0");

        uint256 gameID = gameId++;
        info storage newGame = gameList[gameID];
        newGame.creator = msg.sender;
        newGame.maxJoiners = _maxJoiners;
        newGame.betAmount = _betAmount;
        newGame.ethBalance = msg.value;
        newGame.creatorMerkleRoot = 0;
        newGame.accusationTime = 0;
        newGame.accuser = address(0);

        elencoGiochiDisponibili.push(gameID);
        emit GameCreated(gameID);
    }
    

    function getIDGame() private returns(uint256 ) {
        return ++gameId;
    }
    function joinGame(uint256 _gameId) public {
        require(elencoGiochiDisponibili.length > 0, "No available games!");
        uint256 chosenGameId;
        if (_gameId == 0) {
            chosenGameId = randomGame();
        } else {
            chosenGameId = _gameId;
            require(removeFromArray(chosenGameId), "This game does not exist!");
        }

        require(chosenGameId > 0, "Chosen id negative!");
        require(gameList[chosenGameId].totalJoiners < gameList[chosenGameId].maxJoiners, "Game already taken!");
        require(gameList[chosenGameId].creator != msg.sender, "You can't join a game created by yourself!");

        gameList[chosenGameId].joiners.push(msg.sender);
        gameList[chosenGameId].totalJoiners++;
        emit GameJoined( 
            chosenGameId,
            gameList[chosenGameId].creator,
            msg.sender,
            gameList[chosenGameId].maxJoiners,
            gameList[chosenGameId].totalJoiners,
            gameList[chosenGameId].ethBalance
        );
    }

    function amountEthDecision(uint256 _gameId, bool _response) public payable {
    require(_gameId > 0, "Game id is negative!");

    address sender = msg.sender;

    require(
        gameList[_gameId].creator == sender || contains(gameList[_gameId].joiners, sender),
        "Player not in that game!"
    );

    if (!_response) {
        require(gameList[_gameId].creator != sender, "Creator cannot refuse their own game!");
        remove(gameList[_gameId].joiners,sender);
        elencoGiochiDisponibili.push(_gameId);

        emit AmountEthResponse(sender, gameList[_gameId].betAmount, _gameId, 0);
    } else {
        require(msg.value == gameList[_gameId].ethBalance, "ETH amount is wrong!");

        gameList[_gameId].betAmount += msg.value;

        emit AmountEthResponse(sender, gameList[_gameId].ethBalance, _gameId, 1);
    }
}



    
    function getInfo(uint256 _gameId) private view returns (info storage) {
        // Restituisce la struttura dati "info" associata al gameId specificato
        return gameList[_gameId];
    }

   function getRandomNumber(uint256 max) private view returns (uint256) {
    uint256 seed;
    assembly {
        // Ottieni il timestamp del blocco
        let timestampp := timestamp()
        // Ottieni l'indirizzo del mittente del messaggio
        let sender := caller()
        

        // Calcola l'hash keccak256
        seed := keccak256(timestampp,sender)
    }
    return seed % max;
}



    function randomGame() private returns (uint256 idGiocoCasuale) {
    // Verifica se ci sono giochi disponibili, altrimenti
    if (elencoGiochiDisponibili.length == 0) {
        return 0;
    }

    uint256 indiceCasuale = getRandomNumber(elencoGiochiDisponibili.length);
    idGiocoCasuale = elencoGiochiDisponibili[indiceCasuale];// Ottiene l'ID del gioco corrispondente all'indice casuale

    
    removeFromArray(idGiocoCasuale);// Rimuove il gioco dalla lista degli ID disponibili se il massimo num di giocatori e' stato superato
    return idGiocoCasuale;
}

function removeFromArray(uint256 _gameId) private returns (bool) {
    // Trova l'indice dell'elemento da rimuovere
    uint256 index = findIndex(_gameId);

    // Verifica se l'elemento è stato trovato e se il numero totale di partecipanti supera il limite
    if (index < elencoGiochiDisponibili.length && index >= 0) {
        info storage gameInfo = gameList[_gameId];
        if (gameInfo.totalJoiners > gameInfo.maxJoiners) {
            assembly {
                // Carica l'ultimo elemento dell'array
                let lastElement := sload(add(add(elencoGiochiDisponibili.slot, 0x20), mul(sub(sload(elencoGiochiDisponibili.slot), 1), 0x20)))
                // Sostituisci l'elemento da rimuovere con l'ultimo elemento
                sstore(add(add(elencoGiochiDisponibili.slot, 0x20), mul(index, 0x20)), lastElement)
                // Riduci la lunghezza dell'array
                sstore(elencoGiochiDisponibili.slot, sub(sload(elencoGiochiDisponibili.slot), 1))
            }
            return true;
        }
    }
    return false;
}


// Trova l'indice dell'elemento specificato nell'array elencoGiochiDisponibili
function findIndex(uint256 _gameId) private view returns (uint256) {
    for (uint256 i = 0; i < elencoGiochiDisponibili.length; i++) {
        if (elencoGiochiDisponibili[i] == _gameId) {
            return i;
        }
    }
    // Se l'elemento non è stato trovato, restituisci una posizione oltre la lunghezza dell'array
    return elencoGiochiDisponibili.length;
}



function contains(address[] memory array, address element) internal view returns (bool) {
    assembly {
        // Ottieni la lunghezza dell'array
        let length := mload(array)

        // Inizia il loop for con l'indice i = 0
        for {
            let i := 0
        } lt(i, length) { // Continua finché i < length
            // Incrementa l'indice i
            i := add(i, 1)
        } {
            // Controlla se l'elemento è uguale all'elemento cercato
            if eq(sload(add(add(array, 0x20), mul(i, 0x20))), element) {
                // Se trovi l'elemento, restituisci true
                let result := 1
                return(result, 32)
            }
        }
    }
    // Se l'elemento non è stato trovato, restituisci false
    return false;
}




function remove(address[] memory array, address element) internal pure returns (address[] memory) {
    uint256 length = array.length;
    // Cerca l'elemento nell'array
    for (uint256 i = 0; i < length; i++) {
        if (array[i] == element) {
            // Se trovi l'elemento, sposta l'ultimo elemento nell'indice corrente
            array[i] = array[length - 1];
            // Riduci la lunghezza dell'array
            assembly {
                mstore(array, sub(length, 1))
            }
            // Restituisci l'array con un elemento in meno
            return array;
        }
    }
    // Se l'elemento non è stato trovato, restituisci l'array originale
    return array;
}


    function submitBoard(uint256 _gameId, bytes32 _merkleRoot) public {
    // Verifica che l'ID del gioco sia valido
    require(_gameId > 0, "Game id is negative!");

    // Ottiene il gioco corrispondente all'ID fornito dalla mappa gameList
    info storage game = gameList[_gameId];
    // Ottiene l'indirizzo del mittente della transazione
    address sender = msg.sender;

    // Verifica che il mittente sia uno dei partecipanti al gioco
    require(
        gameList[_gameId].creator == sender || contains(gameList[_gameId].joiners, sender),
        "Player not in that game!"
    );

    // Verifica che il giocatore non abbia già inviato il proprio merkle root
    require(
        (game.creator == sender && game.creatorMerkleRoot == 0) ||
        (contains(gameList[_gameId].joiners, sender) && game.joinerMerkleRoots[sender] == 0),//TODO: aggiorna per piu utenti
        "Board already submitted!"
    );
    if (game.creator == sender) {
        game.creatorMerkleRoot = _merkleRoot;
    } else {
        game.joinerMerkleRoots[sender] = _merkleRoot;
    }
}

    function shot(uint256 _gameId, uint256 _row, uint256 _col) public {
    // Check if the game ID is valid
    require(_gameId > 0, "Invalid game ID");

    // Check if the sender is a participant in the game
    address sender = msg.sender;
    require(gameList[_gameId].creator == sender || contains(gameList[_gameId].joiners, sender), "Not a participant");

    // If there's an accuser, resolve the accusation
    if (gameList[_gameId].accuser != address(0)) {
        emit ResolveAccuse(_gameId, gameList[_gameId].accuser);
        gameList[_gameId].accuser = address(0);
        gameList[_gameId].accusationTime = 0;
    }

    // Determine opponent's address and emit the event
   /* address opponentAddress = (sender == gameList[_gameId].creator) ? gameList[_gameId].joiner : gameList[_gameId].creator;
    emit Checkvalue(_gameId, opponentAddress, _row, _col);*/
}



    // Add other functions as needed
}