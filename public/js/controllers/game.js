<<<<<<< HEAD
/* eslint-disable */
angular.module('mean.system')
    .controller('GameController', ['$scope', 'game', '$timeout',
        '$location', '$window', 'MakeAWishFactsService', '$dialog',
        function ($scope, game, $timeout, $location, $window, MakeAWishFactsService, $dialog) {
            $scope.hasPickedCards = false;
            $scope.winningCardPicked = false;
            $scope.showTable = false;
            $scope.modalShown = false;
            $scope.game = game;
            $scope.pickedCards = [];
            let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
            $scope.makeAWishFact = makeAWishFacts.pop();
            $scope.chat = game.gameChat;
            $scope.userName = $window.user;
            let dialog = document.getElementById('showMyDialog');
            if (!dialog.showModal) {
                dialogPolyfill.registerDialog(dialog);
            }
            /**
            * Method to scroll the chat thread to the bottom
            * so user can see latest message when messages overflow
            * @return{undefined}
            */
            const scrollChatThread = () => {
                const chatResults = document.getElementById('results');
                if (chatResults) {
                    chatResults.scrollTop = chatResults.scrollHeight;
                }
            };

            $scope.$watchCollection('chat.messageArray', (newValue, oldValue) => {
                $timeout(() => {
                    scrollChatThread();
                }, 100);
            });

            $scope.gameState = {
                awaitingPlayers: function() {
                    return $scope.game.state === 'awaiting players';
                },

                ended: function() {
                    return $scope.game.state === 'game ended';
                },

                dissolved: function() {
                    return $scope.game.state === 'game dissolved';
                },

                awaitingCzar: function() {
                    return $scope.game.state === 'waiting for czar to decide';
                },

                winnerChosen: function() {
                    return $scope.game.state === 'winner has been chosen';
                },

                noWinner: function() {
                    return game.gameWinner === -1;
                },
                userWon: function() {
                    return game.gameWinner === game.playerIndex;
                },
                userLost: function () {
                    return game.gameWinner !== game.playerIndex;
                }
            };

            /**
            * Method to send messages
            * @param{String} userMessage - String containing the message to be sent
            * @return{undefined}
            */
            $scope.sendMessage = (userMessage) => {
                $scope.chat.postGroupMessage(userMessage);
                $scope.chatMessage = '';
                document.getElementsByClassName('emoji-wysiwyg-editor')[0].innerHTML = '';
            };

            $scope.pickCard = function(card) {
                if (!$scope.hasPickedCards) {
                    if ($scope.pickedCards.indexOf(card.id) < 0) {
                        $scope.pickedCards.push(card.id);
                        if (game.curQuestion.numAnswers === 1) {
                            $scope.sendPickedCards();
                            $scope.hasPickedCards = true;
                        } else if (game.curQuestion.numAnswers === 2 &&
                            $scope.pickedCards.length === 2) {
                            //delay and send
                            $scope.hasPickedCards = true;
                            $timeout($scope.sendPickedCards, 300);
                        }
                    } else {
                        $scope.pickedCards.pop();
                    }
                }
            };
            $scope.keyPressed = function($event) {
                const keyCode = $event.which || $event.keyCode;
                if (keyCode === 13) {
                    $scope.sendMessage(document.getElementById('text').value);
                }
            };

            $scope.showChat = function() {
                $scope.chat.chatWindowVisible = !$scope.chat.chatWindowVisible;
                // enableChatWindow;
                if ($scope.chat.chatWindowVisible) {
                    $scope.chat.unreadMessageCount = 0;
                }
            };

            $scope.pointerCursorStyle = function() {
                if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
                    return { 'cursor': 'pointer' };
                } else {
                    return {};
                }
            };

            $scope.sendPickedCards = function() {
                game.pickCards($scope.pickedCards);
                $scope.showTable = true;
            };

            $scope.cardIsFirstSelected = function(card) {
                if (game.curQuestion.numAnswers > 1) {
                    return card === $scope.pickedCards[0];
                } else {
                    return false;
                }
            };

            $scope.cardIsSecondSelected = function(card) {
                if (game.curQuestion.numAnswers > 1) {
                    return card === $scope.pickedCards[1];
                } else {
                    return false;
                }
            };

            $scope.firstAnswer = function($index) {
                if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.secondAnswer = function($index) {
                if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.showFirst = function(card) {
                return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
            };

            $scope.showSecond = function(card) {
                return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
            };

            $scope.isCzar = function() {
                return game.czar === game.playerIndex;
            };

            $scope.isPlayer = function($index) {
                return $index === game.playerIndex;
            };

            $scope.isCustomGame = function() {
                return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
            };

            $scope.isPremium = function($index) {
                return game.players[$index].premium;
            };

            $scope.currentCzar = function($index) {
                return $index === game.czar;
            };

            $scope.winningColor = function($index) {
                if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
                    return $scope.colors[game.players[game.winningCardPlayer].color];
                } else {
                    return '#f9f9f9';
                }
            };

            $scope.pickWinning = function(winningSet) {
                if ($scope.isCzar()) {
                    game.pickWinning(winningSet.card[0]);
                    $scope.winningCardPicked = true;
                }
            };

            $scope.winnerPicked = function() {
                return game.winningCard !== -1;
            };

            $scope.startGame = function() {
                game.startGame();
            };

            $scope.saveGame = function() {
                game.saveGame();
            }

            $scope.closeModal = function() {
                $scope.modalInstance.close();
            };

            $scope.abandonGame = function() {
                game.leaveGame();
                $window.location.href = '/#!/play-with';
            };

            // Catches changes to round to update when no players pick card
            // (because game.state remains the same)
            $scope.$watch('game.round', function() {
                $scope.hasPickedCards = false;
                $scope.showTable = false;
                $scope.winningCardPicked = false;
                $scope.makeAWishFact = makeAWishFacts.pop();
                if (!makeAWishFacts.length) {
                    makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
                }
                $scope.pickedCards = [];
            });

            // In case player doesn't pick a card in time, show the table
            $scope.$watch('game.state', function() {
                if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
                    $scope.showTable = true;
                }
            });

            $scope.$watch('game.gameID', function() {
                if (game.gameID && game.state === 'awaiting players') {
                    if (!$scope.isCustomGame() && $location.search().game) {
                        // If the player didn't successfully enter the request room,
                        // reset the URL so they don't think they're in the requested room.
                        $location.search({});
                    } else if ($scope.isCustomGame() && !$location.search().game) {
                        // Once the game ID is set, update the URL if this is a game with friends,
                        // where the link is meant to be shared.
                        $location.search({ game: game.gameID });
                        if (!$scope.modalShown) {
                            setTimeout(function() {
                                var link = document.URL;
                                var txt = 'Give the following link to your friends so they can join your game: ';
                                $('#lobby-how-to-play').text(txt);
                                $('#oh-el').css({ 'text-align': 'center', 'font-size': '22px', 'background': 'white', 'color': 'black' }).text(link);
                            }, 200);
                            $scope.modalShown = true;
                        }
                    }
                }
            });

            if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
                if ($scope.userName) {
                    game.joinGame('joinGame', $location.search().game);
                } else { $window.location.href = '/#!/signup';; }
            } else if ($location.search().custom) {
                game.joinGame('joinGame', null, true);
            } else {
                game.joinGame();
            }

            if ($scope.isCustomGame() && $scope.isCzar) {
                $scope.showDialog = true;
                dialog.showModal();
                dialog.querySelector('.proceed').addEventListener('click', function() {
                    dialog.close();
                    $scope.saveGame();
                });
            } else {
                document.getElementById('showMyDialog').style.display = 'none';
            }
            dialog.querySelector('.close').addEventListener('click', function() {
                dialog.close();
                $window.location.href = '/#!/play-with';
            });
        }]);
=======
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
angular.module('mean.system')
  .controller('GameController', ['$scope', 'game', '$timeout',
    '$location', '$window', 'MakeAWishFactsService', '$dialog',
    ($scope, game, $timeout, $location, $window,
      MakeAWishFactsService, $dialog) => {
      $scope.hasPickedCards = false;
      $scope.winningCardPicked = false;
      $scope.showTable = false;
      $scope.modalShown = false;
      $scope.game = game;
      $scope.pickedCards = [];
      let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      $scope.makeAWishFact = makeAWishFacts.pop();
      $scope.chat = game.gameChat;
      $scope.userName = $window.user;
      const dialog = document.getElementById('showMyDialog');
      if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
      }
      /**
       * Method to scroll the chat thread to the bottom
       * so user can see latest message when messages overflow
       * @return{undefined}
       */
      const scrollChatThread = () => {
        const chatResults = document.getElementById('results');
        if (chatResults) {
          chatResults.scrollTop = chatResults.scrollHeight;
        }
      };

      $scope.$watchCollection('chat.messageArray', (newValue, oldValue) => {
        $timeout(() => {
          scrollChatThread();
        }, 100);
      });

      /**
       * Method to send messages
       * @param{String} userMessage - String containing the message to be sent
       * @return{undefined}
       */
      $scope.sendMessage = (userMessage) => {
        $scope.chat.postGroupMessage(userMessage);
        $scope.chatMessage = '';
      };

      $scope.pickCard = (card) => {
        if (!$scope.hasPickedCards) {
          if ($scope.pickedCards.indexOf(card.id) < 0) {
            $scope.pickedCards.push(card.id);
            if (game.curQuestion.numAnswers === 1) {
              $scope.sendPickedCards();
              $scope.hasPickedCards = true;
            } else if (game.curQuestion.numAnswers === 2 &&
              $scope.pickedCards.length === 2) {
              // delay and send
              $scope.hasPickedCards = true;
              $timeout($scope.sendPickedCards, 300);
            }
          } else {
            $scope.pickedCards.pop();
          }
        }
      };
      $scope.keyPressed = ($event) => {
        const keyCode = $event.which || $event.keyCode;
        if (keyCode === 13) {
          $scope.sendMessage($scope.chatMessage);
        }
      };

      $scope.showChat = () => {
        $scope.chat.chatWindowVisible = !$scope.chat.chatWindowVisible;
        // enableChatWindow;
        if ($scope.chat.chatWindowVisible) {
          $scope.chat.unreadMessageCount = 0;
        }
      };

      $scope.pointerCursorStyle = () => {
        if ($scope.isCzar() && $scope.game.state ===
          'waiting for czar to decide') {
          return { cursor: 'pointer' };
        }
        return {};
      };

      $scope.sendPickedCards = () => {
        game.pickCards($scope.pickedCards);
        $scope.showTable = true;
      };

      $scope.cardIsFirstSelected = (card) => {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[0];
        }
        return false;
      };

      $scope.cardIsSecondSelected = (card) => {
        if (game.curQuestion.numAnswers > 1) {
          return card === $scope.pickedCards[1];
        }
        return false;
      };

      $scope.firstAnswer = ($index) => {
        if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
          return true;
        }
        return false;
      };

      $scope.secondAnswer = ($index) => {
        if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
          return true;
        }
        return false;
      };

      $scope.showFirst = card => game.curQuestion.numAnswers > 1 &&
        $scope.pickedCards[0] === card.id;

      $scope.showSecond = card => game.curQuestion.numAnswers > 1 &&
        $scope.pickedCards[1] === card.id;

      $scope.isCzar = () => game.czar === game.playerIndex;

      $scope.isPlayer = $index => $index === game.playerIndex;

      $scope.isCustomGame = () => !(/^\d+$/).test(game.gameID) &&
        game.state === 'awaiting players';

      $scope.isPremium = $index => game.players[$index].premium;

      $scope.currentCzar = $index => $index === game.czar;

      $scope.winningColor = ($index) => {
        if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
          return $scope.colors[game.players[game.winningCardPlayer].color];
        }
        return '#f9f9f9';
      };

      $scope.pickWinning = (winningSet) => {
        if ($scope.isCzar()) {
          game.pickWinning(winningSet.card[0]);
          $scope.winningCardPicked = true;
        }
      };

      $scope.winnerPicked = () => game.winningCard !== -1;

      $scope.startGame = () => {
        game.startGame();
      };

      $scope.saveGame = () => {
        game.saveGame();
      };

      $scope.closeModal = () => {
        $scope.modalInstance.close();
      };

      $scope.abandonGame = () => {
        game.leaveGame();
        $window.location.href = '/#!/play-with';
      };

      // Catches changes to round to update when no players pick card
      // (because game.state remains the same)
      $scope.$watch('game.round', () => {
        $scope.hasPickedCards = false;
        $scope.showTable = false;
        $scope.winningCardPicked = false;
        $scope.makeAWishFact = makeAWishFacts.pop();
        if (!makeAWishFacts.length) {
          makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
        }
        $scope.pickedCards = [];
      });

      // In case player doesn't pick a card in time, show the table
      $scope.$watch('game.state', () => {
        if (game.state === 'waiting for czar to decide' &&
          $scope.showTable === false) {
          $scope.showTable = true;
        }
      });

      $scope.$watch('game.gameID', () => {
        if (game.gameID && game.state === 'awaiting players') {
          if (!$scope.isCustomGame() && $location.search().game) {
            // If the player didn't successfully enter the request room,
            // reset the URL so they don't think they're in the requested room.
            $location.search({});
          } else if ($scope.isCustomGame() && !$location.search().game) {
            // Once the game ID is set, update the URL
            // if this is a game with friends,
            // where the link is meant to be shared.
            $location.search({ game: game.gameID });
            if (!$scope.modalShown) {
              setTimeout(() => {
                const link = document.URL;
                const txt = `Give the following link to your
                 friends so they can join your game: `;
                $('#lobby-how-to-play').text(txt);
                $('#oh-el').css({
                  'text-align': 'center',
                  'font-size': '22px',
                  background: 'white',
                  color: 'black'
                })
                .text(link);
              }, 200);
              $scope.modalShown = true;
            }
          }
        }
      });

      if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
        if ($scope.userName) {
          game.joinGame('joinGame', $location.search().game);
        } else { $window.location.href = '/#!/signup'; }
      } else if ($location.search().custom) {
        game.joinGame('joinGame', null, true);
      } else {
        game.joinGame();
      }

      if ($scope.isCustomGame() && $scope.isCzar) {
        $scope.showDialog = true;
        dialog.showModal();
        dialog.querySelector('.proceed').addEventListener('click', () => {
          dialog.close();
          $scope.saveGame();
        });
      } else {
        document.getElementById('showMyDialog').style.display = 'none';
      }
      dialog.querySelector('.close').addEventListener('click', () => {
        dialog.close();
        $window.location.href = '/#!/play-with';
      });
    }
  ]);
>>>>>>> 974427e743a5e43081be5663f3e3825cbfbd0813
