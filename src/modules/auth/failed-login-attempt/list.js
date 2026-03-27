import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
import numeral from 'numeral';

@inject(Router, Service)
export class List {

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.today = new Date();
    }
   
    info = { page: 1, size: 99999 };
    
    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 4
        }
    };


    activate() {
       
    }

    
    search(){
        this.error = {};

        if (!this.dateFrom) {
            this.error.dateFrom = "Tanggal awal wajib diisi";
        }
        if (!this.dateTo) {
            this.error.dateTo = "Tanggal akhir wajib diisi";
        }
        if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
            this.error.dateTo = "Tanggal akhir harus lebih besar atau sama dengan tanggal awal";
        }
        if (Object.keys(this.error).length > 0) return;
        this.info.page = 1;
        this.info.total=0;
        this.searching();        
}

   
    searching() {
    var info = {
        page: this.info.page,
        size: this.info.size,
        dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
        dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
    };

    this.service.search(info).then(result => {
        // API returns payload in result.data.Data and paging info in result.info.total
        this.data = (result.data && result.data.Data) ? result.data.Data : [];
        this.info.total = (result.info && result.info.total) ? result.info.total : 0;
    });
}


   formatDate(value) {
    if (!value) return "-";

    let m = moment(value);

    if (!m.isValid() || m.year() === 1) return "-";

    return m.format("DD MMMM YYYY HH:mm:ss");
}

    formatAmount(value) {
        if (!value) return "-";
        return numeral(value).format('(0,0)');
    }


          
    ExportToExcel() {
        this.error = {};

        if (!this.dateFrom) {
            this.error.dateFrom = "Tanggal awal wajib diisi";
        }
        if (!this.dateTo) {
            this.error.dateTo = "Tanggal akhir wajib diisi";
        }
        if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
            this.error.dateTo = "Tanggal akhir harus lebih besar atau sama dengan tanggal awal";
        }
        if (Object.keys(this.error).length > 0) return;
        var info = {
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
        }
        
        this.service.generateExcel(info);
    }

    reset() {
        this.dateFrom = null;
        this.dateTo = null;
        this.data = [];
        this.error = {};
    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.searching();
    }

    dateFromChanged(e) {
        var _startDate = new Date(e.srcElement.value);
        var _endDate = new Date(this.dateTo);

        if (_startDate > _endDate)
            this.dateTo = e.srcElement.value;
    } 
}
