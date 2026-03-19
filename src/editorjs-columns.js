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
import icon from "./editorjs-columns.svg";
import style from "./editorjs-columns.scss";

// import EditorJS from '@editorjs/editorjs'; // required for npm mode

class EditorJsColumns {

	static get enableLineBreaks() {
		return true;
	}


	constructor({ data, config, api, readOnly }) {
		// console.log("API")
		// console.log(api)
		// start by setting up the required parts
		this.api = api;
		this.readOnly = readOnly;
		this.config = config || {}

		// console.log(this.config)

		// console.log(this.config.EditorJsLibrary)

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

	}

	static get isReadOnlySupported() {
		return true;
	}

	onKeyUp(e) {
		// console.log(e)
		// console.log("heyup")
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
		return []
	}

	async _rerender(save = true, reset = true) {
		if (save) {
			await this.save();
		}
		// console.log(this.colWrapper);

		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}
		this.editors.cols = [];

		if (reset) {
			this.colWrapper.innerHTML = "";
		}

		// console.log("Building the columns");

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			// console.log("Start column, ", index);
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			let editor_col_id = uuidv4();
			// console.log("generating: ", editor_col_id);
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
			});

			const menu = document.createElement("div");
			menu.classList.add("ce-editorjsColumns_menu");

			const leftButton = document.createElement("button");
			leftButton.innerText = "←";
			leftButton.addEventListener("click", () => {
				if (index === 0) return;
				this.data.cols.splice(index - 1, 0, this.data.cols[index]);
				this.data.cols.splice(index + 1, 1);
				this._rerender(false, true);
			});
			menu.appendChild(leftButton);

			const rightButton = document.createElement("button");
			rightButton.innerText = "→";
			rightButton.addEventListener("click", () => {
				if (index === this.editors.numberOfColumns - 1) return;
				this.data.cols.splice(index + 2, 0, this.data.cols[index]);
				this.data.cols.splice(index, 1);
				this._rerender(false, true);
			});
			menu.appendChild(rightButton);

			const deleteButton = document.createElement("button");
			deleteButton.innerText = "×";
			deleteButton.addEventListener("click", () => {
				this.editors.numberOfColumns -= 1;
				this.data.cols.pop(index);
				this.editors.cols.pop(index).destroy();
				this._rerender(false, true);
			});
			menu.appendChild(deleteButton);

			const addButton = document.createElement("button");
			addButton.innerText = "+";
			addButton.addEventListener("click", () => {
				this.editors.numberOfColumns += 1;
				console.log("Adding column at index ", index + 1);
				console.log("Current data: ", this.data.cols);
				this.data.cols.splice(index + 1, 0, undefined);
				console.log("New data: ", this.data.cols);
				this._rerender(false, true);
			});
			menu.appendChild(addButton);

			col.appendChild(menu);

			this.editors.cols.push(editorjs_instance);
			// console.log("End column, ", index);
		}
	}

	render() {

		// This is needed to prevent the enter / tab keys - it globally removes them!!!


		// // it runs MULTIPLE times. - this is not good, but works for now






		// console.log("Generating Wrapper");

		// console.log(this.api.blocks.getCurrentBlockIndex());

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");



		// astops the double paste issue
		this.colWrapper.addEventListener('paste', (event) => {
			// event.preventDefault();
			event.stopPropagation();
		}, true);   



		this.colWrapper.addEventListener('keydown', (event) => {

			// if (event.key === "Enter" && event.altKey) {
			// 	console.log("ENTER ALT Captured")
			// 	console.log(event.target)

			// 	// let b = event.target.dispatchEvent(new KeyboardEvent('keyup',{'key':'a'}));

			// 	event.target.innerText += "Aß"

			// 	// console.log(b)
			// }
			// else 
			if (event.key === "Enter") {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
				
				// console.log("ENTER Captured")
				// this.api.blocks.insertNewBlock({type : "alert"});
				// console.log("Added Block")
			}
			if (event.key === "Tab") {
				// event.stopImmediatePropagation();
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();

				// console.log("TAB Captured")
			}
		});

		this._rerender(false, false);
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
