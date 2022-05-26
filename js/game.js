'use strict'

document.addEventListener("contextmenu", e => e.preventDefault());



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
    hintOn: false,
}

var gLives = 3

var gIntervalTime



function initGame(){
    console.log('yes???')

    //reset global variables
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.startTime = 0    

    gLives = 3
    
    gLevel.SIZE = 4
    gLevel.MINES = 2

    //build initial board
    gBoard= buildBoard()
    renderBoard(gBoard)

    //render initial parameters
    var elTime = document.querySelector("h2 span")
    elTime.innerText = '0'

    var elLives = document.querySelector('.lives')
    elLives.innerText = '3'

    //render buttns easy is colored
    var elBtns= document.querySelectorAll('button')  
    for (var i=0; i<elBtns.length; i++){
        if (elBtns[i].innerText === 'Easy') elBtns[i].style.backgroundColor = ' rgb(201, 78, 78)'
        else elBtns[i].style.backgroundColor = "darkslategray"
        }
   
    
    //update score
    var bestEasy = localStorage.getItem('gBestTime.easy');
    var elTimeEasy = document.querySelector('.easy')
    elTimeEasy.innerText = bestEasy

    var bestNormal = localStorage.getItem('gBestTime.normal');
    var elTimeNormal = document.querySelector('.normal')
    elTimeNormal.innerText = bestNormal

    
    var bestExpert = localStorage.getItem('gBestTime.expert');
    var elTimeExpert = document.querySelector('.expert')
    elTimeExpert.innerText = bestExpert
 
 
 
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
    
    
    console.log(rowIdx)

    gGame.isOn = true
    console.log('starting...')

    //build new board with no mine in first cel click
    gBoard= buildBoard(rowIdx, colIdx)
    
    renderBoard(gBoard)

    //start the time
    gGame.startTime = Date.now() 
    gIntervalTime = setInterval(showTime, 1000)

  
    var selector = `.cell-${rowIdx}-${colIdx}`
    var elCell = document.querySelector(selector)
    elCell.style.backgroundColor = 'white' 
    var text = (gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : ''   
    elCell.innerText = text


}



function cellClicked(event, elCell, rowIdx, colIdx){
    
    document.addEventListener( "contextmenu", function(e) {
        console.log(e)
        if (e.button === -1) console.log('maybe')
        })

    if (!gGame.isOn) {
        startGame(rowIdx ,colIdx) 
        elCell.style.backgroundColor = 'white'
        var text = (gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : ''   
        elCell.innerText = text

    }

    if (gBoard[rowIdx][colIdx].isShown) return
    
    if (gGame.hintOn){
        console.log('hint is on')
        if (gBoard[rowIdx][colIdx].isMarked) return
        showhint(rowIdx, colIdx)
        return
    }


   
    //Flag or unflag ---> turn to right click later!!!!!!****!!!
    // if (event.button === 2 ){

    if(confirm('Flag or Unglag?')) {    
        console.log('RIGHT!!') 
        if  (gBoard[rowIdx][colIdx].isMarked){
            gBoard[rowIdx][colIdx].isMarked = false
            gGame.markedCount--
            elCell.innerText = ''

        } else{
            gBoard[rowIdx][colIdx].isMarked = true
            gGame.markedCount++
            elCell.innerText = FLAG
        }  
           
           checkVictory ()
           return
        }
   
    //  else if (event.button === 0 ){
    
    else {
        console.log('LEFT!!')    
       
        //check if already marked
        if (gBoard[rowIdx][colIdx].isMarked ) return
    
        elCell.style.backgroundColor = 'white'
  
       showCell(elCell, rowIdx, colIdx)
       }
       
   }
   
   
function showCell(elCell, rowIdx, colIdx){
    
      
       if (gBoard[rowIdx][colIdx].isMine) {
           console.log('Im a mine')
           gLives-- 
           console.log('gLives', gLives)

           var elLives = document.querySelector('.lives')
           console.log(elLives)
           elLives.innerText = gLives
           
            if (gLives === 0) {
                elCell.innerText =  MINE
                elCell.style.backgroundColor = 'white'
                gameOver()
                return
            }
                 
            elCell.style.backgroundColor = ' rgb(201, 78, 78)'
            setTimeout (function() {
                        elCell.style.backgroundColor = 'darkgray '                 
                        }, 500)
        
        return
       }
            
       // show cell content
       //update model:
       gBoard[rowIdx][colIdx].isShown = true
       gGame.shownCount++
   
       //update DOM:
    
    //    var text = (gBoard[rowIdx][colIdx].isMine) ? MINE: 
    //                        ((gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : '')


       var text = (gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : ''
   
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
        var time = ((Date.now() -gGame.startTime)/1000).toFixed()  
        clearInterval(gIntervalTime)

        var elImg = document.querySelector('img')
        elImg.src = "img/happy.jpg"    
        console.log(time)  


        if (gLevel.SIZE === 4) {
            localStorage.setItem('gBestTime.easy', time )
            var elTimeEasy = document.querySelector('.easy')
            elTimeEasy.innerText = time
        }    
        else if (gLevel.SIZE === 8) {
            localStorage.setItem('gBestTime.normal', time)
            var elTimeNormal = document.querySelector('.normal')
            elTimeNormal.innerText = time    
        }
        else if (gLevel.SIZE === 12) {
            localStorage.setItem('gBestTime.expert', time)
            var elTimeExpert = document.querySelector('.expert')
            elTimeExpert.innerText = time
        }
    }
}

function gameOver(){
    console.log('You Lost!!')
    clearInterval(gIntervalTime)

    gGame.isOn = false
    var elImg = document.querySelector('img')
    elImg.src = "img/upset.jpg"    
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
    elBtn.style.backgroundColor = ' rgb(201, 78, 78)'
}

function restart(){
    if(gGame.isOn) return
    
    var elImg = document.querySelector('img')
    elImg.src = "img/smile.jpg"  

    initGame()  


}

function hint(elHint){

    if (!gGame.isOn) return

    elHint.classList.add("highlight")

    gGame.hintOn = true
  

}

function showhint(rowIdx, colIdx){


    for(var i = rowIdx - 1; i <= rowIdx + 1; i++){
        if(i < 0 || i >= gBoard.length) continue

        for(var j = colIdx - 1; j <= colIdx + 1; j++){
            if(j < 0 || j >= gBoard[0].length) continue

            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) continue

            var selector = `.cell-${i}-${j}`
            var cellToShow = document.querySelector(selector)

            cellToShow.innerText = (gBoard[i][j].isMine )? MINE :
                                (gBoard[i][j].negsCount ) ? gBoard[i][j].negsCount : ''
            cellToShow.style.backgroundColor = "lightcyan"
            setTimeout(unshow, 1000, i, j )

        }
    }
    //unshowing the hint:

    gGame.hintOn = false

    var hints = document.querySelectorAll(".hint")
    
    for (var i=0; i<hints.length; i++){
        if (hints[i].classList.contains("highlight")){
            console.log('found it')
             setTimeout(unshowHint, 1000, hints[i] )
    }
    }
}

function unshow(rowIdx, colIdx){
    var selector = `.cell-${rowIdx}-${colIdx}`
    var elCell = document.querySelector(selector)
    elCell.innerText = ''
    elCell.style.backgroundColor = "darkgray"   

}


function unshowHint(elHint){
    elHint.innerText = ''
    elHint.classList.remove("highlight")

}

