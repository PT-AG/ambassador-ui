import { bindable } from 'aurelia-framework';

export class ScanResultItem {
  @bindable items;

  bind() {
    this.items = Array.isArray(this.items) ? this.items : [];
    this._buildTable();
  }

  itemsChanged() {
    this.items = Array.isArray(this.items) ? this.items : [];
    this._buildTable();
  }

  _buildTable() {
    const self = this;
    this.tableOptions = {
      pagination: false,
      search: false,
      showColumns: false,
      showToggle: false,
      pageSize: 50,
      locale: 'id-ID'
    };
    this.columns = [
      { field: 'ProductCode', title: 'Kode Barang' },
      { field: 'ProductName', title: 'Nama Barang' },
      { field: 'Quantity', title: 'Quantity', align: 'right', formatter: (v) => self.formatNumber(v) },
      { field: 'PricePerUnit', title: 'Harga Per Item', align: 'right', formatter: (v) => self.formatNumber(v) },
      { field: 'TotalPrice', title: 'Total', align: 'right', formatter: (v) => self.formatNumber(v) }
    ];
  }

  formatNumber(v) {
    const n = Number(v);
    if (isNaN(n)) return v == null ? '' : v;
    return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
}

export default ScanResultItem;
