# JSONPath Extract 

JSONPath Extract is a Visual Studio Code extension that allows you to extract parts of a JSON document using a JSONPath query.

## Features

Currently there are two commands, both can be accessed via **Ctrl + Shift + P** (*Cmd + Alt + P* on Mac) typing **JPE**.
To learn more about supported JSONPath syntax, check the documentation for [dchester/jsonpath](https://github.com/dchester/jsonpath) library which is used to query documents.

![JSONPath Extract usage](/images/usage.gif)

### JPE: Run jsonpath query - plaintext

This command asks for a JSONPath query, runs it on the currently opened document and then pastes the results to a new file, each result on a separate line.

### JPE: Run jsonpath query - json

This command works just like **JPE: Run jsonpath query - plaintext**, except that results are pasted as a JSON array to a new file.