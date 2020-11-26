
export default (min: string, max: string, currency: string) => {
    return min == max ? `${min} ${currency}` : `${min} - ${max} ${currency}`
}