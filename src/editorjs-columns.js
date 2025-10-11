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

import icon from "./editorjs-columns.svg?raw";
import twoColumnsIcon from "./icons/two-columns.svg?raw";
import threeColumnsIcon from "./icons/three-columns.svg?raw";
import rollColumnsIcon from "./icons/roll-columns.svg?raw";
import "./editorjs-columns.scss";

// import EditorJS from '@editorjs/editorjs'; // required for npm mode

class EditorJsColumns {
	static get enableLineBreaks() {
		return true;
	}

	constructor({ data, config, api, readOnly }) {
		// Set up the required parts
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

		// Store event handlers for cleanup
		this.pasteHandler = null;
		this.keydownHandler = null;
		this.cleanupPromise = null;

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
		return [
			{
				icon: twoColumnsIcon,
				label: this.api.i18n.t("2 Columns"),
				onActivate: () => {
					this._updateCols(2);
				},
			},
			{
				icon: threeColumnsIcon,
				label: this.api.i18n.t("3 Columns"),
				onActivate: () => {
					this._updateCols(3);
				},
			},
			{
				icon: rollColumnsIcon,
				label: this.api.i18n.t("Roll Columns"),
				onActivate: () => {
					this._rollColumns();
				},
			},
		];
	}

	_rollColumns() {
		// this shifts or "rolls" the columns
		this.data.cols.unshift(this.data.cols.pop());
		this.editors.cols.unshift(this.editors.cols.pop());
		this._rerender();
	}

	/**
	 * Helper method to destroy editors and clean up
	 * @param {Array} editors - Array of editor instances to destroy
	 * @returns {Promise} Promise that resolves when all editors are destroyed
	 */
	_destroyEditors(editors) {
		return Promise.all(
			editors.map(async (editor) => {
				if (editor && editor.isReady) {
					try {
						await editor.isReady;
						if (typeof editor.destroy === "function") {
							await editor.destroy();
						}
					} catch (e) {
						// Silently handle errors
					}
				}
			})
		);
	}

	async _updateCols(num) {
		// Should probably update to make number dynamic... but this will do for now
		if (num === 2) {
			if (this.editors.numberOfColumns === 3) {
				// Use native confirm dialog instead of SweetAlert2 for better compatibility
				const message = `${this.api.i18n.t("Are you sure?")} ${this.api.i18n.t(
					"This will delete Column 3!"
				)}`;
				const confirmed = window.confirm(message);

				if (confirmed) {
					this.editors.numberOfColumns = 2;
					this.data.cols.pop();
					this.editors.cols.pop();
					this._rerender();
				}
			}
		}
		if (num === 3) {
			this.editors.numberOfColumns = 3;
			this._rerender();
		}
	}

	_rerender() {
		// Save before clearing the editors
		this.save();

		// Copy the editors array before clearing it
		const editorsToDestroy = [...this.editors.cols];

		// Clear the array immediately to prevent duplicates
		this.editors.cols = [];

		// Schedule destruction in the background
		this.cleanupPromise = this._destroyEditors(editorsToDestroy);

		this.colWrapper.innerHTML = "";

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			const col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			const editor_col_id = uuidv4();
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			const editorjs_instance = new this.config.EditorJsLibrary({
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
		// Check if we already have a wrapper (multiple render calls on same instance)
		if (this.colWrapper) {
			// Return the existing wrapper without creating new editors
			return this.colWrapper;
		}

		// Clear old editors to prevent duplicates, schedule destruction in the background
		if (this.editors.cols && this.editors.cols.length > 0) {
			// Copy the editors array before clearing it
			const editorsToDestroy = [...this.editors.cols];

			// Clear the array immediately to prevent duplicates
			this.editors.cols = [];

			// Schedule destruction in the background
			this.cleanupPromise = this._destroyEditors(editorsToDestroy);
		}

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");

		// Stops the double paste issue
		this.pasteHandler = (event) => {
			event.stopPropagation();
		};
		this.colWrapper.addEventListener("paste", this.pasteHandler, true);

		// Prevent Enter and Tab keys from creating new blocks
		this.keydownHandler = (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
			}
			if (event.key === "Tab") {
				event.preventDefault();
				event.stopImmediatePropagation();
				event.stopPropagation();
			}
		};
		this.colWrapper.addEventListener("keydown", this.keydownHandler);

		// Build the columns
		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			const col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			const editor_col_id = uuidv4();
			col.id = editor_col_id;

			this.colWrapper.appendChild(col);

			const editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
			});

			this.editors.cols.push(editorjs_instance);
		}
		return this.colWrapper;
	}

	async save() {
		if (!this.readOnly) {
			for (let index = 0; index < this.editors.cols.length; index++) {
				const colData = await this.editors.cols[index].save();
				this.data.cols[index] = colData;
			}
		}
		return this.data;
	}

	/**
	 * Clean up all resources when block is removed
	 */
	async destroy() {
		// Wait for any pending cleanup from render() or _rerender()
		if (this.cleanupPromise) {
			await this.cleanupPromise;
		}

		// Remove event listeners to prevent any new events during cleanup
		if (this.colWrapper) {
			if (this.pasteHandler) {
				this.colWrapper.removeEventListener("paste", this.pasteHandler, true);
			}
			if (this.keydownHandler) {
				this.colWrapper.removeEventListener("keydown", this.keydownHandler);
			}
		}

		// Destroy all nested editor instances
		if (this.editors.cols && this.editors.cols.length > 0) {
			await this._destroyEditors(this.editors.cols);
		}

		// Clear all references
		this.editors.cols = [];
		this.pasteHandler = null;
		this.keydownHandler = null;
		this.cleanupPromise = null;
		this.colWrapper = null;
	}

	static get toolbox() {
		return {
			icon: icon,
			title: "Columns",
		};
	}
}

export { EditorJsColumns as default };
