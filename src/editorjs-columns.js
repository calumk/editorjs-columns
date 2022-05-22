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

class EditorJsColumns {
	constructor({ data, config, api, readOnly }) {
		this.api = api;
		this.readOnly = readOnly;
		this.config = config || {};
		// console.log("HELLO")
		// console.log(this.config)
		// this.config.tools
		// this.config.EditorJsLibrary !IMPORTANT

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

		buttonTwoCols_Button.addEventListener("click", (event) => {
			this._updateCols(2);
		});

		buttonThreeCols_Button.addEventListener("click", (event) => {
			this._updateCols(3);
		});

		buttonRollCols_Button.addEventListener("click", (event) => {
			this._rollCols();
		});

		wrapper.appendChild(buttonTwoCols_Button);
		wrapper.appendChild(buttonThreeCols_Button);
		wrapper.appendChild(buttonRollCols_Button);

		return wrapper;
	}

	_rollCols() {
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

	async _rerender() {
		await this.save();
		// console.log(this.colWrapper);

		for (let index = 0; index < this.editors.cols.length; index++) {
			this.editors.cols[index].destroy();
		}
		this.editors.cols = [];

		this.colWrapper.innerHTML = "";

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
