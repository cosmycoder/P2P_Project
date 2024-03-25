pragma solidity ^0.8.0;

contract Bingo {
    struct info {
        address creator;
        address[] joiners;
        uint maxJoiners;
        uint totalJoiners;
        uint ethBalance;
        uint betAmount;
        bytes32 creatorMerkleRoot;
        mapping(address => bytes32) joinerMerkleRoots;
        uint accusationTime;
        address accuser;
    }
    uint256 public gameId = 0; // Game ID counter
    mapping(uint256 => info) public gameList; // Mapping of game ID to game info
    uint256[] public availableGames;    // List of available game IDs

    event GameCreated(uint256 indexed _gameId); //  Event to log game creation

    
    constructor() {
        // Add constructor code
    }

    function createGame(uint _maxJoiners, uint _betAmount, bytes32 _creatorMerkleRoot)  public payable {
        require(_maxJoiners > 0, "Max joiners must be greater than 0");
        require(_betAmount > 0, "Bet amount must be greater than 0");
        require(_creatorMerkleRoot != bytes32(0), "Invalid creator merkle root");

    
        uint256[] memory gameID = getIDGame();
        gameList[gameID] = info({
            creator: msg.sender,
            joiners: new address[](0),
            maxJoiners: _maxJoiners,
            totalJoiners: 0,
            ethBalance: 0,
            betAmount: _betAmount,
            creatorMerkleRoot: _creatorMerkleRoot,
            accusationTime: 0,
            accuser: address(0)
        });
        availableGames.push(gameID);
        gameList[gameID].ethBalance += msg.value;
        emit GameCreated(gameID);
    }
    

    function getIDGame() private returns(uint256[] memory) {
        return ++gameId;
    }
    function join(uint256 _gameId) external{
        
    }

    // Add other functions as needed
}