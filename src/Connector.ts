import Client, { client } from "./Client"
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
import MenuItem from "./MenuItem"
import { COLLECTION_BY_SLUG } from "./graphql/collectionBySlug"
import getPrice from "./helpers/getPrice"
import { PRODUCT_BY_SLUG, PRODUCT_BY_SLUG_WITH_OPTIONS } from "./graphql/productBySlug"

export const connector: IConnector = {
    home: async (request: Request, response: Response) => {
        const data = await client.shop.fetchInfo()
        const collections = await client.collection.fetchAll()
        const items: Array<MenuItem> = collections.map(c => ({
            text: c.title,
            href: `/s/[subcategoryId]`,
            as: `/s/${c.handle}`
        }))
        const result: Result<HomePageData> = {
            appData: { menu: { items }, tabs: items },
            pageData: { title: data.name, slots: { heading: data.name } }
        }
        return result
    },
    subcategory: async (
        params: SubcategoryParams,
        request: Request,
        response: Response
    ) => {
        const collection = (await Client.query({
            query: COLLECTION_BY_SLUG,
            variables: {
                handle: params.slug?.[0]
            }
        }))?.data?.collectionByHandle
        const products = collection.products?.edges.map((edge: { node: ShopifyBuy.Product }) => {
            const product = edge.node
            return {
                id: (product as any).handle,
                url: '/p/' + (product as any).handle,
                name: product.title,
                price: getPrice((product as any).priceRange.minVariantPrice.amount,
                    (product as any).priceRange.maxVariantPrice.amount,
                    (product as any).priceRange.minVariantPrice.currencyCode),
                thumbnail: {
                    src: (product as any).images?.edges?.[0]?.node.transformedSrc,
                    alt: (product as any).images?.edges?.[0]?.node.altText,
                    type: "image"
                },
                sku: (product.variants?.edges?.[0].node as any)?.sku,
                colors: product.options.find(option => option.name == 'Color')
                    ?.values.map(value => ({ id: value.value, text: value.value })),

            }
        })
        const result: Result<SubcategoryPageData> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: { title: collection.title, name: collection.title, id: collection.id, total: products.length, page: 0, totalPages: 0, sort: '', sortOptions: [], products, cmsSlots: {} }
        }
        return result
    },
    product: async (
        params: ProductParams,
        request: Request,
        response: Response
    ) => {
        const product = (await Client.query({
            query: (params.size || params.color) ? PRODUCT_BY_SLUG_WITH_OPTIONS : PRODUCT_BY_SLUG,
            variables: {
                handle: params.id,
                selectedOptions: params.size && [{ name: "Size", value: params.size }]
            }
        }))?.data?.productByHandle
        const result: Result<ProductPageData> = {
            appData: { menu: { items: [] }, tabs: [] },
            pageData: {
                breadcrumbs: [],
                product: {
                    id: (product as any).handle,
                    url: '/p/' + (product as any).handle,
                    name: product.title,
                    priceText: getPrice((product as any).priceRange.minVariantPrice.amount,
                        (product as any).priceRange.maxVariantPrice.amount,
                        (product as any).priceRange.minVariantPrice.currencyCode, product.variantBySelectedOptions),
                    basePriceText: product?.variantBySelectedOptions?.compareAtPriceV2?.amount && `${product?.variantBySelectedOptions?.compareAtPriceV2?.amount} ${product?.variantBySelectedOptions?.compareAtPriceV2?.currencyCode}`,
                    thumbnail: {
                        src: (product as any).images?.edges?.[0]?.node.transformedSrc,
                        alt: (product as any).images?.edges?.[0]?.node.altText,
                        type: "image"
                    },
                    sku: (product.variants?.edges?.[0].node as any)?.sku,
                    colors: product.options.find(option => option.name == 'Color')
                        ?.values.map(value => ({ id: value.value, text: value.value })),
                    sizes: product.options.find(option => option.name == 'Size')
                        ?.values.map(value => ({ id: value, text: value })),
                    media: {
                        thumbnails: product?.variantBySelectedOptions?.image ? [
                            {
                                src: product?.variantBySelectedOptions?.image?.transformedSrc,
                                alt: product?.variantBySelectedOptions?.image?.altText,
                                type: "image"
                            }
                        ] : product.images?.edges?.map(edge => ({
                            src: edge.node.transformedSrc,
                            alt: edge.node.altText,
                            type: "image"
                        })),
                        full: product?.variantBySelectedOptions?.image ? [
                            {
                                src: product?.variantBySelectedOptions?.image?.originalSrc,
                                alt: product?.variantBySelectedOptions?.image?.altText,
                                type: "image"
                            }
                        ] : product.images?.edges?.map(edge => ({
                            src: edge.node.originalSrc,
                            alt: edge.node.altText,
                            type: "image"
                        }))

                    },
                    description: product.description,
                    quantityAvailable: product?.variantBySelectedOptions?.quantityAvailable ?? product.variants?.edges?.[0].node.quantityAvailable ?? 0
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
            sortBy: 'RELEVANCE',
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
            sortBy: 'RELEVANCE',
            first: 5
        })
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