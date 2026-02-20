import { bindable } from 'aurelia-framework';

// Local logger for upload support component; hidden by default
const DEBUG_UPLOAD = false;
const logger = {
  log: (...args) => { if (DEBUG_UPLOAD) console.log(...args); },
  warn: (...args) => { console.warn(...args); },
  error: (...args) => { console.error(...args); }
};

// Komponen pendukung: menampilkan tabel PO, SJ, dan Faktur Pajak
export class ScanResultSuport {
  @bindable result;
  @bindable editing = false;

  activate(model) {
    if (model && 'result' in model) this.result = model.result;
    this._build();
  }

  bind() {
    this._build();
  }

  resultChanged() {
    this._build();
  }

  _build() {
    const root = this.result ? (this.result.data || this.result.Data || this.result) : null;
    const poArr = root && root.PurchaseOrder && (root.PurchaseOrder.PurchaseOrders || root.PurchaseOrder.purchaseOrders) || [];
    const doArr = root && root.DeliveryOrder && (root.DeliveryOrder.Document || root.DeliveryOrder.document) || [];
    const taxContainer = root && (root.InvoiceTax || root.invoiceTax) || null;
    let taxObj = null;
    if (taxContainer) {
      // Typical shape: { TaxInvoice: { TaxInvoiceNumber, TaxInvoiceDate, ValueAddedTax, ... } }
      taxObj = taxContainer.TaxInvoice || taxContainer.taxInvoice || null;
      // Fallback: sometimes API might already provide flattened object at this level
      if (!taxObj && (taxContainer.TaxInvoiceNumber || taxContainer.TaxInvoiceDate || taxContainer.ValueAddedTax)) {
        taxObj = taxContainer;
      }
    }

    this.poRows = Array.isArray(poArr) ? poArr : [];
    this.doRows = Array.isArray(doArr) ? doArr : [];
    this.taxRows = taxObj ? [taxObj] : [];

    console.log(this.doRows)
    console.log(this.poRows)


    this.tableOptions = {
      pagination: false,
      search: false,
      showColumns: false,
      showToggle: false,
      pageSize: 50,
      locale: 'id-ID'
    };
this.poColumns = [
  { field: 'PO.PurchaseOrderNumber', title: 'Nomor PO' }
];

this.poItemColumns=[{field: 'ItemSerialNumber', title : 'ItemSerialNumber'}]
  

    this.doColumns = [
      { field: 'Header.DocumentNumber', title: 'Nomor Surat Jalan' }
    ];

    // Tambah kolom Tanggal Jatuh Tempo (TaxInvoiceDateOffset)
    this.taxColumns = [
      { field: 'TaxInvoiceNumber', title: 'No. Faktur Pajak' },
      // { field: 'TaxInvoiceDate', title: 'Tanggal Faktur', formatter: (v) => this.formatDate(v) },
      { field: 'TaxInvoiceDateOffset', title: 'Tanggal Faktur', formatter: (v) => this.formatDate(v) },
      { field: 'ValueAddedTax', title: 'PPN', align: 'right', formatter: (v) => this.formatNumber(v) }
    ];
  }

  get hasPO() { return Array.isArray(this.poRows) && this.poRows.length > 0; }
  get hasDO() { return Array.isArray(this.doRows) && this.doRows.length > 0; }
  get hasTax() { return Array.isArray(this.taxRows) && this.taxRows.length > 0; }

  formatNumber(v) {
    if (v == null) return '';
    const n = Number(v);
    if (isNaN(n)) return v;
    return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return v;
  const dd = String(d.getDate()).padStart(2, '0');
  const monthLong = d.toLocaleDateString('id-ID', { month: 'long' });
  const yy = d.getFullYear();
  return `${dd}-${monthLong}-${yy}`;
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

  // ============ Edit/Save API (dipanggil parent) ============
  startEdit() {
    this.editing = true;
  logger.log('[support] startEdit called');
  // Masuk mode edit untuk semua tabel (PO, DO, Tax)
  const tryEdit = (n=10) => {
      setTimeout(() => {
    const okPO = this._enterPOEdit();
    const okDO = this._enterDOEdit();
    const okTax = this._enterTaxEdit();
    if (!(okPO && okDO && okTax) && n > 0) tryEdit(n-1);
      }, 100);
    };
    tryEdit();
  }

  saveEdit() {
  logger.log('[support] saveEdit called');
  try { this._persistPOFromInputs(); } catch(e) { logger.warn('[support] _persistPOFromInputs error', e); }
  try { this._persistDOFromInputs(); } catch(e) { logger.warn('[support] _persistDOFromInputs error', e); }
  try { this._persistTaxFromInputs(); } catch(e) { logger.warn('[support] _persistTaxFromInputs error', e); }
    this.editing = false;
  try { this._renderPOReadonly(); } catch(e) { logger.warn('[support] _renderPOReadonly error', e); }
  try { this._renderDOReadonly(); } catch(e) { logger.warn('[support] _renderDOReadonly error', e); }
  try { this._renderTaxReadonly(); } catch(e) { logger.warn('[support] _renderTaxReadonly error', e); }
  }

  // Helpers ambil table body sebenarnya (bootstrap-table)
  _getBodyTable(container) {
    if (!container) return null;
    let bodyTable = container.querySelector('.fixed-table-body table');
    if (!bodyTable) bodyTable = container.querySelector('.bootstrap-table .fixed-table-body table');
    if (!bodyTable) {
      const candidates = container.querySelectorAll('table');
      for (let t of candidates) {
        const tb = t.querySelector('tbody');
        if (tb && tb.rows && tb.rows.length > 0) { bodyTable = t; break; }
      }
    }
    return bodyTable;
  }

  _getBodyRows(container) {
    const table = this._getBodyTable(container);
    if (!table) return [];
    return Array.from(table.querySelectorAll('tbody tr'));
  }

  // -------- PO (Nomor PO) --------
  _enterPOEdit() {
    if (!this.hasPO) return true; // nothing to do
    const rows = this._getBodyRows(this.poContainer);
    if (!rows || rows.length === 0) return false;
    rows.forEach((tr, i) => {
      const td = tr.cells && tr.cells[0];
      if (!td || !this.poRows[i]) return;
      const val = this.poRows[i].PurchaseOrderNumber;
      const raw = (val == null) ? '' : String(val).replace(/\"/g,'&quot;');
      td.innerHTML = `<input type="text" class="form-control input-sm sup-input" data-scope="po" data-index="${i}" data-field="PurchaseOrderNumber" value="${raw}" style="min-width:160px;" />`;
    });
    return true;
  }

  _persistPOFromInputs() {
    if (!this.poContainer || !Array.isArray(this.poRows)) return;
    const inputs = this.poContainer.querySelectorAll('input.sup-input[data-scope="po"]');
    inputs.forEach(inp => {
      const idx = parseInt(inp.getAttribute('data-index'), 10);
      const field = inp.getAttribute('data-field');
      if (!isNaN(idx) && this.poRows[idx]) {
        this.poRows[idx][field] = inp.value;
      }
    });
  }

  _renderPOReadonly() {
    const rows = this._getBodyRows(this.poContainer);
    rows.forEach((tr, i) => {
      const td = tr.cells && tr.cells[0];
      if (td && this.poRows[i]) td.textContent = this.poRows[i].PurchaseOrderNumber || '';
    });
  }

  // -------- DO (Nomor Surat Jalan) --------
  _enterDOEdit() {
    if (!this.hasDO) return true; // nothing to do
    const rows = this._getBodyRows(this.doContainer);
    if (!rows || rows.length === 0) return false;
    rows.forEach((tr, i) => {
      const td = tr.cells && tr.cells[0];
      if (!td || !this.doRows[i]) return;
      const val = this.doRows[i].DeliveryOrderNumber;
      const raw = (val == null) ? '' : String(val).replace(/\"/g,'&quot;');
      td.innerHTML = `<input type="text" class="form-control input-sm sup-input" data-scope="do" data-index="${i}" data-field="DeliveryOrderNumber" value="${raw}" style="min-width:160px;" />`;
    });
    return true;
  }

  _persistDOFromInputs() {
    if (!this.doContainer || !Array.isArray(this.doRows)) return;
    const inputs = this.doContainer.querySelectorAll('input.sup-input[data-scope="do"]');
    inputs.forEach(inp => {
      const idx = parseInt(inp.getAttribute('data-index'), 10);
      const field = inp.getAttribute('data-field');
      if (!isNaN(idx) && this.doRows[idx]) {
        this.doRows[idx][field] = inp.value;
      }
    });
  }

  _renderDOReadonly() {
    const rows = this._getBodyRows(this.doContainer);
    rows.forEach((tr, i) => {
      const td = tr.cells && tr.cells[0];
      if (td && this.doRows[i]) td.textContent = this.doRows[i].DeliveryOrderNumber || '';
    });
  }

  _enterTaxEdit() {
    if (!this.hasTax) return;
    const table = this._getBodyTable(this.taxContainer);
  logger.log('[support] tax body table:', table);
    if (!table) return false;
    const tr = table.querySelector('tbody tr');
  logger.log('[support] tax first row:', tr);
    if (!tr || !this.taxRows[0]) return false;

    const tax = this.taxRows[0];
    // Kolom: [0] No Faktur, [1] Tgl Faktur, [2] Tgl Jatuh Tempo, [3] PPN
    // Editable: [0] TaxInvoiceNumber (text), [2] TaxInvoiceDateOffset (text/number string), [3] ValueAddedTax (number)
    const map = [
      { idx: 0, field: 'TaxInvoiceNumber', type: 'text' },
      { idx: 1, field: 'TaxInvoiceDateOffset', type: 'date' },
      { idx: 2, field: 'ValueAddedTax', type: 'number' }
    ];
  map.forEach(m => {
      const td = tr.cells[m.idx]; if (!td) return;
      const val = tax[m.field];
      if (m.type === 'number') {
        const raw = (val === null || val === undefined || val === '') ? '' : String(val);
        td.innerHTML = `<input type="number" step="any" class="form-control input-sm sup-input" data-scope="tax" data-field="${m.field}" value="${raw}" style="min-width:120px; text-align:right;" />`;
      } else if (m.type === 'date') {
        const raw = this.toDateInputValue(val);
        td.innerHTML = `<input type="date" class="form-control input-sm sup-input" data-scope="tax" data-field="${m.field}" value="${raw}" style="min-width:140px;" />`;
      } else {
        const raw = (val === null || val === undefined) ? '' : String(val).replace(/\"/g,'&quot;');
        td.innerHTML = `<input type="text" class="form-control input-sm sup-input" data-scope="tax" data-field="${m.field}" value="${raw}" style="min-width:120px;" />`;
      }
    });
  return true;
  }

  _persistTaxFromInputs() {
    if (!this.taxContainer || !this.taxRows || this.taxRows.length === 0) return;
    const inputs = this.taxContainer.querySelectorAll('input.sup-input[data-scope="tax"]');
    const tax = this.taxRows[0];
    inputs.forEach(inp => {
      const field = inp.getAttribute('data-field');
      let v = inp.value;
      if (field === 'ValueAddedTax') v = v === '' ? null : Number(v);
  // keep date string as-is for TaxInvoiceDateOffset from input type=date
      tax[field] = v;
    });
  }

  _renderTaxReadonly() {
    const table = this._getBodyTable(this.taxContainer);
    if (!table || !this.taxRows || this.taxRows.length === 0) return;
    const tr = table.querySelector('tbody tr'); if (!tr) return;
    const tax = this.taxRows[0];
    // Sync kembali tampilan
    const set = [
      { idx: 0, value: tax.TaxInvoiceNumber },
      // { idx: 1, value: this.formatDate(tax.TaxInvoiceDate) },
      { idx: 1, value: this.formatDate(tax.TaxInvoiceDateOffset) },
      { idx: 2, value: this.formatNumber(tax.ValueAddedTax) }
    ];
    set.forEach(s => { const td = tr.cells[s.idx]; if (td) td.textContent = s.value == null ? '' : String(s.value); });
  }
  isShowing =false;
  toggle() {
        if (!this.isShowing)
            this.isShowing = true;
        else
            this.isShowing = !this.isShowing;
    }

  isShowing1 =false;
  toggle1() {
        if (!this.isShowing1)
            this.isShowing1 = true;
        else
            this.isShowing1 = !this.isShowing1;
    }
}

export default ScanResultSuport;
