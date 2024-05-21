// SPDX-License-Identifier: MIT 
pragma solidity >=0.4.22 <0.9.0;

contract Bingo {
/**************************************************************************** */
/**           Struct containing all the info for a game                      **/
/**************************************************************************** */
    struct info {
    address creator;
    address[] joiners;
    uint maxJoiners;
    uint totalJoiners;
    uint ethBalance;
    uint betAmount;
    bytes32 creatorMerkleRoot;
    mapping(address => bytes32) joinerMerkleRoots; // Updated to a mapping
    uint accusationTime;
    address accuser;
}
/************************************************ */
/**            Global variables                  **/
/************************************************ */
    uint256 public gameId = 0; // Game ID counter
    mapping(uint256 => info) public gameList; // Mapping of game ID to game info
    uint256[] public elencoGiochiDisponibili;    // List of available game IDs



/***************************************** */
/**            Events                     **/
/***************************************** */
    event outputerror(string myError); // event: error output

    event GameCreated(uint256 indexed _gameId, uint256 _maxJoiners,uint256 _totalJoiners); //  Event to log game creation

    //TODO: implementa piu persone
    event GameJoined(
        uint256 indexed _gameId,
        address _creator,
        address _joiner, 
        uint256 _maxjoiners,
        uint256 _totalJoiners,
        uint256 _ethAmount
    );
    event Checkvalue(
        uint256 indexed _gameId,
        address _address,
        uint256 _row,
        uint256 _col
    );
    event GameStarted(
        uint256 indexed _gameId
            
    );
    event GameCancelled(uint256 indexed _gameId);
    //event to communicate the end of a game to all the joiners and the creator, loser is used if reason is that he cheated
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

    constructor() {
        
    }
    
    /*********************************************** */
    /**               GETTERS                       **/
    /*********************************************** */
    function getIDGame() private returns(uint256 ) {
        return ++gameId;
    }

    function getInfo(uint256 _gameId) private view returns (info storage) {
        // Restituisce la struttura dati "info" associata al gameId specificato
        return gameList[_gameId];
    }


    function getRandomNumber(uint256 _max) private view returns (uint256) {
       require(_max > 0, "Max must be greater than 0");
        // Generate the random number
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender)));
        // Ensure the result is within the desired range
        return (randomHash % _max);
    }

    function getRandomGame() private returns (uint256 idGiocoCasuale) {
        // Verifica se ci sono giochi disponibili
        if (elencoGiochiDisponibili.length == 0) {
            return 0;
        }
        uint256 indiceCasuale = getRandomNumber(elencoGiochiDisponibili.length);
        idGiocoCasuale = elencoGiochiDisponibili[indiceCasuale];// Ottiene l'ID del gioco corrispondente all'indice casuale
        //removeFromGiochiDisponibili(idGiocoCasuale);// Rimuove il gioco dalla lista degli ID disponibili se il massimo num di giocatori e' stato superato
        return idGiocoCasuale;
    }

    function getJoinerMerkleRoots(uint256 _gameId) public view returns (bytes32[] memory) {
        uint256 joinerCount = gameList[_gameId].joiners.length;
        bytes32[] memory merkleRoots = new bytes32[](joinerCount);        
        for (uint256 i = 0; i < joinerCount; i++) {
            address joiner = gameList[_gameId].joiners[i];
            merkleRoots[i] = gameList[_gameId].joinerMerkleRoots[joiner];
        }
        return merkleRoots;
    }

/************************************************ */
/**            Utility Functions                 **/
/************************************************ */
    function verifyMerkleProof(
        bytes32 _root,
        uint256[] memory _leafData,
        bytes32[] memory _proof
    ) internal pure returns (bool) {
        bytes32 computedHash = keccak256(abi.encodePacked(_leafData[0]));
        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];
            if (_leafData[i++] < uint256(computedHash)) {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            } else {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            }
        }
        return computedHash == _root;
    }

    function remove(uint256 _gameId) public  returns (bool) {
        uint256 index = findIndex(_gameId);
        // Verifica se l'elemento è stato trovato e se il numero totale di partecipanti raggiunge il limite
        if (index < elencoGiochiDisponibili.length) {
                // Sostituisce l'elemento da rimuovere con l'ultimo elemento
                elencoGiochiDisponibili[index] = elencoGiochiDisponibili[elencoGiochiDisponibili.length - 1];
                // Rimuove l'ultimo elemento
                elencoGiochiDisponibili.pop();
                return true;
            
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
        // Se l'elemento non è stato trovato, restituisci una posizione maggiore della lunghezza dell'array
        return elencoGiochiDisponibili.length+1;
    }

    function distributePrizetoAll(uint256 _gameId) public {
        info storage game = gameList[_gameId];
        uint256 betAmountPerPlayer = game.ethBalance /game.joiners.length;
        for (uint256 i = 0; i < game.joiners.length; i++) {
            address player = game.joiners[i];
            if (player != msg.sender) {
                payable(player).transfer(betAmountPerPlayer);
            }
        }
        if (game.creator != msg.sender) {
            payable(game.creator).transfer(betAmountPerPlayer);
        }
    }
    //returns true if the element is in the array
    function contains(address[] memory array, address element) internal pure returns (bool) {
        uint256 length = array.length;
        for (uint256 i = 0; i < length; i++) {
            if (array[i] == element) {
                return true;
            }
        }
        return false;
    }

    //remove an address from an array
    function remove(address[] memory array, address element) internal pure returns (address[] memory) {
        uint256 length = array.length;
        for (uint256 i = 0; i < length; i++) {
            if (array[i] == element) {
                array[i] = array[length - 1];
                assembly {
                    mstore(array, sub(length, 1))
                }
                return array;
            }
        }
        return array;
    }
    function removeFromGiochiDisponibili(uint256 _gameId) public  returns (bool) {
        uint256 index = findIndex(_gameId);
        // Verifica se l'elemento è stato trovato e se il numero totale di partecipanti raggiunge il limite
        if (index < elencoGiochiDisponibili.length) {
                // Sostituisce l'elemento da rimuovere con l'ultimo elemento
                elencoGiochiDisponibili[index] = elencoGiochiDisponibili[elencoGiochiDisponibili.length - 1];
                // Rimuove l'ultimo elemento
                elencoGiochiDisponibili.pop();
                return true;
            
        }
        return false;
    }

    /**************************************************************** */
    /**       Functions to handle main logic of game                 **/
    /**************************************************************** */

    function createGame(uint _maxJoiners, uint _betAmount) public payable {

        require(_maxJoiners > 0, "Max joiners must be greater than 0");
        require(_betAmount > 0, "Bet amount must be greater than 0");

        uint256 gameID = getIDGame();
        info storage newGame = gameList[gameID];
        newGame.creator = msg.sender;
        newGame.joiners = new address[](0);
        newGame.maxJoiners = _maxJoiners;
        newGame.totalJoiners = 0;
        newGame.ethBalance = 0;
        newGame.betAmount = _betAmount;
        newGame.creatorMerkleRoot = 0;
        newGame.accusationTime = 0;
        newGame.accuser = address(0);
        
        // Initialize the creator's merkle root mapping
        newGame.joinerMerkleRoots[msg.sender] = 0;

        elencoGiochiDisponibili.push(gameID);
    
        newGame.ethBalance +=  _betAmount;

        emit GameCreated(gameID,newGame.maxJoiners,newGame.totalJoiners);
    }


function joinGame(uint256 _gameId) public {
    require(elencoGiochiDisponibili.length > 0, "No available games!");
    uint256 chosenGameId;
    if (_gameId == 0) {
        do {
            chosenGameId = getRandomGame();
        } while (gameList[chosenGameId].creator == msg.sender);
        
    } else {
        chosenGameId = _gameId;
    }
    //check if the game is available and if the player is not the creator
    require(chosenGameId > 0, "Chosen id negative!");
    require(gameList[chosenGameId].totalJoiners < gameList[chosenGameId].maxJoiners, "Game already taken!");
    require(gameList[chosenGameId].creator != msg.sender, "You can't join a game created by yourself!");

    //add the player to the game
    gameList[chosenGameId].joiners.push(msg.sender);
    gameList[chosenGameId].totalJoiners++;
    gameList[chosenGameId].ethBalance += gameList[chosenGameId].betAmount;
    
    emit GameJoined( 
            chosenGameId,
            gameList[chosenGameId].creator,
            msg.sender,
            gameList[chosenGameId].maxJoiners,
            gameList[chosenGameId].totalJoiners,
            gameList[chosenGameId].ethBalance
    );
    if(gameList[chosenGameId].totalJoiners == gameList[chosenGameId].maxJoiners){
        removeFromGiochiDisponibili(chosenGameId);
        emit GameStarted(chosenGameId);
    }
}    

function amountEthDecision(uint256 _gameId, bool _response) public payable {
    require(_gameId > 0, "Game id is negative!");
    address sender = msg.sender;        
    require(gameList[_gameId].creator == sender || contains(gameList[_gameId].joiners, sender),
            "Player not in that game!"
    );

    if (!_response) {
        require(gameList[_gameId].creator != sender, "Creator cannot refuse their own game!");
        remove(gameList[_gameId].joiners,sender);
        elencoGiochiDisponibili.push(_gameId);
            //emith the amount eth refused
        emit AmountEthResponse(sender, gameList[_gameId].betAmount, _gameId, 0);
        } else {
            require(msg.value == gameList[_gameId].ethBalance, "ETH amount is wrong!");
            gameList[_gameId].betAmount += msg.value;
            //emit the amount eth accepted
            emit AmountEthResponse(sender, gameList[_gameId].ethBalance, _gameId, 1);
        }
    }

    function submitBoard(uint256 _gameId, bytes32 _merkleRoot) public {
        require(_gameId > 0, "Game id is negative!");
        info storage game = gameList[_gameId];
        address sender = msg.sender;
        require(
            gameList[_gameId].creator == sender || contains(gameList[_gameId].joiners, sender),
            "Player not in that game!"
        );
        require(
            (game.creator == sender && game.creatorMerkleRoot == 0) ||
            (contains(gameList[_gameId].joiners, sender) && game.joinerMerkleRoots[sender] == 0),
            "Board already submitted!"
        );
        if (game.creator == sender) {
            game.creatorMerkleRoot = _merkleRoot;
        } else {
            game.joinerMerkleRoots[sender] = _merkleRoot;
        }
    }
  
}