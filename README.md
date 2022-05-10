# @calumk/editorjs-Columns

A **BETA** plugin which allows the user to have columns

## Installation


> npm i @calumk/editorjs-columns


> https://cdn.jsdelivr.net/npm/@calumk/editorjs-columns@latest


## Demo

![demo](assets/demo.gif)

## Features 

* [x] Support new vertical menu style
* [x] Save/Load
* [x] Support for 2 colums
* [x] Support for 3 columns
    * [x] Migrate storage to array
    * [x] Add tool to change type
    * [x] Added tool to switch/roll arrays
* [ ] Refactor code for legibility
* [ ] Tests




# Known Bugs
* Pressing enter key inside a column, will exit the column 
    * Can be solved (sort-of) by using @calumk/editorjs-paragraph-linebreakable
* Pressing tab key inside column will launch both column, and parent tools
* Copy/Pasting can cause duplication of data in the wrong place
* ~~z-index issues with toolboxes~~
* Tools are hosted as global var
* ~~All Styling is currently only in the example.html~~
    * ~~Column styling should move to plugin~~
    * ~~Opinionaited styling (Borders, rounded corners, hover shaddow) will remain in example.html~~
* ~~SVG logo is not rendering correctly in new vertical menu~~


## Docs
None yet, see example/example.html for useage.


---

> Note : Currently Requires tools to be bound to global variable, so the same tools can be accessed in nested instance - This will likley change to a config var

```
window.editorjs_global_tools = {
    header: Header,
    delimiter: Delimiter,
    image: SimpleImage,
}