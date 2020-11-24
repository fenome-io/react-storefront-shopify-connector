import client from "./Client"
import { IConnector } from "./IConnector"
import HomePageData from './HomePageData'
import Result from './Result'
import SubcategoryParams from './SubcategoryParams'
import SubcategoryPageData from './SubcategoryPageData'
import ProductParams from './ProductParams'
import ProductPageData, { Product } from './ProductPageData'
import SearchSuggestions from './SearchSuggestions'
import Session from './Session'
import SearchParams from './SearchParams'
import SearchResult from './SearchResult'
import CmsSlots from './CmsSlots'
import ProductSlotsParams from './ProductSlotsParams'
import Route from './Route'
import CartResponse from './CartResponse'
import CartItem from './CartItem'
import SignUpData from './SignUpData'
import ProductSummary from "./ProductSummary"

export const connector: IConnector = {
    home: async (request: Request, response: Response) => {
        const data = await client.shop.fetchInfo()
        const result: Result<HomePageData> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: { title: data.name, slots: { heading: data.name } }
        }
        return result
    },
    subcategory: async (
        params: SubcategoryParams,
        request: Request,
        response: Response
    ) => {
        const result: Result<SubcategoryPageData> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: { title: '', name: '', id: '', total: 0, page: 0, totalPages: 0, sort: '', sortOptions: [], products: [], cmsSlots: {} }
        }
        return result
    },
    product: async (
        params: ProductParams,
        request: Request,
        response: Response
    ) => {
        const product = await client.product.fetch(params.id)
        const result: Result<ProductPageData> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: {
                breadcrumbs: [],
                product: {
                    id: product.id as string,
                    url: '/p/' + product.id,
                    name: product.title,
                    price: parseInt(product.variants[0].price),
                    media: {
                        thumbnails: product.images?.map(image => ({
                            src: image.src,
                            alt: product.title + image.id,
                            type: "image"
                        })),
                        full: product.images?.map(image => ({
                            src: image.src,
                            alt: product.title + image.id,
                            type: "image"
                        }))

                    },
                    description: product.description,
                    thumbnail: {
                        src: product.images?.[0]?.src,
                        alt: product.title,
                        type: "image"
                    },
                    sku: (product.variants?.[0] as any)?.sku,
                    sizes: product.options.find(option => option.name == 'Size')
                        ?.values.map(value => ({ id: value.value, text: value.value })),
                    colors: product.options.find(option => option.name == 'Color')
                        ?.values.map(value => ({ id: value.value, text: value.value })),

                }
            }
        }
        return result
    },
    productSlots: (params: ProductSlotsParams, request: Request, res: Response) => {
        const result: CmsSlots = {}
        return result
    },
    productSuggestions: async (id: string, request: Request, response: Response) => {
        const result: Product[] = []
        return result
    },
    searchSuggestions: async (
        query: string,
        request: Request,
        response: Response
    ) => {
        const data = await client.product.fetchQuery({
            query: query,
            sortBy: 'updated_at',
            first: 5
        })
        const links = data.map((product) => ({
            href: '/p/' + product.id,
            text: product.title,
            as: '/p/' + product.id,
            thumbnail: {
                src: product.images?.[0]?.src,
                alt: product.title,
                type: "image" as 'image'
            }

        }))
        const collectionData = await client.collection.fetchQuery({
            query: query,
            sortBy: 'updated_at',
            first: 5
        })
        console.log(collectionData[0])
        const collectionLinks = collectionData.map((collection) => ({
            href: '/s/' + collection.id,
            text: collection.title,
            as: '/s/' + collection.id,
            thumbnail: {
                src: collection.image?.src,
                alt: collection.title,
                type: "image" as 'image'
            }

        }))
        const result: SearchSuggestions = {
            text: query,
            groups: [
                {
                    ui: "thumbnails",
                    caption: 'Products',
                    links: links
                },
                {
                    ui: "thumbnails",
                    caption: 'Collections',
                    links: collectionLinks
                }
            ]
        }
        return result
    },
    session: async (request: Request, response: Response) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    cart: async (request: Request, response: Response) => {

        const result: Result<CartResponse> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: {}
        }
        return result
    },
    addToCart: async (
        product: Product,
        quantity: number,
        request: Request,
        response: Response
    ) => {
        const result: CartResponse = {
            cart: { items: [] }
        }
        return result
    },
    updateCartItem: async (
        item: CartItem,
        quantity: number,
        request: Request,
        response: Response
    ) => {
        const result: CartResponse = {
            cart: { items: [] }
        }
        return result
    },
    removeCartItem: async (item: CartItem, request: Request, response: Response) => {
        const result: CartResponse = {
            cart: { items: [] }
        }
        return result
    },
    search: async (
        params: SearchParams,
        request: Request,
        response: Response
    ) => {
        const data = await client.product.fetchQuery({
            query: params.q ?? '',
            sortBy: 'updated_at',

        })
        const products = data.map((product) => ({
            id: product.id as string,
            url: '/p/' + product.id,
            name: product.title,
            price: parseInt(product.variants[0].price),
            thumbnail: {
                src: product.images?.[0]?.src,
                alt: product.title,
                type: "image" as 'image'
            }

        }))
        const result: Result<SearchResult> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: { total: 0, page: 0, totalPages: 0, sort: '', sortOptions: [], products, cmsSlots: {} }
        }
        return result
    },
    signIn: async (
        email: string,
        password: string,
        request: Request,
        response: Response
    ) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    signOut: async (request: Request, response: Response) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    signUp: async (data: SignUpData, request: Request, response: Response) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    routes: [] as Route[]
}
export default connector 