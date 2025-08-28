export class NumberThousandSeparatorValueConverter {
    toView(value) {
      if (value == null) return '';
      return new Intl.NumberFormat('id-ID').format(value);
    }
    fromView(value) {
      if (!value) return null;
      return parseFloat(value.replace(/\./g, ''));
    }
  }