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
import MicroModal from "micromodal";

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

		this._dispatchTimer = null;

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

	// Selector for all EditorJS toolbar/UI elements
	static get TOOLBAR_SELECTOR() {
		return '.ce-inline-toolbar, .ce-toolbar, .ce-toolbox, .ce-popover, .ce-conversion-toolbar, .ce-settings';
	}

	/**
	 * Notify the parent editor that content changed, debounced to 300ms.
	 * Skipped while a toolbar element has focus to avoid disrupting
	 * multi-step interactions (e.g. typing a link URL).
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

	_createConfirmModal() {
		const modalId = 'editorjs-columns-confirm-modal';
		let modal = document.getElementById(modalId);
		if (modal) modal.remove();

		modal = document.createElement('div');
		modal.id = modalId;
		modal.classList.add('modal', 'micromodal-slide');
		modal.setAttribute('aria-hidden', 'true');
		modal.innerHTML = `
			<div class="modal__overlay" tabindex="-1" data-micromodal-close>
				<div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title">
					<header class="modal__header">
						<h2 id="${modalId}-title" class="modal__title">${this.api.i18n.t("Are you sure?")}</h2>
						<button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
					</header>
					<div class="modal__content" id="${modalId}-content">
						<p>${this.api.i18n.t("This will delete Column 3!")}</p>
					</div>
					<footer class="modal__footer">
						<button class="modal__btn modal__btn--primary" data-micromodal-confirm>${this.api.i18n.t("Yes, delete it!")}</button>
						<button class="modal__btn" data-micromodal-close>${this.api.i18n.t("Cancel")}</button>
					</footer>
				</div>
			</div>`;

		document.body.appendChild(modal);
		return { modal, modalId };
	}

	_showConfirmModal() {
		return new Promise((resolve) => {
			const { modal, modalId } = this._createConfirmModal();
			let confirmed = false;

			const confirmBtn = modal.querySelector('[data-micromodal-confirm]');
			confirmBtn.addEventListener('click', () => {
				confirmed = true;
				MicroModal.close(modalId);
			});

			MicroModal.show(modalId, {
				onClose: () => {
					modal.remove();
					resolve(confirmed);
				},
			});
		});
	}

	async _updateCols(num) {
		// Should probably update to make number dynamic... but this will do for now
		if (num == 2) {
			if (this.editors.numberOfColumns == 3) {
				const confirmed = await this._showConfirmModal();

				if (confirmed) {
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
			});

			this.editors.cols.push(editorjs_instance);
		}
	}

	render() {

		this.colWrapper = document.createElement("div");
		this.colWrapper.classList.add("ce-editorjsColumns_wrapper");

		if (!this.readOnly) {
			// Bubble-phase isolation: child editors process events first,
			// then we stop propagation to prevent the parent editor from
			// also handling them.
			const stop = (event) => event.stopPropagation();

			this.colWrapper.addEventListener('keydown', stop);
			this.colWrapper.addEventListener('keyup', stop);
			this.colWrapper.addEventListener('keypress', stop);
			this.colWrapper.addEventListener('paste', stop);
			this.colWrapper.addEventListener('copy', stop);
			this.colWrapper.addEventListener('cut', stop);

			// Focus management for non-editable blocks (images, embeds).
			// After clicking one, activeElement can land outside the
			// colWrapper. Make it focusable and reclaim focus so keyboard
			// events are captured by our stopPropagation handlers.
			this.colWrapper.setAttribute('tabindex', '-1');
			this.colWrapper.style.outline = 'none';

			this.colWrapper.addEventListener('click', (event) => {
				if (event.target.closest(EditorJsColumns.TOOLBAR_SELECTOR)) return;
				setTimeout(() => {
					const selection = window.getSelection();
					if (selection && !selection.isCollapsed) return;
					if (this.colWrapper.contains(document.activeElement)) return;
					this.colWrapper.focus();
				}, 20);
			});

			// Workaround for EditorJS core issue #2736:
			// When focus moves to the inline toolbar's URL input inside
			// a nested editor, the parent editor's selectionChanged handler
			// closes the child's toolbar. Capture-phase listener fires
			// before the parent's bubble-phase handler and blocks it.
			this._selectionChangeHandler = (e) => {
				if (!this.colWrapper) return;
				const active = document.activeElement;
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

		this.editors.cols = [];

		for (let index = 0; index < this.editors.numberOfColumns; index++) {
			let col = document.createElement("div");
			col.classList.add("ce-editorjsColumns_col");
			col.classList.add("editorjs_col_" + index);

			let editor_col_id = uuidv4();
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
		return this.colWrapper;
	}

	async save() {
		if(!this.readOnly){
			// Blur active element to flush contenteditable content,
			// but skip if focus is on a toolbar element.
			const active = this.colWrapper && this.colWrapper.contains(document.activeElement)
				? document.activeElement
				: null;
			if (active && typeof active.blur === 'function') {
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

	destroy() {
		if (this._selectionChangeHandler) {
			document.removeEventListener('selectionchange', this._selectionChangeHandler, true);
			this._selectionChangeHandler = null;
		}
		clearTimeout(this._dispatchTimer);
	}

	static get toolbox() {
		return {
			icon: icon,
			title: "Columns",
		};
	}
}

export { EditorJsColumns as default };
