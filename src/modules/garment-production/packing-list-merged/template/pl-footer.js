import numeral from 'numeral';

export class DetailFooter {
    controlOptions = {
        label: {
            length: 12,
            align: "right"
        },
        control: {
            length: 0
        }
    }

    activate(context) {
        this.context = context;
        this.sizes = context.options.sizes;
    }

    get totalQuantity() {
        let totals = {};

        // Inisialisasi semua size → 0
        for (let sz of this.sizes) {
            totals[sz] = 0;
        }

        // Loop semua row dalam AU-Collection
        for (let row of this.context.items) {
            let data = row.data;

            // Jika row data punya field sizes (list of { size, sizeId, quantity }) atau flat key
            for (let sz of this.sizes) {
                let szQty = 0;
                if (Array.isArray(data.sizes)) {
                    let found = data.sizes.find(s => (s.size || s.Size || '').toUpperCase() === sz.toUpperCase());
                    szQty = found ? Number(found.quantity || found.Quantity || 0) : 0;
                } else if (data[sz] != null) {
                    szQty = Number(data[sz]) || 0;
                }
                totals[sz] += szQty * Number(data.cartons || 0);
            }
        }

        return totals;
    }

    get totalQuantityCTN() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.quantity(cur.data), 0);
        return totalQuantity;
    }
    
    quantity = (data) => {
        return parseFloat((data.cartons).toFixed(2));
    }

    get grandTotal() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.qty(cur.data), 0);
        return totalQuantity;
    }
    
    qty = (data) => {
        return parseFloat((data.qtyCtn).toFixed(2));
    }

    get totalGW() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.gw(cur.data), 0);
        return totalQuantity;
    }
    
    gw = (data) => {
        return parseFloat(((data.grossWeight != null ? data.grossWeight : data.gw) || 0).toFixed(2));
    }

    get totalNW() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.nw(cur.data), 0);
        return totalQuantity;
    }
    
    nw = (data) => {
        return parseFloat(((data.netWeight != null ? data.netWeight : data.nw) || 0).toFixed(2));
    }

    get totalNNW() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.nnw(cur.data), 0);
        return totalQuantity;
    }
    
    nnw = (data) => {
        return parseFloat(((data.netNetWeight != null ? data.netNetWeight : data.nnw) || 0).toFixed(2));
    }

    get error() {
        return this.context.options.error ? this.context.options.error.TotalQtySize : null;
    }

    get totalCBM() {
        let totals = 0;

        for (let row of this.context.items) {
            let data = row.data;
            totals += (Number(data.length) * Number(data.width)* Number(data.height) * this.quantity(data)) / 1000000;
        }

        return (totals).toLocaleString('en-EN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }
}