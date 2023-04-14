let baseExamples = new Object(null);

// Example keys are the id of the selection option that should load the example
baseExamples["bstringsStartWith0"] = "\
ATM // Specify start\n\
EXAMPLE: Bitstrings that start with 0 // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 B // Tape Alphabet, blank is B\n\
1 // Number of Tapes\n\
1 // Numbers of Tracks on Tape 0\n\
2 // Tape 0 is 2-way infinite\n\
start // Initial State, states are seperated by spaces\n\
startsWithZero // Accepting State(s)\n\
start 0 startsWithZero 0 R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
start 1 notStartWithZero 1 R\n\
startsWithZero 0 startsWithZero 0 R\n\
startsWithZero 1 startsWithZero 1 R\n\
notStartWithZero 0 notStartWithZero 0 R\n\
notStartWithZero 1 notStartWithZero 1 R\n\
END // Specify end\
";

baseExamples["bstringsEndWithTwo0"] = "\
ATM // Specify start\n\
EXAMPLE: Bitstrings that end in 2 zeros // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 ✔️ ❌ // Tape Alphabet, blank is B\n\
1 // Number of Tapes\n\
1 // Numbers of Tracks on Tape 0\n\
2 // Tape 0 is 2-way infinite\n\
noEndingZeros // Initial State, states are seperated by spaces\n\
endingWith2Zeros // Accepting State(s)\n\
noEndingZeros 0 endingWith1Zero ✔️ R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
noEndingZeros 1 noEndingZeros ❌ R\n\
endingWith1Zero 0 endingWith2Zeros ✔️ R\n\
endingWith1Zero 1 noEndingZeros ❌ R\n\
endingWith2Zeros 0 endingWith2Zeros ✔️ R\n\
endingWith2Zeros 1 noEndingZeros ❌ R\n\
END // Specify end\
";

baseExamples["bstringsStartWith10|00"] = "\
ATM // Specify start\n\
EXAMPLE(MultiTrack): Bitstrings that start with 10 or 00 // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 B // Tape Alphabet, blank is B\n\
2 // Number of Tapes\n\
1 // Number of Tracks on Tape 0\n\
2 // Number of Tracks on Tape 1\n\
2 // Tape 0 is 2-way infinite\n\
1 // Tape 1 is 1-way infinite\n\
sN // Initial State, states are seperated by spaces\n\
s10 or s00 // Accepting State(s)\n\
sN 0+B+B s0 0+0+B R+R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
sN 1+B+B s1 1+1+B R+R\n\
s0 0+B+B s00 0+0+B R+R\n\
s0 1+B+B sG 1+1+B R+R\n\
s1 0+B+B s10 0+0+B R+R\n\
s1 1+B+B sG 1+1+B R+R\n\
s00 0+B+B s00 0+0+B R+R\n\
s00 1+B+B s00 1+1+B R+R\n\
s10 0+B+B s10 0+0+B R+R\n\
s10 1+B+B s10 1+1+B R+R\n\
sG 0+B+B sG 0+0+B R+R\n\
sG 1+B+B sG 1+1+B R+R\n\
END // Specify end\
";

baseExamples["bouncer"] = "\
ATM // Specify start\n\
EXAMPLE: Bouncer // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 B // Tape Alphabet, blank is B\n\
1 // Number of Tapes\n\
1 // Numbers of Tracks on Tape 0\n\
2 // Tape 0 is 2-way infinite\n\
moveRight // Initial State, states are seperated by spaces\n\
accept // Accepting State(s)\n\
moveRight 0 moveRight 0 R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
moveRight 1 moveRight 1 R\n\
moveRight B moveLeft 0 L\n\
moveLeft 0 moveLeft 0 L\n\
moveLeft 1 moveLeft 1 L\n\
moveLeft B moveRight 1 R\n\
END // Specify end\
";

baseExamples["quickStart"] = "\
ATM\n\
Quick Start // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 B // Tape Alphabet, blank is B\n\
1 // Number of Tapes\n\
1 // Numbers of Tracks on Tape 0\n\
2 // Tape 0 is 2-way infinite\n\
s0 // Initial State\n\
s0 // Accepting State(s)\n\
s0 0 s0 0 R // Transitions\n\
END\
";

baseExamples["leftBitShift"] = "\
ATM\n\
EXAMPLE: Left Bit Shift // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 B // Tape Alphabet, blank is B\n\
1 // Number of Tapes\n\
1 // Numbers of Tracks on Tape 0\n\
1 // Tape 0 is 1-way infinite\n\
start // Initial State\n\
read // Accepting State(s)\n\
start 1 read 0 R // Transitions\n\
start 0 read 0 R\n\
read 0 read 0 R\n\
read 1 write 0 L\n\
write 0 read 1 R\n\
END\
";

baseExamples["bitwiseAND"] = "\
ATM\n\
EXAMPLE: Bitwise AND\n\
0 1 // Input Alphabet\n\
0 1 B // Tape Alphabet\n\
2 // Number of Tapes\n\
2 // Number of Tracks on Tape 0\n\
1 // Number of Tracks on Tape 1\n\
1 // Tape 0 is 1-way infinite\n\
1 // Tape 1 is 1-way infinite\n\
read // Initial State\n\
read // Accepting State(s)\n\
read 0+0+* read 0+0+0 R+R // Transitions, '*' is a wildcard\n\
read 1+0+* read 1+0+0 R+R\n\
read 0+1+* read 0+1+0 R+R\n\
read 1+1+* read 1+1+1 R+R\n\
END\
";