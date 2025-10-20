import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
var moment = require('moment');

@inject(Router, Service)
export class List{

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.today = new Date();
    }

    info = { page: 1,size:50};

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 4
        }
    };

    @bindable UnitItem;
    UnitItems = ['','KONFEKSI AG1','KONFEKSI AG2']

    search(){
            this.info.page = 1;
            this.info.total=0;
            this.searching();        
    }
    activate() {
       
    }

    tableData = []
    searching() {
        var args = {
            // page: this.info.page,
            // size: this.info.size,
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
            unitcode : this.unit ? this.unit : "",
        };
        this.service.search(args)
            .then(result=>{
                var datas=[];
                var datadetail=[];
                var index=0;

                for(var _data of result.data){
                    
                    var ro =_data.RO;

                    for(var _data1 of _data.rincian){
                        datadetail.push(_data1);
                    }

                    datas.push(_data);

                }
                this.data=datas;
            
                this.data2=datadetail
                console.log("data1",this.data);
                console.log("data2",this.data2);


            })


    }

    UnitItemChanged(newvalue){
        if (newvalue) {
            if (newvalue === "KONFEKSI AG1") {
                this.unit = "KONFEKSI AG1";
                this.unitname = "AG1";
            }
            else if (newvalue === "KONFEKSI AG2") { 
                this.unit = "KONFEKSI AG2";
                this.unitname = "AG2";
            }
            // else if (newvalue === "KONFEKSI 2C") {
            //     this.unit = "C2C"; 
            //     this.unitname = "KONFEKSI 2C";
            // }else if(newvalue === "KONFEKSI 1A"){
            //     this.unit = "AG1";
            //     this.unitname = "KONFEKSI 1A";
            // }else if(newvalue === "KONFEKSI 1B"){
            //     this.unit = "AG2";
            //     this.unitname = "KONFEKSI 1B";
            // }
            else{
                this.unit = "";
                this.unitname = "";
            }
        }else{
            this.unit = "";
            this.unitname = "";
        }
    }

    async ExportToExcel() {
         this.errorMessage = null; // reset error
         this.successMessage = null; // reset success
            let args = {            
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
            unitcode : this.unit ? this.unit : "",
            unitname : this.unitname ? this.unitname : "",
            };

            await this.service.generateExcel(args)
        .then(result => {
            console.log(result);
            this.successMessage = "File Excel berhasil dibuat!"
        })
        .catch(error => {
            if (error && error.message) {
                this.errorMessage = error.message;
            } else if (error && error.response && error.response.data) {
                // kalau pakai axios misalnya
                this.errorMessage = error.response.data.message || "Terjadi kesalahan pada server.";
            } else {
                this.errorMessage = "Gagal membuat file Excel.";
            }
        });
    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.searching();
    }

    reset() {
        this.dateFrom = null;
        this.dateTo = null;
        this.UnitItem = '';
        this.data=[];
        this.data2=[];
        this.errorMessage = null;
        this.info.page = 1;
        this.info.total=0;

        //reload network devtools
        location.reload();
    }

}