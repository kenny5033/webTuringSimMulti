// Set up document

document.title = "It's Turin' Time!"

setUpDarkMode = () => {
    if(localStorage.getItem("darkMode") === "true") {
        toggleDarkMode();
        // Needs to be set to true again to override toggle
        localStorage.setItem("darkMode", true);
    }
}

const inputs = document.getElementById("inputs");
const machine = document.querySelector(".machineDiv");
const speedInput = document.getElementById("speedSlider");
const showCurrentState = document.getElementById("currentState");
const loader = document.getElementById("loader");
const tapes = document.getElementById("tapes");
const fr = new FileReader();
const rerunButton = document.getElementById("rerunButton");
const copyOutputButton = document.getElementById("copyOutputButton");
const recognizeText = document.getElementById("recognizeText");
const exampleSelector = document.getElementById("exampleSelector");
const loadExampleButton = document.getElementById("loadExampleButton");

let loadExampleGlowing = false;
exampleSelector.addEventListener("change", () => {
    loadExampleButton.style.animation = "1s infinite alternate loadExampleBreathe";
    loadExampleGlowing = true;
});

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

reset = () => {
    clearInterval(mainUpdate);
    clearCells();
    inputAlphabet = [];
    tapeAlphabet = [];
    startState = "";
    finalStates = [];
    transitions = Object.create(null);
    currentState = "";
    updateCurrentState();
    rerunButton.disabled = true;
    copyOutputButton.disabled = true;
    recognizeText.innerHTML = "N/A";
}

run = () => {
    reset();

    // Set up each track
    inputPerTrack = [];
    for(let i = 0; i < totalNumberOfTracks; i++) {
        inputPerTrack.push(document.getElementById("input" + i).value);
    }
    
    if(interpretEditor()) {
        setInputToCellData();

        for(let i = 0; i < numberOfTapes; i++) {
            currentCellPerTape.push(0);
            displayTracksPerTape(i);
        }

        mainUpdate = setInterval(function() {
            doNext(currentState, getCharAtCurrentCell());
        }, speed);

    } else {
        alert("Issue encountered in code at line " + errorLine + "!");
    }
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
    saveAs(fileData, fileName);
}

load = () => {
    loader.click();
}

// Engine: Interpretation

removeComment = (lineToParse) => {
    return lineToParse.split("//")[0].trim();
}

interpretEditor = () => {
    let lines = editor.getValue().split("\n");
    // Bounds check
    if(removeComment(lines[0]) != "ATM") {
        alert("First line must specify that the program is a Turing Machine file (ATM)!");
        return false;
    }
    if(removeComment(lines[lines.length - 1]).toLowerCase() != "end") {
        alert("Last line must specify the end of the program (END)!");
        return false;
    }

    inputAlphabet = removeComment(lines[2]).split(" ");
    tapeAlphabet = removeComment(lines[3]).split(" ");
    numberOfTapes = removeComment(lines[4]).split(" ");
    
    for(let tapeIdx = 0; tapeIdx < numberOfTapes; tapeIdx++) {
        for(let trackIdx = 0; trackIdx < numberOfTracksPerTape[tapeIdx]; trackIdx++) {
            // Push individual tracks
            squares[tapeIdx].push(document.getElementById("track" + tapeIdx + trackIdx).children);
        }
    }

    startState = currentState = removeComment(lines[(2 * numberOfTapes) + 5]);
    updateCurrentState();
    finalStates = removeComment(lines[(2 * numberOfTapes) + 6]).split(" ");

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
                return false;
            }
        }
    }

    // The program is valid
    return true;
}

interpretTransitions = (transitionToInterpret) => {
    let transitionText = removeComment(transitionToInterpret);
    if(transitionText.toLowerCase() == "end") {
        return true;
    }

    let transitionInfo = transitionText.split(" ");
    if(transitionInfo.length != 5) {
        return false;
    }

    // Check if the proposed read character(s) is some combination of the tape alphabet
    let givenCellChars = transitionInfo[1].split("+");
    for(let i = 0; i < givenCellChars.length; i++) {
        if(givenCellChars[i] != "*" && !tapeAlphabet.includes(givenCellChars[i])){
            return false;
        }
    }
    
    // Parse the next cell value info and next direction info
    newCellChars = transitionInfo[3].split("+");
    newDirections = transitionInfo[4].split("+");

    // Check that the next cell values and next directions are valid
    if(newCellChars.length != totalNumberOfTracks || newDirections.length != numberOfTapes) {
        return false;
    }

    for(let i = 0; i < newCellChars.length; i++) {
        if(!tapeAlphabet.includes(newCellChars[i])){
            return false;
        }
    }

    // And that the next direction is either R or L
    for(let i = 0; i < newDirections.length; i++) {
        if(newDirections[i].toLowerCase() != "r" && newDirections[i].toLowerCase() != "l" && newDirections[i].toLowerCase() != "s") {
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
    // wildcardString will act as some read in value to see if there is or is not some transition function that would deal with wildcardString (given the state of the machine)
    let wildcardString = "";
    for(let i = 0; i <= (cellValue.length - 1) / 2; ++i) {
        wildcardString = cellValue;
        wildcardString = wildcardString.substring(0, 2 * i) + "*" + wildcardString.substring((2 * i) + 1);
        if(transitions[state + "," + wildcardString] != null) {
            return transitions[state + "," + wildcardString];
        }
    }
    // If there is no matching wilcard transition, give back undefined so that the machine will halt.
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
                    leftCellsPerTapePerTrack[tapeIdx][trackIdx][Math.abs(0 - (currentCellPerTape[tapeIdx] + 1))] = instructions.nextCellValuePerTrack[currentGlobalTrack];
                } else if (currentCellPerTape[tapeIdx] >= 0) {
                    cellsPerTapePerTrack[tapeIdx][trackIdx][currentCellPerTape[tapeIdx]] = instructions.nextCellValuePerTrack[currentGlobalTrack];
                }
            }

            if(instructions.nextDirectionPerTape[tapeIdx].toLowerCase() == "r") {
                moveTapeRight(tapeIdx);
            } else if(instructions.nextDirectionPerTape[tapeIdx].toLowerCase() == "l") {
                moveTapeLeft(tapeIdx);
            }
        } 
    } else {
        // Machine has halted
        if(finalStates.includes(currentState)) {
            recognized();
        } else {
            notRecognized();
        }
        rerunButton.disabled = false;
        copyOutputButton.disabled = false;
    }
}

rerunWithCurrentOutput = () => {
    recognizeText.innerHTML = "N/A";
    currentState = startState;
    updateCurrentState();

    currentCellPerTape = []
    for(let i = 0; i < numberOfTapes; i++) {
        currentCellPerTape.push(0);
        displayTracksPerTape(i);
    }

    mainUpdate = setInterval(function() {
        doNext(currentState, getCharAtCurrentCell());
    }, speed);
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

// Visuals

compileVisuals = () => {
    clearInterval(mainUpdate);
    rerunButton.disabled = true;
    copyOutputButton.disabled = true;
    recognizeText.innerHTML = "N/A";
    totalNumberOfTracks = 0;
    let lines = editor.getValue().split("\n");
    numberOfTapes = removeComment(lines[4]).split(" ");
    infiniteDirectionsPerTape = [];
    for(let i = 0; i < numberOfTapes; i++) {
        totalNumberOfTracks += parseInt(removeComment(lines[5 + i]).split(" "));
        infiniteDirectionsPerTape.push(parseInt(removeComment(lines[parseInt(numberOfTapes) + 5 + i]).split(" ")));
    }

    if(totalNumberOfTracks != previousTotalNumberOfTracks || numberOfTapes != previousNumberOfTapes.toString()) {
        inputs.innerHTML = "<label for=\"input\">Input</label><br>\n\
        <input type=\"text\" class=\"input spaces\" name=\"input\" id=\"input0\"></input><br>";
        for(let i = 1; i < totalNumberOfTracks; i++) {
            inputs.innerHTML += "<input type=\"text\" class=\"input spaces\" name=\"input\" id=\"input" + i + "\"></input><br>";
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

            numberOfTracksPerTape.push(parseInt(removeComment(lines[5 + i]).split(" ")));

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