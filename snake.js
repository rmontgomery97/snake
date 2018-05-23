/*jslint browser: true, indent: 3 */

// CS 3312, spring 2018
// Snake Final Project
// YOUR NAMES: Reese Montgomery, Harrison Chodacki

// All the code below will be run once the page content finishes loading.
document.addEventListener('DOMContentLoaded', function () {
   'use strict';

   var gameCanvas, gameContext;
   // Get the canvas object and its two-dimensional rendering context.
   gameCanvas = document.querySelector('#game-board');
   gameContext = gameCanvas && gameCanvas.getContext && gameCanvas.getContext('2d');
   if (!gameContext) {
      document.querySelector('#game-warning').textContent = 'Your browser does not seem to support the <canvas> element correctly; please use a recent version of a standards-compliant browser such as Opera, Chrome or Firefox.';
      return;
   }

   gameCanvas.width = 600;
   gameCanvas.height = 400;

   // Add functionality to the game area.
   (function () {
      var createSnake;

      createSnake = function () {
         var self, state;

         state = {
            // origin positions for snake
            snake: [{x: 140, y: 100}, {x: 120, y: 100}, {x: 100, y: 100}],
            //origin position for food
            food: {x: 300, y: 200},
            // default to right
            direction: 'right',
            speed: 100,
            score: 0,
            highScore: 0
         };

         // if theres a high score in web storage, use it instead
         if (localStorage && localStorage.getItem) {
            state.highScore = localStorage.getItem('SnakeGame highScore');
         }

         self = {
            changeDirection: function (dir) {
               // change the direction, but only if its not opposite of the current direction
               if (dir === 'right' && state.direction !== 'left') {
                  state.direction = 'right';
               } else if (dir === 'left' && state.direction !== 'right') {
                  state.direction = 'left';
               } else if (dir === 'up' && state.direction !== 'down') {
                  state.direction = 'up';
               } else if (dir === 'down' && state.direction !== 'up') {
                  state.direction = 'down';
               }
            },
            getDirection: function () {
               return state.direction;
            },
            randomizeFood: function () {
               // get a random location for the food
               state.food.x = Math.floor(Math.random() * 600);
               state.food.y = Math.floor(Math.random() * 400);

               // round it to the nearest 20
               state.food.x = Math.round(state.food.x / 20) * 20;
               state.food.y = Math.round(state.food.y / 20) * 20;

               // make sure the food is in the canvas
               if (state.food.x > (gameCanvas.width - 10) || state.food.y > (gameCanvas.height - 10)) {
                  self.randomizeFood();
               }

               // make sure the food isnt where the snake's body is
               state.snake.forEach(function (square) {
                  if (state.food.x === square.x && state.food.y === square.y) {
                     self.randomizeFood();
                  }
               });
            },
            getFood: function () {
               return state.food;
            },
            getSnake: function () {
               // return the array of snake square objects
               return state.snake;
            },
            getSpeed: function () {
               return state.speed;
            },
            getScore: function () {
               // if the current score is higher than the high score, update the high score
               if (state.score > state.highScore) {
                  state.highScore = state.score;
               }
               return state.score;
            },
            getHighScore: function () {
               return state.highScore;
            },
            setSpeed: function (speed) {
               // set the timeout speed
               state.speed = speed;
            },
            incrementScore: function () {
               state.score += 10;
            },
            reset: function () {
               // reset the snake to original positions when game is over
               state.snake.splice(3);
               state.snake[0] = {x: 140, y: 100};
               state.snake[1] = {x: 120, y: 100};
               state.snake[2] = {x: 100, y: 100};
               state.direction = 'right';
               state.length = 3;
               state.score = 0;
               state.food.x = 300;
               state.food.y = 200;
            }
         };
         return Object.freeze(self);
      };

      (function () {
         var snake, updateBoard, isGameActive, drawSquares, checkCollision;

         isGameActive = false;

         // draw the snake and it's food
         drawSquares = function drawSquares(snakeArray, food) {
            gameContext.fillStyle = 'rgb(255, 255, 255)';
            snakeArray.forEach(function (square) {
               gameContext.fillRect(square.x, square.y, 18, 18);
            });

            gameContext.fillStyle = 'rgb(200, 68, 100)';
            gameContext.fillRect(food.x, food.y, 18, 18);
         };

         checkCollision = function checkCollision(snakeArray, x, y) {
            var i;
            // check to see if the snake ran into the wall
            if (x < 0 || x > gameCanvas.width - 20 || y < 0 || y > gameCanvas.height - 20) {
               isGameActive = !isGameActive;
               snake.reset();
               gameContext.fillStyle = 'rgb(255, 0, 0)';
               gameContext.font = 'bold 50px Arial';
               gameContext.fillText("GAME OVER", 225, 200, 150);
               document.querySelector('#start-button').style.visibility = 'visible';
            }

            // check to see if the snake ate itself
            for (i = 1; i < snakeArray.length; i += 1) {
               if (snakeArray[i].x === x && snakeArray[i].y === y) {
                  isGameActive = false;
                  snake.reset();
                  gameContext.fillStyle = 'rgb(255, 0, 0)';
                  gameContext.font = 'bold 50px Arial';
                  gameContext.fillText("GAME OVER", 225, 200, 150);
                  document.querySelector('#start-button').style.visibility = 'visible';
               }
            }
         };

         updateBoard = function updateBoard() {
            var snakeArray, direction, headX, headY, foodLocation;

            // save the high score in web storage
            if (localStorage && localStorage.setItem) {
               localStorage.setItem('SnakeGame highScore', snake.getHighScore());
            }

            // Fill the canvas with a dark color.
            gameContext.fillStyle = 'rgb(0, 0, 0)';
            gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
            // output the current score to the screen
            document.querySelector('#score').textContent = 'Score: ' + snake.getScore();
            document.querySelector('#high-score').textContent = snake.getHighScore();

            snakeArray = snake.getSnake();
            foodLocation = snake.getFood();
            // draw the snake and the food
            drawSquares(snakeArray, foodLocation);

            checkCollision(snakeArray, snakeArray[0].x, snakeArray[0].y);

            headX = snakeArray[0].x;
            headY = snakeArray[0].y;
            direction = snake.getDirection();
            // get the location of the next square using the current direction
            if (direction === 'up') {
               headY -= 20;
            } else if (direction === 'down') {
               headY += 20;
            } else if (direction === 'left') {
               headX -= 20;
            } else {
               headX += 20;
            }

            if (isGameActive) {
               // if the head is on the food, just push it onto the snake
               if (headX === foodLocation.x && headY === foodLocation.y) {
                  snakeArray.unshift({x: headX, y: headY});
                  snake.incrementScore();
                  snake.randomizeFood();
               } else {
                  // otherwise just take the tail and put it onto the front of the snake
                  snakeArray.pop();
                  snakeArray.unshift({x: headX, y: headY});
               }
               setTimeout(updateBoard, snake.getSpeed());
            }
         };

         // add functionality to the start button
         document.querySelector('#start-button').addEventListener('click', function () {
            if (document.querySelector('#easy-difficulty').checked) {
               snake.setSpeed(120);
            } else if (document.querySelector('#regular-difficulty').checked) {
               snake.setSpeed(100);
            } else {
               snake.setSpeed(70);
            }
            // hide it while the game is active
            document.querySelector('#start-button').style.visibility = 'hidden';
            if (!isGameActive) {
               isGameActive = true;
               updateBoard();
            }
         }, false);

         // use the arrows to control the snake
         document.addEventListener('keypress', function (ev) {
            switch (ev.key) {
            case 'ArrowUp':
               snake.changeDirection('up');
               break;
            case 'ArrowDown':
               snake.changeDirection('down');
               break;
            case 'ArrowLeft':
               snake.changeDirection('left');
               break;
            case 'ArrowRight':
               snake.changeDirection('right');
               break;
            default:
               return;
            }
         }, false);

         //initialize the game
         snake = createSnake();
         updateBoard();
      }());
   }());
}, false);