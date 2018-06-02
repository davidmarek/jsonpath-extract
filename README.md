# JSONPath Extract 

[![Visual Studio Marketplace](https://img.shields.io/vscode-marketplace/v/davidmarek.jsonpath-extract.svg)](https://marketplace.visualstudio.com/items?itemName=davidmarek.jsonpath-extract)
[![Build Status](https://travis-ci.com/davidmarek/jsonpath-extract.svg?branch=master)](https://travis-ci.com/davidmarek/jsonpath-extract)

JSONPath Extract is a Visual Studio Code extension that allows you to extract parts of a JSON document using a JSONPath query.

## Features

Currently there are two commands, both can be accessed via **Ctrl + Shift + P** (*Cmd + Alt + P* on Mac) typing **JPE**.

### JPE: Run jsonpath query - plaintext

This command asks for a JSONPath query, runs it on the currently opened document and then pastes the results to a new file, each result on a separate line.

### JPE: Run jsonpath query - json

This command works just like **JPE: Run jsonpath query - plaintext**, except that results are pasted as a JSON array to a new file.

![JSONPath Extract usage](/images/usage.gif)

## JSONPath basics

JSONPath was originally introduced by [Stefan Goessner in 2007](http://goessner.net/articles/JsonPath/).

| JSONPath | Description |
|----------|-------------|
| $ | The outer level object / array |
| @ | The current object / element |
| .*name*&nbsp;or&nbsp;["*name*"] |  The child member operator (access value of key *"name"*) |
| .. | Recursive descent |
| * | Wildcard matching all objects / elements regardless of their names. |
| [*name1*,&nbsp;*name2*,&nbsp;...] | Subscript operator for multiple names or array indices as a set |
| [*start* : *end* : *step*]| Slice operator |
| ?() | Applies a filter (script) expression via static evaluation |
| () | Script expression via static evaluation |

Let's explore the JSONPath expressions on example JSON file representing a bookstore.

```json
{
  "store": {
      "book": [
          {
              "category": "reference",
              "author": "Nigel Rees",
              "title": "Sayings of the Century",
              "price": 8.95
          },
          {
              "category": "fiction",
              "author": "Evelyn Waugh",
              "title": "Sword of Honour",
              "price": 12.99
          },
          {
              "category": "fiction",
              "author": "Herman Melville",
              "title": "Moby Dick",
              "isbn": "0-553-21311-3",
              "price": 8.99
          },
          {
              "category": "fiction",
              "author": "J. R. R. Tolkien",
              "title": "The Lord of the Rings",
              "isbn": "0-395-19395-8",
              "price": 22.99
          }
      ],
      "bicycle": {
          "color": "red",
          "price": 19.95
      }
  }
}
```

| JSONPath | Result |
|----------|--------|
| $.store.book[*].author | The authors of all books in the store |
| $..author	| All authors |
| $.store.*	| All things in the store (books and a bicycle) |
| $..book[?(@.price<10)] | All books cheaper than 10 |
| $..book[:2] | The first two books |
| $..book[(@.length-1)] | The last book |

## Credits

This extension uses [dchester/jsonpath](https://github.com/dchester/jsonpath) library for processing JSONPath queries.
