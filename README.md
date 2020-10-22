# TabToChordPro
JavaScript module to convert regular tab files to the ChordPro format.
## Installation and use
1. Add the `TabToChordPro` package to your project with npm:
    ```bash
    npm install tabtochordpro
    ```
1. Use require in the file where you would like to make use for it:
    ```javascript
    const tabToChordPro = require('TabToChordpro')
    ```
1. There is only one method to use:
    ```javascript
    tabToChordPro.tabToChordPro(tab, artist, title, capo, key, outputSong);
    ```

    Parameters:
    * tab (string): The contents of the tab file. For example a string that contains the following:
    ```
    Bm7                                 G      D/F#   Em   G   D/F#   Em
    In pitch dark I go walking in your landscape.
    Bm7                           G     D/F#   Em   G   D/F#   Em
    Broken branches trip me as I speak.
    ```
    * artist (string), title (string), capo (int), key (string): Metadata of the song. All of these may be `null` or `indefined` if you do not want them in your ChordPro file.
    * outputSong: This is the callback method wich will contain a parameter that will hold the output. for example you could define a method to a variable to handle the output:
    ```javascript
    const outputSong = (converted) => { console.log(converted) }
    ```
    Then pass this variable to the procedure as a parameter.
    If this callback procedure is not provided, this method will return a string containing the song in ChordPro format.