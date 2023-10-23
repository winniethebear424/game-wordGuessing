const wordsModule = require('./words.js')

module.exports = {

    getLoginPage:() => {
        return `
        <html>
        <head>
        <title>Log IN Page</title>
        <link rel="stylesheet" type="text/css" href="./index.css">
        <style>
        .container {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        .page-title {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .input-field {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
        }
        .submit-button {
            padding: 10px 20px;
            background-color: #333;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        .hint {
            color: #999;
            font-size: 14px;
        }
        </style>
        </head>
        <body>
            <div class="container">
                <h1 class="page-title">Login</h1>
                <form method = "POST" action = "/login">
                    <input class="input-field" type = "text" name = "username" placeholder = "Username" >
                    <button class="submit-button type = "submit">Login</button>
                </form>
                <p class="hint">hint: login with characters in /^[a-zA-Z0-9-_]+$/</p>
            </div>
        </body>
        </html>
        `
    },

    getHomePage:(user, userGameState) => {
        const guessedWords = userGameState.guessedWord || [];
        const guessedWordsList = guessedWords.map(entry => {
            const word = entry.word || '';
            const matchedLetters = entry.matchedLetters || [];
            return `word: ${word} (matched letters num: ${matchedLetters.length})`;
        }).join(', ');

        const lastGuessedWordEntry = guessedWords[guessedWords.length - 1] || {};
        const lastGuessedWord = lastGuessedWordEntry.word || '';
        const lastguessedWordsMLetters = lastGuessedWordEntry.matchedLetters ? lastGuessedWordEntry.matchedLetters.length : 0;
        const totalValidGuesses = guessedWords.length;
        return `
        <html>
        <head>
        <title>Home Page</title>
        </head>
        <style>
        .container {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        .page-title {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .word-list {
            columns: 5; 
            column-gap: 20px;
        }
        .guessed-words-list {
            list-style: none;
            padding:0px
        }
        .section h3 {
            font-weight: bold; 
            margin-top: 10px; 
        }
        .button {
            background-color: #0074d9; 
            color: white; 
            padding: 10px 20px;
            margin-right: 10px;
            border: none; 
            cursor: pointer;
        }
        .button:hover {
            background-color:
        }
        </style>
        <body>
            <div class="container">
                <h1 class="page-title">Home Page</h1>
                <div class="session">
                    <h2 class="greeting">Welcome ${user.username}</h2>
                </div>
                <div class="session">
                    <h3>Secret Words for Your Reference:</h3> 
                    <ul class="word-list">${wordsModule.words.map(word => `<li>${word}</li>`).join('')}</ul>
                </div>    
                <div class="session">
                    <h3>Your Guessed Words & Matched Letters:</h3>
                    <ul class="guessed-words-list">
                    ${guessedWordsList.split(',').map(item => {
                        const [word, matchedLetters] = item.split('(matched letters num: ');
                        if (parseInt(matchedLetters) === word.length) {
                            return `<li>${word} (matched letters num: ${matchedLetters}) - You won</li>`;
                        } else {
                            return `<li>${word} (matched letters num: ${matchedLetters})</li>`;
                        }
                    }).join('')}
                    </ul>
                </div> 
                <div class="session">
                    <h3>Last Valid Word Guessed:</h3>
                    <p>${lastGuessedWord}</p>
                    <p>matched letters:${lastguessedWordsMLetters}</p>
                </div> 
                <div class="session">
                    <h3>Total Successful Guess:${totalValidGuesses} </h3>
                </div>
                <div class="session">
                    <form method = "POST" action = "/new-game">
                        <button class="button" type = "submit">Start New Game</button>
                    </form>                
                    <form method = "GET" action = "/retrieve-game">
                        <button class="button" type = "submit">Continue/Retry Unfinished Game</button>
                    </form>    
                    <form method = "POST" action = "/logout">
                        <button class="button" type = "submit">Logout</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
        `
    },

    getGamePage:(user, gameStartMessage) => {
        return `
        <html>
        <head>
        <title>Guess Game</title>
        </head>
        <style>
        .container {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        .greeting {
            color: #333;
            font-size: 40px;
        }
        .page-title {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .greeting {
            color: #333;
            font-size: 40px;
        }
        .input-field {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
        }
        .submit-button {
            padding: 10px 20px;
            background-color: #333;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        .new_game {
            color: #999;
            font-size: 14px;
        }
        </style>
        <body>
            <div class="container">
                <h1 class="page-title">New Game</h1>
                <h2 class="greeting">Hi ${user.username}, ${gameStartMessage}</h2>
                <form method = "POST" action = "/guess">
                    <input class="input-field" type = "text" name = "guess" placeholder = "Please Input Your Guess" >
                    <button class="submit-button" type = "submit">Check!</button>        
                </form>
                <form method = "POST" action = "/new-game">
                    <a class="new_game" href = "/new-game">New Game</a>
                </form>
                <form >
                    <a class="jump" href = "/">Home</a>
                </form>
            </div>
        </body>
        </html>
        `
    },

    getRetrieveGamePage:(user, guessedWord, selectWord, gameStartMessage) => {
        return `
        <html>
        <head>
        <title>Archive</title>
        </head>
        <style>
        .container {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        .greeting {
            color: #333;
            font-size: 40px;
        }
        .page-title {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        .input-field {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
            width: 100%;
            margin-bottom: 10px;
        }
        .submit-button {
            padding: 10px 20px;
            background-color: #333;
            color: #fff;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
        }
        .jump {
            color: #999;
            font-size: 14px;
        }
        </style>
        <body>
            <div class="container">
                <h1 class="page-title">Archive Game</h1>
                <h2>Hi ${user.username}, ${gameStartMessage}</h2>
                <form method = "POST" action = "/guess">
                    <input class="input-field" type = "text" name = "guess" placeholder = "Please Input Your Guess" >
                    <button class="submit-button" type = "submit">Check!</button>        
                </form>
                <form >
                    <a class="jump" href = "/new-game">New Game</a>
                </form>
                <form >
                    <a class="jump" href = "/">Home</a>
                </form>
            </div>
        </body>
        </html>
        `
    },
}