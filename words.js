const readline = require("readline").createInterface({input: process.stdin, output: process.stdout});

const words = `
about above after again among began begin
black bring build carry cause check class
clear close color could cover cross drive
early earth every field final first force
found front great green group heard horse
house large laugh learn leave light might
money music never night north often order
other paper piece place plain plane plant
point pound power press quick reach ready
right river round serve shape short since
sleep small sound south spell stand start
state still stood story study table teach
their there these thing think those three
under until usual voice vowel watch water
wheel where which while white whole world
would write young
`.split(/[\s\n]+/).filter( item => !!item );

const wordsArrayLen = words.length;

let game = null;

function startGame() {
    return {
        word: process.env.OVERRIDE || pickWord(words),
        turns: 0,
        guessedWord: []
    }; 
}

function pickWord(words) {
    return words[Math.floor(Math.random() * wordsArrayLen)];
}

function exactMatch(guess,word){
    return word.toUpperCase() === guess.toUpperCase();
}

module.exports = { startGame, words };
