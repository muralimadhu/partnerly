const BOARDS = 1
const ROWS = 5
const COLS = 5
const DEL = "Del"
const SUBMIT = "Enter"
let WORDS_API_SETTINGS = {
    "headers": {
        "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
        "x-rapidapi-key": "725cb746f2msh33a05b8a0e2b0a9p1f1885jsnf5129d11bf7c"
    }
}


class Game {
    gameState = {
        nextCell: 0,
        currentWord: "",
        nextRow: 1,
        solution: this.#newWord(),
        currentWordEl: []
    }
    constructor(rows, cols, boards) {
        this.rows = rows
        this.cols = cols
        this.boards = boards
    }
    initialize() {
        const self = this
        $(document).ready(function () {
            self.#createKeyboard()
            self.#createGame(self.rows, self.cols)
        });
        let solutionCache = {}
        const solutionArr = this.gameState.solution.split("")
        for (let i in solutionArr) {
            if (!solutionCache[solutionArr[i]]) {
                solutionCache[solutionArr[i]] = []
            }
            solutionCache[solutionArr[i]].push(parseInt(i))
        }
        this.gameState.solutionCache = solutionCache
    }

    #createKeyboard() {
        const self = this
        const keyboard = {
            r1: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            r2: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            r3: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        }
        const onClick = function (e) {
            const key = $(this).attr("data-key")
            self.#submitKey(key)
        }
        for (let row in keyboard) {
            const keyboardRow = $("<div>", { class: 'keyboard-row' })
            $("#keyboard-container").append(keyboardRow)
            if (row == 'r2') {
                keyboardRow.append($("<div>", { class: "spacer-half" }))
            }
            if (row == 'r3') {
                let button = $("<button>").attr("data-key", SUBMIT).attr("class", "wide-button").text(SUBMIT)
                button.click(onClick)
                keyboardRow.append(button)
            }
            for (let letter of keyboard[row]) {
                let button = $("<button>").attr("data-key", letter).text(letter).attr("id", letter)
                button.click(onClick)
                keyboardRow.append(button)
            }
            if (row == 'r2') {
                keyboardRow.append($("<div>", { class: "spacer-half" }))
            }
            if (row == 'r3') {
                let button = $("<button>").attr("data-key", DEL).attr("class", "wide-button").text(DEL)
                button.click(onClick)
                keyboardRow.append(button)
            }
        }
    }

    #submitKey(key) {
        const self = this
        const badWord = function() {
            self.gameState.currentWordEl.forEach(function (cellId, index) {
                self.#animateCSS($(`#${cellId}`), index, "bounce")
            })
        }
        if (key == SUBMIT) {
            if (this.gameState.currentWordEl.length == this.cols) {
                this.#checkWord(this.gameState.currentWord).then(function(data) {
                    if(data.ok) {
                        self.#submitWord()
                    }
                    else {
                        badWord()
                    }
                })
                .catch(function(err) {
                    badWord()
                })
            }
        }
        else if (key == DEL) {
            if (this.gameState.nextCell <= this.cols * this.gameState.nextRow && this.gameState.nextCell >= (this.cols) * (this.gameState.nextRow - 1) + 1 && this.gameState.currentWordEl.length > 0) {
                let cellToUpdate = $(`#${this.gameState.nextCell}`)
                cellToUpdate.text("")
                this.gameState.currentWord = this.gameState.currentWord.slice(0, -1)
                this.gameState.currentWordEl.pop()
                this.gameState.nextCell--
            }
        }
        else {
            if (this.gameState.nextCell < this.cols * this.gameState.nextRow && this.gameState.nextCell >= (this.gameState.nextRow - 1) * this.cols) {
                this.gameState.nextCell++
                let cellToUpdate = $(`#${this.gameState.nextCell}`)
                cellToUpdate.text(key.toUpperCase())
                this.gameState.currentWord += key
                this.gameState.currentWordEl.push(this.gameState.nextCell)
            }
        }
    }

    #createGame(rows, cols) {
        const self = this
        const onKeyUp = function (e) {
            const key = e.key
            self.#submitKey(key)
        }
        for (let j = 0; j < rows * cols; j++) {
            let div = $("<div>", { class: "square", "id": j + 1 })
            //     div.on("keyup", onKeyUp)
            $("#board").append(div)
        }
        $("#board").css("grid-template-columns", `repeat(${cols}, 1fr)`)
    }

    #newWord() {
        const options = ["hello", "fetch", "testy", "cynic", "space", "index", "notes", "leech"]
        return options[Math.floor(Math.random() * options.length)];
    }

    async #checkWord(word) {
        return await fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
            method: "GET",
            headers: WORDS_API_SETTINGS.headers,
        })
    }

    #submitWord() {
        const self = this
        this.gameState.currentWord.split("").forEach(function (letter, index) {
            const cellId = ((self.gameState.nextRow - 1) * self.cols) + index + 1
            self.#animateCSS($(`#${cellId}`), index + 1, "flipInY", self.#getCellColor(letter, index))
            const key = $(`#${letter}`)
            self.#animateCSS(key, index + 1, "flipInY", self.#getCellColor(letter, index))
        })
        if (this.gameState.currentWord == this.gameState.solution) {
            self.#animateCSS($(`#board`), 1, "bounce" )
        }
        else if (this.gameState.nextRow == this.rows) {

        }
        else {
            this.gameState.currentWord = ""
            this.gameState.nextRow++
            this.gameState.currentWordEl = []
        }
    }

    #animateCSS = function (element, index, animation, bgColor) {
        element.addClass(`animate__${animation}`);
        element.addClass("animate__animated");
        element.addClass(`animate__delay-${index * 1000}ms`);
        if (bgColor) {
            element.css('background-color', bgColor)
            element.css('border-color', bgColor)
        }
        element.on("animationend", function (event) {
            event.stopPropagation();
            element.removeClass(`animate__${animation}`);
            element.removeClass("animate__animated")
        })
    }

    #getCellColor(letter, index) {
        if (this.gameState.solutionCache[letter] && this.gameState.solutionCache[letter].includes(index)) {
            return "rgb(83, 141, 78)"
        }
        if (this.gameState.solutionCache[letter]) {
            return "rgb(181, 159, 59)"
        }
        return "rgb(58, 58, 60)"
    }
}

g = new Game(ROWS, COLS, BOARDS)
g.initialize()



