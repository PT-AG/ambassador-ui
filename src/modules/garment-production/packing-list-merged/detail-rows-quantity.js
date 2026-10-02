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