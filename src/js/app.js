App = {
  web3Provider: null,
  contracts: {},

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
      App.contracts.Bingo = TruffleContract(BingoArtifact);
    
      // Set the provider for our contract
      App.contracts.Bingo.setProvider(App.web3Provider);
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    //$(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '#createNewGameBtn', App.handleCreateRoom);


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
  
  gameCreation: function () {
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
  handleCreateRoom: function () { // function to show the create game menu
    $('#newGame').show();
    $('#initialsection').hide();
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
