export function reindexSizes(data) {
    if (data == null || !Array.isArray(data.items)) {
        return;
    }

    for (const item of data.items) {
        if (item == null ||
            !Array.isArray(item.sizes) ||
            !Array.isArray(item.detailRows)) {
            continue;
        }

        const sizeIndexes = new Map();

        item.sizes.forEach((size, index) => {
            if (size == null) {
                return;
            }

            const sizeName = String(size).trim().toUpperCase();
            sizeIndexes.set(sizeName, index + 1);
        });

        for (const row of item.detailRows) {
            if (row == null || !Array.isArray(row.sizes)) {
                continue;
            }

            for (const size of row.sizes) {
                if (size == null) {
                    continue;
                }

                const sizeName = String(size.size || '')
                    .trim()
                    .toUpperCase();

                size.sizeIdx = sizeIndexes.get(sizeName) || 0;
            }
        }
    }
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