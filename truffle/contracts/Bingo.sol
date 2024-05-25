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
    // enum Cols {
    //     FIRST_COL,
    //     SECOND_COL,
    //     THIRD_COL,
    //     FOURTH_COL,
    //     FIFTH_COL
    // }
/************************************************ */
/**            Global variables                  **/
/************************************************ */
    uint256 public gameId = 0; // Game ID counter
    mapping(uint256 => info) public gameList; // Mapping of game ID to game info
    uint256[] public elencoGiochiDisponibili;    // List of available game IDs
    // mapping(uint8 => Cols) private COLS;
    // uint8[] private _FIRST_COL   = [0, 5, 10, 14, 19];
    // uint8[] private _SECOND_COL  = [1, 6, 11, 15, 20];
    // uint8[] private _THIRD_COL   = [2, 7, 16, 21];
    // uint8[] private _FOURTH_COL  = [3, 8, 12, 17, 22];
    // uint8[] private _FIFTH_COL   = [4, 9, 13, 18, 23];








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
    event GetInfo(
        uint256 indexed _gameId,
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
        /** Code used for the verification of the table
        for (uint i = 0; i < 5; i++) {
            COLS[_FIRST_COL[i]]  = Cols.FIRST_COL;
            COLS[_SECOND_COL[i]] = Cols.SECOND_COL;
            COLS[_THIRD_COL[i]]  = Cols.THIRD_COL;
            COLS[_FIFTH_COL[i]]  = Cols.FIFTH_COL;
            if (i < 4) {
                COLS[_FOURTH_COL[i]] = Cols.FOURTH_COL;

            }
        }
        */
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

    function getInfoGame(uint256 _gameid) public{
        // Verifica se ci sono giochi disponibili
        require(_gameid >= 0, "Game id is negative!");
        if(_gameid == 0){
            uint256 gameID = getRandomGame();
            require(gameID != 0, "No available games!");
            emit GetInfo(gameID, gameList[gameID].maxJoiners, gameList[gameID].totalJoiners, gameList[gameID].betAmount);
            return;
        }else{
            if(findIndex(_gameid) > elencoGiochiDisponibili.length){
                revert("Reverted because game is not available!");
            }
            emit GetInfo(_gameid, gameList[_gameid].maxJoiners, gameList[_gameid].totalJoiners, gameList[_gameid].betAmount);
            return;
        }
    }


    function getRandomNumber(uint256 _max) private view returns (uint256) {
       require(_max > 0, "Max must be greater than 0");
        // Generate the random number
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender)));
        // Ensure the result is within the desired range
        return (randomHash % _max);
    }

    function getRandomGame() private view returns (uint256 idGiocoCasuale) {
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
        bytes32  _leaf,
        bytes32[] memory _proof,
        uint _index
    ) internal pure returns (bool) {
        bytes32 _hash = _leaf;
        for (uint256 i = 0; i < _proof.length; i++) {
            if (_index % 2 == 0) {
                _hash = keccak256(abi.encodePacked(_hash, _proof[i]));
            } else {
                _hash = keccak256(abi.encodePacked(_proof[i], _hash));
            }
            _index /= 2;
        }
        return _hash == _root;
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

    /** This code has been implemented to perform a table check. It should be implemented in a proper backend not to burn a huge amount of gas
    function uint8ToBytes32(uint8 _value) public pure returns (bytes32 result) {
        assembly {
            mstore(result, shl(248, _value)) // Shift left by 248 to pad with zeros
        }
    }

    function computeCardHash(uint8[24] memory card) internal pure returns (bytes32) {
        bytes memory cardBytes = new bytes(24 * 32);
        uint8 pos = 0;
        for (uint256 i = 0; i < 24; i++) {
            bytes32 elementBytes = uint8ToBytes32(card[i]); // uint to bytes
            for (uint256 k = 0; k < 32; k++) {
                cardBytes[pos] = elementBytes[k];
                pos++;
            }
        }
        return keccak256(cardBytes);
    }

    function isCardValid(uint256 _gameId, uint8[24] memory card) internal view returns (bool, bytes32) {
        bool[75] memory numberSeen;
        bytes32 _cardHash = 0;
        _cardHash = computeCardHash(card);
        for (uint i = 0; i < gameList[_gameId].joiners.length; i++) {
            if (
                gameList[_gameId].joinersCardHashes[gameList[_gameId].joiners[i]] != 0 &&
                gameList[_gameId].joinersCardHashes[gameList[_gameId].joiners[i]] != _cardHash) {
                for (uint8 j = 0; j < 24; j++) {
                    if (COLS[j] == Cols.FIRST_COL && (card[j] < 1 || card[j] > 15)) {
                        return (false, bytes32(0));
                    } else if (COLS[j] == Cols.SECOND_COL && (card[j] < 16 || card[j] > 30)) {
                        return (false, bytes32(0));
                    } else if (COLS[j] == Cols.THIRD_COL && (card[j] < 31 || card[j] > 45)) {
                        return (false, bytes32(0));
                    } else if (COLS[j] == Cols.FOURTH_COL && (card[j] < 61 || card[j] > 75)) {
                        return (false, bytes32(0));
                    } else if (COLS[j] == Cols.FIFTH_COL && (card[j] < 46 || card[j] > 60)) {
                        return (false, bytes32(0));
                    }
                    if (numberSeen[card[j]-1]) {
                        return (false, bytes32(0));
                    }
                    numberSeen[card[j]-1] = true;
                }
            } else if (gameList[_gameId].joinersCardHashes[gameList[_gameId].joiners[i]] == _cardHash) {
                return (false, bytes32(0));
            }
        }
        return (true, _cardHash);
    }

    */
    /**************************************************************** */
    /**       Functions to handle main logic of game                 **/
    /**************************************************************** */

    function createGame(uint _maxJoiners, uint _betAmount, bytes32 _cardMerkleRoot) public payable {

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
        newGame.creatorMerkleRoot = _cardMerkleRoot;
        newGame.accusationTime = 0;
        newGame.accuser = address(0);

        // Initialize the creator's merkle root mapping
        newGame.joinerMerkleRoots[msg.sender] = 0;

        elencoGiochiDisponibili.push(gameID);

        newGame.ethBalance +=  _betAmount;

        emit GameCreated(gameID,newGame.maxJoiners,newGame.totalJoiners);
    }


    function joinGame(uint256 _gameId, bytes32 _cardMerkleRoot) public {
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
        require(gameList[chosenGameId].creatorMerkleRoot != _cardMerkleRoot, "Invalid merkle root!");
        for (uint i = 0; i < gameList[chosenGameId].joiners.length; i++) {
            require(gameList[chosenGameId].joinerMerkleRoots[gameList[chosenGameId].joiners[i]] != _cardMerkleRoot, "Invalid merkle root!");
        }
        //add the player to the game
        gameList[chosenGameId].joiners.push(msg.sender);
        gameList[chosenGameId].totalJoiners++;
        gameList[chosenGameId].ethBalance += gameList[chosenGameId].betAmount;
        gameList[chosenGameId].joinerMerkleRoots[msg.sender] = _cardMerkleRoot;

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

    // function submitCard(uint256 _gameId, bytes32 _merkleRoot) public {
    //     require(_gameId > 0, "Game id is negative!");
    //     info storage game = gameList[_gameId];
    //     address sender = msg.sender;
    //     require(
    //         gameList[_gameId].creator == sender || contains(gameList[_gameId].joiners, sender),
    //         "Player not in that game!"
    //     );
    //     require(
    //         (game.creator == sender && game.creatorMerkleRoot == 0) ||
    //         (contains(gameList[_gameId].joiners, sender) && game.joinerMerkleRoots[sender] == 0),
    //         "Card already submitted!"
    //     );
    //     if (game.creator == sender) {
    //         game.creatorMerkleRoot = _merkleRoot;
    //     } else {
    //         game.joinerMerkleRoots[sender] = _merkleRoot;
    //     }
    // }

}
