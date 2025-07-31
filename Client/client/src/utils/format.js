const formatPrice = (val) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
export default formatPrice;