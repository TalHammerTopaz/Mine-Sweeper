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
    safeclick: 3,
    sevenBoom: false,
    manualycreate: false,
    manualGame: false,
    placingMine: false,
    readyToPlay: false,
}

var gLives = 3

var gIntervalTime

var gLog = []



function initGame(){

    //reset global variables
    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.startTime = 0    
    gGame.sevenBoom = false
    gGame.manualycreate = false,
    gGame.manualGame = false,
    gGame.safeclick = 3

    gLives = 3
    
    gLevel.SIZE = 4
    gLevel.MINES = 2

    //build and render initial board
    gBoard= buildBoard()
    renderBoard(gBoard)

    //render initial parameters to the display
    var elTime = document.querySelector("h2 span")
    elTime.innerText = '0'

    var elLives = document.querySelector('.lives')
    elLives.innerText = '3'

    var elHints = document.querySelectorAll('.hint') 
    for(var i=0; i<elHints.length; i++){
        elHints[i].innerText = '💡'
    }

    var elSafeclicks = document.querySelector('.safeclicks')
    elSafeclicks.innerText = gGame.safeclick

    var elSevenBoom = document.querySelector('.sevenboom')
    elSevenBoom.classList.remove("sevenligthed" )

    var elBtn  = document.querySelector('.manual')
    elBtn.innerText = '👇 Manualy Create'
    elBtn.classList.remove('manualligthed')

    var elModal = document.querySelector('.modal')
    elModal.style.display = "none"

    //render buttns (easy is colored)
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
 
 
    gGame.readyToPlay = true
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

    if (gGame.sevenBoom) placeMinesSevenBoom(board)

    else {
    //set mines at random locations:
        for (var i = 0; i<gLevel.MINES; i++) {

            var randIdxRow = getRandomInt(0, gLevel.SIZE-1)
            var randIdxCol = getRandomInt(0, gLevel.SIZE-1)

            //skip firstcellclicked
            if(randIdxRow === rowIdx, randIdxCol === colIdx ) {
                i-- 
                continue
            }  
            //ingnore if mine is already placed  
            if (board [randIdxRow][randIdxCol].isMine === true ) i--

            board [randIdxRow][randIdxCol].isMine = true
        }

    }
    //add neighbors count:
    setMinesNegCount(board)

    console.log(board)
    return board
}


function placeMinesSevenBoom(board){
    gLevel.MINES = 0

    var cellNum = 0
    
    for (var i=0; i<gLevel.SIZE; i++){
          for(var j=0; j<gLevel.SIZE; j++){

            cellNum++
            if (cellNum %7 === 0) {
                board[i][j].isMine = true
                gLevel.MINES++
                }
            var stringCellNum = cellNum+''
            if (stringCellNum.includes(7)) {
                board[i][j].isMine = true
                gLevel.MINES++
                }
            
            }    
        }  

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

    
        //start the time
    gGame.startTime = Date.now() 
    gIntervalTime = setInterval(showTime, 1000)

    if(gGame.sevenBoom || gGame.manualGame) return

    //build new board with no mine in first cel click
    gBoard= buildBoard(rowIdx, colIdx)
    
    renderBoard(gBoard)

  
    var selector = `.cell-${rowIdx}-${colIdx}`
    var elCell = document.querySelector(selector)
    elCell.style.backgroundColor = 'white' 
    var text = (gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : ''   
    elCell.innerText = text


}


function cellClicked(event, elCell, rowIdx, colIdx){
    
    if(!gGame.readyToPlay) return

    document.addEventListener('mousedown', e => {
    e.preventDefault() });


    if(event.button === 2) {
 
     flag(elCell, rowIdx, colIdx)
     return
    }


    else if(event.button === 0){
    
        if(gGame.manualycreate) {
            manualyCreateOnClick(elCell,rowIdx,colIdx )  
            return
        }

        if (!gGame.isOn) {
            startGame(rowIdx ,colIdx) 
        }


        if (gBoard[rowIdx][colIdx].isShown) return
        
        if (gGame.hintOn){  
            showhint(rowIdx, colIdx)
            console.log(1)
            return
        }

        
        //check if already marked
        if (gBoard[rowIdx][colIdx].isMarked ) return
            
        showCell(elCell, rowIdx, colIdx)

        checkVictory()

    }

}

   
function flag(elCell, rowIdx, colIdx) {

    if (!gGame.isOn) return

    if  (gBoard[rowIdx][colIdx].isShown) return
        
    if  (gBoard[rowIdx][colIdx].isMarked){
            
    //log data :
    log(rowIdx, colIdx, 'unmark')
    
    //unmarking
    gBoard[rowIdx][colIdx].isMarked = false
    gGame.markedCount--
    elCell.innerText = ''    

            
    } else{

    //log data :
    log(rowIdx, colIdx, 'mark')

    //marking
    gBoard[rowIdx][colIdx].isMarked = true
    gGame.markedCount++
    elCell.innerText = FLAG
            
    }  
           
    checkVictory () 

}   

   
function showCell(elCell, rowIdx, colIdx){
        
    
    if (gBoard[rowIdx][colIdx].isMine) {
        gLives--        
        
        var elLives = document.querySelector('.lives')
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
     

    //log data 
    log(rowIdx, colIdx, 'show')
       
    // show cell content

    //update model:
    gBoard[rowIdx][colIdx].isShown = true
    gGame.shownCount++
   
    //update DOM:
   


    var text = (gBoard[rowIdx][colIdx].negsCount ) ? gBoard[rowIdx][colIdx].negsCount : ''
   
    elCell.innerText = text
    elCell.style.backgroundColor = 'white'
   
     
    if (gBoard[rowIdx][colIdx].negsCount === 0 ) expandShown(gBoard, elCell, rowIdx, colIdx)
   
    checkVictory ()
   
    console.log(gBoard)
   
}

function checkVictory () {

    if (!(gGame.markedCount === gLevel.MINES) || 
        !(gGame.shownCount === gLevel.SIZE**2 - gLevel.MINES) ) return
       
        
    gGame.isOn = false
    gGame.readyToPlay = false

    var time = ((Date.now() -gGame.startTime)/1000).toFixed()      
    clearInterval(gIntervalTime)

    var elImg = document.querySelector('img')
    elImg.src = "img/happy.jpg"    

    //update storage with time:
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


function gameOver(){

    clearInterval(gIntervalTime)

    gGame.isOn = false
    gGame.readyToPlay = false

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

    if(!gGame.readyToPlay) return

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
    if(gGame.hintOn) return

    elHint.classList.add("highlight")

    gGame.hintOn = true
  

}

function showhint(rowIdx, colIdx){

    console.log(2)

    if (gBoard[rowIdx][colIdx].isMarked) return

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

function safeclick(){

    if(!gGame.isOn) return

    if (gGame.hintOn) return

    if (gGame.safeclick === 0)    return

    gGame.safeclick--
    var elSafeclicks = document.querySelector('.safeclicks')
    elSafeclicks.innerText = gGame.safeclick


    var randIdxRow = getRandomInt(0, gLevel.SIZE-1)
    var randIdxCol = getRandomInt(0, gLevel.SIZE-1)

    while   (gBoard[randIdxRow][randIdxCol].isMine || 
            gBoard[randIdxRow][randIdxCol].isShown || 
            gBoard[randIdxRow][randIdxCol].isMarked) {
        randIdxRow = getRandomInt(0, gLevel.SIZE-1)
        randIdxCol = getRandomInt(0, gLevel.SIZE-1)
    }

    var selector = `.cell-${randIdxRow}-${randIdxCol}`
    var cellToShow = document.querySelector(selector)

    cellToShow.innerText = (gBoard[randIdxRow][randIdxCol].negsCount ) ? gBoard[randIdxRow][randIdxCol].negsCount : ''
    cellToShow.style.backgroundColor = "lightgreen"
    setTimeout(unshow, 1000, randIdxRow, randIdxCol )


}

function sevenboom(elBtn){

    if (gGame.isOn) return

    if(!gGame.readyToPlay) return

    elBtn.classList.toggle("sevenligthed" )

    if(gGame.sevenBoom){
        gGame.sevenBoom = false
        return
    }

    gGame.sevenBoom = true

    gBoard = buildBoard()

}


function manualycreate(elBtn){

    
    if (gGame.isOn) return
    
    if(!gGame.readyToPlay) return

    elBtn.classList.toggle("manualligthed" )
    
    if(gGame.manualycreate){
        gGame.manualycreate = false
        var elModal = document.querySelector('.modal')
        elModal.style.display = "none"

        initGame()
        return
    }

    
    gGame.manualycreate = true
    console.log('Im manualycreate On!!')
    
    gLevel.MINES = 0
    gBoard = []

    //build empty borad 
    for (var i=0; i<gLevel.SIZE; i++){
        gBoard[i]= []
        for(var j=0; j<gLevel.SIZE; j++){
            gBoard[i][j] = {
                isMine: false,
                negsCount: null,
                isMarked: false,
                isShown: false, 
            }
        }
    }
    console.log(gBoard)

    var elModal = document.querySelector('.modal')
    elModal.style.display = "block"

}

function setmine(elMineBtn){

    elMineBtn.style.background = "radial-gradient( #ecb02c 33%, #fff 100%)"
    gBoard.placingMine = true


}

function manualyCreateOnClick(elCell,rowIdx,colIdx ) {

    if (!gBoard.placingMine) return

    if(gBoard[rowIdx][colIdx].isMine) return
  
    gBoard[rowIdx][colIdx].isMine = true

    gLevel.MINES++

    elCell.style.backgroundColor = ' rgb(201, 78, 78)'
    elCell.innerText = MINE

    setTimeout(function(){
        elCell.style.backgroundColor = ' darkgray'
        elCell.innerText = ''
        var elMineBtn = document.querySelector('.mineset')
        elMineBtn.style.background = "#e9e9f0"
       
        }, 1000)
    console.log(gBoard) 

    gBoard.placingMine = !gBoard.placingMine
}

function startmanualgame(){

    setMinesNegCount(gBoard)
    renderBoard(gBoard)
    gGame.manualycreate = false
    gGame.manualGame = true

    var elBtn  = document.querySelector('.manual')
    elBtn.innerText = '👉Playing Manually Created!'

    var elModal = document.querySelector('.modal')
    elModal.style.display = "none"
    
}

function undo(){

    if (!gGame.isOn) return

    console.log('undo')
    var event = gLog.pop()
    console.log(event)

    //uodate model:
    if(gBoard[event.rowIdx][event.colIdx].isShown) gBoard[event.rowIdx][event.colIdx].isShown = false

    var selector = `.cell-${event.rowIdx}-${event.colIdx}`
    var elCellToUndo = document.querySelector(selector)
    elCellToUndo.style.backgroundColor = "darkgray"
    elCellToUndo.innerText = ''

    
    if (event.action === 'show') {
        gBoard[event.rowIdx][event.colIdx].isShown = false
        gGame.shownCount--
    }

    else if  (event.action === 'mark') {
        gBoard[event.rowIdx][event.colIdx].isMarked = false
        gGame.markedCount--
    }    

    else if (event.action === 'unmark') {
        gBoard[event.rowIdx][event.colIdx].isMarked = true
        gGame.markedCount++
        elCellToUndo.innerText = FLAG 
    }
}


function log(rowIdx, colIdx, action){
    gLog.push( { rowIdx: rowIdx,
                colIdx : colIdx, 
                action: action,
    })
 
}

