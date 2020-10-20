const fs = require('fs')
const path = require('path')
const ChordSheetJS = require('chordsheetjs').default

//const testFile = path.join(__dirname, "Paolo Nuntini - Candy.txt")
const testFile = path.join(__dirname, "Radiohead - Creep.txt")

//usingChordSheetJS();
ownImplementation();

function ownImplementation(){
    const CHORD_LINE_REGEX = /^\s*((([A-G])(#|b)?([^/\s]*)(\/([A-G])(#|b)?)?)(\s|$)+)+(\s|$)+/; // Stolen shamelessly from ChordsheetJS
    fs.readFile(testFile, { encoding: 'utf8' }, (err, data) => {
        if (err){
            console.error(err.message)
        }
        else {
            var lineIndex = -1
            const lines = data.split('\n')

            var converted = ""
            var currentPart = ""
            var verseCounter = 1
            var chorusCounter = 1
            var instrumentalCounter = 1
            var outroCounter = 1

            for (const line of lines) {
                lineIndex++
                
                const hasNext = lineIndex < lines.length
                const hasPrevious = lineIndex > 0
                if (line.trim() === '') {
                    continue
                }
                
                const words = line.split(/[ ]+/);
                if (CHORD_LINE_REGEX.test(line)){
                    // Line with chords
                    var lyricStartIndex = 0
                    var wordIndex = -1
                    for (const chord of words) {
                        wordIndex++
                        const chordIndex = line.indexOf(chord);
                        
                        if (hasNext) {
                            const nextLine = lines[lineIndex + 1]
                            if (nextLine.trim() === '' || CHORD_LINE_REGEX.test(nextLine)){
                                converted += `[${chord.trim()}]`
                                if (words.length === wordIndex + 1) {
                                    converted += '\r\n'
                                }

                                continue
                            }

                            if (nextLine.length !== 0 && nextLine.length > chordIndex) {
                                const nextChordIndexOrEnd = words.length <= wordIndex + 1 ? nextLine.length : line.indexOf(words[wordIndex + 1])
                                
                                const lyric = nextLine.substr(chordIndex, nextChordIndexOrEnd - chordIndex)
                                
                                if (chord.trim() !== ''){
                                    converted += `[${chord.trim()}]`
                                }
                                
                                converted += `${lyric}`

                                if (nextChordIndexOrEnd === nextLine.length){
                                    converted += `\r\n`
                                }

                                lyricStartIndex = nextChordIndexOrEnd
                            }
                        }
                    }
                }
                else {
                    // Line with lyrics or parts
                    if (words.length === 1){
                        const word = words[0].toLowerCase()
                        if (word.includes("intro")) {
                            if (currentPart !== ''){
                                converted += `{end_of_${currentPart}}\r\n`
                            }
                            currentPart = "intro"
                            converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)}}\r\n`
                            continue
                        }
                        else if (word.includes("verse")) {
                            if (currentPart !== ''){
                                converted += `{end_of_${currentPart}}\r\n`
                            }
                            currentPart = "verse"
                            converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)} ${verseCounter}}\r\n`
                            verseCounter ++;
                            continue
                        }
                        else if (word.includes("chorus")) {
                            if (currentPart !== ''){
                                if (currentPart !== ''){
                                    converted += `{end_of_${currentPart}}\r\n`
                                }
                                currentPart = "chorus"
                                converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)} ${chorusCounter}}\r\n`
                                chorusCounter ++;
                                continue
                            }
                        }
                        else if (word.includes("instrumental")) {
                            if (currentPart !== ''){
                                converted += `{end_of_${currentPart}}\r\n`
                            }
                            currentPart = "instrumental"
                            converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)} ${instrumentalCounter}}\r\n`
                            instrumentalCounter ++;
                            continue
                        }
                        else if (word.includes("outro")) {
                            if (currentPart !== ''){
                                converted += `{end_of_${currentPart}}\r\n`
                            }
                            currentPart = "outro"
                            converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)} ${outroCounter}}\r\n`
                            outroCounter ++;
                            continue
                        }
                    }
                }
            }

            if (currentPart !== ''){
                converted += `{end_of_${currentPart}}\r\n`
            }

            console.log(converted)
        }
    })
}

function usingChordSheetJS(){
    fs.readFile(testFile, { encoding: 'utf8' }, (err, data) => {
        if (err){
            console.error(err.message)
        }
        else {
            const parser = new ChordSheetJS.ChordSheetParser({ preserveWhitespace: false })
            const song = parser.parse(data)
            var converted = ""
            var currentPart = ""
            var verseCounter = 1
            var chorusCounter = 1
            var lineCounter = 0;
            for (const line of song.lines) {
                lineCounter++;
                if (line.items.length === 0) {
                    continue
                }
    
                if (line.items.length === 1) {
                    var itemLyrics = line.items[0].lyrics.toLowerCase()
                    if (itemLyrics.includes("intro")) {
                        if (currentPart !== ''){
                            converted += `{end_of_${currentPart}}\r\n`
                        }
                        currentPart = "intro"
                        converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)}}\r\n`
                        continue
                    }
                    else if (itemLyrics.includes("verse")) {
                        if (currentPart !== ''){
                            converted += `{end_of_${currentPart}}\r\n`
                        }
                        currentPart = "verse"
                        converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)} ${verseCounter}}\r\n`
                        verseCounter ++;
                        continue
                    }
                    else if (itemLyrics.includes("chorus")) {
                        if (currentPart !== ''){
                            if (currentPart !== ''){
                                converted += `{end_of_${currentPart}}\r\n`
                            }
                            currentPart = "chorus"
                            converted += `{start_of_${currentPart}: ${capitalizeFirstLetter(currentPart)} ${chorusCounter}}\r\n`
                            chorusCounter ++;
                            continue
                        }
                    }
                }
    
                for (const item of line.items) {
                    if (item.chords.trim() !== '') {
                        converted += `[${item.chords.trim()}]`
                    }
                    if (item.lyrics !== '' && item.lyrics != '\r') {
                        converted += `${item.lyrics}`
                    }
                }
    
                converted += "\r\n"
            }
    
            if (currentPart !== '') {
                converted += `{end_of_${currentPart}}\r\n`
            }
    
            console.log(converted)
            // const formatter = new ChordSheetJS.TextFormatter();
            // console.log(formatter.format(song));
        }
    })
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}