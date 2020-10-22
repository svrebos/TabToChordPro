module.exports = {
    tabToChordPro: (tab, artist, title, capo, key, callback) => {
        const CHORD_LINE_REGEX = /^\s*(((\()?([A-G])(#|b)?([^/\s]*)(\/([A-G])(#|b)?)?)(\s|$)+)+(\s|$)+/
        const TAB_LINE_REGEX = /^([A-G]|[a-g])\|/
        const PART_LINE_REGEX = /\[.*?\]/
        const SPACES_REGEX = /[ ]+/

        let converted = ""
        {
            const metaData = new Map()
            metaData.set("artist", artist)
            metaData.set("title", title)
            metaData.set("capo", capo)
            metaData.set("key", key)

            for (const key of metaData.keys()) {
                const value = metaData.get(key)
                if (value != null) {
                    converted += `{${key}: ${value}}\r\n`
                }
            }
        }

        let lineIndex = -1
        const lines = tab.split('\n')

        let currentPart = ""

        for (const line of lines) {
            lineIndex++

            const hasNext = lineIndex + 1 < lines.length
            if (line.trim() === '') {
                continue
            }

            if (CHORD_LINE_REGEX.test(line) && !TAB_LINE_REGEX.test(line)) {
                const words = line.split(SPACES_REGEX);
                // Line with chords
                let wordIndex = -1
                let position = 0
                for (const chord of words) {
                    wordIndex++
                    const chordIndex = line.indexOf(chord, position);
                    position = chordIndex;

                    if (hasNext) {
                        const nextLine = lines[lineIndex + 1]
                        if (nextLine.trim() === '' || CHORD_LINE_REGEX.test(nextLine)) {
                            converted += `[${chord.trim()}]`
                            if (words.length === wordIndex + 1) {
                                converted += '\r\n'
                            }

                            continue
                        }

                        if (nextLine.length !== 0 && nextLine.length > chordIndex) {
                            const nextChordIndexOrEnd = words.length <= wordIndex + 1 ? nextLine.length : line.indexOf(words[wordIndex + 1], position)

                            const lyric = nextLine.substr(chordIndex, nextChordIndexOrEnd - chordIndex)

                            if (chord.trim() !== '') {
                                converted += `[${chord.trim()}]`
                            }

                            converted += lyric

                            if (nextChordIndexOrEnd === nextLine.length) {
                                converted += `\r\n`
                            }
                        }
                        else if (nextLine.length <= chordIndex && chord.trim() !== '') {
                            converted += `[${chord.trim()}]`

                            if (wordIndex + 1 === words.length) {
                                converted += `\r\n`
                            }
                        }
                    }
                }
            }
            else if (PART_LINE_REGEX.test(line)) {
                // Line with lyrics or parts
                const partName = line.substr(line.indexOf('[') + 1, line.indexOf(']') - (line.indexOf('[') + 1));

                let part

                let hasNextNext = lines.length - 2 > lineIndex;
                if (hasNext && (TAB_LINE_REGEX.test(lines[lineIndex + 1]) || (hasNextNext && TAB_LINE_REGEX.test(lines[lineIndex + 2])))) {
                    part = "tab"
                }
                else {
                    part = partName.split(SPACES_REGEX)[0]
                }

                if (currentPart !== '') {
                    converted += `{end_of_${currentPart}}\r\n`
                }

                currentPart = part.toLowerCase()
                converted += `{start_of_${currentPart}: ${partName}}\r\n`
            }
            else if (TAB_LINE_REGEX.test(line)) {
                converted += line + `\r\n`;
            }
        }

        if (currentPart !== '') {
            converted += `{end_of_${currentPart}}\r\n`
        }

        if (callback != null) {
            callback(converted)
        }
        else
        {
            return converted
        }
    }
}