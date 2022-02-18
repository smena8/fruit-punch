"use strict";

document.addEventListener('DOMContentLoaded', (event) => {

    let i;
    const gameGrid = document.querySelector('.game-grid');
    const gridCols = 7;
    const gridRows = 7;
    const gridItems = gridCols*gridRows;
    gameGrid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    const scoreDisplay = document.getElementById('score')
    const targetDisplay = document.getElementById('target')
    const levelDisplay = document.getElementById('level')
    const movesDisplay = document.getElementById('moves')
    const progressDisplay = document.getElementById('progress')
    const progressBar = document.getElementById('progressBar')
    let SPEED = 2
    let SCORE = 0
    let TARGET = 2000
    let MOVES_START = 50
    let MOVES = 50
    let LEVEL = 1

    const appName = 'game/';
    const fruitImageFolder = 'images/fruits_svg/';
    const fruitImageType = '.svg';
    const fruitStringArray = ['avocado', 'watermelon', 'banana', 'cantaloupe', 'durian',
                        'grapes', 'kiwi', 'lemon', 'orange', 'papaya',
                        'pineapple', 'strawberry',
                        ];

    class Fruit {
        constructor(name, id) {
            this.name = name;
            this.image = `/static/${appName}${fruitImageFolder}${name}${fruitImageType}`;
            this.points = 40;
        }
    }

    let fruitRow = gridRows;
    let fruitCol = gridCols;
    let fruitArray = [];

    let fruitDragged;
    let fruitDraggedId;
    let fruitReplaced;
    let fruitReplacedId;

    let paused = false;
    const pauseButton = document.querySelector('#pause')
    const pauseText = pauseButton.querySelector('span')
    pauseButton.addEventListener('click', pauseGame)


    let lastRenderTime;
    let matchedIndexArray = [];
    let fruitInstances = [];
    let matchHint = [];
    let fallingFruits = [];
    let flashing;
    startGame()
    setTimeout (() => { window.requestAnimationFrame(main); }, 50 * ( gridItems + 1 ))

    function main(currentTime) {
        window.requestAnimationFrame(main);
        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if ( paused || secondsSinceLastRender < 1 ) {
            console.log('Paused...');
            return
        }
        lastRenderTime = currentTime;
        // add some functions here
        matchedIndexArray = [];
        try {
            checkRowOfThree();
            checkColOfThree();
            if (matchedIndexArray.length > 0) {
                console.log('Matched index array is greater than 0...')
                console.log(matchedIndexArray)
                // reduce array so numbers are not repeating
                matchedIndexArray = [...new Set(matchedIndexArray)];
                moveElementsDown();
                editFruitArray();
            }

        } catch (err) {
            console.log(err)
        }
        if (matchedIndexArray.length === 0 && matchHint.length === 0) {
            matchHint = searchPotentialMatches();
            flashing = setInterval(flashHint, 1000);
            // if matchHint still zero then start new array and refresh the elements
            if (matchHint.length === 0) {
                alert('No more moves, shuffling fruits...')
                gameGrid.innerHTML = '';
                shuffleFruitArray();
                replaceFruitElements();
                clearHint();
            }
        }
        displayLevel();
        displayMoves();
        displayTarget();
        displayScore();
        updateProgressBar();
        // check if reached target score or no moves left
        if (endGame()) {
            console.log('end game')
        } else {
            endLevel();
        }

    }

    // functions ----------------------------------------------------------------------------------------------------

    function startGame() {
        createFruitArray();
        let fruitRow = gridRows;
        let fruitCol = gridCols;
        fruitArray.forEach((fruitObj, i) => {
            let fruitElement = createFruitElement(i, fruitObj);
            fruitElement.classList.add('above');
            fruitElement.style.gridRow = fruitRow
            fruitElement.style.gridColumn = fruitCol
            fruitRow = (fruitCol === 1 && fruitRow <= gridCols) ? fruitRow -= 1 : fruitRow
            fruitCol = (fruitCol === 1) ?  gridCols : fruitCol -= 1
            setTimeout (() => { fruitElement.classList.remove('above') }, 10 * (i+1))
        })
    }

    function createFruitArray() {
        fruitInstances = [];
        fruitStringArray.forEach((fruitName, index) => {
                window[fruitName] = new Fruit(fruitName);
            if (index < 4 + LEVEL) {
                fruitInstances.push(window[fruitName]);
            }
        })

        fruitArray = [];
        for (i=0; i < gridItems; i++) {
            let randomFruitObj = randomFruit();
            fruitArray.push(randomFruitObj);
        }
    }

    function shuffleFruitArray() {
        for (i=0; i < fruitArray.length; i++) {
                let randomNumber = Math.floor(Math.random() * fruitArray.length);
                let firstFruitObj = fruitArray[i]
                let secFruitObj = fruitArray[randomNumber]
                fruitArray[i] = secFruitObj
                fruitArray[randomNumber] = firstFruitObj
            }
    }

    function randomFruit() {
        return fruitInstances[Math.floor(Math.random()*fruitInstances.length)]
    }

    function createFruitElement(number, fruitObj) {
        let elementContainer = document.createElement('div');
        elementContainer.setAttribute('class', 'fruit__container');
        elementContainer.setAttribute('draggable', 'true');
        elementContainer.id = number;
        elementContainer.setAttribute('data-fruit', `${fruitObj.name}`);
        elementContainer.style.backgroundImage = `url('${fruitObj.image}')`;
        elementContainer.style.backgroundImage = `url('${fruitObj.image}')`;
        dragListeners(elementContainer);
        gameGrid.prepend(elementContainer);
        return elementContainer
    }

    function replaceFruitElements() {
        let fruitRow = gridRows;
        let fruitCol = gridCols;
        fruitArray.forEach((fruitObj, i) => {
            let fruitElement = createFruitElement(i, fruitObj);
            fruitElement.classList.add('above');
            fruitElement.style.gridRow = fruitRow
            fruitElement.style.gridColumn = fruitCol
            fruitRow = (fruitCol === 1 && fruitRow <= gridCols) ? fruitRow -= 1 : fruitRow
            fruitCol = (fruitCol === 1) ?  gridCols : fruitCol -= 1
            setTimeout (() => { fruitElement.classList.remove('above') }, 10 * (i+1))
        })
    }

    function dragListeners(element) {
        element.addEventListener('dragstart', dragStart)
        element.addEventListener('dragend', dragEnd)
        element.addEventListener('dragover', dragOver)
        element.addEventListener('dragenter', dragEnter)
        element.addEventListener('dragleave', dragLeave)
        element.addEventListener('drop', dragDrop)
        return
    }

    function dragStart(event) {
        fruitDraggedId = parseInt(event.target.id);
        fruitDragged = fruitArray[fruitDraggedId];
    }

    function dragEnd(event) {
        event.preventDefault();
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function dragEnter(event) {
        event.preventDefault();
    }

    function dragLeave(event) {
        event.preventDefault();
    }

    function dragDrop(event) {
        fruitReplacedId = parseInt(event.target.id);
        fruitReplaced = fruitArray[fruitReplacedId];
        if ((fruitReplacedId % gridCols == 0 &&  (fruitDraggedId+1) % gridCols == 0) || (fruitDraggedId % gridCols == 0 &&  (fruitReplacedId+1) % gridCols == 0)) {
            return
        }
        if (isValidMove()) {
            fruitArray[fruitReplacedId] = fruitDragged
            fruitArray[fruitDraggedId] = fruitReplaced
            if (isMatch(fruitDraggedId) || isMatch(fruitReplacedId)) {
                    switchTwoElements(fruitDraggedId, fruitReplacedId)
//                    event.target.style.backgroundImage = `url('${fruitArray[fruitReplacedId].image}')`;
//                    event.target.dataset.fruit = `${fruitArray[fruitReplacedId].name}`;
//                    document.getElementById(fruitDraggedId).style.backgroundImage = `url('${fruitArray[fruitDraggedId].image}')`;
//                    document.getElementById(fruitDraggedId).dataset.fruit = `${fruitArray[fruitDraggedId].name}`;
                    MOVES -= 1;
                    clearHint();
            } else {
                fruitArray[fruitReplacedId] = fruitReplaced
                fruitArray[fruitDraggedId] = fruitDragged
            }
        }
    }

    function switchTwoElements(id1, id2) {
        if (id1 - 1 === id2) {
            document.getElementById(id2).style.transform = 'translate(-100%, 0)' // left
            document.getElementById(id1).style.transform = 'translate(100%, 0)' // right
        }
        if (id1 + 1 === id2) {
            document.getElementById(id1).style.transform = 'translate(-100%, 0)' // left
            document.getElementById(id2).style.transform = 'translate(100%, 0)' // right
        }
        if (id1 - gridCols === id2) {
            document.getElementById(id1).style.transform = 'translate(0, 100%)' // down
            document.getElementById(id2).style.transform = 'translate(0, -100%)' // up
        }
        if (id1 + gridCols === id2) {
            document.getElementById(id2).style.transform = 'translate(0, 100%)' // down
            document.getElementById(id1).style.transform = 'translate(0, -100%)' // up
        }
    }

    function flashHint() {
         matchHint.forEach(match => {
                // animate/highlight elements to signal potential match to player
                let matchElem = document.getElementById(match)
                if (!matchElem.classList.contains('flash')) {
                    matchElem.classList.add('flash')
                } else {
                    matchElem.classList.remove('flash')
                }
         })
    }

    function clearHint() {
         clearInterval(flashing);
         matchHint.forEach(match => {
                let matchElem = document.getElementById(match)
                matchElem.classList.remove('flash')
         })
         matchHint = [];

    }



    function searchPotentialMatches() {
        console.log('--------Searching potential matches...')
        let randomMatch = []
        // copy current array
        let tempFruitArray = fruitArray.map((fruitObj) => fruitObj);
        // go through each index/element
        let potentialMatchArray = []
        for (i=0; i < gridItems; i++) {
        // get surrounding index/element numbers
            let validMoves = returnValidMoves(i)
            let orgFruitObj = tempFruitArray[i]
            let nextFruitObj;
            validMoves.forEach(move => {
                if ((i % gridCols == 0 &&  (move+1) % gridCols == 0) || ((i+1) % gridCols == 0 &&  move % gridCols == 0)) {
                        return
                    }
                // pretend to switch with each surrounding element
                let nextFruitObj = tempFruitArray[move]
                tempFruitArray[i] = nextFruitObj
                tempFruitArray[move] = orgFruitObj
                if (move >= 0 && move < gridItems) {
                    // if switch leads to match, note the array/indexes
                    if (isPotentialMatch(move, tempFruitArray)) {
                        potentialMatchArray.push([i, move])
                    }
                }
                tempFruitArray[i] = orgFruitObj
                tempFruitArray[move] = nextFruitObj
            })
        }
        // pick random potential match from array of potential matches
        if (potentialMatchArray.length > 0) {
            let randomNumber = Math.floor(Math.random() * potentialMatchArray.length)
            let randomMatch = potentialMatchArray[randomNumber]
            return randomMatch
        }

        return randomMatch
    }

    function returnValidMoves(id) {
        let moveLeft = id + 1
        let moveRight = id - 1
        let moveUp = id + gridCols
        let moveDown = id - gridCols
        let validMoves = [moveLeft, moveRight, moveUp, moveDown]
        return validMoves
    }

    function isPotentialMatch(id, tempFruitArray) {
        let fruitObjId = id
        let possibleMatches = []
        if ((fruitObjId+1 <= gridItems - 1) && (fruitObjId+2 <= gridItems - 1) && (fruitObjId+1 >= 0) && (fruitObjId+2 >= 0)
            && ((fruitObjId+1) % gridCols !== 0) && ((fruitObjId+2) % gridCols !== 0)) {
            possibleMatches.push([fruitObjId, fruitObjId+1, fruitObjId+2])
        }
        if ((fruitObjId-1 <= gridItems - 1) && (fruitObjId-2 <= gridItems - 1) && (fruitObjId-1 >= 0) && (fruitObjId-2 >= 0)
            && ((fruitObjId) % gridCols !== 0) && ((fruitObjId-1) % gridCols !== 0) ) {
            possibleMatches.push([fruitObjId, fruitObjId-1, fruitObjId-2])
        }
        if ((fruitObjId+1 <= gridItems - 1) && (fruitObjId-1 <= gridItems - 1) && (fruitObjId+1 >= 0) && (fruitObjId-1 >= 0)
            && (fruitObjId % gridCols !== 0) && ((fruitObjId+1) % gridCols !== 0)) {
            possibleMatches.push([fruitObjId+1, fruitObjId, fruitObjId-1])
        }
        if ((fruitObjId+gridCols <= gridItems - 1) && (fruitObjId+(gridCols*2) <= gridItems - 1) && (fruitObjId+gridCols >= 0) && (fruitObjId+(gridCols*2) >= 0)) {
            possibleMatches.push([fruitObjId, fruitObjId+gridCols, fruitObjId+(gridCols*2)])
        }
        if ((fruitObjId-gridCols <= gridItems - 1) && (fruitObjId-(gridCols*2) <= gridItems - 1) && (fruitObjId-gridCols >= 0) && (fruitObjId-(gridCols*2) >= 0)) {
            possibleMatches.push([fruitObjId, fruitObjId-gridCols, fruitObjId-(gridCols*2)])
        }
        if ((fruitObjId+gridCols <= gridItems - 1) && (fruitObjId-gridCols <= gridItems - 1) && (fruitObjId+gridCols >= 0) && (fruitObjId-gridCols >= 0)) {
            possibleMatches.push([fruitObjId+gridCols, fruitObjId, fruitObjId-gridCols])
        }
        return possibleMatches.some(possibleMatch => potentialNamesMatch(possibleMatch, tempFruitArray[fruitObjId], tempFruitArray))
    }

    function potentialNamesMatch(possibleMatch, mainFruitObj, tempFruitArray) {
        return possibleMatch.every(index => checkName(tempFruitArray[index], mainFruitObj))
    }

    function isValidMove() {
        let moveLeft = fruitDraggedId + 1
        let moveRight = fruitDraggedId - 1
        let moveUp = fruitDraggedId + gridCols
        let moveDown = fruitDraggedId - gridCols
        let validMoves = [moveLeft, moveRight, moveUp, moveDown]
        return validMoves.includes(fruitReplacedId)
    }

    function isMatch(id) {
        let fruitObjId = id
        let possibleMatches = []
        if ((fruitObjId+1 <= gridItems - 1) && (fruitObjId+2 <= gridItems - 1) && (fruitObjId+1 >= 0) && (fruitObjId+2 >= 0)
            && ((fruitObjId+1) % gridCols !== 0) && ((fruitObjId+2) % gridCols !== 0)) {
            possibleMatches.push([fruitObjId, fruitObjId+1, fruitObjId+2])
        }
        if ((fruitObjId-1 <= gridItems - 1) && (fruitObjId-2 <= gridItems - 1) && (fruitObjId-1 >= 0) && (fruitObjId-2 >= 0)
            && ((fruitObjId) % gridCols !== 0) && ((fruitObjId-1) % gridCols !== 0) ) {
            possibleMatches.push([fruitObjId, fruitObjId-1, fruitObjId-2])
        }
        if ((fruitObjId+1 <= gridItems - 1) && (fruitObjId-1 <= gridItems - 1) && (fruitObjId+1 >= 0) && (fruitObjId-1 >= 0)
            && (fruitObjId % gridCols !== 0) && ((fruitObjId+1) % gridCols !== 0)) {
            possibleMatches.push([fruitObjId+1, fruitObjId, fruitObjId-1])
        }
        if ((fruitObjId+gridCols <= gridItems - 1) && (fruitObjId+(gridCols*2) <= gridItems - 1) && (fruitObjId+gridCols >= 0) && (fruitObjId+(gridCols*2) >= 0)) {
            possibleMatches.push([fruitObjId, fruitObjId+gridCols, fruitObjId+(gridCols*2)])
        }
        if ((fruitObjId-gridCols <= gridItems - 1) && (fruitObjId-(gridCols*2) <= gridItems - 1) && (fruitObjId-gridCols >= 0) && (fruitObjId-(gridCols*2) >= 0)) {
            possibleMatches.push([fruitObjId, fruitObjId-gridCols, fruitObjId-(gridCols*2)])
        }
        if ((fruitObjId+gridCols <= gridItems - 1) && (fruitObjId-gridCols <= gridItems - 1) && (fruitObjId+gridCols >= 0) && (fruitObjId-gridCols >= 0)) {
            possibleMatches.push([fruitObjId+gridCols, fruitObjId, fruitObjId-gridCols])
        }
        return possibleMatches.some(possibleMatch => namesMatch(possibleMatch, fruitArray[fruitObjId]))
    }

    function namesMatch(possibleMatch, mainFruitObj) {
        return possibleMatch.every(index => checkName(fruitArray[index], mainFruitObj))
    }

    function checkName(fruitObj, mainFruitObj) {
        if (typeof fruitObj !== 'undefined') {
            return fruitObj.name === mainFruitObj.name
        }
        return false
    }

    function checkRowOfThree() {
        console.log('--------------Checking rows...')
        let fruitMatchesRows = [];
        fruitArray.forEach((fruitObj, i) => {
                if (i >= gridItems - 1 || ((i+1) % gridCols === 0) || ((i+2) % gridCols === 0)) return
                let rowIndexes = [i, i+1, i+2]
                fruitMatchesRows = concatIfMatch(fruitMatchesRows, fruitObj, rowIndexes)
        })
        combineIndexArrays(fruitMatchesRows)
    }

    function checkColOfThree() {
        console.log('--------------Checking columns...')
        let fruitMatchesCols = [];
        fruitArray.forEach((fruitObj, i) => {
                if (gridItems - (gridCols * 2) <= i ) return
                let colIndexes = [i, i + gridCols, i + (gridCols*2)]
                fruitMatchesCols = concatIfMatch(fruitMatchesCols, fruitObj, colIndexes)
        })
        combineIndexArrays(fruitMatchesCols)
    }

    function concatIfMatch(fruitMatches, fruitObj, indexes) {
        if (indexes.every(x => fruitArray[x].name === fruitObj.name )) {
            return fruitMatches.concat(indexes)
        }
        return fruitMatches
    }

    function combineIndexArrays(indexArray) {
        if (indexArray && indexArray.length) {
            matchedIndexArray = matchedIndexArray.concat(indexArray)
        }
    }

    function editFruitArray() {
//        checkRowOfThree();
//        checkColOfThree();
        // reduce array so numbers are not repeating
//        matchedIndexArray = [...new Set(matchedIndexArray)];
        // go through each index
        fallingFruits = [];
        if (matchedIndexArray.length > 0) {
            matchedIndexArray.reverse().forEach(id => {
                        console.log('-------------Editing fruit array...')
                        fruitArray[id] = randomFruit();
                        let index = id
                        let indexAbove = index + gridCols
                        let element = document.getElementById(index)
                        // "pop" element
                        element.classList.add('popped')
                        SCORE += 40;
                        // move item to the end of "column"
                        while ( indexAbove < gridItems ) {
                            let currentFruit = fruitArray[index]
                            let aboveFruit = fruitArray[indexAbove]
                            // switch fruits
                            fruitArray[index] = aboveFruit
                            fruitArray[indexAbove] = currentFruit
                            // switch elements
//                            let belowElement = document.getElementById(index)
//                            let aboveElement = document.getElementById(indexAbove)
//                            let belowImg = belowElement.style.backgroundImage
//                            let aboveImg = aboveElement.style.backgroundImage
//                            belowElement.style.backgroundImage = aboveImg
//                            aboveElement.style.backgroundImage = belowImg
                            // next row
                            index = indexAbove
                            indexAbove = index + gridCols
                        }
                        let fallingFruit = index
                        while (fallingFruits.includes(fallingFruit)) {
                            fallingFruit -= gridCols
                        }
                        fallingFruits.push(fallingFruit)
            })
            // move elements down

        }

    }

    function createColumnsArray() {
        let firstArray = [];
        for (i=0; i < gridCols; i++) {
            let secondArray = [];
            let index = i;
            while (index < gridItems) {
                secondArray.push(index);
                index += gridCols
            }
            firstArray.push(secondArray)
        }
        return firstArray
    }

    function moveElementsDown() {
        console.log('-------------Moving elements down...')
        for (i=gridItems-1; i > 0; i--) {
            if (matchedIndexArray.includes(i)) {
                let element = document.getElementById(i)
                // destroy element
                element.classList.add('popped')
                // move above elements down
                let aboveElementId = i + gridCols
                while (aboveElementId < gridItems) {
                    let aboveElement = document.getElementById(aboveElementId)
                    if (!aboveElement.classList.contains('popped')) {
                        aboveElement.style.transform = 'translate(0, 100%)'
                        aboveElement.id = aboveElementId - gridCols
                        setTimeout(() => {
                            let currentRow = parseInt(aboveElement.style.gridRow)
                            let belowRow = currentRow + 1
                            aboveElement.style.transform = ''
                            aboveElement.style.gridRow = belowRow
                        }, 500)
                    }
                    aboveElementId += gridCols
                }
            }


//            fallingFruits.forEach(index => {
//                document.getElementById(index).dataset.fruit = fruitArray[index].name
//                document.getElementById(index).style.backgroundImage = `url("/static/game/images/fruits_svg/${fruitArray[index].name}.svg")`
////                setTimeout (() => { document.getElementById(index).classList.add('above') }, 0 )
////                setTimeout (() => { document.getElementById(index).classList.remove('above') }, 500)
//            })
        }
    }

    function updateProgressBar() {
        let PERCENT = Math.round((SCORE / TARGET) * 100)
        if (PERCENT > 0 && PERCENT < 100) {
            progressBar.style.width = `${PERCENT}%`
            progressDisplay.textContent = `${PERCENT}%`
            progressBar.classList.remove('full')
        } else if (PERCENT >= 100) {
            progressBar.style.width = '100%'
            progressDisplay.textContent = '100%'
            progressBar.classList.add('full')
        }
    }

    function displayMoves() {        
        movesDisplay.textContent = MOVES
    }

    function displayTarget() {        
        targetDisplay.textContent = TARGET
    }

    function displayLevel() {        
        levelDisplay.textContent = LEVEL
    }

    function displayScore() {
        scoreDisplay.textContent = SCORE;
    }

    function pauseGame(event) {
        event.preventDefault();
        paused = !paused
        if (paused) {
            pauseText.textContent = 'Play';
            pauseButton.classList.add('play-btn');
        } else {
            pauseText.textContent = 'Pause';
            pauseButton.classList.remove('play-btn')
        }

    }

    function endLevel() {
        if (TARGET <= SCORE) {
            paused = true
            if (confirm('Moving to next level') === true) {
                nextLevel()
            } else {
                close()
            }
        }
    }

    function nextLevel() {
        LEVEL += 1
        MOVES_START -= 5
        MOVES = MOVES_START
        SCORE = 0
        TARGET += 500
        gameGrid.innerHTML = '';
        progressBar.style.width = 0
        progressDisplay.textContent = '0%'
        startGame();
        paused = false
    }

    function endGame() {
        if (MOVES === 0 && SCORE < TARGET) {
            alert('you lose')
            return true
        }
        if (LEVEL >= fruitStringArray.length && SCORE >= TARGET) {
            alert('congrats, you\'ve won')
            return true
        }
        return false
    }

});
