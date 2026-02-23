import { bindable } from 'aurelia-framework';
import { event } from 'jquery';

// Local logger: hidden by default; flip to true to re-enable debug logs for this module only
const DEBUG_UPLOAD = false;
const logger = {
	log: (...args) => { if (DEBUG_UPLOAD) console.log(...args); },
	warn: (...args) => { console.warn(...args); },
	error: (...args) => { console.error(...args); }
};

export class ScanResultData {
	@bindable result;
	editing = false;
	editedJsonString = '';

	activate(model) {
		if (model && 'result' in model) {
			this.result = model.result;
			this.currentKey = model.key || 0;
		}
		this._extract();
	}

	bind() {
		this._extract();
	}

		// Called by <compose> when parent updates model
	modelChanged(newModel) {
		this.editing = false;
		this.showItems = false;
		
		const newKey = newModel && newModel.key || 0;
		const keyChanged = this.currentKey !== newKey;
		
		if (keyChanged) {
			this._clearData();
		}
		
		this.result = newModel && 'result' in newModel ? newModel.result : null;
		this.currentKey = newKey;
		this._extract();
	}

	resultChanged() {
		this._extract();
	}

	_clearData() {
		this.result = null;
		this.header = null;
		this.items = [];
		this.headerData = [];
		this.showItems = false;
	}

	_extract() {
		// Reset prior state first
		this.header = null;
		this.items = [];
		this.headerData = [];
		this.showItems = false;
		if (!this.result) { 
			this._buildTables(); 
			return; 
		}
		const root = this.result ? (this.result.data || this.result.Data || this.result) : null;
		let invoice = null;
		if (root) invoice = root.Invoice || root.invoice || root.InvoiceResult || (root.Result && root.Result.Invoice) || null;
		const headerCandidate = (invoice && (invoice.Header || invoice.header)) || (root && (root.Header || root.header)) || null;
		const itemsCandidate = (invoice && (invoice.Items || invoice.items || invoice.Lines || invoice.lines)) || (root && (root.Items || root.items)) || [];
		this.header = headerCandidate || null;
		this.items = Array.isArray(itemsCandidate) ? itemsCandidate : [];
		this._buildTables();
	}

	_buildTables() {
		const self = this;
		this.headerData = this.header ? [this.header] : [];
		this.tableOptions = { pagination: false, search: false, showColumns: false, showToggle: false, pageSize: 50, locale: 'id-ID' };
		this.headerColumns = [
			{ field: 'InvoiceDocumentNumber', title: 'Nomor Invoice External' },
			{ field: 'SupplierName', title: 'Supplier' },
			{ field: 'TaxInvoiceDateParsed', title: 'Tanggal Faktur Pajak', 
				formatter: (value) => {
					if (!value) return '';
					const d = new Date(value);
					if (isNaN(d)) return value;
					const day = d.toLocaleDateString('id-ID', { day: '2-digit' });
					const month = d.toLocaleDateString('id-ID', { month: 'long' });
					const year = d.getFullYear();
					return `${day}-${month}-${year}`;
				}
			},
			{
			field: 'TaxInvoiceValueAddedTaxAmount', title: 'Nominal Faktur', formatter: (value) => {
				// Tampilkan selalu dengan format Indonesia dan 2 desimal
				if (value == null || value === '') return '';
				const num = Number(value);
				return isNaN(num) ? value : num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			}
			},
			{
			field: 'IdrTotalPriceBeforeTax', title: 'DPP (IDR)', formatter: (value) => {
				if (value == null || value === '') return Number(0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
				const num = Number(value);
				return isNaN(num) ? value : num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			}
			},
			{
			field: 'IdrTotalPriceAfterTax', title: 'Total Amount (IDR)', formatter: (value) => {
				if (value == null || value === '') return Number(0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
				const num = Number(value);
				return isNaN(num) ? value : num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			}
			},
			{
			field: 'NonIdrTotalPriceBeforeTax', title: 'DPP (Non-IDR)', formatter: (value) => {
				if (value == null || value === '') return Number(0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
				const num = Number(value);
				return isNaN(num) ? value : num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			}
			},
			{
			field: 'NonIdrTotalPriceAfterTax', title: 'Total Amount (Non-IDR)', formatter: (value) => {
				if (value == null || value === '') return Number(0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
				const num = Number(value);
				return isNaN(num) ? value : num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
			}
			},
			{
				field: '__toggle', title: '', align: 'center', width: 180,
				formatter: () => `
					<div style="white-space:nowrap; display:inline-flex; align-items:center;">
						<button class="btn btn-info btn-sm toggle-items">i</button>
						
					</div>`

					// <button class="btn btn-warning btn-sm action-edit" title="Edit" style="margin-left:6px;"><i class="fa fa-edit"></i></button>
					// 	<button class="btn btn-success btn-sm action-save" title="Simpan" style="margin-left:6px;" disabled><i class="fa fa-save"></i></button>
				,
				// events: {
				// 	'click .toggle-items': function (e) { try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch(_) {} self.toggleItems(); },
				// 	'click .action-edit': function (e) { try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch(_) {} self.startEdit(); },
				// 	'click .action-save': function (e) { try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch(_) {} self.saveEdit(); }
				// }
				events: { 
					
						'click .toggle-items': function (e) {
							try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch(_) {}
							self.toggleItems();
						},
						'click .action-edit': function (e) {
							try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch(_) {}
							self.startEdit();
							// Aktifkan tombol Save yang sebidang dengan tombol Edit ini
							const $cell = $(e.currentTarget).closest('td');
							$cell.find('.action-save').prop('disabled', false);
						},
						'click .action-save': function (e) {
							try { if (e) { e.preventDefault(); e.stopPropagation(); } } catch(_) {}
							// Guard tambahan (opsional)
							if ($(e.currentTarget).prop('disabled')) return;
							self.saveEdit();
							// Setelah berhasil simpan, nonaktifkan kembali
							const $cell = $(e.currentTarget).closest('td');
							$cell.find('.action-save').prop('disabled', true);
						}
				} // Handled by delegated click listener on panel
			}
		];
	}

	get hasHeader() { return !!this.header; }
	get hasItems() { return Array.isArray(this.items) && this.items.length > 0; }

	attached() {
		this._panelHandler = (e) => {
			if (!this.editing) return;
			const input = e.target.closest('input.sr-input');
			if (!input) return;
			const field = input.getAttribute('data-field');
			const scope = input.getAttribute('data-scope') || 'header';
			if (scope === 'header') {
				if (this.header && field) {
					let v = input.value;
					// Untuk field number, validasi value
					if (["GrandTotalBeforeTax","ValueAddedTax","IncomeTax","GrandTotalAfterTax"].includes(field)) {
						v = v === '' ? null : Number(v);
						if (v == null || v === '') return;
						if (v === this.header[field]) return;
					}
					if (field === 'InvoiceDateOffset') {
						v = v || null;
						if (v === this.header[field]) return;
					}
					if (field === 'InvoiceNumber' || field === 'Currency') {
						if (v === this.header[field]) return;
					}
					this.header[field] = v;
				}
			} else if (scope === 'item') {
				const idx = parseInt(input.getAttribute('data-index'), 10);
				if (!isNaN(idx) && this.items && this.items[idx]) {
					let v = input.value; v = v === '' ? null : Number(v);
					this.items[idx][field] = v;
					if (field === 'Quantity' || field === 'PricePerUnit') {
						const q = Number(this.items[idx].Quantity) || 0;
						const p = Number(this.items[idx].PricePerUnit) || 0;
						this.items[idx].TotalPrice = q * p;
						const row = input.closest('tr');
						if (row) {
							const totalCell = row.cells[4];
							if (totalCell && totalCell.querySelector('input.sr-input[data-field="TotalPrice"]')) {
								totalCell.querySelector('input.sr-input').value = this.items[idx].TotalPrice || 0;
							}
						}
					}
				}
			}
		};
		if (this.panel) this.panel.addEventListener('input', this._panelHandler);

		// Delegated click handler as a robust fallback
		this._panelClick = (e) => {
			// const editBtn = e.target && e.target.closest && e.target.closest('button.action-edit');
			// if (editBtn) { try { e.preventDefault(); e.stopPropagation(); } catch(_) {} this.startEdit(); return; }
			// const saveBtn = e.target && e.target.closest && e.target.closest('button.action-save');
			// if (saveBtn) { try { e.preventDefault(); e.stopPropagation(); } catch(_) {} this.saveEdit(); return; }
			const toggleBtn = e.target && e.target.closest && e.target.closest('button.toggle-items');
			if (toggleBtn) { try { e.preventDefault(); e.stopPropagation(); } catch(_) {} this.toggleItems(); return; }
		};
		if (this.panel) this.panel.addEventListener('click', this._panelClick);
	}

	// Helpers
	formatDateLong(v) {
		if (!v) return '';
		const d = new Date(v);
		if (isNaN(d)) return v;
		const day = d.toLocaleDateString('id-ID', { day: '2-digit' });
		const month = d.toLocaleDateString('id-ID', { month: 'long' });
		const year = d.getFullYear();
		return `${day}-${month}-${year}`;
	}
	toDateInputValue(v) {
		if (!v) return '';
		const d = new Date(v);
		if (isNaN(d)) return '';
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	}

	detached() {
		if (this.panel && this._panelHandler) this.panel.removeEventListener('input', this._panelHandler);
		if (this.panel && this._panelClick) this.panel.removeEventListener('click', this._panelClick);
	}

	toggleItems() {
		if (!this.hasItems) return;
		this.showItems = !this.showItems;
		if (this.editing && this.showItems) setTimeout(() => { try { this._tryEnterItemsEdit(); } catch(_) {} }, 0);
	}

	formatNumber(v) {
		if (v == null) return '';
		const n = Number(v); if (isNaN(n)) return v;
		return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
	}

	// Edit/save
	startEdit() {
		this.editing = true;
		logger.log('startEdit called, showItems:', this.showItems);
		// Defer to allow au-table to finish rendering DOM before we mutate cells
		setTimeout(() => {
			try { this._enterHeaderEdit(); } catch(_) {}
			try {
				logger.log('Support ref on edit:', this.supportRef);
				if (this.supportRef && this.supportRef.startEdit) {
					logger.log('Calling supportRef.startEdit()');
					this.supportRef.startEdit();
					// Also retry a few times to handle late render
					this._trySupportEdit(8);
				} else {
					logger.log('supportRef not ready or no startEdit');
				}
			} catch(e) { logger.warn('Error calling supportRef.startEdit', e); }
			// Use the existing working method instead of _triggerItemsEdit
			try { 
				if (this.showItems) {
					logger.log('Calling _enterItemsEdit (existing method)');
					// Add extra delay for items table to be fully rendered
					setTimeout(() => {
						this._enterItemsEdit();
						// Also schedule a couple retries in case rows appear later
						this._tryEnterItemsEdit(10);
					}, 200);
				} else {
					logger.log('Items not shown, skipping _enterItemsEdit');
				}
			} catch(_) {}
		}, 0);
	}

	_trySupportEdit(attempts = 5) {
		if (attempts <= 0) return;
		setTimeout(() => {
			try {
				if (this.supportRef && this.supportRef.startEdit) {
					this.supportRef.startEdit();
				}
			} catch(_) {}
		}, 200);
	}
	// saveEdit() {
	// 	// Persist first, then exit edit mode, then render as readonly
	// 	try { this._persistHeaderFromInputs(); } catch(_) {}
	// 	try { this._persistItemsFromInputs(); } catch(_) {}
	// 	try {
	// 		logger.log('Support ref on save:', this.supportRef);
	// 		if (this.supportRef && this.supportRef.saveEdit) {
	// 			logger.log('Calling supportRef.saveEdit()');
	// 			this.supportRef.saveEdit();
	// 		} else {
	// 			logger.log('supportRef not ready or no saveEdit');
	// 		}
	// 	} catch(e) { logger.warn('Error calling supportRef.saveEdit', e); }
	// 	this.editing = false;
	// 	try { this._renderHeaderReadonly(); } catch(_) {}
	// 	try { this._renderItemsReadonly(); } catch(_) {}
	// 		// Force refresh bound data so au-table re-renders with latest values
	// 		try {
	// 			// Header data
	// 			const newHeader = this.header ? { ...this.header } : null;
	// 			this.headerData = newHeader ? [newHeader] : [];
	// 			// Items data (trigger child component change detection)
	// 			if (Array.isArray(this.items)) {
	// 				this.items = this.items.map(it => ({ ...it }));
	// 			}
	// 			// Support tables: reassign arrays to new refs
	// 			if (this.supportRef) {
	// 				if (Array.isArray(this.supportRef.poRows)) this.supportRef.poRows = this.supportRef.poRows.map(r => ({ ...r }));
	// 				if (Array.isArray(this.supportRef.doRows)) this.supportRef.doRows = this.supportRef.doRows.map(r => ({ ...r }));
	// 				if (Array.isArray(this.supportRef.taxRows)) this.supportRef.taxRows = this.supportRef.taxRows.map(r => ({ ...r }));
	// 			}
	// 		} catch(_) {}
	// 	// Apply edits back into underlying scanResult JSON and refresh viewer
	// 	try { this._applyEditsToResult(); } catch(e) { logger.warn('Error applying edits to result', e); }
	// 	try { this.showEditedJson(); } catch(_) {}
	// }

	saveEdit() {
  // Persist first, then exit edit mode, then render as readonly
			try { this._persistHeaderFromInputs(); } catch(_) {}
			try { this._persistItemsFromInputs(); } catch(_) {}

			try {
				logger.log('Support ref on save:', this.supportRef);
				if (this.supportRef && this.supportRef.saveEdit) {
				logger.log('Calling supportRef.saveEdit()');
				this.supportRef.saveEdit();
				} else {
				logger.log('supportRef not ready or no saveEdit');
				}
			} catch(e) { logger.warn('Error calling supportRef.saveEdit', e); }

			this.editing = false;

			// Selalu render header kembali ke readonly
			try { this._renderHeaderReadonly(); } catch(_) {}

			// HANYA render items bila items sedang ditampilkan
			try { if (this.showItems) { this._renderItemsReadonly(); } } catch(_) {}

			// Force refresh bound data supaya au-table re-render dengan nilai terbaru
			try {
				// Header data
				const newHeader = this.header ? { ...this.header } : null;
				this.headerData = newHeader ? [newHeader] : [];

				// Items data (trigger child component change detection)
				if (Array.isArray(this.items)) {
				this.items = this.items.map(it => ({ ...it }));
				}

				// Support tables: reassign arrays to new refs
				if (this.supportRef) {
				if (Array.isArray(this.supportRef.poRows))  this.supportRef.poRows  = this.supportRef.poRows.map(r => ({ ...r }));
				if (Array.isArray(this.supportRef.doRows))  this.supportRef.doRows  = this.supportRef.doRows.map(r => ({ ...r }));
				if (Array.isArray(this.supportRef.taxRows)) this.supportRef.taxRows = this.supportRef.taxRows.map(r => ({ ...r }));
				}
			} catch(_) {}

			// Apply edits back into underlying scanResult JSON and refresh viewer
			try { this._applyEditsToResult(); } catch(e) { logger.warn('Error applying edits to result', e); }
			try { this.showEditedJson(); } catch(_) {}
	}


	// Merge latest edits back into the original result structure, best-effort without changing shape drastically
	_applyEditsToResult() {
		if (!this.result) return;
		const root = this.result.data || this.result.Data || this.result;
		if (!root || typeof root !== 'object') return;
		// Prefer nested Invoice container when present
		let invoice = root.Invoice || root.invoice || root.InvoiceResult || (root.Result && root.Result.Invoice) || null;
		// Header
		if (this.header && typeof this.header === 'object') {
			if (invoice && typeof invoice === 'object') {
				if (invoice.Header || invoice.header) {
					if (invoice.Header) invoice.Header = this.header;
					if (invoice.header) invoice.header = this.header;
				} else {
					// If no dedicated header field, try common root header
					if (root.Header) root.Header = this.header;
					if (root.header) root.header = this.header;
				}
			} else {
				if (root.Header) root.Header = this.header;
				if (root.header) root.header = this.header;
			}
		}
		// Items
		if (Array.isArray(this.items)) {
			if (invoice && typeof invoice === 'object') {
				if (Array.isArray(invoice.Items)) invoice.Items = this.items;
				if (Array.isArray(invoice.items)) invoice.items = this.items;
				if (Array.isArray(invoice.Lines)) invoice.Lines = this.items;
				if (Array.isArray(invoice.lines)) invoice.lines = this.items;
			} else {
				if (Array.isArray(root.Items)) root.Items = this.items;
				if (Array.isArray(root.items)) root.items = this.items;
			}
		}
		// Support (PO, DO, Tax) — update only if containers exist
		if (this.supportRef) {
			const poRows = Array.isArray(this.supportRef.poRows) ? this.supportRef.poRows : null;
			const doRows = Array.isArray(this.supportRef.doRows) ? this.supportRef.doRows : null;
			const taxRows = Array.isArray(this.supportRef.taxRows) ? this.supportRef.taxRows : null;
			// PurchaseOrder container
			if (poRows && root.PurchaseOrder) {
				if (Array.isArray(root.PurchaseOrder.Document)) root.PurchaseOrder.Document = poRows;
				if (Array.isArray(root.PurchaseOrder.document)) root.PurchaseOrder.document = poRows;
			}
			// DeliveryOrder container
			if (doRows && root.DeliveryOrder) {
				if (Array.isArray(root.DeliveryOrder.Document)) root.DeliveryOrder.Document = doRows;
				if (Array.isArray(root.DeliveryOrder.document)) root.DeliveryOrder.document = doRows;
			}
			// TaxInvoice container
			if (taxRows && root.TaxInvoice) {
				const taxObj = taxRows[0] || null;
				if (taxObj) {
					if (root.TaxInvoice.TaxInvoice) root.TaxInvoice.TaxInvoice = taxObj;
					if (root.TaxInvoice.taxInvoice) root.TaxInvoice.taxInvoice = taxObj;
					// Fallback flat shape
					if (!root.TaxInvoice.TaxInvoice && !root.TaxInvoice.taxInvoice) {
						Object.assign(root.TaxInvoice, taxObj);
					}
				}
			}
		}
	}

	// DOM helpers
	_getHeaderRow() {
		// Prefer the specific header table rendered by au-table
		if (this.headerTableEl) {
			const tr = this.headerTableEl.querySelector('tbody tr');
			if (tr) return tr;
		}
		// Fallback: search within panel
		if (!this.panel) return null;
		const tr = this.panel.querySelector('table tbody tr');
		return tr || null;
	}
	_getItemsTable() {
		if (!this.showItems) return null;
		// Prefer the ACTUAL rendered body table from bootstrap-table inside items container
		if (this.itemsContainer) {
			// Bootstrap-table wraps the original table and renders rows into
			// .bootstrap-table > .fixed-table-container > .fixed-table-body > table
			let bodyTable = this.itemsContainer.querySelector('.fixed-table-body table');
			if (!bodyTable) bodyTable = this.itemsContainer.querySelector('.bootstrap-table .fixed-table-body table');
			if (!bodyTable) {
				// As a fallback, pick the first table that has a tbody with rows
				const candidateTables = this.itemsContainer.querySelectorAll('table');
				for (let tbl of candidateTables) {
					const tb = tbl.querySelector('tbody');
					if (tb && tb.rows && tb.rows.length > 0) { bodyTable = tbl; break; }
				}
			}
			if (bodyTable) {
				logger.log('Found items body table:', bodyTable);
				return bodyTable;
			}
			// Last resort: return the original (likely empty) table to avoid nulls
			const orig = this.itemsContainer.querySelector('table');
			if (orig) {
				logger.log('Falling back to original items table (may be empty):', orig);
				return orig;
			}
		}
		if (!this.panel) return null;
		const tables = this.panel.querySelectorAll('table');
		logger.log('All tables in panel:', tables.length);
		if (tables.length < 2) {
			// Fallback: look for any table that might be the items table
			const allTables = document.querySelectorAll('table');
			logger.log('All tables in document:', allTables.length);
			for (let table of allTables) {
				const tbody = table.querySelector('tbody');
				if (tbody && tbody.rows.length > 0) {
					const firstRow = tbody.rows[0];
					// Check if this looks like an items table (has ProductCode, ProductName, etc.)
					const cells = Array.from(firstRow.cells);
					const hasProductCode = cells.some(cell => cell.textContent && cell.textContent.includes('BA No:'));
					if (hasProductCode) {
						logger.log('Found items table by content:', table);
						return table;
					}
				}
			}
			return null;
		}
		const itemsTable = tables[1];
		logger.log('Found items table as second table:', itemsTable);
		return itemsTable;
	}

		_tryEnterItemsEdit(attempts = 15) {
			if (!this.editing || !this.showItems) return;
			const table = this._getItemsTable();
			if (table) { this._enterItemsEdit(); return; }
			if (attempts <= 0) return;
			setTimeout(() => this._tryEnterItemsEdit(attempts - 1), 50);
		}
	_enterHeaderEdit() {
		const tr = this._getHeaderRow();
		if (!tr || !this.header) return;
		const map = [
			{ idx: 0, field: 'InvoiceNumber', type: 'text' },
			{ idx: 1, field: 'InvoiceDateOffset', type: 'date' },
			{ idx: 2, field: 'GrandTotalBeforeTax', type: 'number' },
			{ idx: 4, field: 'IncomeTax', type: 'number' },
			{ idx: 5, field: 'GrandTotalAfterTax', type: 'number' },
			{ idx: 6, field: 'Currency', type: 'text' }
		];
		map.forEach(m => {
			const td = tr.cells[m.idx]; if (!td) return;
			const val = this.header[m.field];
			if (m.type === 'number') {
				const raw = (val === null || val === undefined || val === '') ? '' : String(val);
				td.innerHTML = `<input type="number" step="any" class="form-control input-sm sr-input" data-scope="header" data-field="${m.field}" value="${raw}" style="min-width:120px; text-align:right;" />`;
			} else if (m.type === 'date') {
				const raw = this.toDateInputValue(val);
				td.innerHTML = `<input type="date" class="form-control input-sm sr-input" data-scope="header" data-field="${m.field}" value="${raw}" style="min-width:140px;" />`;
			} else {
				const raw = (val === null || val === undefined) ? '' : String(val).replace(/\"/g,'&quot;');
				td.innerHTML = `<input type="text" class="form-control input-sm sr-input" data-scope="header" data-field="${m.field}" value="${raw}" style="min-width:120px;" />`;
			}
		});
		// Focus first input for visibility
		const firstInput = tr.querySelector('input.sr-input');
		if (firstInput && firstInput.focus) firstInput.focus();
	}
	_enterItemsEdit() {
		const table = this._getItemsTable();
		if (!table || !this.items || !this.items.length) return;
		// In bootstrap-table, body rows live inside the rendered body table
		let rows = table.querySelectorAll('tbody tr');
		if (!rows || rows.length === 0) {
			// Try deeper under fixed-table-body
			rows = this.itemsContainer ? this.itemsContainer.querySelectorAll('.fixed-table-body table tbody tr') : rows;
		}
		rows.forEach((tr, i) => {
			const qTd = tr.cells[2]; const pTd = tr.cells[3]; const tTd = tr.cells[4];
			const qRaw = (this.items[i].Quantity === null || this.items[i].Quantity === undefined || this.items[i].Quantity === '') ? '' : String(this.items[i].Quantity);
			const pRaw = (this.items[i].PricePerUnit === null || this.items[i].PricePerUnit === undefined || this.items[i].PricePerUnit === '') ? '' : String(this.items[i].PricePerUnit);
			const tRaw = (this.items[i].TotalPrice === null || this.items[i].TotalPrice === undefined || this.items[i].TotalPrice === '') ? '' : String(this.items[i].TotalPrice);
			if (qTd) qTd.innerHTML = `<input type="text" class="form-control input-sm sr-input" data-scope="item" data-index="${i}" data-field="Quantity" value="${qRaw}" style="min-width:100px; text-align:right;" />`;
			if (pTd) pTd.innerHTML = `<input type="text" class="form-control input-sm sr-input" data-scope="item" data-index="${i}" data-field="PricePerUnit" value="${pRaw}" style="min-width:100px; text-align:right;" />`;
			if (tTd) tTd.innerHTML = `<input type="text" class="form-control input-sm sr-input" data-scope="item" data-index="${i}" data-field="TotalPrice" value="${tRaw}" style="min-width:100px; text-align:right;" />`;
		});
	}
	_persistHeaderFromInputs() {
		if (!this.panel || !this.header) return;
		const inputs = this.panel.querySelectorAll('input.sr-input[data-scope="header"]');
		inputs.forEach(inp => {
			const field = inp.getAttribute('data-field');
			let v = inp.value; 
			// Untuk field number, pastikan validasi value
			if (["GrandTotalBeforeTax","ValueAddedTax","IncomeTax","GrandTotalAfterTax"].includes(field)) {
				v = v === '' ? null : Number(v);
				// Jika value input kosong/null, jangan update
				if (v == null || v === '') return;
				// Jika value input sama dengan nilai asli, jangan update
				if (v === this.header[field]) return;
				// Log perubahan untuk debugging
				console.log(`Field ${field} updated from ${this.header[field]} to ${v}`);
			}
			if (field === 'InvoiceDateOffset') {
				// store as ISO string (yyyy-mm-dd) or original if empty
				v = v || null;
				if (v === this.header[field]) return;
			}
			if (field === 'InvoiceNumber' || field === 'Currency') {
				if (v === this.header[field]) return;
			}
			this.header[field] = v;
		});
	}
	_persistItemsFromInputs() {
		if (!this.panel || !this.items) return;
		const inputs = this.panel.querySelectorAll('input.sr-input[data-scope="item"]');
		inputs.forEach(inp => {
			const field = inp.getAttribute('data-field');
			const idx = parseInt(inp.getAttribute('data-index'), 10);
			if (isNaN(idx) || !this.items[idx]) return;
			let v = inp.value; v = v === '' ? null : Number(v);
			// Validasi perubahan Quantity
			if (field === 'Quantity') {
				if (v === this.items[idx][field]) return;
				console.log(`Quantity pada item ${idx} diperbarui dari ${this.items[idx][field]} ke ${v}`);
			}
			this.items[idx][field] = v;
			if (field === 'Quantity' || field === 'PricePerUnit') {
				const q = Number(this.items[idx].Quantity) || 0;
				const p = Number(this.items[idx].PricePerUnit) || 0;
				this.items[idx].TotalPrice = q * p;
			}
		});
	}
	_renderHeaderReadonly() {
		const tr = this._getHeaderRow(); if (!tr || !this.header) return;
		const set = [
			{ idx: 0, value: this.header.InvoiceNumber },
			{ idx: 1, value: this.formatDateLong(this.header.InvoiceDateOffset) },
			{ idx: 2, value: this.formatNumber(this.header.GrandTotalBeforeTax) },
			{ idx: 3, value: this.formatNumber(this.header.ValueAddedTax) },
			{ idx: 4, value: this.formatNumber(this.header.IncomeTax) },
			{ idx: 5, value: this.formatNumber(this.header.GrandTotalAfterTax) },
			{ idx: 6, value: this.header.Currency }
		];
		set.forEach(s => { const td = tr.cells[s.idx]; if (td) td.textContent = s.value == null ? '' : String(s.value); });
	}
	_renderItemsReadonly() {
		const table = this._getItemsTable(); if (!table || !this.items) return;
		let rows = table.querySelectorAll('tbody tr');
		if (!rows || rows.length === 0) {
			rows = this.itemsContainer ? this.itemsContainer.querySelectorAll('.fixed-table-body table tbody tr') : rows;
		}
		rows.forEach((tr, i) => {
			if (!this.items[i]) return;
			const qTd = tr.cells[2]; if (qTd) qTd.textContent = this.formatNumber(this.items[i].Quantity);
			const pTd = tr.cells[3]; if (pTd) pTd.textContent = this.formatNumber(this.items[i].PricePerUnit);
			const tTd = tr.cells[4]; if (tTd) tTd.textContent = this.formatNumber(this.items[i].TotalPrice);
		});
	}

	// Show latest edited snapshot (header/items/support + raw)
	showEditedJson() {
		try {
			const snapshot = {
				header: this.header || null,
				items: Array.isArray(this.items) ? this.items : [],
				support: {
					purchaseOrders: (this.supportRef && Array.isArray(this.supportRef.poRows)) ? this.supportRef.poRows : [],
					deliveryOrders: (this.supportRef && Array.isArray(this.supportRef.doRows)) ? this.supportRef.doRows : [],
					taxInvoices: (this.supportRef && Array.isArray(this.supportRef.taxRows)) ? this.supportRef.taxRows : []
				},
				raw: this.result || null
			};
			this.editedJsonString = JSON.stringify(snapshot, null, 2);
		} catch (e) {
			this.editedJsonString = `{"error": "Gagal membangun snapshot: ${e && e.message ? e.message : e}"}`;
		}
	}
}

export default ScanResultData;
