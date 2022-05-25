'use strict'

window.addEventListener("contextmenu", e => e.preventDefault());

//Global varibles:

const MINE = '💣'
const FLAG = '🚩'

var gBoard

var gLevel = {
    SIZE: 4,
    MINES:2,
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    startTime: 0,
}

var gLives = 3

var gIntervalTime


function initGame(){
    console.log('we are on!')

    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.startTime = 0    

    gLives = 3
    
    gLevel.SIZE = 4
    gLevel.MINES = 2

    gBoard= buildBoard()
    renderBoard(gBoard)

    var elBtns= document.querySelectorAll('button')  
    for (var i=0; i<elBtns.length; i++){
        if (elBtns[i].innerText === 'Easy') elBtns[i].style.backgroundColor = "rgb(240, 10, 79)"
        else elBtns[i].style.backgroundColor = "darkslategray"
        }
   
    

}

function buildBoard(rowIdx = 0, colIdx = 0) {

    var board = []

    //build borad with diffult parameter
    for (var i=0; i<gLevel.SIZE; i++){
        board[i]= []
        for(var j=0; j<gLevel.SIZE; j++){
            board[i][j] = {
                isMine: false,
                negsCount: null,
                isMarked: false,
                isShown: false, 
            }
        }
    }

    //set mines at random locations:
    for (var i = 0; i<gLevel.MINES; i++) {

        var randIdxRow = getRandomInt(0, gLevel.SIZE-1)
        var randIdxCol = getRandomInt(0, gLevel.SIZE-1)
        if(randIdxRow === rowIdx, randIdxCol === colIdx ) {
            i-- 
            continue
        }    
        if (board [randIdxRow][randIdxCol].isMine === true ) i--
        board [randIdxRow][randIdxCol].isMine = true
    }

    //add neighbors count:
    setMinesNegCount(board)
    console.log(board)
    return board
}


function setMinesNegCount(board){

    for (var i=0; i<board.length; i++){
        for(var j=0; j<board[0].length; j++){

            if(board[i][j].isMine) continue

            var currCellNegsCount = negsCount(board, i,j)
            board[i][j].negsCount = currCellNegsCount
        }
    }

}


function negsCount (board, rowIdx,colIdx){
        var count = 0
    
        for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
            if(i < 0 || i >= board.length) continue
    
            for(var j = colIdx - 1; j <= colIdx + 1; j++){
                if(j < 0 || j >= board.length) continue               
                if(i === rowIdx && j === colIdx) continue

                if(board[i][j].isMine) count++
            }
        }
        return count
}
    

function renderBoard(board){
  
    var strHTML = '<table><tbody>'
        
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            //var cellContent = board[i][j].isMine === true ? MINE :  board[i][j].negsCount
            var className = `cell cell-${i}-${j} `
            
            strHTML += `<td class="${className}" 
                            onmousedown="cellClicked(event, this,${i},${j})"
                            >  </td>`
        //${cellContent}
                        
          }
          strHTML += '</tr>'
        }
        strHTML += '</tbody></table>';
        var elBoard = document.querySelector(".board");
        elBoard.innerHTML = strHTML;
}


function startGame(rowIdx, colIdx) {
    
    gGame.isOn = true

    //build new board with no mine in first cel click
    gBoard= buildBoard(rowIdx, colIdx)
    
    renderBoard(gBoard)

    //start the time
    gGame.startTime = Date.now() 
    gIntervalTime = setInterval(showTime, 1000)
 

}



function cellClicked(event, elCell, i, j){

    
 //   console.log('event.button:', event.button)

    

    //Flag or unflag ---> turn to right click later!!!!!!****!!!
    if (event.button === 2 ){

        // update the DOM based on the model before the change:
    
        elCell.innerText = gBoard[i][j].isMarked? '' : FLAG

        // update Model:
        if  (gBoard[i][j].isMarked){
            gBoard[i][j].isMarked = false
            gGame.markedCount--
        } else{
            gBoard[i][j].isMarked = true
            gGame.markedCount++
        }  

        checkVictory ()
        return
    }

    else if (event.button === 0 ){
    console.log('LEFT!!')    
    
    if (!gGame.isOn) {
            elCell.style.backgroundColor = 'green'
            startGame(elCell, i,j)
        }
    
    elCell.style.backgroundColor = 'white'

     //check if already shown or marked
      if (gBoard[i][j].isShown || gBoard[i][j].isMarked ) return

    showCell(elCell, i, j)
    }
    
}


function showCell(elCell, rowIdx, colIdx){


    console.log('showCell')
    console.log(elCell)
   
   
    if (gBoard[rowIdx][colIdx].isMine) {
        
        elCell.style.backgroundColor = 'red'
        setTimeout (function() {elCell.style.backgroundColor = 'darkgray '}, 500)

        //updtea model
        gLives--

        //update DOM
        var elLives = document.querySelector('.lives')
        elLives.innerText = gLives

        if (gLives === 0) {
            elCell.innerText =  MINE
            elCell.style.backgroundColor = 'white'
            gameOver()
        }
    
        return
    }
         
    // show cell content
    //update model:
    gBoard[rowIdx][colIdx].isShown = true
    gGame.shownCount++

    //update DOM:


    var text = (gBoard[rowIdx][colIdx].isMine) ? MINE: 
                        ((gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : '')

    elCell.innerText = text
    elCell.style.backgroundColor = 'white'

    console.log('gGame.shownCount', gGame.shownCount)
    console.log(elCell)

    if (gBoard[rowIdx][colIdx].negsCount === 0 ) expandShown(gBoard, elCell, rowIdx, colIdx)

    checkVictory ()

    console.log(gBoard)

}

function checkVictory () {

    if (gGame.markedCount === gLevel.MINES && 
        gGame.shownCount === gLevel.SIZE**2 - gLevel.MINES ) {
        console.log('Win!!')
        gGame.isOn = false
        clearInterval(gIntervalTime)
        showModal('You Won!! ')

        }

}

function gameOver(){
    console.log('You Lost!!')
    clearInterval(gIntervalTime)
    gGame.isOn = false
    showModal('You Lost:( ')
}


function showModal(msg){
    console.log(msg)
    var elModal = document.querySelector('.modal')
    elModal.style.display = "block"
    var elMsg = document.querySelector('.modal p')
    elMsg.innerText = msg


}





function expandShown(board, elCell, rowIdx, colIdx){


    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i >= board.length) continue

        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j >= board.length) continue               
            if(i === rowIdx && j === colIdx) continue

            if(i === rowIdx-1 && j === colIdx-1) continue
            if(i === rowIdx-1 && j === colIdx+1) continue
            if(i === rowIdx+1 && j === colIdx-1) continue
            if(i === rowIdx+1 && j === colIdx+1) continue

            if(board[i][j].isShown || gBoard[i][j].isMarked || gBoard[i][j].isMine) continue
            
            var elCellToShow = document.querySelector(`.cell-${i}-${j}`)
            showCell (elCellToShow, i, j) 
           
            if(board[i][j].negsCount === 0 ) {            
                expandShown(board, elCell, i, j)
            }
        }
    }

}


function showTime(){
    var time = ((Date.now() -gGame.startTime)/1000).toFixed()
    var elTime = document.querySelector("h2 span")
    elTime.innerText = time 
}



function levelchoise(elBtn){

    if (gGame.isOn) return

    var level = elBtn.innerHTML
      
    if (level === "Easy") {
        gLevel.SIZE = 4
        gLevel.MINES = 2    
    }
    
    else if (level === "Normal") {
        gLevel.SIZE = 8
        gLevel.MINES = 12
    }    
    

    else if (level === "Expert")  {
        gLevel.SIZE = 12
        gLevel.MINES = 30
    }
       
    gBoard= buildBoard()
    renderBoard(gBoard)

    var elBtns= document.querySelectorAll('button')  
    for (var i=0; i<elBtns.length; i++){
        elBtns[i].style.backgroundColor = "darkslategray"
        }
    elBtn.style.backgroundColor = "rgb(240, 10, 79)"
}

function restart(){
    var elModal = document.querySelector('.modal')
    elModal.style.display = "none"
    initGame()
}


