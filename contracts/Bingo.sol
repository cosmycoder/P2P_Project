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
    bytes32 joinerMerkleRoots; //TODO: implementa piu persone
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
    
    function createGame(uint _maxJoiners, uint _betAmount)  public payable {
        require(_maxJoiners > 0, "Max joiners must be greater than 0");
        require(_betAmount > 0, "Bet amount must be greater than 0");

    
        uint256 gameID = getIDGame();
        info memory newGame;
        newGame.creator = msg.sender;
        newGame.joiners = new address[](0);
        newGame.maxJoiners = _maxJoiners;
        newGame.totalJoiners = 0;
        newGame.ethBalance = 0;
        newGame.betAmount = _betAmount;
        newGame.creatorMerkleRoot = 0;
        newGame.joinerMerkleRoots = 0; //TODO: aggiorna per piu utenti
        newGame.accusationTime = 0;
        newGame.accuser = address(0);
       
        gameList[gameID] = newGame;
           
        elencoGiochiDisponibili.push(gameID);
        gameList[gameID].ethBalance += msg.value;
        emit GameCreated(gameID);
    }
    

    function getIDGame() private returns(uint256 ) {
        return ++gameId;
    }
    function join(uint256 _gameId) external{
        
    }
    
    function getInfo(uint256 _gameId) private view returns (info memory) {
        // Restituisce la struttura dati "info" associata al gameId specificato
        return gameList[_gameId];
    }

    function getRandomNumber(uint256 max) private view  returns (uint256) {

        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
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
    if (index < elencoGiochiDisponibili.length) {
        info storage gameInfo = gameList[_gameId];
        if (gameInfo.totalJoiners > gameInfo.maxJoiners) {
            // Sostituisci l'elemento da rimuovere con l'ultimo elemento nell'array
            elencoGiochiDisponibili[index] = elencoGiochiDisponibili[elencoGiochiDisponibili.length - 1];
            // Rimuovi l'ultimo elemento (che ora si trova in posizione index)
            elencoGiochiDisponibili.pop();
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



    // Add other functions as needed
}