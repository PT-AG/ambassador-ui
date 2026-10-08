export function createSavePayload(data) {
    if (data == null || !Array.isArray(data.items)) {
        return data;
    }

    return {
        ...data,
        items: data.items.map(item => {
            if (item == null || !Array.isArray(item.detailRows)) {
                return item;
            }

            const sizeIndexes = new Map();

            (item.sizes || []).forEach((size, index) => {
                if (size != null) {
                    sizeIndexes.set(String(size).trim().toUpperCase(), index + 1);
                }
            });

            return {
                ...item,
                detailRows: item.detailRows.map(row => {
                    if (row == null || !Array.isArray(row.sizes)) {
                        return row;
                    }

                    return {
                        ...row,
                        sizes: row.sizes
                            .filter(size => {
                                if (size == null) {
                                    return false;
                                }

                                const quantity = size.quantity != null
                                    ? size.quantity
                                    : size.Quantity;

                                return Number(quantity) !== 0;
                            })
                            .map(size => {
                                const sizeName = String(size.size || '')
                                    .trim()
                                    .toUpperCase();

                                return {
                                    ...size,
                                    sizeIdx: sizeIndexes.get(sizeName) || 0
                                };
                            })
                    };
                })
            };
        })
    };
}

export function validateDetailRowsQuantity(item) {
    const totalQuantity = (item.detailRows || []).reduce((total, row) => {
        const sizes = row.sizes || row.Sizes || [];
        const quantityPerCarton = sizes.reduce(
            (sizeTotal, size) => sizeTotal + (Number(size.quantity != null ? size.quantity : size.Quantity) || 0),
            0
        );

        const cartons = row.cartons != null ? row.cartons : row.Cartons;
        return total + quantityPerCarton * (Number(cartons) || 0);
    }, 0);
    const roQuantity = Number(item.quantity != null ? item.quantity : item.Quantity) || 0;

    item.detailRowsQuantityError = totalQuantity > roQuantity
        ? `Total PCS detail (${totalQuantity}) tidak boleh melebihi quantity RO (${roQuantity}).`
        : null;

    return !item.detailRowsQuantityError;
}