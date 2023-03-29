/**
 * Column Block for the Editor.js.
 *
 * @author Calum Knott (calum@calumk.com)
 * @copyright Calum Knott
 * @license The MIT License (MIT)
 */

/**
 * @typedef {Object} EditorJsColumnsData
 * @description Tool's input and output data format
 */

import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";

import icon from "./editorjs-columns.svg";
import style from "./editorjs-columns.css";

import EditorJS from '@editorjs/editorjs'; // required for npm mode

const MAX_SPAN = 12;

class EditorJsColumns {
	constructor({ data, config, api, readOnly }) {
		// start by setting up the required parts
		this.api = api;
		this.readOnly = readOnly;
		this.config = config || {};

		this._CSS = {
			block: this.api.styles.block,
			wrapper: "ce-EditorJsColumns",
		};

		if (!this.readOnly) {
			this.onKeyUp = this.onKeyUp.bind(this);
		}


		this._data = {};

		this.editors = {};

		this.colWrapper = undefined;

		this.editors.cols = [];

		this.data = data;

		if (!Array.isArray(this.data.cols)) {
			this.data.cols = [];
			this.editors.numberOfColumns = 2;
      
		} else {
			
      this.editors.numberOfColumns = this.data.cols.length;
      
      
		}
    var n = this.data.cols.length || 2;
    this.editors.spanOfColumns =  [...Array(n).keys()].map(x=>MAX_SPAN/n);
	}

	static get isReadOnlySupported() {
		return true;
	}


	onKeyUp(e) {
		console.log(e)
		console.log("heyup")
		if (e.code !== "Backspace" && e.code !== "Delete") {
			return;
		}
	}

	get CSS() {
		return {
			settingsButton: this.api.styles.settingsButton,
			settingsButtonActive: this.api.styles.settingsButtonActive,
		};
	}

	renderSettings() {
		const buttonTwoCols = {
			name: "Two Cols",
			icon: `<div>2</div>`,
		};

		const buttonThreeCols = {
			name: "Three Cols",
			icon: `<div>3</div>`,
		};

		const buttonRollCols = {
			name: "Roll Cols",
			icon: `<div>R</div>`,
		};

		const buttonWidenCols = {
			name: "Widen Cols",
			icon: `<div>W</div>`,
		};

		const wrapper = document.createElement("div");

		let buttonTwoCols_Button = document.createElement("div");
		buttonTwoCols_Button.classList.add("cdx-settings-button");
		buttonTwoCols_Button.innerHTML = buttonTwoCols.icon;

		let buttonThreeCols_Button = document.createElement("div");
		buttonThreeCols_Button.classList.add("cdx-settings-button");
		buttonThreeCols_Button.innerHTML = buttonThreeCols.icon;

		let buttonRollCols_Button = document.createElement("div");
		buttonRollCols_Button.classList.add("cdx-settings-button");
		buttonRollCols_Button.innerHTML = buttonRollCols.icon;


    let buttonWidenCols_Button = document.createElement("div");
		buttonWidenCols_Button.classList.add("cdx-settings-button");
		buttonWidenCols_Button.innerHTML = buttonWidenCols.icon;

		buttonTwoCols_Button.addEventListener("click", (event) => {
			this._updateCols(2);
		});

		buttonThreeCols_Button.addEventListener("click", (event) => {
			this._updateCols(3);
		});

		buttonRollCols_Button.addEventListener("click", (event) => {
			this._rollCols();
		});
    
    buttonWidenCols_Button.addEventListener("click", (event) => {
			this._widenCols();
		});

		wrapper.appendChild(buttonTwoCols_Button);
		wrapper.appendChild(buttonThreeCols_Button);
		wrapper.appendChild(buttonRollCols_Button);
    wrapper.appendChild(buttonWidenCols_Button);

		return wrapper;
	}

	_rollCols() {
		// this shifts or "rolls" the columns
		this.data.cols.unshift(this.data.cols.pop());
		this.editors.cols.unshift(this.editors.cols.pop());
		this._rerender();
	}

	async _updateCols(num) {
		// Should probably update to make number dynamic... but this will do for now
		if (num == 2) {
			if (this.editors.numberOfColumns == 3) {
				let resp = await Swal.fire({
					title: "Are you sure?",
					text: "This will delete Column 3!",
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#3085d6",
					cancelButtonColor: "#d33",
					confirmButtonText: "Yes, delete it!",
				});

				if (resp.isConfirmed) {
					this.editors.numberOfColumns = 2;
					this.data.cols.pop();
					this.editors.cols.pop();
					this._rerender();
				}
			}
		}
		if (num == 3) {
			this.editors.numberOfColumns = 3;
			this._rerender();
			// console.log(3);
		}
	}
  
  
  async _widenCols() {
		
		if (this.editors.numberOfColumns == 2) {
				  var [s1, s2] = this.editors.spanOfColumns;
          s1+=1;
          if (s1>11) s1=1;
          s2 = MAX_SPAN - s1;
					this.editors.spanOfColumns = [s1, s2];
					this._rerender();
				
		} else if (this.editors.numberOfColumns == 3) {
          var [s1, s2, s3] = this.editors.spanOfColumns;
          s1+=1;
          if (s1>10) s1=1;
          s2 = parseInt((MAX_SPAN - s1)/2);
          s3 = MAX_SPAN - s1 - s2;

					this.editors.spanOfColumns = [s1, s2, s3];
					
          this._rerender();
			
		}
	}

	async _rerender() {
		await this.save();
		

		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}
		this.editors.cols = [];

		this.colWrapper.innerHTML = "";

		

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);
      col.classList.add(`ce-editorjsColumns_span-${this.editors.spanOfColumns[index]}`);
      
      

			let editor_col_id = uuidv4();
			
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new EditorJS({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
			});

			this.editors.cols.push(editorjs_instance);
		}
	}

	render() {

		// This is needed to prevent the enter / tab keys - it globally removes them!!!


		// it runs MULTIPLE times. - this is not good, but works for now
		window.helpme = document.addEventListener('keydown', function(event) {

			// if (event.key === "Enter" && event.altKey) {
			// 	console.log("ENTER ALT Captured")
			// 	console.log(event.target)

			// 	// let b = event.target.dispatchEvent(new KeyboardEvent('keyup',{'key':'a'}));

			// 	event.target.innerText += "Aß"

			// 	// console.log(b)
			// }
			// else 
			if (event.key === "Enter") {
				event.stopImmediatePropagation();
				event.preventDefault();
				console.log("ENTER Captured")
			}
			if (event.key === "Tab") {
				event.stopImmediatePropagation();
				event.preventDefault();
				console.log("TAB Captured")
			}
		}, true);






		// console.log("Generating Wrapper");

		// console.log(this.api.blocks.getCurrentBlockIndex());

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");

		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}

		// console.log(this.editors.cols);
		this.editors.cols = []; //empty the array of editors
		// console.log(this.editors.cols);

		// console.log("Building the columns");

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			// console.log("Start column, ", index);
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);
      col.classList.add(`ce-editorjsColumns_span-${this.editors.spanOfColumns[index]}`);

			let editor_col_id = uuidv4();
			// console.log("generating: ", editor_col_id);
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new EditorJS({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
			});

			this.editors.cols.push(editorjs_instance);
      var n = this.data.cols.length || 2;
      this.editors.spanOfColumns = [...Array(n).keys()].map(x=>MAX_SPAN/n);
			// console.log("End column, ", index);
		}
		return this.colWrapper;
	}

	async save() {
		if(!this.readOnly){
			// console.log("Saving");
			for (let index = 0; index < this.editors.cols.length; index++) {
        let colData = await this.editors.cols[index].save();
				this.data.cols[index] = colData;
        
        
			}
		}
    this.data.spans=this.editors.spanOfColumns
    console.log("reporttest saving return ", this.data)
		return this.data;
	}

	static get toolbox() {
		return {
			icon: icon,
			title: "Columns",
		};
	}
}

export { EditorJsColumns as default };
