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
        console.log(this.context)
        this.sizes = context.options.sizes;
        console.log(this.context.items)
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

            // Jika row data punya field size (XS, S, M, L...)
            for (let sz of this.sizes) {
                if (data[sz] != null) {
                    totals[sz] += Number(data[sz])* Number(data.cartons) || 0;
                }
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
        return parseFloat((data.gw).toFixed(2));
    }
    get totalNW() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.nw(cur.data), 0);
        return totalQuantity;
    }
    
    nw = (data) => {
        return parseFloat((data.nw).toFixed(2));
    }
    get totalNNW() {
        const totalQuantity = this.context.items.reduce((acc, cur) => 
        acc += this.nnw(cur.data), 0);
        return totalQuantity;
    }
    
    nnw = (data) => {
        return parseFloat((data.nnw).toFixed(2));
    }

    get error() {
        return this.context.options.error ? this.context.options.error.TotalQtySize : null;
    }
}