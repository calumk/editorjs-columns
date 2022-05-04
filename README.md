# EditorJS Markdown Importer/Exporter

An **opinionated** plugin which allows the user to export the EditorJS data to Markdown and import it from Markdown.

You can try to import this page if you like!

> :red_square: This project is currently a WIP!

## Features 

* [ ] Support for /all/ Official EditorJs Blocks
* [x] Support for several third party Blocks
* [x] Re-written syntax for block support
* [ ] Configuration options for the end user
* [x] Add readonly mode (doesnt do anything, but prevents EditorJs from throwing an error when used with readonly mode)


## Demo

> Include demo here

---


## About The Project

### Legacy

This project was originally written by [Stefan Mikic](https://github.com/stejul/), and hosted at https://github.com/stejul/editorjs-markdown-parser. That project was last updated in December 2020, and has since been archived

### Current 

In early 2022, Since I also needed markdown support for a work-related project, I have forked this project, and provided some significant updates

---

## Theory

Since we are trying to convert EditorJs <--> Markdown we have to be aware of some core facts.

### 1) Not all EditorJs blocks can be accuratly represented by markdown

Since EditorJs blocks can be very complex (can contain javascript libraries, and support complex json output), It is likley that not all blocks can be accuratly converted to markdown.

### 2) Not all Markdown syntax can be accuratly represented by EditorJs (Yet)

Some markdown features (such as tables, with images) do not have EditorJs implimentations. 
That is not to say they /cannot/ have an implimentation, but just that a block has not been built yet.

### 3) Markdown may have multiple valid EditorJs representations

EG: 

Markdown fenced code blocks, could be interpreted as 
* [editor-js/code](https://github.com/editor-js/code) - Offical Code Block
* [dev-juju/codebox](https://github.com/dev-juju/codebox) - 3rd Party Code Block
* [calumk/editor-js-codeflask](https://github.com/calumk/editorjs-codeflask) - 3rd Party Code Block


Quotes, could be interpreted as 
* [editor-js/quotes](https://github.com/editor-js/code) - Offical Code Tool
* [vishaltelangre/editorjs-alert](https://github.com/vishaltelangre/editorjs-alert) - 3rd Party Alert Block


---


### Built With

This package is built with Unified, Remark, Remark-GFM and several other packages

To limit the scope of this package, we will rely on the interpritation of remark, to generate the known block-types. This may make it impossible to detect certain charecteristics.

This package uses the remark-directive plugin, 






## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

- yarn

### Installation

1. Clone the repo
```sh
git clone https://github.com/stejul/editorjs-markdown-parser
```
2. Install packages
```sh
yarn
```

## Usage

- Load up the bundled file (`dist/bundle.js`) in you document.
- Add the Importer/Exporter to the EditorJS tools.

```js
const editor = new EditorJS({
    autofocuse: true,
    tools: {
        markdownParser: MDParser,
        markdownImporter: MDImporter,
    },
};
```

## Config

```js
const editor = new EditorJS({
    autofocuse: true,
    tools: {
        markdownParser: MDParser,
        markdownImporter: MDImporter,
    },
};
```