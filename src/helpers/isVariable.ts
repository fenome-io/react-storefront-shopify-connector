import { Product } from "../ProductPageData"

export default ({ options }: Product) => {
    return !(options?.length == 1 && options[0].name == 'Title')
}