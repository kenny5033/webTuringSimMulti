let baseExamples = new Object(null);

// Example keys are the id of the selection option that should load the example
baseExamples["bstringsStartWith0"] = "\
ATM // Specify start\n\
EXAMPLE: Bitstrings that start with 0 // Machine Name\n\
0 1 // Input Alphabet\n\
0 1 // Tape Alphabet, blank is B\n\
1 // Number of Tapes\n\
1 // Numbers of Tracks on Tape 0\n\
2 // Tape 0 is 2-way infinite\n\
s0 // Initial State, states are seperated by spaces\n\
s1 // Accepting State(s)\n\
s0 0 s1 0 R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
s0 1 s2 1 R\n\
s1 0 s1 0 R\n\
s1 1 s1 1 R\n\
s2 0 s2 0 R\n\
s2 1 s2 1 R\n\
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
s0 // Initial State, states are seperated by spaces\n\
s2 // Accepting State(s)\n\
s0 0 s1 ✔️ R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
s0 1 s0 ❌ R\n\
s1 0 s2 ✔️ R\n\
s1 1 s0 ❌ R\n\
s2 0 s2 ✔️ R\n\
s2 1 s0 ❌ R\n\
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
sR // Initial State, states are seperated by spaces\n\
s0 // Accepting State(s)\n\
sR 0 sR 0 R // Transitions <state> <cell value> <next state> <next cell value> <next direction>\n\
sR 1 sR 1 R\n\
sR B sL 0 L\n\
sL 0 sL 0 L\n\
sL 1 sL 1 L\n\
sL B sR 1 R\n\
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
read 0+0+* read 0+0+0 R+R // Transitions\n\
read 1+0+* read 1+0+0 R+R\n\
read 0+1+* read 0+1+0 R+R\n\
read 1+1+* read 1+1+1 R+R\n\
END\
";