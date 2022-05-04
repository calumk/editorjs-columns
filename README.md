# EditorJS Columns

An **ALPHA** plugin which allows the user to have columns


## Features 

* [x] Support new vertical menu style
* [x] Support for == 2 colums
* [ ] Support for >= 3 columns
    * [ ] Migrate storage to array
    * [ ] Add tool to change type
* [ ] Fix bug with Enter key 


# Known Bugs
* Pressing enter key inside a column, will exit the column
* Copy/Pasting can cause duplication of data in the wrong place


## Docs
None yet, see example/example.html for useage.


---

> Note : Requires tools to be bound to global variable!

```


    window.editorjs_global_tools = {

    // Load Official Tools
      header: Header,
      delimiter: Delimiter,
      image: SimpleImage,