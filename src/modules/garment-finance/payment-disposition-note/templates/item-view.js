export class ItemView {

    constructor() {
        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'Satuan', 'Harga Total'];
    }

    activate(context) {
        this.data = context.data;
        let totalPaid = Number(this.data.TotalPaid) || 0;
        let totalPaidPayment = Number(this.data.TotalPaidPayment) || 0;
        let totalPaidPaymentBefore = Number(this.data.TotalPaidPaymentBefore) || 0;
        this.data.TotalPaidPaymentAccumulated = parseFloat((totalPaidPaymentBefore + totalPaidPayment).toFixed(4));
        this.data.DiffTotalPaidPayment = parseFloat((totalPaid - this.data.TotalPaidPaymentAccumulated).toFixed(4));
    }
}