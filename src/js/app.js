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
    return newInstance.amountEthDecision(gameId, false, { value: 0 });//TODO check if the value is needed
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
  
    App.contracts.BattleShipGame.deployed().then(async function (instance) {
      const newInstance = instance;
      return newInstance.joinGame(chosenGame);
    }).then(async function (logs) {
      const gameId = logs.logs[0].args._gameId.toNumber();
      const ethAmount = logs.logs[0].args._ethAmount.toNumber();
      const boardSize = logs.logs[0].args._boardSize.toNumber();
      const shipNumber = logs.logs[0].args._shipNum.toNumber();
  
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
  

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
    
      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
      console.log(error);
      }
      var account = accounts[0];
      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
        }).catch(function(err) {
        console.log(err.message);
        });
    });

  },
  
  createGame: function () {
    boardSize = 5; // Bingo board size
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
  }
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
