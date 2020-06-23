 "use strict";

const board = [];

const global = {
	team: "X",
	running: true,
	size: 3	
}

createNewGame();

function createNewGame() {
	buildEmptyBoard();
	renderBoardInHTML();
	addClickListenerToEachCell();
	addChangeListenerForSizeToggle();
	addClickListenerForResetGame();
}

// Initialise empty board dynamically based on size
function buildEmptyBoard() {
	for (let i = 0; i < global.size; i++) {
		board.push([]);
		for (let j = 0; j < global.size; j++) 
			board[i].push(" ");		
	}
}

function renderBoardInHTML() {
	const board = document.querySelector("#board");
	var newRow;
	var newCell;
	var newSpan;

	board.style.height = "60%"
	board.style.width = "40%";

	for (let i = 0; i < global.size; i++) {
		newRow = document.createElement("tr");
		newRow.className = "row";

		for (let j = 0; j < global.size; j++)  {
			newCell = createCell();
			newSpan = createSpan(i, j);	

			newCell.append(newSpan);
			newRow.append(newCell);
		}

		board.append(newRow);
	}
}	

// Create element that lies in the tiles of the board
function createCell() {
	var newCell = document.createElement("td");

	newCell.className = "elem";
	newCell.style.fontSize = (3000 / global.size) + "%" 

	return newCell;
}

// Create element that lies within a tile that registers the clicks and holds X's and O's
function createSpan(i, j) {
	var newSpan = document.createElement("span");

	newSpan.className = "clickable";
	newSpan.id = "r" + i + "c" + j;
	newSpan.innerHTML = "W";

	return newSpan;
}

// Add listener that registers the user placing X's and O's
function addClickListenerToEachCell() {
	const matches = document.querySelectorAll("#board .row .elem .clickable");

	for (let i = 0; i < matches.length; i++) 
		matches[i].addEventListener("click", dealWithUserMove);
}

function addChangeListenerForSizeToggle() {
	const slider = document.querySelector("#speed-toggle");

	slider.addEventListener("change", updateSize);
}

function updateSize(sliderEvent) {
	const slider = sliderEvent.target;

	global.size = slider.value;

	resetGame();
}

function addClickListenerForResetGame() {
	const resetButton = document.querySelector("#reset-game");

	resetButton.addEventListener("click", resetGame);
}

function resetGame() {
	removeClickListenerFromEachCell();
	resetHTML();
	clearBoard();
	createNewGame();

	global.running = true;
	global.team = "X";
}

function resetHTML() {
	const board = document.querySelector("#board");

	board.innerHTML = '';
}

function clearBoard() {
	board.length = 0;
}

function dealWithUserMove(clickable) {
	const id = clickable.target.id;

	if (isValidMove(id)) {
		makeMove(id);
		ifElseAI();
	}
	else
		alert("Invalid move");
}

// A very simple "AI" that just picks the first possible move that's valid
function simpleAIMove() {
	for (let i = 0; i < global.size; i++) {
		for (let j = 0; j < global.size; j++) {
			if (board[i][j] == " ") {
				makeMove(convertCoordinatesToID(i, j));
				return;
			}
		}
	}
}

// A rule based AI that breaks game down into different cases
function ifElseAI() {
	var twoInRow;
	var twoInColumn;
	var posDiagonal;
	var negDiagonal;
	var openCorner;

	if (global.running) {		
		if ((twoInRow = checkForTwoInRows()) != undefined) 
			makeMove(convertCoordinatesToID(twoInRow[0], twoInRow[1]));
		else if ((twoInColumn = checkForTwoInColumns()) != undefined) 
			makeMove(convertCoordinatesToID(twoInColumn[0], twoInColumn[1]));
		else if ((posDiagonal = checkForPosGradDiagonal()) != undefined) 
			makeMove(convertCoordinatesToID(posDiagonal[0], posDiagonal[1]));
		else if ((negDiagonal = checkForNegGradDiagonal()) != undefined) 
			makeMove(convertCoordinatesToID(negDiagonal[0], negDiagonal[1]));	
		else if ((openCorner = checkForOpenCorner()) != undefined) 
			makeMove(convertCoordinatesToID(openCorner[0], openCorner[1]));	
		else 
			simpleAIMove();
	}
}

// Check for the case where 2 pieces of the same team are one move away from winning. Scans through every row
function checkForTwoInRows() {
	var missingRow;
	
	for (let i = 0; i < global.size; i++) 
		if ((missingRow = checkForTwoInSpecificRow(i)) != undefined)
			return [i, missingRow];	

	return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for a specific row
function checkForTwoInSpecificRow(j) {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < global.size; i++) {
		if (board[j][i] == global.team)
			teamCounter++;
		else if (board[j][i] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 
	}

	if ((teamCounter == global.size - 1 || opponentCounter == Math.floor(global.size / 2) + 1) && emptySpace != -1)
		return emptySpace;
	else
		return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Scans through every column
function checkForTwoInColumns() {
	var missingColumn;

	for (let i = 0; i < global.size; i++) 
		if ((missingColumn = checkForTwoInSpecificColumn(i)) != undefined)
			return [missingColumn, i];

	return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for a specific column
function checkForTwoInSpecificColumn(j) {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < global.size; i++) {
		if (board[i][j] == global.team)
			teamCounter++;
		else if (board[i][j] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 
	}

	if ((teamCounter == global.size - 1 || opponentCounter == Math.floor(global.size / 2) + 1) && emptySpace != -1)
		return emptySpace;
	else
		return undefined;
}

function checkForOpenCorner() {
	if (board[0][0] == " ")
		return [0, 0];
	else if (board[0][global.size - 1] == " ")
		return [0, global.size - 1];
	else if (board[global.size - 1][global.size - 1] == " ")
		return [global.size - 1, global.size - 1];
	else if (board[global.size - 1][0] == " ")
		return [global.size - 1, 0];

	return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for the positive gradient diagonal
function checkForPosGradDiagonal() {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < global.size; i++) {
		if (board[i][i] == global.team)
			teamCounter++;
		else if (board[i][i] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 
	}

	if ((teamCounter == global.size - 1 || opponentCounter == Math.floor(global.size / 2) + 1) && emptySpace != -1)
		return [emptySpace, emptySpace];
	else
		return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for the negative gradient diagonal
function checkForNegGradDiagonal() {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < global.size; i++) 
		if (board[global.size - 1 - i][i] == global.team)
			teamCounter++;
		else if (board[global.size - 1 - i][i] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 

	if ((teamCounter == global.size - 1 || opponentCounter == Math.floor(global.size / 2) + 1) && emptySpace != -1)
		return [global.size - emptySpace -1, emptySpace];
	else
		return undefined;
}

// Given 2 co-ordinates, convert to a string ID that the html will understand
function convertCoordinatesToID(i, j) {
	return "r" + i + "c" + j;
}

function isValidMove(id) {
	return board[getRowFromID(id)][getColumnFromID(id)] == " ";
}

function makeMove(id) {
	updateViewWithMove(id);
	updateBoardWithMove(id);

	detectGameOver(id);
	switchTeam();
}

// If game has finished, clean up and alert the appropriate message
function detectGameOver(id) {
	if (isWinner(id)) {
		alert("Team " + global.team + " has won!");
		global.running = false;
		removeClickListenerFromEachCell();
	}
	else if (isStalemate()) {
		alert("Game ended in stalemate");
		global.running = false;
		removeClickListenerFromEachCell();
	}
}

function removeClickListenerFromEachCell() {
	const matches = document.querySelectorAll("#board .row .elem .clickable");

	for (let i = 0; i < matches.length; i++) 
		matches[i].removeEventListener("click", dealWithUserMove);
}

function isStalemate() {
	for (let i = 0; i < global.size; i++) 
		for (let j = 0; j < global.size; j++) 
			if (board[i][j] == " ") 
				return false;			

	return true;
}

// Return true if move resulted in a win
function isWinner(id) {
	return isSidewaysWinner(id) || isDiagonalWinner(id);
}

// Return true if move resulted in a vertical or horizontal win
function isSidewaysWinner(id) {
	var column = 0;
	var row = 0;

	for (let i = 0; i < global.size; i++) {
		if (board[getRowFromID(id)][i] == global.team)
			column++;
		if (board[i][getColumnFromID(id)] == global.team)
			row++;
	}

	return row == global.size || column == global.size;
}

function isDiagonalWinner(id) {
	var posGradient = true;
	var negGradient = true;

	for (let i = 1; i < global.size; i++) {
		if (board[i][i] != board[i - 1][i - 1] || board[i - 1][i - 1] == " ")
			posGradient = false;

		if (board[global.size - 1 - i][i] != board[global.size - i][i - 1] || board[global.size - i][i - 1] == " ")
			negGradient = false;
	}

	return posGradient || negGradient;
}

function switchTeam() {
	if (global.team == "X")
		global.team = "O"
	else 
		global.team = "X"
}

function updateBoardWithMove(id) {
	board[getRowFromID(id)][getColumnFromID(id)] = global.team;
}

function updateViewWithMove(id) {
	const cell = document.querySelector("#board .row .elem #" + id);
	cell.innerHTML = global.team;
	cell.style.color = "black";
}

// Parses string ID and returns and numerical value for row
function getRowFromID(id) {
	var strNum = "";

	for (let i = 1; isCharDigit(id.charAt(i)); i++)
		strNum = strNum.concat(id.charAt(i));

	return parseInt(strNum);
}

// Parses string ID and returns and numerical value for column
function getColumnFromID(id) {
	var strNum = "";

	for (let i = id.length - 1; isCharDigit(id.charAt(i)); i--)
		strNum = strNum.concat(id.charAt(i));

	return parseInt(reverseStr(strNum));
}

// Helper function for parsers
function isCharDigit(c) {
	var zeroAscii = "0".charCodeAt(0);
	var nineAscii = "9".charCodeAt(0);

	return c.charCodeAt() >= zeroAscii && c <= nineAscii;
}

// Helper function for parsers
function reverseStr(str) {
	return str.split("").reverse().join("");
}
