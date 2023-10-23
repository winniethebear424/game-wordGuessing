const express = require('express')
// const session = require('express-session')
const app = express()
const port = 3004
const view = require('./view.js')
const wordsModule = require('./words.js')
const cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid');


// userSession for connecting sessions to usernames and userGameStates for connecting usernames to game state.
const userSession = {} 
const userGameStates = {}; 

app.use(express.urlencoded({ extended: true }), cookieParser());
app.use((req,res,next) => {
    const sessionId = req.cookies.sessionId;
    if(req.url === '/login'){
        next();
    }
     else if( sessionId && userSession[sessionId]){
        req.user = userSession[sessionId];
        next();
    }
    else{ 
        res.send(view.getLoginPage());
    }
});


app.get('/login', (req,res)=>{
    res.send(view.getLoginPage());
});

app.get('/',(req,res)=>{
    const user = req.user;
    if (user){
        const gameState = userGameStates[user.username];
        if (!gameState) {
            // Get word and turns from startGame, then store in userGameStates by users' names
            userGameStates[user.username] = {
                selectedWord: [],
                guessedWord: [],
                turns: 0,
            };
        } 
        res.send(view.getHomePage(user, gameState));
    }
    else{
        res.redirect('/login');
    }
});

app.get('/new-game',(req,res)=>{
    const newGame = wordsModule.startGame();
    const sessionId = req.cookies.sessionId;

    // Check for a valid session ID    
    if (sessionId && userSession[sessionId]) {
        const user = userSession[sessionId];
        req.userGameStates = newGame;
        userGameStates[user.username] = {
            selectedWord: req.userGameStates.word,
            guessedWord: userGameStates[user.username] ? userGameStates[user.username].guessedWord: [],
            turns: newGame.turns,
        };

        // Consolelog the username and the selected word on the server side
        console.log(`New game started for user: ${user.username}`);
        console.log(`Selected word: ${req.userGameStates.word}`);

        const gameStartMessage = `the word is ${req.userGameStates.word.length} letters long`;
        res.send(view.getGamePage(user, gameStartMessage));
    } else {
        // Invalid session ID
        res.redirect('/login');
        }
})

app.post('/new-game', (req, res) => {
    const newGame = wordsModule.startGame();
    const sessionId = req.cookies.sessionId;

    // Check for a valid session ID    
    if (sessionId && userSession[sessionId]) {
    const user = userSession[sessionId];
    req.userGameStates = newGame;
    userGameStates[user.username] = {
        selectedWord: req.userGameStates.word,
        guessedWord: userGameStates[user.username] ? userGameStates[user.username].guessedWord: [],
        turns: newGame.turns,
    };

    // Consolelog the username and the selected word on the server side
    console.log(`New game started for user: ${user.username}`);
    console.log(`Selected word: ${req.userGameStates.word}`)
    
    const gameStartMessage = `the word is ${req.userGameStates.word.length} letters long`;
    res.send(view.getGamePage(user, gameStartMessage));
    } else {
    // Invalid session ID
    res.send(view.getLoginPage);
    }
})

app.get('/retrieve-game',(req,res)=>{
    const user = req.user;
    if (userGameStates[user.username]){
        //retrieve userGameStates
        const gameState = userGameStates[user.username];
        const selectWord = gameState.selectedWord;
        const guessedWord = gameState ? userGameStates[user.username].guessedWord: [];
        const turns = gameState.turns;

        const gameStartMessage = `the word is ${selectWord.length} letters long`;
        res.send(view.getRetrieveGamePage(user, guessedWord, selectWord, gameStartMessage, turns));
    } 
    res.redirect('/');
})

app.post('/guess',(req,res)=>{
    const user = req.user;

    if (user){
        const guess = req.body.guess.toLowerCase();
        const gameState = userGameStates[user.username];
        const selectedWord = gameState.selectedWord;
        const guessedWord = gameState.guessedWord;
        const wordListOrigin = wordsModule.words;

        //valid guess
        const matchedLetters = getMatchedLetters(guess, selectedWord);
        if (wordListOrigin.includes(guess) && !guessedWord.includes(guess)){
            // Correct guess.
            if (guess === selectedWord ) {
                guessedWord.push({word:guess,matchedLetters});
                gameState.turns ++;
                res.send(`You Won! Click<a href="/"> Home<a> and start a NEW game.Matched ${matchedLetters.length} characters. You guessed the word for ${gameState.turns} turns.`);
            } else {
            // Incorrect guess.
                guessedWord.push({word:guess,matchedLetters});
                gameState.turns ++;
                res.send(`valid but incorrect guess, Click<a href="/retrieve-game"> here<a> for another try. Matched ${matchedLetters.length} characters.  You validly guessed the word for ${gameState.turns} turns`);
            } 
        }  
        //invalid guess
        else {
            res.send(`invalid guess! Click<a href="/retrieve-game"> here<a> for another try. Matched ${matchedLetters.length} characters. You validly guessed the word for ${gameState.turns} turns.`);
            // Redirect to the Home Page
            res.redirect('/');
        }

    }
})

app.post('/login',(req,res)=>{
    const username = req.body.username;

    // check whether its validated username
    if (isValidate(username)) {
        // Generate a new session ID
        const sessionId = req.cookies.sessionId;
        // Check if a session ID already exists for the user
        if (sessionId && userSession[sessionId]) {
            req.user = userSession[sessionId];
            res.redirect('/');
            return;
        } else {
            // session ID doesnt exists, then generate a new session ID
            const sid = uuidv4();
            userSession[sid] = { username: username };
            // Initialize or retrieve user's game state
            if (!userGameStates[username]) {
                userGameStates[username] = {
                    selectedWord: [],
                    guessedWord: userGameStates[username.username] ? userGameStates[user.username].guessedWord: [],
                    turns: 0,
                };
            }
            // Set user's game state and session cookie
            req.user = userSession[sid];
            req.userGameStates = userGameStates[username];
            res.cookie('sessionId', sid);

            // Redirect to the appropriate page
            res.redirect('/new-game');
        } 
    }else {
        // Invalid username
        res.status(401).send(`Invalid username. Please make sure your input is correct. Click <a href="/login">Here</a> for another try`);
    }
});

app.post('/logout', (req, res) => {
    // Clear the session ID cookie
    res.clearCookie('sessionId');
  
    // Check if there is a valid session ID
    const sessionId = req.cookies.sessionId;
    if (sessionId && userSession[sessionId]) {
      const username = userSession[sessionId].username;
      
      // Remove the session information from the server
      delete userSession[sessionId];
      
      // Redirect to the Home Page
      res.redirect('/');
    } else {
      // No valid session ID, just redirect to the Home Page
      res.redirect('/');
    }
  });
  
function isValidate(username){
    const validCharacters = /^[a-zA-Z0-9-_]+$/;
    if (username.toLowerCase() === "dog") {
        return false;
    }
    return validCharacters.test(username);
}

function getMatchedLetters(guess, selectedWord) {
    const matched = [];
    for (const letter of guess) {
        if (selectedWord.includes(letter) && !matched.includes(letter)) {
            matched.push(letter);
        }
    }
    return matched;
}


app.listen(port, () => console.log( `Guessing Game starts! listening on port ${port}!`));  