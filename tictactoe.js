 "use strict";

const size = 3;
const board = [];
var team = "X";
var running = true;

buildEmptyBoard();
addClickListenerToEachCell();

// Initialise empty board dynamically based on size
function buildEmptyBoard() {
	for (let i = 0; i < size; i++) {
		board.push([]);
		for (let j = 0; j < size; j++) 
			board[i].push(" ");		
	}
}

function addClickListenerToEachCell() {
	var matches = document.querySelectorAll("#board .row .elem .clickable");

	for (let i = 0; i < matches.length; i++) 
		matches[i].addEventListener("click", dealWithUserMove);
}

function dealWithUserMove(clickable) {
	var id = clickable.target.id;

	if (isValidMove(id))
		makeMove(id);
	else
		alert("Invalid move");

	ifElseAI();
}

// A very simple `AI` that just picks the first possible move that's valid
function simpleAIMove() {
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
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

	if (running) {
		if (boardHasOpenCenter() && board[getCenter()][getCenter()] == " ")
			makeMove(convertCoordinatesToID(getCenter(), getCenter()));		
		else if ((twoInRow = checkForTwoInRows()) != undefined) 
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

// Returns true if the board is an odd size and the center is empty
function boardHasOpenCenter() {
	return size % 2 != 0 && board[getCenter()][getCenter()] == " ";
}

function getCenter() {
	return ((size + 1) / 2) - 1;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Scans through every row
function checkForTwoInRows() {
	var missingRow;
	
	for (let i = 0; i < size; i++) 
		if ((missingRow = checkForTwoInSpecificRow(i)) != undefined)
			return [i, missingRow];	

	return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for a specific row
function checkForTwoInSpecificRow(j) {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < size; i++) {
		if (board[j][i] == team)
			teamCounter++;
		else if (board[j][i] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 
	}

	if ((teamCounter == size - 1 || opponentCounter == size - 1) && emptySpace != -1)
		return emptySpace;
	else
		return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Scans through every column
function checkForTwoInColumns() {
	var missingColumn;

	for (let i = 0; i < size; i++) 
		if ((missingColumn = checkForTwoInSpecificColumn(i)) != undefined)
			return [missingColumn, i];

	return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for a specific column
function checkForTwoInSpecificColumn(j) {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < size; i++) {
		if (board[i][j] == team)
			teamCounter++;
		else if (board[i][j] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 
	}

	if ((teamCounter == size - 1 || opponentCounter == size - 1) && emptySpace != -1)
		return emptySpace;
	else
		return undefined;
}

function checkForOpenCorner() {
	if (board[0][0] == " ")
		return [0, 0];
	else if (board[0][size - 1] == " ")
		return [0, size - 1];
	else if (board[size - 1][size - 1] == " ")
		return [size - 1, size - 1];
	else if (board[size - 1][0] == " ")
		return [size - 1, 0];

	return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for the positive gradient diagonal
function checkForPosGradDiagonal() {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < size; i++) {
		if (board[i][i] == team)
			teamCounter++;
		else if (board[i][i] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 
	}

	if ((teamCounter == size - 1 || opponentCounter == size - 1) && emptySpace != -1)
		return [emptySpace, emptySpace];
	else
		return undefined;
}

// Check for the case where 2 pieces of the same team are one move away from winning. Checks this for the negative gradient diagonal
function checkForNegGradDiagonal() {
	var teamCounter = 0;
	var emptySpace = -1;
	var opponentCounter = 0;

	for (let i = 0; i < size; i++) 
		if (board[size - 1 - i][i] == team)
			teamCounter++;
		else if (board[size - 1 - i][i] == " ")
			emptySpace = i;		
		else
			opponentCounter++; 

	if ((teamCounter == size - 1 || opponentCounter == size - 1) && emptySpace != -1)
		return [size - emptySpace -1, emptySpace];
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
		alert("Team " + team + " has won!");
		running = false;
		removeClickListenerFromEachCell();
	}
	else if (isStalemate()) {
		alert("Game ended in statemate");
		running = false;
		removeClickListenerFromEachCell();
	}
}

function removeClickListenerFromEachCell() {
	var matches = document.querySelectorAll("#board .row .elem .clickable");

	for (let i = 0; i < matches.length; i++) 
		matches[i].removeEventListener("click", dealWithUserMove);
}

function isStalemate() {
	for (let i = 0; i < size; i++) 
		for (let j = 0; j < size; j++) 
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

	for (let i = 0; i < size; i++) {
		if (board[getRowFromID(id)][i] == team)
			column++;
		if (board[i][getColumnFromID(id)] == team)
			row++;
	}

	return row == size || column == size;
}

function isDiagonalWinner(id) {
	var posGradient = true;
	var negGradient = true;

	for (let i = 1; i < size; i++) {
		if (board[i][i] != board[i - 1][i - 1] || board[i - 1][i - 1] == " ")
			posGradient = false;

		if (board[size - 1 - i][i] != board[size - i][i - 1] || board[size - i][i - 1] == " ")
			negGradient = false;
	}

	return posGradient || negGradient;
}

function switchTeam() {
	if (team == "X")
		team = "O"
	else 
		team = "X"
}

function updateBoardWithMove(id) {
	board[getRowFromID(id)][getColumnFromID(id)] = team;
}

function updateViewWithMove(id) {
	var cell = document.querySelector("#board .row .elem #" + id);
	cell.innerHTML = team;
	cell.style.color = "black";
}

function getRowFromID(id) {
	return parseInt(id.charAt(1));
}

function getColumnFromID(id) {
	return parseInt(id.charAt(3));
}
