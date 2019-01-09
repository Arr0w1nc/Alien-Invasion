var canvas = document.getElementById('canvas');

canvas.width = window.innerWidth / 2;
canvas.height = window.innerHeight / 1.25;

var graphics = canvas.getContext('2d');

var play = 0;
var rows = 4;
var eCount = 0;
var score = 0;

var playerW = 75;
var playerH = 75;

var x = canvas.width / 2 - playerW / 2;
var hx = 27.5;
var y = canvas.height - 100;

var bulletX = x;
var bulletY = 0;
var shot = false;
var shooting = 0;
var eshooting = 0;
var ebulletX = 0;
var ebulletY = 0;

var change = 0;
var move = 0;
var spacing = 25;
var eBorder = 30;

var WoL = 0;

var movements = [
	false,
	false,
	false
];

var enemyWidth = 50;
var enemyHeight = 50;
var enemies = [];
for(var r = 0; r < rows; r++) {
    enemies[r] = [];
    for(var c = 0; c < 40; c++) {
        enemies[r][c] = { x: 0, y: 0, status: 1};
    }
}

start();

/*
This is the starting component of the program. 
It sends a link as a parameter to the function that creates a background displaying the start menu.
The user will only have to click the screen to start.
*/
function start(){
	createBackground("https://i.imgur.com/ehQ94MD.jpg");
	play = requestAnimationFrame(start);
	canvas.addEventListener("mousedown", playGame);
}

/*
This function steps up the layout of the game and functions for the AI opponents.
The enemy's position is set and there actions are set in motion. The game starts.
*/
function playGame(){
	canvas.removeEventListener("mousedown", playGame);
	cancelAnimationFrame(play);
	enemyData();
	setInterval(animateEnemiesMove, 1350);
	setInterval(animateEnemiesAttack, 1000);
	animateGame();
}

/*
The keyboard buttons are set for the player movements and the background is created.
A loop is set for the function to continually run until all the enemies are defeated.
Once the max score that can be achieved occurs, the game ends.
*/
function animateGame(){
	document.onkeydown = movePlayer;
	document.onkeyup = resetMovements;
	play = requestAnimationFrame(animateGame);
	createBackground("https://i.ytimg.com/vi/vECKVb3n8pg/maxresdefault.jpg");
	drawPlayer();
	drawEnemies();
	drawScore();
	if(score == eCount * rows){
		gameOver(" Won :) ");
	}
}

/*
This funtion draws the game character. The spaceship which is placed at a set width, height, and y position.
The x position is set based on the characters movement, set at the center at the start and moved with the arrow keys.
*/
function drawPlayer(){
	var ship = new Image(); 
    ship.src = "https://4.bp.blogspot.com/-cg1jtrxaZ8Y/Ufl5SmFUVaI/AAAAAAAAAzg/PAaekSVbZ0g/s1600/F5S4.png";
    graphics.drawImage(ship, x, y, playerW, playerH);
}

/*
This function draws each enemy possible that can fit on the screen. 
The enemy will only be drawn if it has not been hit by a player bullet.
*/
function drawEnemies(){
	for(var r = 0; r < rows; r++){
		for(var c = 0; c < eCount; c++){
			var eX = c * (50 + spacing) + eBorder + move;
			var eY = r * (50 + 10) + 10;
			if(enemies[r][c].status == 1){
				enemies[r][c].x = eX;
				enemies[r][c].y = eY;
				var aliens = new Image();
				aliens.src = "https://2.bp.blogspot.com/-8fhHi4GqGIk/Vllq2C-tGEI/AAAAAAAACHg/_Qyupg969cE/s320/aliensh.png";
				graphics.drawImage(aliens, eX, eY, enemyWidth, enemyHeight);
			}
		}
	}
}

/*
Every 1.35 seconds, the enemies move either 10 pixels left, right, or not at all. 
This gives players a challenge as the enemies move.
*/
function animateEnemiesMove(){
	if(change == 0){
		move += 10;
		change++;
	} else if(change >= 1){
		move -= 10;
		change++;
		if(change == 3){
			change = -1;
		}
	} else {
		move = 0;
		change = 0;
	}
}

/*
The function is called every second to shhot a bullet from a random enemy. 
A random row and column is chosen until there is an enemy there. 
Once an active enemy is found, a function is called to shoot a bullet from that position.
*/
function animateEnemiesAttack(){
	var randRow = Math.floor(Math.random() * rows);
	var randCol = Math.floor(Math.random() * eCount);
	if(enemies[randRow][randCol].status == 1){
		ebulletX = enemies[randRow][randCol].x + 25;
		ebulletY = enemies[randRow][randCol].y + 25;
		eShootBullets();
	} else {
		animateEnemiesAttack();
	}
}

/*
This function draws the updated score in the bottom left-hand corner of the canvas.
*/
function drawScore() {
    graphics.font = "16px Comic Sans MS";
    graphics.fillStyle = "#0125DD";
    graphics.fillText("Score: " + score, 10, canvas.height - 50 + 45);
}

/*
This function calculated how many columns can be placed on the canvas, up to a max of 15.
The number will be used to create the maximun number of columns of enemies. 
*/
function enemyData(){
	for(var r = 0; r < 15; r++){
		if((r * (50 + spacing) + eBorder) + 60 < canvas.width){
			eCount++;
		}
	}
}

/*
The function creates a background based on the paremeter given when called.
It displays the start screen, game background, and the end screen.
*/
function createBackground(img){
	var background = new Image();
	background.src = img;
    graphics.drawImage(background, 0, 0, canvas.width, canvas.height);
}

/*
Based on the key input, a boolean is changed and the character moves until the key is uplifted.
The shoot boolean is set until the shot is over, to avoid spamming. 
Once the player hits the end of the map, they will end up on the opposite side. 
*/
function movePlayer(e){
	if(e.keyCode === 32){
		movements[2] = true;
	}
	if(shot == true){
		movements[2] = false;
	}
	if(e.keyCode === 37){
		movements[0] = true;
	}
	if(e.keyCode === 39){
		movements[1] = true;
	}
	playerActions();
	if(x + (playerW/2) > canvas.width){
        x = 1 - playerW/2;
    } else if(x < -playerW/2){
        x = canvas.width - playerW/2;
    }
}

/*
Based on a set of booleans in a list, the player moves left or right in 27.5 pixels.
The bullet is then told to be launched from the players current positionat the center of the avatar.
*/
function playerActions(){
	if(movements[0] == true){
		x -= hx;
	}
	if(movements[1] == true){
		x += hx;
	}
	if(movements[2] == true){
		bulletX = x + (playerW / 2);
		bulletY = y;
		shootBullets();
	}
}

/*
The function resets all the movement booleans when a button is uplifted.
*/
function resetMovements(){
	movements[0] = false;
	movements[1] = false;
	movements[2] = false;
}

/*
A bullet is shot from the position of the player which moves 18 pixels upward.
*/
function shootBullets(){
	shot = true;
	shooting = requestAnimationFrame(shootBullets);
	graphics.beginPath();
	graphics.strokeStyle = "white";
	graphics.arc(bulletX, bulletY, 6, 0, 2 * Math.PI, false);
	graphics.stroke();
	bulletY -= 18;
	hitDetect();
}

/*
If the game is not over, the enemy character shoots a bullet out from the x and y coordinate of the previously chosen living enemy.
the bullet moves at a rate of 10 pixels downward.
*/
function eShootBullets(){
	if(WoL != "L"){
		eshooting = requestAnimationFrame(eShootBullets);
		graphics.beginPath();
		graphics.strokeStyle = "yellow";
		graphics.arc(ebulletX, ebulletY, 6, 0, 2 * Math.PI, false);
		graphics.stroke();
		ebulletY += 10;
		hitDetect();
	}
}

/*
This function controls the hit detection system. 
If the player's bullet travels in the area of a living enemy is, the enemy will be deleted, the score will increase, and the bullet will disappear.
The player's bullet will also disappear if it hits the top of the map.
If the enemy's bullet hits the player, then the player will die and the game will end. 
If the enemy misses and the bullet hits the bottom of the screen, the bullet will disappear and the game will continue.
*/
function hitDetect(){
	for(var r = 0; r < rows; r++){
		for(var c = 0; c < eCount; c++){
			var removeE = enemies[r][c];
			if(removeE.status == 1){
				if(bulletX >= removeE.x-1 && bulletX <= removeE.x+enemyWidth+1 && bulletY >= removeE.y - 1 && bulletY <= removeE.y+enemyHeight + 1){
					removeE.status = 0;
					score++;
					shot = false;
					bulletY = y;
					cancelAnimationFrame(shooting);
				}
			}
		}
	}
	if(bulletY < 0){
		shot = false;
		bulletY = y;
		cancelAnimationFrame(shooting);
	}
	if(ebulletX >= x - 1 && ebulletX <= x + 1 + playerW && ebulletY >= y - 1 && ebulletY <= y + 1 + playerH){
		WoL = "L";
		gameOver(" Lost! :( ");
	}
	if(ebulletY > canvas.height){
		ebulletY = canvas.height;
		cancelAnimationFrame(eshooting);
	}
}

/*
The function stops all timers, movements, and game functions.
The canvas will display the users final score, whether the user won or lost based on the parameter given, and the instruction to refresh the page to play again.
*/
function gameOver(game){
	resetMovements();
	shot = false;
	cancelAnimationFrame(play);
	cancelAnimationFrame(eshooting);
	cancelAnimationFrame(shooting);
	clearInterval(animateEnemiesMove);
	clearInterval(animateEnemiesAttack);
	document.onkeydown = resetMovements;
	graphics.font = "16px Comic Sans MS";
    graphics.fillStyle = "#0125DD";
    graphics.fillText("You" + game, canvas.width/2 - 45, canvas.height/2 - 20);
    graphics.fillText("Score: " + score, canvas.width/2 - 40, canvas.height/2);
    graphics.fillText("Press the 'F5' on keyboard to refresh and play again ", canvas.width/2 - 200, canvas.height/2 + 20);
}