# `@mrwhale-io/commands`

> Shared Mr. Whale command modules used by each chat bot integration

## Commands

### Fun (12 commands)

| Name            | Description                             | Usage                                 |
| --------------- | --------------------------------------- | ------------------------------------- |
| **ascii**       | Generate ascii.                         | ascii [text]                          |
| **choose**      | Choose between one or multiple choices. | choose [choice] or [choice] ...       |
| **chucknorris** | Get a random Chuck Norris joke.         | chucknorris                           |
| **coin**        | Flip a coin.                            | coin                                  |
| **conchshell**  | Ask the magic conchshell a question.    | conchshell                            | 
| **dadjoke**     | Get a random Dad joke.                  | dadjoke                               |
| **define**      | Define a word or phrase.                | define [word]                         |
| **fact**        | Get a random useless fact.              | fact                                  |
| **gameidea**    | Generate a random game idea.            | gameidea                              |
| **roll**        | Roll one or multiple dice.              | roll [n sides] or [n dice] d[n sides] |
| **ship**        | Find out how compatible two users are.  | ship [user1], [user2]                 |              
| **whale**       | Generate a whale face.                  | whale [length]                        |

### Game (2 commands)

| Name          | Description                     | Usage                             |
| ------------- | ------------------------------- | --------------------------------- |
| **hangman**   | Play a classic game of hangman. | hangman [start|guess|end] [guess] |
| **rockpaper** | Rock. Paper. Scissors.          | rockpaper [rock|paper|scissors]   |

### Utility (6 commands)

| Name      | Description                                         | Usage            |
| --------- | --------------------------------------------------- | ---------------- |
| **help**  | Get command help.                                   | help [type|name] |
| **info**  | Get bot information.                                | info             |
| **langs** | List supported languages for the translate command. | langs            |
| **ping**  | Sends back a pong response.                         | ping             |
| **rank**  | Get your current rank.                              | rank             |
| **whois** | Get information about a user.                       | whois [@user]    |

### Useful (3 commands)

| Name          | Description                                                                 | Usage                    |
| ------------- | --------------------------------------------------------------------------- | ------------------------ |
| **advice**    | Get advice.                                                                 | advice                   |
| **translate** | Translate to specified language. Use langs command for supported languages. | translate [lang], [text] |
| **wiki**      | Search for a Wiki page.                                                     | wiki [search]            |

### Admin (2 commands)

| Name          | Description                              | Usage                |
| ------------- | ---------------------------------------- | -------------------- |
| **cleverbot** | Toggle cleverbot on/off.                 | cleverbot            |
| **reload**    | Reload a command.                        | reload [command|all] |

## License

[MIT](https://tldrlegal.com/license/mit-license)