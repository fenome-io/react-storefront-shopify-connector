
export default (min: string, max: string, currency: string, variant?: any) => {
    if (variant) {
        return `${variant.priceV2.amount} ${variant.priceV2.currencyCode}`
    }
    return min == max ? `${min} ${currency}` : `${min} - ${max} ${currency}`
}