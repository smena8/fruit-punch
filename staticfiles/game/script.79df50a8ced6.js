"use strict";

document.addEventListener('DOMContentLoaded', (event) => {

    let i;
    const gameGrid = document.querySelector('.game-grid');
    const gridCols = 7;
    const gridRows = 7;
    const gridItems = gridCols*gridRows;
    gameGrid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    gameGrid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    // display numbers
    const scoreDisplay = document.getElementById('score');
    const targetDisplay = document.getElementById('target');
    const levelDisplay = document.getElementById('level');
    const movesDisplay = document.getElementById('moves');
    const progressContainer = document.getElementById('progressContainer')
    const progressDisplay = document.getElementById('progress');
    const progressBar = document.getElementById('progressBar');
    const progressBackground = document.getElementById('progressBackground');
    // modal
    const modalContainer = document.getElementById('modalContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalReason = document.getElementById('modalReason');
    const modalButton1 = document.getElementById('modalButton1');
    const modalButton2 = document.getElementById('modalButton2');

    modalButton1.addEventListener('click', buttonEvents)
    modalButton2.addEventListener('click', buttonEvents)
    //
    let TRANSITION_SPEED = 350;
    let SPEED = 2;
    let SCORE = 0;
    let POINTS_PER = 20;
    let TARGET = 1000;
    let MOVES_START = 40;
    let MOVES = 40;
    let LEVEL = 1;

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
            this.points = 50;
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
    const pauseButton = document.querySelector('#pause');
    pauseButton.addEventListener('click', pauseGame);

    let lastRenderTime;
    let matchedIndexArray = [];
    let fruitInstances = [];
    let matchHint = [];
    let fallingFruits = [];
    let flashing;
    startGame();
    setTimeout (() => { window.requestAnimationFrame(main); }, 0)

    function main(currentTime) {
        window.requestAnimationFrame(main);
        const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
        if ( paused || secondsSinceLastRender < 1.5 ) {
            return
        }
        lastRenderTime = currentTime;
        // add some functions here
        matchedIndexArray = [];
        checkRowOfThree();
        checkColOfThree();
        if (matchedIndexArray.length > 0) {
            // reduce array so numbers are not repeating
            matchedIndexArray = [...new Set(matchedIndexArray)];
            // render elements
            requestAnimationFrame(() => {
                // slowly make fruit disappear
                destroyFruits();
                // move elements down
                arrangeColumns();
            });
        }
        if (matchedIndexArray.length === 0 && matchHint.length === 0) {
            matchHint = searchPotentialMatches();
            flashing = setInterval(flashHint, 1000);
            // if matchHint still zero then start new array and refresh the elements
            if (matchHint.length === 0) {
                updateModal('Shuffle Fruits', 'No more moves, shuffling fruits...', 'Shuffle');
                setTimeout(() => {
                    gameGrid.innerHTML = '';
                    shuffleFruitArray();
                    replaceFruitElements();
                    clearHint();
                    setTimeout(() => {
                        modalContainer.style.display = 'none';
                        gameGrid.classList.remove('disabled');
                    }, 1000)

                }, 0)

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
        console.log('end loop')

    }

    // functions ----------------------------------------------------------------------------------------------------

    function startGame() {
        modalContainer.style.display = 'none';
        gameGrid.classList.remove('disabled');
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
                    MOVES -= 1;
                    clearHint();
            } else {
                fruitArray[fruitReplacedId] = fruitReplaced
                fruitArray[fruitDraggedId] = fruitDragged
            }
        }
    }

    function switchTwoElements(fruitDraggedId, fruitReplacedId) {
        let fruitReplaceElement = document.getElementById(fruitReplacedId)
        let fruitDraggedElement = document.getElementById(fruitDraggedId)
        fruitReplaceElement.classList.add('switch')
        fruitDraggedElement.classList.add('switch')
        if (fruitDraggedId - 1 === fruitReplacedId) {
            fruitReplaceElement.classList.add('left') // left
            fruitDraggedElement.classList.add('right') // right
        }
        if (fruitDraggedId + 1 === fruitReplacedId) {
            fruitDraggedElement.classList.add('left') // left
            fruitReplaceElement.classList.add('right') // right
        }
        if (fruitDraggedId - gridCols === fruitReplacedId) {
            fruitDraggedElement.classList.add('down') // down
            fruitReplaceElement.classList.add('up') // up
        }
        if (fruitDraggedId + gridCols === fruitReplacedId) {
            fruitReplaceElement.classList.add('down') // down
            fruitDraggedElement.classList.add('up')// up
        }
        fruitReplaceElement.id = fruitDraggedId;
        fruitDraggedElement.id = fruitReplacedId;
            //potential setTimeout

        switchElementRows(fruitReplaceElement, fruitDraggedElement)
    }

    function switchElementRows(fruitReplaceElement, fruitDraggedElement) {
            let replaceElementGridArea = fruitReplaceElement.style.gridArea
            let draggedElementGridArea = fruitDraggedElement.style.gridArea
            fruitReplaceElement.style.gridArea = draggedElementGridArea
            fruitDraggedElement.style.gridArea = replaceElementGridArea
            fruitReplaceElement.classList.remove('switch', 'up', 'down', 'left', 'right')
            fruitDraggedElement.classList.remove('switch', 'up', 'down', 'left', 'right')
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

    function destroyFruits() {
        gameGrid.classList.add('disabled');
        console.log('none')
        matchedIndexArray.forEach(index => {
            SCORE += POINTS_PER
            let matchedElement = document.getElementById(index)
            matchedElement.setAttribute('data-status', 'destroy')
            matchedElement.style.transition = `transform ${TRANSITION_SPEED/2}ms linear`;
            matchedElement.style.transform = 'translate(0, 0) scale(0)';
            console.log('fruits disappeared...')
        })

    }

    function arrangeColumns() {
        let destroyedElems = document.querySelectorAll('[data-status="destroy"]')
        setTimeout(() => {
            destroyedElems.forEach(destroyedElem => {
                let elementId = parseInt(destroyedElem.id);
                // bring above items down, IF there are any above elements
                // note last element in column
                // render elements
                let lastElementId = moveElementDown(elementId);
                // change top element in column and corresponding fruit array

            })
            gameGrid.classList.remove('disabled');
            console.log('unset')
        }, TRANSITION_SPEED)

    }

    function changeFruitElement(lastElementId) {
        let lastElementInCol = document.getElementById(lastElementId);
        let newFruitObj = randomFruit();
        fruitArray[lastElementId] = newFruitObj;
        lastElementInCol.dataset.fruit = newFruitObj.name;
        lastElementInCol.style.backgroundImage = `url('${newFruitObj.image}')`;
        lastElementInCol.style.transition = `transform 0ms linear`;
        lastElementInCol.style.transform = 'translate(0, -100vh) scale(1)';
        setTimeout(() => {
            lastElementInCol.style.transition = `transform ${TRANSITION_SPEED}ms linear`;
            lastElementInCol.style.transform = 'translate(0, 0) scale(1)';
            lastElementInCol.removeAttribute('data-status');
        }, TRANSITION_SPEED)
    }

    function moveElementDown(id) {
        let lastElementId = id;
        changeFruitElement(lastElementId);
        for (let aboveId=id+gridCols; aboveId < gridItems ; aboveId+=gridCols) {
            lastElementId = aboveId;
            let belowId = aboveId-gridCols;
            // render switch of elements
            switchTwoElements(aboveId, belowId);
            // exchange in fruit array
            let movedFruit = fruitArray[aboveId];
            let destroyedFruit = fruitArray[belowId];
            fruitArray[aboveId] = destroyedFruit;
            fruitArray[belowId] = movedFruit;
      }
      return lastElementId
    }


    function updateProgressBar() {
        let PERCENT = Math.round((SCORE / TARGET) * 100)
        if (PERCENT > 0 && PERCENT < 100) {
            progressDisplay.textContent = `${PERCENT}%`;
            progressContainer.style.setProperty("--progress-percent", `${PERCENT}%`);
            progressBackground.classList.remove('full');
        } else if (PERCENT >= 100) {
            progressDisplay.textContent = `100%`;
            progressContainer.style.setProperty("--progress-percent", `100%`);
            progressBackground.classList.remove('full');
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
            pauseButton.textContent = 'Play';
            pauseButton.classList.add('play-btn');
            gameGrid.classList.add('disabled');
        } else {
            pauseButton.textContent = 'Pause';
            pauseButton.classList.remove('play-btn')
            gameGrid.classList.remove('disabled');
        }

    }

    function endLevel() {
        if (TARGET <= SCORE) {
            paused = true;
            updateModal('Level Up', 'Moving to next level', 'Next Level');
        }
    }

    function nextLevel() {
        LEVEL += 1
        MOVES_START -= 5
        MOVES = MOVES_START
        SCORE = 0
        TARGET += 500
        clearHint();
        gameGrid.innerHTML = '';
        progressDisplay.textContent = `0%`;
        progressContainer.style.setProperty("--progress-percent", `0%`);
        progressBackground.classList.add('full');
        startGame();
        paused = false
    }

    function endGame() {
        if (MOVES === 0 && SCORE < TARGET) {
            updateModal('Game Over', 'You ran out of moves.', 'Play Again');
            return true
        }
        if (LEVEL >= fruitStringArray.length && SCORE >= TARGET) {
            updateModal('Congrats', 'You completed all the levels to win the game!', 'Play Again');
            return true
        }
        return false
    }

    function updateModal(titleStr, reasonStr, button1Str) {
        modalContainer.style.display = 'block';
        gameGrid.classList.add('disabled');
        modalTitle.innerText = titleStr;
        modalReason.innerText = reasonStr;
        modalButton1.innerText = button1Str;
        modalButton2.innerText = 'Quit';
        if ( modalTitle.innerText === ('Shuffle Fruits' || 'Shuffle fruits')) {
            modalButton1.style.display = 'none';
            modalButton2.style.display = 'none';
        } else {
            modalButton1.style.display = 'inherit';
            modalButton2.style.display = 'inherit';
        }
    }

    function buttonEvents(e) {
        switch (e.target.innerText) {
            case 'Play Again':
                location.reload();
                break;
            case 'Next Level':
                nextLevel();
                break;
            case 'Quit':
                close();
                break;
            default:
                break;
        }
    }

});
