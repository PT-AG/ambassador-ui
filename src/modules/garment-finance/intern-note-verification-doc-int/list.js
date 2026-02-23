import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
var moment = require("moment");

@inject(Router, Service)
export class List {
  navigateToMainPage() {
    this.router.navigateToRoute('compare');
  }
  
  constructor(router, service) {
    this.router = router;
    this.service = service;
    
    // Bind viewModel reference untuk button onclick
    window.viewModel = this;
  }
  
  // context = ["Rincian"];
  // contextClickCallback(event) {
  //       var arg = event.detail;
  //       var data = arg.data;
  //       switch (arg.name) {
  //           case "Rincian":
  //               this.router.navigateToRoute('view', { id: data.Id });
  //               break;
  //       }
  //   }

    
  contextShowCallback(index, name, data) {
      return name === "Lihat Detail";
  }
  // Lifecycle method untuk memastikan tabel ter-render dengan benar
  attached() {
    // Pastikan event handler lama dihapus agar tidak duplikat
    this.detached();
    // Refresh tabel setelah DOM ready
    if (this.table) {
      setTimeout(() => {
        this.table.refresh();
      }, 100);
    }

    // Event handler untuk tombol detail (expand/collapse manual)
    $(document).on('click', '[data-toggle="detail"]', (e) => {
      e.preventDefault();
      var $btn = $(e.currentTarget);
      var $tr = $btn.closest('tr');
      var index = $btn.data('index');
      // Cek apakah sudah ada detail row
      if ($tr.next().hasClass('detail-row')) {
        $tr.next().remove();
        $btn.find('i').removeClass('fa-eye-slash').addClass('fa-eye');
      } else {
        // Tutup detail lain jika ingin single expand
        $tr.siblings('.detail-row').remove();
        $tr.siblings().find('td .fa-eye-slash').removeClass('fa-eye-slash').addClass('fa-eye');
        // Ambil data row dari loadedData
        var rowData = this.loadedData ? this.loadedData[index] : null;
        var detailHtml = this.detailFormatter(index, rowData);
        $tr.after(`<tr class="detail-row"><td colspan="${$tr.children().length}">${detailHtml}</td></tr>`);
        $btn.find('i').removeClass('fa-eye').addClass('fa-eye-slash');
      }
    });

    // Event handler untuk tombol hapus
    $(document).on('click', '[data-toggle="delete"]', (e) => {
      e.preventDefault();
      var $btn = $(e.currentTarget);
      var index = $btn.data('index');
      var rowData = this.loadedData ? this.loadedData[index] : null;
      if (rowData && rowData.Id) {
        this.deleteRowById(rowData.Id, index);
      } else {
        alert('Id data tidak ditemukan!');
      }
    });
  }

  // Lifecycle method untuk cleanup
  detached() {
    // Remove event handler
    $(document).off('click', '[data-toggle="detail"]');
    $(document).off('click', '[data-toggle="delete"]');
  }

  // Loader data dari service
  loader = (info) => {
    var order = {};
    if (info.sort)
      order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      order: order
    };

    return this.service.search(arg)
      .then(result => {
        // Mapping data untuk menampilkan kolom yang sesuai
        var data = {};
        data.total = result.info.total;
        data.data = result.data;
        // Simpan data hasil load ke property agar bisa diakses event handler
        this.loadedData = data.data;
        data.data.forEach(item => {
          // Pastikan field yang diperlukan ada
          item.invoiceNo = item.invoiceNo || item.INNo || 'N/A';
          item.supplierName = item.supplierName || 'N/A';
          item.remark= item.dpp == item.dppScan ? "" : "DPP tidak sesuai, "
          item.remark+= item.ppn == item.ppnScan ? "" : "PPN tidak sesuai"
        });
        return {
          total: data.total,
          data: data.data
        };
      });
  }

  // Konfigurasi options untuk table
  tableOptions = {
    pagination: true,
    showColumns: true,
    search: true,
    showToggle: true,
    striped: true,
    sortable: true,
    searchOnEnterKey: true,
    showRefresh: true,
    smartDisplay: true,
    // Nonaktifkan detailView bawaan agar tombol custom yang berfungsi
    // detailView: true,
    // detailViewIcon: true,
    // detailViewAlign: 'right',
    // iconsPrefix: 'fa',
    // icons: {
    //   detailOpen: 'fa-eye',
    //   detailClose: 'fa-eye-slash'
    // },
    // detailFormatter: this.detailFormatter.bind(this)
  };

  // Konfigurasi kolom tabel
  columns = [
    { field: 'index', title: 'No', formatter: (value, row, index) => index + 1, width: 80, align: 'center', sortable: false },
    { field: 'invoiceNo', title: 'Invoice', width: 200, align: 'left', sortable: true },
    { field: 'supplierName', title: 'Nama Supplier', width: 250, align: 'left', sortable: true },
    { field: 'remark', title: 'Keterangan', width: 250, align: 'left', sortable: true },
    { 
      field: 'actions', 
      title: 'Aksi', 
      width: 100, 
      align: 'center',
      sortable: false,
      formatter: (value, row, index) => {
        return `
          <button class="btn btn-sm btn-success" data-toggle="detail" data-index="${index}" title="Lihat Detail">
            <i class="fa fa-eye"></i>
          </button>
          <span style="margin-left:3px;"></span>
          <button class="btn btn-sm btn-danger" data-toggle="delete" data-index="${index}" title="Hapus">
            <i class="fa fa-trash"></i>
          </button>
        `;
      }
    }
  ];

  // Function untuk format detail view (child table)
  detailFormatter(index, row) {
    var items = row.items || [];
    
    if (items.length === 0) {
      return '<div class="alert alert-info">Tidak ada item</div>';
    }

    var html = `
      <div class="table-responsive">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th width="50">No</th>
              <th width="200">No SJ</th>
              <th width="100">Qty</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
    `;

    items.forEach((item, idx) => {
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.internalNoteDONo || 'N/A'}</td>
          <td>${item.internNoteQuantity || 0}</td>
          <td>${item.remarkDescription || 'N/A'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    return html;
  }

  // Function untuk create (tidak digunakan untuk saat ini)
  // Function untuk menghapus row berdasarkan id
  deleteRowById(id, index) {
    if (!id) {
      alert('Id tidak valid!');
      return;
    }
    if (confirm('Yakin ingin menghapus data ini?')) {
      this.service.delete(id)
        .then(() => {
          alert('Data berhasil dihapus.');
          if (this.table) {
            this.table.refresh();
          }
        })
        .catch(err => {
          alert('Gagal menghapus data: ' + (err && err.message ? err.message : err));
        });
    }
  }
  create() {
    console.log('Create clicked');
  }
}
