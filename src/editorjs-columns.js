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
import style from "./editorjs-columns.scss";

// import EditorJS from '@editorjs/editorjs'; // required for npm mode

class EditorJsColumns {

	static get enableLineBreaks() {
		return true;
	}


	constructor({ data, config, api, readOnly, block }) {
		// start by setting up the required parts
		this.api = api;
		this.readOnly = readOnly;
		this.config = config || {}
		this.block = block;

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

		// Timer for debounced parent change notifications
		this._dispatchTimer = null;

		this.data = data;

		if (!Array.isArray(this.data.cols)) {
			this.data.cols = [];
			this.editors.numberOfColumns = 2;
		} else {
			this.editors.numberOfColumns = this.data.cols.length;
		}

	}

	// Selector for all EditorJS toolbar/UI elements
	static get TOOLBAR_SELECTOR() {
		return '.ce-inline-toolbar, .ce-toolbar, .ce-toolbox, .ce-popover, .ce-conversion-toolbar, .ce-settings';
	}

	/**
	 * Notify the parent editor that content changed, but only when no
	 * toolbar interaction is in progress. Debounced to 300ms so rapid
	 * mutations (e.g. each keystroke in a link URL input) don't each
	 * trigger the parent's onChange → save() chain.
	 *
	 * If the toolbar is still active when the debounce fires, the
	 * notification is skipped — the next child onChange after the
	 * toolbar closes will dispatch it.
	 */
	_notifyParentChanged() {
		if (!this.block) return;
		clearTimeout(this._dispatchTimer);
		this._dispatchTimer = setTimeout(() => {
			const active = document.activeElement;
			const toolbarHasFocus = active
				&& this.colWrapper
				&& this.colWrapper.contains(active)
				&& active.closest(EditorJsColumns.TOOLBAR_SELECTOR);
			if (!toolbarHasFocus) {
				this.block.dispatchChange();
			}
		}, 300);
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
		return [
			{
				icon : "2",
				label : this.api.i18n.t("2 Columns"),
				onActivate : () => {this._updateCols(2)}
			},
			{
				icon : "3",
				label : this.api.i18n.t("3 Columns"),
				onActivate : () => {this._updateCols(3)}
			},
			{
				icon : "R",
				label : this.api.i18n.t("Roll Columns"),
				onActivate : () => {this._rollColumns()}
			},
			]
	}


	_rollColumns() {
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
					title: this.api.i18n.t("Are you sure?"),
					text: this.api.i18n.t("This will delete Column 3!"),
					icon: "warning",
					showCancelButton: true,
					cancelButtonText: this.api.i18n.t("Cancel"),
					confirmButtonColor: "#3085d6",
					cancelButtonColor: "#d33",
					confirmButtonText: this.api.i18n.t("Yes, delete it!"),
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

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
				onChange: () => this._notifyParentChanged(),
			});

			this.editors.cols.push(editorjs_instance);
		}
	}

	render() {

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");

		// ──────────────────────────────────────────────────────────────
		// Mutation observer isolation: mark the column wrapper so the
		// parent editor's MutationObserver ignores DOM changes inside
		// it (e.g. child toolbars appearing/disappearing on hover).
		// Without this, every hover triggers the parent's onChange
		// callback, causing false "unsaved changes" state.
		//
		// Real content changes are forwarded to the parent via
		// block.dispatchChange() in each child editor's onChange.
		// ──────────────────────────────────────────────────────────────
		this.colWrapper.setAttribute('data-mutation-free', 'true');

		if (!this.readOnly) {
			// ──────────────────────────────────────────────────────────────
			// Event isolation: use BUBBLE phase so child editors handle
			// events first, then stop propagation to prevent the parent
			// EditorJS instance from also processing them.
			//
			// Only keyboard and clipboard events are stopped. Mouse and
			// focus events must propagate — child editors use event
			// delegation for toolbar interactions.
			// ──────────────────────────────────────────────────────────────

			const stop = (event) => event.stopPropagation();

			this.colWrapper.addEventListener('keydown', stop);
			this.colWrapper.addEventListener('keyup', stop);
			this.colWrapper.addEventListener('keypress', stop);

			this.colWrapper.addEventListener('paste', stop);
			this.colWrapper.addEventListener('copy', stop);
			this.colWrapper.addEventListener('cut', stop);

			// ──────────────────────────────────────────────────────────────
			// Focus management for non-editable blocks (images, embeds).
			//
			// When clicking an image, activeElement can land outside the
			// colWrapper (images aren't focusable). Subsequent keyboard
			// events (like Tab) then fire from above it — our
			// stopPropagation handlers never see them and the parent
			// editor opens its toolbox too.
			//
			// Fix: make colWrapper focusable and reclaim focus after
			// clicking non-editable content. Uses 'click' (not mousedown)
			// with a short setTimeout so EditorJS finishes its own click
			// processing (block selection etc.) before we check focus.
			// ──────────────────────────────────────────────────────────────
			this.colWrapper.setAttribute('tabindex', '-1');
			this.colWrapper.style.outline = 'none';

			this.colWrapper.addEventListener('click', (event) => {
				// Don't interfere with toolbar interactions
				if (event.target.closest(EditorJsColumns.TOOLBAR_SELECTOR)) return;

				setTimeout(() => {
					// Don't reclaim if there's an active text selection
					const selection = window.getSelection();
					if (selection && !selection.isCollapsed) return;

					// Don't reclaim if focus is already inside colWrapper
					if (this.colWrapper.contains(document.activeElement)) return;

					this.colWrapper.focus();
				}, 20);
			});

			// ──────────────────────────────────────────────────────────────
			// Workaround for EditorJS core bug #2736:
			// https://github.com/codex-team/editor.js/issues/2736
			//
			// When focus moves to the inline toolbar's URL input inside
			// a nested editor, the parent editor's selectionChanged
			// handler fires (via document 'selectionchange') and
			// incorrectly determines that focus has left the block,
			// closing the child's toolbar.
			//
			// Fix: capture-phase listener on document for selectionchange
			// that runs BEFORE the parent editor's handler (which uses
			// bubble phase). When a child editor's inline toolbar is
			// active inside our column wrapper, stop the event so the
			// parent never processes it.
			// ──────────────────────────────────────────────────────────────
			this._selectionChangeHandler = (e) => {
				if (!this.colWrapper) return;
				const active = document.activeElement;
				// Only block selectionchange when focus is on an INPUT
				// inside the inline toolbar (e.g. the link URL field).
				// Don't block for toolbar button clicks (bold, italic)
				// — the child editor needs to process those selection
				// changes to maintain its inline tool state.
				if (active && this.colWrapper.contains(active)
					&& active.closest('.ce-inline-toolbar')
					&& (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
					e.stopImmediatePropagation();
				}
			};
			document.addEventListener('selectionchange', this._selectionChangeHandler, true);
		}





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

			let editorjs_instance = new this.config.EditorJsLibrary({
				defaultBlock: "paragraph",
				holder: editor_col_id,
				tools: this.config.tools,
				data: this.data.cols[index],
				readOnly: this.readOnly,
				minHeight: 50,
				onChange: () => this._notifyParentChanged(),
			});

			this.editors.cols.push(editorjs_instance);
			// console.log("End column, ", index);
		}
		return this.colWrapper;
	}

	async save() {
		if(!this.readOnly){
			// Force the currently focused block inside any column to
			// commit its content before we ask the child editors to save.
			// Without this, contenteditable blocks that still have focus
			// may not have flushed their latest text into EditorJS's
			// internal state.
			const active = this.colWrapper && this.colWrapper.contains(document.activeElement)
				? document.activeElement
				: null;
			if (active && typeof active.blur === 'function') {
				// Don't blur if focus is on a toolbar element (e.g. the
				// link URL input). Blurring would close the toolbar and
				// prevent the user from completing their action.
				const isInToolbar = active.closest(EditorJsColumns.TOOLBAR_SELECTOR);
				if (!isInToolbar) {
					active.blur();
				}
			}

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

	destroy() {
		// Clean up the document-level selectionchange listener
		if (this._selectionChangeHandler) {
			document.removeEventListener('selectionchange', this._selectionChangeHandler, true);
			this._selectionChangeHandler = null;
		}
	}
}

export { EditorJsColumns as default };