// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
pragma experimental ABIEncoderV2; // Needed to use bytes32[][] as function parameter
contract Bingo {
/**************************************************************************** */
/**           Struct containing all the info for a game                      **/
/**************************************************************************** */

    struct Info {
        address creator;
        address[] joiners;
        uint maxJoiners;
        uint totalJoiners;
        uint ethBalance;
        uint betAmount;
        bytes32 creatorMerkleRoot;
        mapping(address => bytes32) joinerMerkleRoots; // Updated to a mapping
        uint8[] numbersExtracted;
        uint accusationTime;
        address accuser;
        uint numberExtractionWei;
    }
    enum WinningReasons {
        BINGO,
        CREATOR_STALLED
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
    int256 public lastGameId = 0; // Game ID counter
    mapping(int256 => Info) public gameList; // Mapping of game ID to game info
    int256[] public elencoGiochiDisponibili;    // List of available game IDs
    // mapping(uint8 => Cols) private COLS;
    // uint8[] private _FIRST_COL   = [0, 5, 10, 14, 19];
    // uint8[] private _SECOND_COL  = [1, 6, 11, 15, 20];
    // uint8[] private _THIRD_COL   = [2, 7, 16, 21];
    // uint8[] private _FOURTH_COL  = [3, 8, 12, 17, 22];
    // uint8[] private _FIFTH_COL   = [4, 9, 13, 18, 23];








/***************************************** */
/**            Events                     **/
/***************************************** */

    event GameCreated(int256 indexed _gameId, uint256 _maxJoiners,uint256 _totalJoiners); //  Event to log game creation
    event Log(string message);
    //TODO: implementa piu persone
    event GameJoined(
        int256 indexed _gameId,
        address _creator,
        address _joiner,
        uint256 _maxjoiners,
        uint256 _totalJoiners,
        uint256 _ethAmount
    );
    event GetInfo(
        int256 indexed _gameId,
        uint256 _maxjoiners,
        uint256 _totalJoiners,
        uint256 _ethAmount,
        bool _found
    );
    event Checkvalue(
        int256 indexed _gameId,
        address _address,
        uint256 _row,
        uint256 _col
    );
    event GameStarted(int256 indexed _gameId);

    event NumberExtracted(int256 _gameId, uint8 number);

    event GameCancelled(uint256 indexed _gameId);
    //event to communicate the end of a game to all the joiners and the creator, loser is used if reason is that he cheated
    event NotBingo(int256 indexed _gameId, address player);

    event GameEnded(
        int256 indexed _gameId,
        address _winner,
        uint256 _amountWon,
        uint256 _creatorRefund,
        WinningReasons _reason
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
    function getGameId() private returns(int256) {
        return ++lastGameId;
    }

    function getInfo(int256 _gameId) private view returns (Info storage) {
        // Restituisce la struttura dati "info" associata al gameId specificato
        return gameList[_gameId];
    }

    function getInfoGame(int256 _gameId) public {
        // Verifica se ci sono giochi disponibili
        require(_gameId >= 0, "Game ID must be greater than 0!");
        if(_gameId == 0){
            int256 gameId = getRandomGame();
            if (gameId < 0)
                emit GetInfo(_gameId, 0, 0, 0, false);
            else
                emit GetInfo(gameId, gameList[gameId].maxJoiners, gameList[gameId].totalJoiners, gameList[gameId].betAmount, true);
        }else{
            if(findIndex(_gameId) > elencoGiochiDisponibili.length)
                emit GetInfo(_gameId, 0, 0, 0, false);
                // revert("Reverted because game is not available!");
            else
                emit GetInfo(_gameId, gameList[_gameId].maxJoiners, gameList[_gameId].totalJoiners, gameList[_gameId].betAmount, true);
        }
    }


    function getRandomNumber(uint256 _max) private view returns (uint256) {
       require(_max > 0, "Max must be greater than 0");
        // Generate the random number
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender)));
        // Ensure the result is within the desired range
        return (randomHash % _max);
    }

    function getRandomGame() private view returns (int256 idGiocoCasuale) {
        // Verifica se ci sono giochi disponibili
        if (elencoGiochiDisponibili.length == 0) {
            return -1;
        }
        uint256 indiceCasuale = getRandomNumber(elencoGiochiDisponibili.length);
        idGiocoCasuale = elencoGiochiDisponibili[indiceCasuale];// Ottiene l'ID del gioco corrispondente all'indice casuale
        //removeFromGiochiDisponibili(idGiocoCasuale);// Rimuove il gioco dalla lista degli ID disponibili se il massimo num di giocatori e' stato superato
        return idGiocoCasuale;
    }

    function getJoinerMerkleRoots(int256 _gameId) public view returns (bytes32[] memory) {
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
        string memory _leaf,
        bytes32[] memory _proof,
        uint256 _index
    ) internal pure returns (bool) {
        bytes32 _hash = keccak256(abi.encodePacked(_leaf));
        // Starting from 2 to avoid resizing the proof array
        for (uint256 i = 2; i < _proof.length; i++) {
            if (_index % 2 == 0) {
                _hash = keccak256(abi.encodePacked(_hash, _proof[i]));
            } else {
                _hash = keccak256(abi.encodePacked(_proof[i], _hash));
            }
            _index /= 2;
        }
        return _hash == _root;
    }

    function removeGame(int256 _gameId) public returns (bool) {
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
    function findIndex(int256 _gameId) private view returns (uint256) {
        for (uint256 i = 0; i < elencoGiochiDisponibili.length; i++) {
            if (elencoGiochiDisponibili[i] == _gameId) {
                return i;
            }
        }
        // Se l'elemento non è stato trovato, restituisci una posizione maggiore della lunghezza dell'array
        return elencoGiochiDisponibili.length+1;
    }

    function distributePrizetoAll(int256 _gameId) public {
        Info storage game = gameList[_gameId];
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
    function containsAddress(address[] memory array, address element) internal pure returns (bool) {
        uint256 length = array.length;
        for (uint256 i = 0; i < length; i++) {
            if (array[i] == element) {
                return true;
            }
        }
        return false;
    }

    //remove an address from an array
    function removeAddress(address[] memory array, address element) internal pure returns (address[] memory) {
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

    function removeFromGiochiDisponibili(int256 _gameId) public  returns (bool) {
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

    function createGame(uint _maxJoiners, uint _betAmount, bytes32 _cardMerkleRoot) public payable {
        require(_maxJoiners > 0, "Max joiners must be greater than 0");
        require(_betAmount > 0, "Bet amount must be greater than 0");
        require(msg.sender.balance/1 ether >= _betAmount, "Cannot bet more than you can afford!");
        int256 gameId = getGameId();
        Info storage newGame = gameList[gameId];
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

        elencoGiochiDisponibili.push(gameId);

        newGame.ethBalance += _betAmount;

        emit GameCreated(
            gameId,
            newGame.maxJoiners,
            newGame.totalJoiners
        );
    }


    function joinGame(int256 _gameId, bytes32 _cardMerkleRoot) public payable {
        require(_gameId >= 0, "Game ID must be greater than 0!");
        require(elencoGiochiDisponibili.length > 0, "No available games!");

        int256 chosenGameId;
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
        require(msg.sender.balance/1 ether >= gameList[chosenGameId].betAmount, "Cannot bet more than you can afford!");
        require(msg.value/1 ether == gameList[chosenGameId].betAmount, "Please send the correct bet amount!");

        for (uint i = 0; i < gameList[chosenGameId].joiners.length; i++) {
            require(
                gameList[chosenGameId]
                    .joinerMerkleRoots[gameList[chosenGameId]
                    .joiners[i]] != _cardMerkleRoot, "Invalid merkle root!");
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

    function isExtracted(uint8[] memory numbersList, uint8 newNumber) internal pure returns(bool) {
        for (uint i = 0; i < numbersList.length; i++) {
            if (numbersList[i] == newNumber) return true;
        }
        return false;
    }

    function getNewNumber(int256 seed) internal view returns(uint8) {
        uint256 randomHash = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, seed)));
        uint256 randomNumber = (randomHash % 75) + 1;
        return uint8(randomNumber);
    }

    function extractNumber(int256 _gameId) public {
        uint startGas = gasleft();
        require(gameList[_gameId].numbersExtracted.length <= 75, "All numbers have been extracted!");
        uint8 newNumber = getNewNumber(_gameId);
        int8 i = 1;
        while (isExtracted(gameList[_gameId].numbersExtracted, newNumber)) {
            newNumber = getNewNumber(_gameId+i);
            i++;
        }
        gameList[_gameId].numbersExtracted.push(newNumber);
        emit NumberExtracted(_gameId, newNumber);
        gameList[_gameId].numberExtractionWei += (startGas - gasleft()) * tx.gasprice;
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    function stringToUint(string memory s) public pure returns (uint256) {
        bytes memory b = bytes(s);
        uint256 result = 0;
        for (uint256 i = 0; i < b.length; i++) {
            // Ensure the character is a digit
            require(b[i] >= 0x30 && b[i] <= 0x39, "Invalid character");
            result = result * 10 + (uint256(uint8(b[i])) - 48);
        }
        return result;
    }
    function submitCard(int256 _gameId, bytes32[][] memory _merkleProofs) public {
        require(_gameId > 0, "Game id is negative!");
        require(
            gameList[_gameId].creator == msg.sender || containsAddress(gameList[_gameId].joiners, msg.sender),
            "Player not in that game!"
        );
        // require(
        //     (game.creator == msg.sender && game.creatorMerkleRoot == 0) ||
        //     (containsAddress(gameList[_gameId].joiners, msg.sender) && game.joinerMerkleRoots[msg.sender] == 0),
        //     "Card already submitted!"
        // );
        bytes32 root = gameList[_gameId].creator == msg.sender
                       ? gameList[_gameId].creatorMerkleRoot
                       : gameList[_gameId].joinerMerkleRoots[msg.sender];
        bool isNumberExtracted = false;
        for (uint8 i = 0; i < _merkleProofs.length; i++) {
            isNumberExtracted = false;
            for (uint8 j = 0; j < gameList[_gameId].numbersExtracted.length; j++) {
                if (gameList[_gameId].numbersExtracted[j] == stringToUint(bytes32ToString(_merkleProofs[i][0]))){
                    isNumberExtracted = true;
                    break;
                }
            }
            if (!isNumberExtracted || !verifyMerkleProof(root, bytes32ToString(_merkleProofs[i][0]), _merkleProofs[i], stringToUint(bytes32ToString(_merkleProofs[i][1])))){
                emit NotBingo(_gameId, msg.sender);
                return;
            }
        }
        uint creatorRefund = gameList[_gameId].numberExtractionWei/1 ether;
        uint prize = (gameList[_gameId].ethBalance*1 ether)- creatorRefund;
        emit GameEnded(_gameId, msg.sender, gameList[_gameId].ethBalance, creatorRefund, WinningReasons.BINGO);
        payable(msg.sender).transfer(prize);
        payable(gameList[_gameId].creator).transfer(creatorRefund);
    }
}
