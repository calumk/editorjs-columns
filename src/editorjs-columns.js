/**
 * Base Paragraph Note Block for the Editor.js.
 * Represents simple paragraph
 *
 * @author Calum Knott (calum@calumk.com)
 * @copyright Calum Knott
 * @license The MIT License (MIT)
 */

/**
 * @typedef {Object} EditorJsColumnsData
 * @description Tool's input and output data format
 * @property {String} text — Paragraph's content. Can include HTML tags: <a><b><i>
 */

// import EditorJS from '@editorjs/editorjs';
import { v4 as uuidv4 } from 'uuid';

import icon from './editorjs-columns.svg';


class EditorJsColumns {
  /**
   * Default placeholder for Paragraph Tool
   *
   * @return {string}
   * @constructor
   
  static get DEFAULT_PLACEHOLDER() {
    return 'Hello';
  }


  static get enableLineBreaks() {
    return true;
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {object} params - constructor params
   * @param {ParagraphData} params.data - previously saved data
   * @param {ParagraphConfig} params.config - user config for Tool
   * @param {object} params.api - editor.js api
   * @param {boolean} readOnly - read only mode flag
   */


  constructor({data, config, api, readOnly}) {

    console.log("Constructed")

    this.api = api;
    this.readOnly = readOnly;

    this._CSS = {
      block: this.api.styles.block,
      wrapper: 'ce-EditorJsColumns'
    };
    
    if (!this.readOnly) {
      this.onKeyUp = this.onKeyUp.bind(this);
    }

    /**
     * Placeholder for paragraph if it is first Block
     * @type {string}
     */
    this._placeholder = config.placeholder ? config.placeholder : EditorJsColumns.DEFAULT_PLACEHOLDER;
    this._data = {};
    // this._element = this.drawView();

    this.editors = {}
    this.editors.editor_col_0 = {}
    this.editors.editor_col_1 = {}


    this.data = data;

    // console.log("Geneerated new editor")
    // console.log(this.data)
    // console.log("----")
  }


  /**
 * Returns true to notify the core that read-only mode is supported
 *
 * @return {boolean}
 */
    static get isReadOnlySupported() {
    return true;
  }


  /**
   * Check if text content is empty and set empty string to inner html.
   * We need this because some browsers (e.g. Safari) insert <br> into empty contenteditanle elements
   *
   * @param {KeyboardEvent} e - key up event
   */
  onKeyUp(e) {
    console.log("ku")
    console.log(e)
    if (e.code !== 'Backspace' && e.code !== 'Delete') {
      return;
  }

  // const {textContent} = this._element;

  // if (textContent === '') {
  //   this._element.innerHTML = '';
  // }
}

/**
 * Create Tool's view
 * @return {HTMLElement}
 * @private
 */
// drawView() {
//   let div = document.createElement('DIV');

//   div.classList.add(this._CSS.wrapper, this._CSS.block);
//   div.contentEditable = true;
//   div.dataset.placeholder = this._placeholder;

//   div.addEventListener('keyup', this.onKeyUp);

//   return div;
// }


/**
 * Alert Tool`s styles
 *
 * @returns {Object}
 */
get CSS() {
  return {
    settingsButton: this.api.styles.settingsButton,
    settingsButtonActive: this.api.styles.settingsButtonActive,
  };
}



  /**
   * Return Tool's view
   * @returns {HTMLDivElement}
   * @public
   */
  render() {

    // console.log("Rendering:")
    // console.log(this.data)
    
    let newWrapper = document.createElement('div');
    newWrapper.classList.add("ce-editorjsColumns_wrapper")

    let col_0 = document.createElement('div');
    col_0.classList.add("ce-editorjsColumns_col")
    col_0.classList.add("editorjs_col0")
    // col_0.innerHTML = "Hello"

    let col_1 = document.createElement('div');
    col_1.classList.add("ce-editorjsColumns_col")
    col_1.classList.add("editorjs_col1")
    // col_1.innerHTML = "World"

    newWrapper.appendChild(col_0)
    newWrapper.appendChild(col_1)

    let editor_col_0_id = uuidv4();
    let editor_col_1_id = uuidv4();
    col_0.id = editor_col_0_id
    col_1.id = editor_col_1_id

    // console.log("indside")
    // console.log(window.editorjs_global_tools)

    this.editors.editor_col_0 = new EditorJS({
      defaultBlock: "paragraph",
      holder: editor_col_0_id,
      tools : window.editorjs_global_tools,
      data : this.data.col0,
      readOnly: this.readOnly,
      minHeight : 50
    });

    this.editors.editor_col_1 = new EditorJS({
      defaultBlock: "paragraph",
      holder: editor_col_1_id,
      tools : window.editorjs_global_tools,
      data : this.data.col1,
      readOnly: this.readOnly,
      minHeight : 50
    });


    // this.editors.editor_col_0.firstChild.classList.remove("codex-editor--narrow")
    // this.editors.editor_col_1.firstChild.classList.remove("codex-editor--narrow")


    // if ( this.data.col0 != undefined ){
    //   this.editors.editor_col_0.render(this.data.col0)

      
    // }
    // if ( this.data.col1 != undefined ){
    //   this.editors.editor_col_1.render(this.data.co1) 
    // }

    // return this._element;
    //change
    return newWrapper
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   * @param {EditorJsColumnsData} data
   * @public
   */
  // merge(data) {
  //   let newData = {
  //     text : this.data.text + data.text
  //   };

  //   this.data = newData;
  // }

  /**
   * Validate Paragraph block data:
   * - check for emptiness
   *
   * @param {EditorJsColumnsData} savedData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(savedData) {
    // if (savedData.text.trim() === '') {
    //   return false;
    // }

    return true;
  }

  /**
   * Extract Tool's data from the view
   * @param {HTMLDivElement} blockContent - SimpleColumns tools rendered view
   * @returns {EditorJsColumnsData} - saved data
   * @public
   */
  async save(blockContent) {
    // we dont need the blockContent, because we call the editors

    console.log("Saving Col 0")
    let col0_savedData = await this.editors.editor_col_0.save()
    console.log("Saving Col 1")
    let col1_savedData = await this.editors.editor_col_1.save()

    this.data.col0 = col0_savedData
    this.data.col1 = col1_savedData

    return this.data;
  }

  /**
   * On paste callback fired from Editor.
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(event) {
    const data = {
      text: event.detail.data.innerHTML
    };

    this.data = data;
  }

  /**
   * Enable Conversion Toolbar. Paragraph can be converted to/from other tools
   */
  // static get conversionConfig() {
  //   return {
  //     export: 'text', // to convert Paragraph to other block, use 'text' property of saved data
  //     import: 'text' // to covert other block's exported string to Paragraph, fill 'text' property of tool data
  //   };
  // }

  /**
   * Sanitizer rules
   */
  static get sanitize() {
    return {
      text: {
        br: true,
      }
    };
  }

  /**
   * Get current Tools`s data
   * @returns {EditorJsColumnsData} Current data
   * @private
   */
  // get data() {
  //   console.log("get data ran")
  //   // let text = this._element.innerHTML;

  //   // this._data.text = text;

  //   return this._data;
  // }

  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {EditorJsColumnsData} data — data to set
   * @private
   */
  // set data(data) {
  //   console.log("--------")
  //   console.log("Setting with data")
  //   console.log(data)
  //   console.log("--------")

  //   this.editors.editor_col_0.render(this.data.col0)
  //   this.editors.editor_col_1.render(this.data.col1)
  // }

  /**
   * Used by Editor paste handling API.
   * Provides configuration to handle P tags.
   *
   * @returns {{tags: string[]}}
   */
  // static get pasteConfig() {
  //   return {
  //     tags: [ 'P' ]
  //   };
  // }

  /**
   * Icon and title for displaying at the Toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: icon,
      title: 'Columns'
    };
  }
}

export { EditorJsColumns as default }