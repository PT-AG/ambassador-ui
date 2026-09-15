import { inject, bindable, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';

@inject(Router, Service)
export class Create {
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.data = {};
        this.error = {};
        this.create = true;
    }

    list() {
        this.router.navigateToRoute('list');
    }

    cancelCallback(event) {
        this.list();
    }

    saveCallback() {
        this.data.CostCalculationGarment_Materials.forEach(
            (m, i) => (m.MaterialIndex = i)
        );

        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.list();
            })
            .catch(e => {
                this.errorUpload = [];
                if (e && Array.isArray(e.CostCalculationGarment_Materials)) {
                    e.CostCalculationGarment_Materials.forEach((materialError, index) => {
                        const item = this.data.CostCalculationGarment_Materials[index];
                        const kodeBarang = item.Product ? item.Product.Code : "Unknown";

                        let rowError = {};

                        if (materialError.Category) {
                            rowError.Category = `Kategori dengan Kode Barang ${kodeBarang} tidak ditemukan`;
                        }

                        Object.keys(materialError || {})
                            .filter(key => key !== "Category")
                            .forEach(key => {
                                rowError[key] = materialError[key];
                            });

                        this.errorUpload[index] = rowError;
                    });
                }

                // --- Pesan Error Lain ---
                if (e && e.message && e.message.includes("CategoryComodity")) {
                    const parts = e.message.split(":");
                    alert((parts[1] || e.message).trim());
                } else if (e.statusCode === 500) {
                    alert("Gagal menyimpan, silakan coba lagi!");
                } else {
                    this.error = e;
                }
            })
    }
}
