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

const connector: IConnector = {
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
                breadcrumbs: [], product: {
                    id: product.id as string,
                    url: '/p/' + product.id,
                    name: product.title,
                    price: parseInt(product.selectedVariant.price),
                    media: {
                        full: [

                        ],
                        thumbnails: [

                        ]
                    },
                    description: product.description,
                    thumbnail: {
                        src: product.images[0].src,
                        alt: product.title,
                        type: "image"
                    }

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
        const result: SearchSuggestions = {
            text: '',
            groups: []
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

        const result: Result<SearchResult> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: { total: 0, page: 0, totalPages: 0, sort: '', sortOptions: [], products: [], cmsSlots: {} }
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
    routes: []
}
export default connector