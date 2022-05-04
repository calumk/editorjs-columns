# @calumk/editorjs-Columns

An **ALPHA** plugin which allows the user to have columns

## Installation

> NPM : Todo


## Features 

* [x] Support new vertical menu style
* [x] Save/Load
* [x] Support for == 2 colums
* [ ] Support for >= 3 columns
    * [ ] Migrate storage to array
    * [ ] Add tool to change type


# Known Bugs
* Pressing enter key inside a column, will exit the column
* Pressing tab key inside column will launch both column, and parent tools
* Copy/Pasting can cause duplication of data in the wrong place
* ~~SVG logo is not rendering correctly in new vertical menu~~


## Docs
None yet, see example/example.html for useage.


---

> Note : Requires tools to be bound to global variable, so the same tools can be accessed in nested instance

```
window.editorjs_global_tools = {
    header: Header,
    delimiter: Delimiter,
    image: SimpleImage,
}