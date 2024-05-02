
var gameId = null;
var ethAmmount = null;
var boardSize = 5;
App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },


  
  initContract: function() {
    $.getJSON('Bingo.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var BingoArtifact = data;
      console.log(BingoArtifact);
      App.contracts.Bingo = TruffleContract(BingoArtifact);
    
      // Set the provider for our contract
      App.contracts.Bingo.setProvider(App.web3Provider);
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    console.log("Binding events...");



    console.log($('#newGame'));
    $(document).on('click', '#createNewGameBtn', App.handleCreateRoom);
    $(document).on('click', '#backToMenuBtn', App.backToMainMenu);
    $(document).on('click', '#createGameBtn', App.createGame);
    $(document).on('click', '#joinRandomGameBtn', App.joinRandomGame);
    $(document).on('click', '#joinGameBtn', App.joinedSpecific);
    $(document).on('click', '#acceptAmountBtn', App.acceptEthAmount);
    // button to refuse the Ethereum amount
    $(document).on('click', '#refuseAmountBtn', App.refuseEthAmount);

},
showAcceptEthAmount: function() {
  $('#joinSpecificGame').hide();
  $('#initialsection').hide();
  
  var acceptAmountText = document.getElementById('acceptAmountText');
  acceptAmountText.innerHTML = "<h2>Do you want to start the game with id " + gameId +
    "<h2>The amount of ETH to bet is " + ethAmmount + " ETH.</h2>";
  $('#acceptAmount').show();
},

acceptEthAmount: function() {
  App.contracts.Bingo.deployed().then(async function(instance) {
    const newInstance = instance;
    return newInstance.amountEthDecision(gameId, true, { value: (ethAmount * 1000000000000000000) });
  }).then(async function(logArray) {
    App.handleEvents();
  }).catch(function(err) {
    console.log(err.message);
  });
},
refuseEthAmount: function() {
  App.contracts.Bingo.deployed().then(async function(instance) {
    const newInstance = instance;
    return newInstance.amountEthDecision(gameId, false);//TODO check if the value is needed
  }).then(async function(logArray) {
    App.handleEvents();
  }).catch(function(err) {
    console.log(err.message);
  });
},


  joinRandomGame: function () {
   App.joinedGame (true);
  },


  joinedSpecific: function () {
    $('#joinSpecificGame').show();
    $("#initialsection").hide();
    $(document).on('click', '#joinGameIdBtn', App.joinedGame(false));
  },

  joinedGame: function (randomized) {
    let chosenGame;
    if (randomized === true) {
      chosenGame = 0;
      $('#setUpNewGame').hide();
    } else {
      chosenGame = $('#selectedGameId').val();
    }
  
    App.contracts.Bingo.deployed().then(async function (instance) {
      const newInstance = instance;
      return newInstance.joinGame(chosenGame);
    }).then(async function (logs) {
      const gameId = logs.logs[0].args._gameId.toNumber();
      const ethAmount = logs.logs[0].args._ethAmount.toNumber();
      
  
      const myBoardMatrix = [];
      const opponentBoardMatrix = [];
      for (let i = 0; i < boardSize; i++) {
        myBoardMatrix[i] = [];
        opponentBoardMatrix[i] = [];
        for (let j = 0; j < boardSize; j++) {
          myBoardMatrix[i][j] = 0;
          opponentBoardMatrix[i][j] = 0;
        }
      }
  
      App.showAcceptEthAmount();
    }).catch(function (error) {
      console.log(error.message);
    });
  },
  
  createGame: function () {
    ethAmmount = $('#ethAmmount').val();
    iHostTheGame = true;
    // Call to the contract
    App.contracts.Bingo.deployed().then(async function (instance) {
      newInstance = instance;
      return newInstance.createGame({ value: 0 }); // No value needed for bingo
    }).then(async function (logArray) { // Callback to the contract function createGame
      gameId = logArray.logs[0].args._gameId.toNumber(); // Get the gameId from the event emitted in the contract
      if (gameId < 0) {
        console.error("Something went wrong, game id is negative!");
      }
      else {
        // Waiting room:
        $('#newGame').hide();
        $('#waitingOpponent').show();
        document.getElementById('waitingOpponentConnection').innerHTML = "<h2>Creation of a Bingo board.</h2>" +
          "<h2>Waiting for an opponent! The Game ID is " + gameId + "!</h2>";
  
        // Board matrix initialization
        bingoBoard = [];
  
        for (var i = 0; i < boardSize; i++) {
          bingoBoard[i] = [];
          for (var j = 0; j < boardSize; j++) {
            bingoBoard[i][j] = 0;
          }
        }
  
        // Waiting for the opponent:
        App.handleEvents();
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },
  handleCreateRoom: function (event) { // function to show the create game menu
    $("#newGame").show();
    $("#initialsection").hide();
  },
  backToMainMenu: function (event) { // function for back to the menu
    // show the main menu:
    console.log("back to menu");
    $('#initialsection').show();
    // hide all the remaining parts:
    $('#newGame').hide();
    $('#joinSpecificGame').hide();
    $('#waitingOpponent').hide();
    $('#acceptAmount').hide();
    $('#gameBoard').hide();
  },
  generateMerkleProof: function(merkleTree, row, col, boardSize) {
    const merkleProof = [];
    let flatIndex = row * boardSize + col;

    for (let i = 0; i < merkleTree.length - 1; i++) {
        const siblingIndex = (flatIndex % 2 == 0) ? flatIndex + 1 : flatIndex - 1;
        merkleProof.push(merkleTree[i][siblingIndex]);
        flatIndex = Math.floor(flatIndex / 2);
    }

    return merkleProof;
  },
  createBoardTable: function () {
    // Function to create a board for the placement phase
    // Get the div "gameBoard" and add the template size
    const board = document.getElementById('gameBoard');
    board.style = "grid-template-columns: 40px repeat(" + boardSize + ", 1fr);grid-template-rows: 40px repeat(" + boardSize + ", 1fr);"
  
    // Creation of the header column:
    for (let j = 0; j <= boardSize; j++) {
      const headerCell = document.createElement("div");
      headerCell.classList.add("header-cell");
      if (j > 0) {
        headerCell.textContent = String.fromCharCode(64 + j);
      }
      board.appendChild(headerCell);
    }
  
    for (let i = 0; i < boardSize; i++) {
      // Creation of the header row
      const headerCell = document.createElement("div");
      headerCell.classList.add("header-cell");
      headerCell.textContent = i + 1;
  
      board.appendChild(headerCell);
  
      // Creation of the board with placing button and dropdown menu
      for (let j = 0; j < boardSize; j++) {
        const cell = document.createElement("div");
        cell.classList.add("my-cell");
        cell.dataset.row = i;
        cell.dataset.col = j;
  
        // Create dropdown menu
        const dropdown = document.createElement("select");
        dropdown.addEventListener("change", (event) => {
          const selectedNumber = parseInt(event.target.value);
          if (!isNaN(selectedNumber)) {
            // Check if selected number is not already selected in other cells
            const selectedNumbers = Array.from(document.querySelectorAll(".my-cell select"))
              .map(select => parseInt(select.value))
              .filter(value => !isNaN(value));
            if (!selectedNumbers.includes(selectedNumber)) {
              // Set selected number to cell's dataset
              cell.dataset.value = selectedNumber;
            } else {
              // Reset dropdown if number is already selected
              dropdown.value = "";
              alert("Number already selected in another cell.");
            }
          }
        });
  
        // Add options to dropdown
        for (let number = 1; number <= 99; number++) {
          const option = document.createElement("option");
          option.value = number;
          option.textContent = number;
          dropdown.appendChild(option);
        }
  
        cell.appendChild(dropdown);
        board.appendChild(cell);
      }
    }
  },
  handleEvents: function() {
    App.contracts.Bingo.deployed().then(async function(instance) {
      const newInstance = instance;
      // Event listener for gameCreated event
      newInstance.gameCreated({}, { fromBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          const gameId = event.args._gameId.toNumber();
          const ethAmount = event.args._ethAmount.toNumber();
          console.log("Game created with ID: " + gameId + ", ETH amount: " + ethAmount);
          // TODO: Handle the gameCreated event
        } else {
          console.error(error);
        }
      });

      // Event listener for gameJoined event
      newInstance.gameJoined({}, { fromBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          const gameId = event.args._gameId.toNumber();
          const player = event.args._player;
          console.log("Player " + player + " joined game with ID: " + gameId);
          // TODO: Handle the gameJoined event
        } else {
          console.error(error);
        }
      });

      // Event listener for amountEthDecision event
      newInstance.amountEthDecision({}, { fromBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          const gameId = event.args._gameId.toNumber();
          const player = event.args._player;
          const accepted = event.args._accepted;
          console.log("Player " + player + " made an ETH amount decision for game with ID: " + gameId + ", Accepted: " + accepted);
          // TODO: Handle the amountEthDecision event
        } else {
          console.error(error);
        }
      });

      // Event listener for gameStarted event
      newInstance.gameStarted({}, { fromBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          const gameId = event.args._gameId.toNumber();
          console.log("Game with ID: " + gameId + " started");
          // TODO: Handle the gameStarted event
        } else {
          console.error(error);
        }
      });

      // Event listener for numberCalled event
      newInstance.numberCalled({}, { fromBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          const gameId = event.args._gameId.toNumber();
          const number = event.args._number.toNumber();
          console.log("Number " + number + " called for game with ID: " + gameId);
          // TODO: Handle the numberCalled event
        } else {
          console.error(error);
        }
      });

      // Event listener for gameEnded event
      newInstance.gameEnded({}, { fromBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          const gameId = event.args._gameId.toNumber();
          const winner = event.args._winner;
          console.log("Game with ID: " + gameId + " ended, Winner: " + winner);
          // TODO: Handle the gameEnded event
        } else {
          console.error(error);
        }
      });
    }).catch(function(err) {
      console.log(err.message);
    });

    
  },







  

};
function loader()
{
    document.getElementById("guscioloader").style.display="flex";
}
$(function() {
  $(window).load(function() {
    App.init();
  });
});
