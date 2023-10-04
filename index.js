// Ctor

const initialize = () => {
    const inputs = document.getElementById("inputs");
    const machine = document.querySelector(".machineDiv");
    const speedInput = document.getElementById("speedSlider");
    const showCurrentState = document.getElementById("currentState");
    const loader = document.getElementById("loader");
    const tapes = document.getElementById("tapes");
    const resetWithOutputButton = document.getElementById("resetWithOuputButton");
    const resetButton = document.getElementById("resetButton");
    const copyOutputButton = document.getElementById("copyOutputButton");
    const recognizeText = document.getElementById("recognizeText");
    const exampleSelector = document.getElementById("exampleSelector");
    const loadExampleButton = document.getElementById("loadExampleButton");
    const stepButton = document.getElementById("stepButton");
    const runButton = document.getElementById("runButton");
}

document.addEventListener("DOMContentLoaded", initialize)

let loadExampleGlowing = false;
exampleSelector.addEventListener("change", () => {
    loadExampleButton.style.animation = "1s infinite alternate loadExampleBreathe";
    loadExampleGlowing = true;
});

const fr = new FileReader();
loader.addEventListener('change', (event) => {
    fr.readAsText(loader.files[0]);
});

fr.addEventListener('load', (event) => {
    editor.setValue(event.target.result);
    compileVisuals();
});

let editor = CodeMirror(document.querySelector(".editor"), {
    lineNumbers: true,
    tabSize: 4});

document.querySelector(".editor").addEventListener("keyup", () => {
    compileVisuals();
});

speedInput.addEventListener("mouseup", function() {
    speed = 1001 - speedInput.value;
}, false);

// Engine

let cellsPerTapePerTrack = [];
let leftCellsPerTapePerTrack = [];
let currentCellPerTape = [];
let speed = 1001 - speedInput.value;
let totalNumberOfTracks = 0;
let inputPerTrack = [];
let previousTotalNumberOfTracks = 0;
let previousNumberOfTapes = 0;
let inputAlphabet = [];
let tapeAlphabet = [];
let numberOfTapes = 0;
let numberOfTracksPerTape = [];
let infiniteDirectionsPerTape = [];
let startState = "";
let finalStates = [];
let transitions = Object.create(null);
let squares = [];
let currentState = "";
let errorLine = 0;
let mainUpdate;

setInputToCellData = () => {
    // Used to keep track of the "global" (not in relation to tapes) number of tracks completed
    let currentTrack = 0;
    
    // Push tapes
    for(let tapeIdx = 0; tapeIdx < numberOfTapes; tapeIdx++) {
        cellsPerTapePerTrack.push([]);
        leftCellsPerTapePerTrack.push([]);        

        // Push tracks
        let trackCount = numberOfTracksPerTape[tapeIdx];
        for(let trackIdx = 0; trackIdx < trackCount; trackIdx++, currentTrack++) {
            cellsPerTapePerTrack[tapeIdx].push([]);
            leftCellsPerTapePerTrack[tapeIdx].push([]);

            // Push individual values from input string(s)
            for(let cellIdx = 0; cellIdx < inputPerTrack[currentTrack].length; cellIdx++) {
                cellsPerTapePerTrack[tapeIdx][trackIdx].push(inputPerTrack[currentTrack][cellIdx]);
            }
        }
    }
}

clearCells = () => {
    cellsPerTapePerTrack = [];
    leftCellsPerTapePerTrack = [];
    currentCellPerTape = [];
}

clearMachine = () => {
    clearInterval(mainUpdate);
    clearCells();
    inputAlphabet = [];
    tapeAlphabet = [];
    startState = "";
    finalStates = [];
    transitions = Object.create(null);
    currentState = "";
    updateCurrentState();
    resetWithOutputButton.disabled = true;
    resetButton.disabled = true;
    copyOutputButton.disabled = true;
    recognizeText.innerHTML = "N/A";
}

let editorHasBeenInterpreted = false;
codeIsValid = () => {
    if(!editorHasBeenInterpreted || !inputHasBeenSet) {
        return interpretEditor();
    }
    return true;
}

giveErrorMessage = (errorMessage) => {
    alert("Issue encountered in code at line " + errorLine + "!\n" + errorMessage);
} 

run = () => {
    
    if(codeIsValid()) {
        stepButton.disabled = true;
        toggleRunStop();
        mainUpdate = setInterval(function() {
            doNext(currentState, getCharAtCurrentCell());
        }, speed);
    }
}

stop = () => {
    clearInterval(mainUpdate);
    toggleRunStop();
}

let inputHasBeenSet = false;
step = () => {
    // Makes sure the tracks have the input strings showing... helps look better
    if(!inputHasBeenSet) {
        interpretEditor();
    } else {
        if(codeIsValid()) {
            doNext(currentState, getCharAtCurrentCell());
        } else {
            alert("Issue encountered in code at line " + errorLine + "!");
        }
    }   
}

toggleRunStop = () => {
    if(runButton.innerHTML == "Run") {
        // Change to Stop
        runButton.onclick =  () => { stop(); };
        runButton.innerHTML = "Pause";
        
    } else {
        // Change to Run
        runButton.onclick = () => { run(); };
        stepButton.disabled = false;
        runButton.innerHTML = "Run";
    }
}

reset = () => {
    interpretEditor();
    runButton.disabled = false;
    stepButton.disabled = false;
}

resetWithCurrentOutput = () => {
    recognizeText.innerHTML = "N/A";
    currentState = startState;
    updateCurrentState();

    currentCellPerTape = []
    for(let i = 0; i < numberOfTapes; i++) {
        currentCellPerTape.push(0);
        displayTracksPerTape(i);
    }

    resetButton.disabled = true;
    resetWithOutputButton.disabled = true;
    copyOutputButton.disabled = true;
    runButton.disabled = false;
    stepButton.disabled = false;
}

moveTapeRight = (tapeIdx) => {
    currentCellPerTape[tapeIdx]++;
    displayTracksPerTape(tapeIdx);
}

moveTapeLeft = (tapeIdx) => {
    if(currentCellPerTape[tapeIdx] == 0 && infiniteDirectionsPerTape[tapeIdx] == "1") {
        crash("Segmentation Fault");
    } else {
        currentCellPerTape[tapeIdx]--;
        displayTracksPerTape(tapeIdx);
    }
}

getCharAtCurrentCell = () => {
    let final = "";
    for(let tapeIdx = 0; tapeIdx < numberOfTapes; tapeIdx++) {
        for(let trackIdx = 0; trackIdx < numberOfTracksPerTape[tapeIdx]; trackIdx++) {
            if(currentCellPerTape[tapeIdx] < 0) {
                // Look at left infinite cells
                if(typeof leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(currentCellPerTape[tapeIdx] + 1)] == "undefined" || leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(currentCellPerTape[tapeIdx] + 1)] == "") {
                    final += "B+";
                } else {
                    final += leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(currentCellPerTape[tapeIdx] + 1)] + "+";
                }
            } else {
                // Look at right infinite cells
                if(typeof cellsPerTapePerTrack[tapeIdx][trackIdx][currentCellPerTape[tapeIdx]] == "undefined" || cellsPerTapePerTrack[tapeIdx][trackIdx][currentCellPerTape[tapeIdx]] == "") {
                    final += "B+";
                } else {
                    final += cellsPerTapePerTrack[tapeIdx][trackIdx][currentCellPerTape[tapeIdx]] + "+";
                }
            }
        }
    }
    
    // Remove the final, hanging "+"
    final = final.slice(0, -1);
    
    return(final);
}

copyCode = () => {
    navigator.clipboard.writeText(editor.getValue());
    alert("Copied program to clipboard!");
}

download = () => {
    let editorData = editor.getValue();
    let fileName = removeComment(editorData.split("\n")[1]);
    let fileData = new Blob([editorData], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(fileData, fileName + ".txt");
}

load = () => {
    loader.click();
}

// Engine: Interpretation

removeComment = (lineToParse) => {
    return lineToParse.split("//")[0].trim();
}

interpretEditor = () => {
    clearMachine();

    // Set up each track
    inputPerTrack = [];
    for(let i = 0; i < totalNumberOfTracks; i++) {
        inputPerTrack.push(document.getElementById("input" + i).value);
    }

    let lines = editor.getValue().split("\n");
    // Bounds check
    if(removeComment(lines[0]) != "ATM") {
        alert("First line must specify that the program is a Turing Machine program (ATM)!");
        return false;
    }
    if(removeComment(lines[lines.length - 1]).toLowerCase() != "end") {
        alert("Last line must specify the end of the program (END)!");
        return false;
    }

    inputAlphabet = removeComment(lines[2]).split(/\s+/);
    tapeAlphabet = removeComment(lines[3]).split(/\s+/);
    numberOfTapes = removeComment(lines[4]).split(/\s+/);
    
    for(let tapeIdx = 0; tapeIdx < numberOfTapes; tapeIdx++) {
        for(let trackIdx = 0; trackIdx < numberOfTracksPerTape[tapeIdx]; trackIdx++) {
            // Push individual tracks
            squares[tapeIdx].push(document.getElementById("track" + tapeIdx + trackIdx).children);
        }
    }

    startState = currentState = removeComment(lines[(2 * numberOfTapes) + 5]);
    finalStates = removeComment(lines[(2 * numberOfTapes) + 6]).split(/\s+/);

    // Remove the config lines, leaving only the transitions
    lines.splice(0, (2 * numberOfTapes) + 7);
    
    // Interpret lines describing transition functions
    errorLine = (2 * numberOfTapes) + 7 + 1;
    for(let i = 0; i < lines.length; i++, errorLine++) {
        if(!interpretTransitions(lines[i])) {
            return false;
        }
    }

    // Check if the characters given in all the input are all part of the input alphabet
    for(let trackIdx = 0; trackIdx < totalNumberOfTracks; trackIdx++) {
        for(let i = 0; i < inputPerTrack[trackIdx].length; i++) {
            if(!inputAlphabet.includes(inputPerTrack[trackIdx][i])) {
                giveErrorMessage("All characters in all input strings need to be part of the input alphabet.")
                return false;
            }
        }
    }

    // The program is valid
    setInputToCellData();

    for(let i = 0; i < numberOfTapes; i++) {
        currentCellPerTape.push(0);
        displayTracksPerTape(i);
    }

    editorHasBeenInterpreted = true;
    inputHasBeenSet = true;
    updateCurrentState();
    return true;
}

interpretTransitions = (transitionToInterpret) => {
    let transitionText = removeComment(transitionToInterpret);
    if(transitionText.toLowerCase() == "end") {
        return true;
    }

    let transitionInfo = transitionText.split(/\s+/);
    if(transitionInfo.length != 5) {
        giveErrorMessage("All transition functions need to have 5 parts. See instruction manuel.");
        return false;
    }

    // Lex the next cell value info and next direction info
    newCellChars = transitionInfo[3].split("+");
    newDirections = transitionInfo[4].split("+");

    // Check if the proposed read character(s) is some combination of the tape alphabet
    let givenCellChars = transitionInfo[1].split("+");
    for(let i = 0; i < givenCellChars.length; i++) {
        if(givenCellChars[i] != "*" && !tapeAlphabet.includes(givenCellChars[i])){
            giveErrorMessage("Character(s) to read need to be of the tape alphabet.");
            return false;
        }
    }

    // and proposed write character(s)
    for(let i = 0; i < newCellChars.length; i++) {
        if(!tapeAlphabet.includes(newCellChars[i]) && newCellChars[i] != "*"){
            giveErrorMessage("Character(s) to write need to be of the tape alphabet.");
            return false;
        }
    }

    // Check that the next cell values
    if(newCellChars.length != totalNumberOfTracks) {
        giveErrorMessage("Count of characters to write needs to match the total count of tracks.");
        return false;
    }

    // and next directions are valid
    if(newDirections.length != numberOfTapes) {
        giveErrorMessage("Count of directions to move needs to match the total count of tapes.");
        return false;
    }

    // And that the next direction is either R or L or S
    for(let i = 0; i < newDirections.length; i++) {
        if(newDirections[i].toLowerCase() != "r" && newDirections[i].toLowerCase() != "l" && newDirections[i].toLowerCase() != "s") {
            giveErrorMessage("Valid direction(s) are 'R', 'L', or 'S'");
            return false;
        }
    }

    transitions[transitionInfo[0] + "," + transitionInfo[1]] = {nextState: transitionInfo[2], nextCellValuePerTrack: newCellChars, nextDirectionPerTape: newDirections};
    return true;
}

// Engine: Executing the machine

recognized = () => {
    clearInterval(mainUpdate);
    recognizeText.innerHTML = "Recognized";
}

notRecognized = () => {
    clearInterval(mainUpdate);
    recognizeText.innerHTML = "Not Recognized";
}

crash = (errorMessage) => {
    clearInterval(mainUpdate);
    recognizeText.innerHTML = "Crashed: " + errorMessage;
}

findWilcardTransition = (state, cellValue) => {
    // wildcardString will act as some read in value to see if there is or is not some transition function 
    // that would deal with wildcardString (given the state of the machine)
    let wildcardString = "";

    // Loop checks in pattern *+B+B, B+*+B, B+B+*, *+*+B, B+*+*, *+*+*.
    for(let wildcardCount = 1; wildcardCount <= ((cellValue.length - 1) / 2) + 1; ++wildcardCount) {
        // Starting character will move the wildcards over to get all possible combinations
        for(let startingCharacter = 0; startingCharacter <= ((cellValue.length - 1) / 2) - (wildcardCount - 1); ++startingCharacter) {

            wildcardString = cellValue;

            // Add all the wildcards
            for(let wildcardIdx = 0; wildcardIdx < wildcardCount; ++wildcardIdx) {
                wildcardString = wildcardString.substring(0, (startingCharacter * 2) + (wildcardIdx * 2)) + "*" + wildcardString.substring(((startingCharacter * 2) + (wildcardIdx * 2)) + 1);
            }

            if(transitions[state + "," + wildcardString] != null) {
                return transitions[state + "," + wildcardString];
            }
        }
    }

    // If there is no matching wildcard transition, give back undefined so that the machine will halt
    return undefined;
}

doNext = (state, cellValue) => {
    let currentGlobalTrack = 0;
    let instructions = transitions[state + "," + cellValue] ?? findWilcardTransition(state, cellValue);

    if(typeof instructions != "undefined") {
        currentState = instructions.nextState;
        updateCurrentState();

        for(let tapeIdx = 0; tapeIdx < numberOfTapes; tapeIdx++) {
            for(let trackIdx = 0; trackIdx < numberOfTracksPerTape[tapeIdx]; trackIdx++, currentGlobalTrack++) {
                if(infiniteDirectionsPerTape[tapeIdx] == "2" && currentCellPerTape[tapeIdx] < 0) {
                    // Write to left track
                    if(instructions.nextCellValuePerTrack[currentGlobalTrack] != "*") {
                        leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(0 - (currentCellPerTape[tapeIdx] + 1))] = instructions.nextCellValuePerTrack[currentGlobalTrack];
                    }
                } else if (currentCellPerTape[tapeIdx] >= 0) {
                    // Write to right track
                    if(instructions.nextCellValuePerTrack[currentGlobalTrack] != "*") {
                        cellsPerTapePerTrack[tapeIdx][trackIdx][currentCellPerTape[tapeIdx]] = instructions.nextCellValuePerTrack[currentGlobalTrack];
                    }
                }
            }

            if(instructions.nextDirectionPerTape[tapeIdx].toLowerCase() == "r") {
                moveTapeRight(tapeIdx);
            } else if(instructions.nextDirectionPerTape[tapeIdx].toLowerCase() == "l") {
                moveTapeLeft(tapeIdx);
            } else {
                displayTracksPerTape(tapeIdx);
            }
        } 
    } else {
        // Machine has halted

        stepButton.disabled = true;
        // Set run button back to run option;
        runButton.onclick = () => { run(); };
        runButton.innerHTML = "Run";
        runButton.disabled = true;

        if(finalStates.includes(currentState)) {
            recognized();
        } else {
            notRecognized();
        }
        resetWithOutputButton.disabled = false;
        resetButton.disabled = false;
        copyOutputButton.disabled = false;
    }
}

copyOutput = () => {
    let output = "";
    for(let tapeIdx = 0; tapeIdx < numberOfTapes; ++tapeIdx) {
        for(let trackIdx = 0; trackIdx < numberOfTracksPerTape[tapeIdx]; ++trackIdx) {
            output += ("tape" + tapeIdx + ".track" + trackIdx + ": ");
            // Get left cells
            for(let cellIdx = 0; cellIdx < leftCellsPerTapePerTrack[tapeIdx][trackIdx].length; ++cellIdx) {
                output += leftCellsPerTapePerTrack[tapeIdx][trackIdx][leftCellsPerTapePerTrack[tapeIdx][trackIdx].length - (cellIdx + 1)];
            }

            // Get right cells
            for(let cellIdx = 0; cellIdx < cellsPerTapePerTrack[tapeIdx][trackIdx].length; ++cellIdx) {
                output += cellsPerTapePerTrack[tapeIdx][trackIdx][cellIdx];
            }

            output += "\n";
        }
    }
    navigator.clipboard.writeText(output);
    alert("Copied output to clipboard!")
}

pasteInputStrings = (eventInfo) => {
    eventInfo.preventDefault();

    let individualInputs = inputs.querySelectorAll("input");
    let clipboardValue = eventInfo.clipboardData.getData("text");

    // Process clipboard value
    clipboardValue = clipboardValue.split("\n");
    let lineCount = clipboardValue.length;
    let values = [];
    for(let lineIdx = 0; lineIdx < lineCount; ++lineIdx) {
        try {
            let line = clipboardValue[lineIdx].split(": ")[1] ?? clipboardValue[lineIdx];
            line.trim();
            // If line is entirly underscores (i.e. blank), only give truly blank line 
            if(/^B*$/g.test(line)) {
                values.push("");
            } else {
                values.push(line);
            }
        } catch {
            break;
        }
    }

    // Put clipboard value to inputs
    let length = Math.min(individualInputs.length, lineCount);
    for(let inputIdx = 0; inputIdx < length; ++inputIdx) {
        individualInputs[inputIdx].value = values[inputIdx];
    }
}

loadExample = () => {
    editor.setValue(baseExamples[exampleSelector.options[exampleSelector.selectedIndex].id]);
    compileVisuals();
}

unsetInput = () => {
    clearInterval(mainUpdate);
    inputHasBeenSet = false;
    resetButton.disabled = true;
    resetWithOutputButton.disabled = true;
    copyOutputButton.disabled = true;
    runButton.disabled = false;
    stepButton.disabled = false;
}

// Visuals

compileVisuals = () => {
    clearInterval(mainUpdate);
    resetWithOutputButton.disabled = true;
    resetButton.disabled = true;
    copyOutputButton.disabled = true;
    recognizeText.innerHTML = "N/A";
    totalNumberOfTracks = 0;
    let lines = editor.getValue().split("\n");
    numberOfTapes = removeComment(lines[4]).split(/\s+/);
    infiniteDirectionsPerTape = [];
    for(let i = 0; i < numberOfTapes; i++) {
        totalNumberOfTracks += parseInt(removeComment(lines[5 + i]).split(/\s+/));
        infiniteDirectionsPerTape.push(parseInt(removeComment(lines[parseInt(numberOfTapes) + 5 + i]).split(/\s+/)));
    }

    // Set up input areas for input strings per track
    if(totalNumberOfTracks != previousTotalNumberOfTracks || numberOfTapes != previousNumberOfTapes.toString()) {
        inputs.innerHTML = "<label for=\"input\">Input</label><br>\n\
        <input type=\"text\" class=\"input spaces\" name=\"input\" id=\"input0\" onchange=\"unsetInput()\"></input><br>";
        for(let i = 1; i < totalNumberOfTracks; i++) {
            inputs.innerHTML += "<input type=\"text\" class=\"input spaces\" name=\"input\" id=\"input" + i + "\" onchange=\"unsetInput()\"></input><br>";
        }
        document.getElementById("input0").addEventListener("paste", (event) => {pasteInputStrings(event);})

        previousTotalNumberOfTracks = totalNumberOfTracks;
        previousNumberOfTapes = numberOfTapes;

        tapes.innerHTML = "";
        numberOfTracksPerTape = [];
        squares = [];
        for(let i = 0; i < numberOfTapes; i++) {
            // New array to push squares of each track into
            squares.push([]);

            numberOfTracksPerTape.push(parseInt(removeComment(lines[5 + i]).split(/\s+/)));

            // Construct the tape in html
            for(let j = 0; j < numberOfTracksPerTape[i]; j++) {
                tapes.innerHTML += "\
<div class=\"machineDiv\" id=\"track" + i + j + "\">\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
    <div class=\"square\" id=\"s\"></div>\n\
</div>\n\
        "
        }
        // Add the head of the current tape
        tapes.innerHTML += "\
<div id=\"head\">\n\
    <div class=\"triangle center\"></div>\n\
</div>"
        }
    }
    if(loadExampleGlowing) {
        loadExampleButton.style.backgroundColor = "";
        loadExampleButton.style.borderColor = "";
        loadExampleButton.style.animation = "";
        loadExampleGlowing = false;
    }
    stepButton.disabled = false;
    runButton.disabled = false;
    inputHasBeenSet = false;
    editorHasBeenInterpreted = false;
}

displayTracksPerTape = (tapeIdx) => {
    let trackCount = numberOfTracksPerTape[tapeIdx];
    for(let trackIdx = 0; trackIdx < trackCount; trackIdx++) {
        // cell is offset by 4 because the first square in a track is 4 left from the cell over which is the head (i.e. the center square)
        for(let squareIdx = 0, cell = (currentCellPerTape[tapeIdx] - 4); squareIdx < 9; squareIdx++, cell++) {
            if(cell < 0) {
                if(typeof leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(0 - (cell + 1))] != "undefined" && leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(0 - (cell + 1))] != "B") {
                    squares[tapeIdx][trackIdx][squareIdx].innerHTML = leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(0 - (cell + 1))];
                } else {
                    squares[tapeIdx][trackIdx][squareIdx].innerHTML = "";
                }
            } else {
                if(typeof cellsPerTapePerTrack[tapeIdx][trackIdx][cell] != "undefined" && cellsPerTapePerTrack[tapeIdx][trackIdx][cell] != "B") {
                    squares[tapeIdx][trackIdx][squareIdx].innerHTML = cellsPerTapePerTrack[tapeIdx][trackIdx][cell];
                } else {
                    squares[tapeIdx][trackIdx][squareIdx].innerHTML = "";
                }
            }
        }
    }
}

toggleDarkMode = () => {
    document.body.classList.toggle("darkMode");
    inputs.classList.toggle("inputDarkMode");
    document.querySelector(".box").classList.toggle("boxDarkMode");

    if(localStorage.getItem("darkMode") === "true") {
        localStorage.setItem("darkMode", false);
    } else {
        localStorage.setItem("darkMode", true);
    }
}

updateCurrentState = () => {
    showCurrentState.innerHTML = "Current State: " + currentState;
}