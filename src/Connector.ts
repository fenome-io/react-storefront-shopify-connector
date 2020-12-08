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
import isVariable from "./helpers/isVariable"
import { CREATE_CHECKOUT } from "./graphql/createCheckout"
import { GET_CHECKOUT_BY_ID } from "./graphql/getCheckoutById"
import { UPDATE_CHECKOUT_LINES } from "./graphql/updateCheckoutItems"
import { REMOVE_CHECKOUT_LINES } from "./graphql/removeCheckoutItems"
import { ADD_CHECKOUT_LINES } from "./graphql/addCheckoutItems"
import cookie, { serialize } from 'cookie';
import { PRODUCTS_BY_QUERY } from "./graphql/productsByQuery"
import { PRODUCT_RECOMMENDATIONS_BY_ID } from "./graphql/productRecommendations"


export const connector: IConnector = {
    home: async (request: any, response: any) => {
        const data = await client.shop.fetchInfo()
        const collections = await client.collection.fetchAll()
        const items: Array<MenuItem> = collections.map(c => ({
            text: c.title,
            href: `/s/[subcategoryId]`,
            as: `/s/${c.handle}`
        }))
        const result: Result<HomePageData> = {
            appData: { menu: { items: [] }, tabs: items },
            pageData: { title: data?.name, slots: { heading: data?.name } }
        }
        return result
    },
    subcategory: async (
        params: SubcategoryParams,
        request: any,
        response: any
    ) => {
        const collection = (await Client.query({
            query: COLLECTION_BY_SLUG,
            variables: {
                handle: params.slug?.[0],
                first: 2,
                after: params.afterCursor
            }
        }))?.data?.collectionByHandle
        const collections = await client.collection.fetchAll()
        const items: Array<MenuItem> = collections.map(c => ({
            text: c.title,
            href: `/s/[subcategoryId]`,
            as: `/s/${c.handle}`
        }))
        const afterCursor: string = collection?.products.pageInfo.hasNextPage ? collection?.products?.edges?.slice(-1)[0].cursor : undefined
        const products = collection?.products?.edges.map((edge: any) => {
            const product = edge.node
            return {
                id: (product as any)?.handle,
                url: '/p/' + (product as any).handle,
                name: product?.title,
                price: getPrice((product as any)?.priceRange.minVariantPrice.amount,
                    (product as any)?.priceRange.maxVariantPrice.amount,
                    (product as any)?.priceRange.minVariantPrice.currencyCode),
                thumbnail: {
                    src: (product as any)?.images?.edges?.[0]?.node.transformedSrc,
                    alt: (product as any)?.images?.edges?.[0]?.node.altText,
                    type: "image"
                },
                sku: (product?.variants?.edges?.[0].node as any)?.sku,
                colors: product?.options.find((option: { name: string }) => option.name == 'Color')
                    ?.values.map((value: any) => ({ id: value, text: value })),

            }
        })
        const result: Result<SubcategoryPageData> = {
            appData: { menu: { items: [] }, tabs: items },
            pageData: {
                title: collection?.title, name: collection?.title, id: collection?.id, total: products?.length + 1, page: 1, totalPages: 4, afterCursor: afterCursor, sort: '', sortOptions: [], products, cmsSlots: {},
            }
        }
        return result
    },
    product: async (
        params: ProductParams,
        request: any,
        response: any
    ) => {
        const selectedOptions = []
        params.size && selectedOptions.push({ name: "Size", value: params.size })
        params.color && selectedOptions.push({ name: "Color", value: params.color })
        const product = (await Client.query({
            query: (params.size || params.color) ? PRODUCT_BY_SLUG_WITH_OPTIONS : PRODUCT_BY_SLUG,
            variables: {
                handle: params.id,
                selectedOptions
            }
        }))?.data?.productByHandle
        const collections = await client.collection.fetchAll()
        const items: Array<MenuItem> = collections.map(c => ({
            text: c.title,
            href: `/s/[subcategoryId]`,
            as: `/s/${c.handle}`
        }))
        const result: Result<ProductPageData> = {
            appData: { menu: { items: [] }, tabs: items },
            pageData: {
                breadcrumbs: [],
                product: {
                    id: (product as any)?.handle,//must be refactored to slug or handle
                    productId: (product as any).id,
                    url: '/p/' + (product as any)?.handle,
                    name: product.title,
                    price: isVariable(product) ? product?.variantBySelectedOptions?.priceV2?.amount : product.variants?.edges?.[0].node.priceV2?.amount,
                    currencyCode: isVariable(product) ? product?.variantBySelectedOptions?.priceV2?.currencyCode : product.variants?.edges?.[0].node.priceV2?.currencyCode,
                    priceText: getPrice((product as any).priceRange.minVariantPrice.amount,
                        (product as any).priceRange.maxVariantPrice.amount,
                        (product as any).priceRange.minVariantPrice.currencyCode, product.variantBySelectedOptions),
                    basePriceText: product?.variantBySelectedOptions?.compareAtPriceV2?.amount && `${product?.variantBySelectedOptions?.compareAtPriceV2?.amount} ${product?.variantBySelectedOptions?.compareAtPriceV2?.currencyCode}`,
                    thumbnail: {
                        src: (product as any).images?.edges?.[0]?.node.transformedSrc,
                        alt: (product as any).images?.edges?.[0]?.node.altText,
                        type: "image"
                    },
                    sku: (product.variants?.edges?.[0].node as any)?.sku ?? product.variantBySelectedOptions?.sku,
                    colors: product.options.find((option: { name: string, values: [] }) => option.name === 'Color')
                        ?.values.map((value: any) => ({ id: value, text: value })),
                    sizes: product.options.find((option: { name: string }) => option.name == 'Size')
                        ?.values.map((value: any) => ({ id: value, text: value })),
                    options: product.options,
                    media: {
                        thumbnails: product?.variantBySelectedOptions?.image ? [
                            {
                                src: product?.variantBySelectedOptions?.image?.transformedSrc,
                                alt: product?.variantBySelectedOptions?.image?.altText,
                                type: "image"
                            }
                        ] : product.images?.edges?.map((edge: { node: { transformedSrc: any; altText: any } }) => ({
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
                        ] : product.images?.edges?.map((edge: { node: { originalSrc: any; altText: any } }) => ({
                            src: edge.node.originalSrc,
                            alt: edge.node.altText,
                            type: "image"
                        }))

                    },
                    description: product.description,
                    variantBySelectedOptions: product.variantBySelectedOptions ?? product.variants?.edges?.[0].node,
                    isVariable: isVariable(product),
                    quantityAvailable: isVariable(product) ? product.variantBySelectedOptions?.quantityAvailable || 0 : product.variants?.edges?.[0].node.quantityAvailable
                }
            }
        }
        return result
    },
    productSlots: (params: ProductSlotsParams, request: any, res: any) => {
        const result: CmsSlots = {}
        return result
    },
    productSuggestions: async (id: string, request: any, response: any) => {
        const products = (await Client.query({
            query: PRODUCT_RECOMMENDATIONS_BY_ID,
            variables: {
                productId: id,
            }
        }))?.data?.productRecommendations

        const result: Product[] = products.map((product: any) => {
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
                colors: product.options.find((option: { name: string }) => option.name == 'Color')
                    ?.values.map((value: any) => ({ id: value, text: value })),

            }
        })
        return result

    },
    searchSuggestions: async (
        query: string,
        request: any,
        response: any
    ) => {
        const data = await client.product.fetchQuery({
            query: query,
            sortBy: 'RELEVANCE',
            first: 5
        })
        const links = data?.map((product) => ({
            href: '/p/' + (product as any)?.handle,
            text: product?.title,
            as: '/p/' + (product as any)?.handle,
            thumbnail: {
                src: product?.images?.[0]?.src,
                alt: product.title,
                type: "image" as 'image'
            }

        }))
        const collectionData = await client.collection.fetchQuery({
            query: query,
            sortBy: 'RELEVANCE',
            first: 5
        })
        const collectionLinks = collectionData?.map((collection) => ({
            href: '/s/' + collection?.id,
            text: collection?.title,
            as: '/s/' + collection?.id,
            thumbnail: {
                src: collection?.image?.src,
                alt: collection?.title,
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
    session: async (request: any, response: any) => {
        try {
            const checkoutData = (await Client.query({
                query: GET_CHECKOUT_BY_ID,
                variables: {
                    id: cookie.parse(request.headers.cookie).checkoutId
                }
            }))
            const result: Session = {
                cart: {
                    items: checkoutData?.data?.node?.lineItems?.edges?.map((edge: { node: any }) => {
                        const item = edge.node
                        return {
                            id: item.id,
                            quantity: item.quantity,
                            name: item.title,
                            url: '/p/' + item.variant.product.handle,
                            price: item.variant.priceV2.amount,
                            thumbnail: {
                                src: item.variant.image.transformedSrc,
                                alt: item.variant.image.altText,
                                type: "image"
                            },
                        }
                    })
                },
                signedIn: false,
                currency: checkoutData.data.node.currencyCode
            }
            // response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData.data.node.id));
            return result
        } catch (error) {
            const checkoutData = (await Client.mutate({
                mutation: CREATE_CHECKOUT,
                variables: {
                    input: {
                    }
                }
            }))?.data?.checkoutCreate

            const result: Session = {
                cart: {
                    items: []
                }
            }
            response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData?.checkout?.id));
            return result
        }

    },
    cart: async (request: any, response: any) => {
        const checkoutData = (await Client.query({
            query: GET_CHECKOUT_BY_ID,
            variables: {
                id: cookie.parse(request.headers.cookie).checkoutId
            }
        }))
        const collections = await client.collection.fetchAll()
        const items: Array<MenuItem> = collections?.map(c => ({
            text: c?.title,
            href: `/s/[subcategoryId]`,
            as: `/s/${c?.handle}`
        }))
        const result: Result<CartResponse> = {
            appData: { menu: { items: [] }, tabs: items },
            pageData: {
                cart: {
                    items: checkoutData?.data?.node?.lineItems?.edges.map((edge: { node: any }) => {
                        const item = edge.node
                        return {
                            id: item.id,
                            quantity: item.quantity,
                            name: item.title,
                            url: '/p/' + item.variant?.product.handle,
                            price: item.variant.priceV2.amount,
                            thumbnail: {
                                src: item.variant.image.transformedSrc,
                                alt: item.variant.image.altText,
                                type: "image"
                            },
                        }
                    })
                }
            }
        }
        response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData.data.node.id));
        return result
    },
    addToCart: async (
        product: { product: Product, quantity: number },
        request: any,
        response: any
    ) => {
        try {
            const checkoutData = (await Client.mutate({
                mutation: ADD_CHECKOUT_LINES,
                variables: {
                    checkoutId: cookie.parse(request.headers.cookie).checkoutId,
                    lineItems: [
                        {
                            quantity: product?.quantity,
                            variantId: product?.product.variantBySelectedOptions.id
                        }
                    ]
                }
            }))?.data?.checkoutLineItemsAdd
            const result: CartResponse = {
                cart: {
                    items: checkoutData?.checkout?.lineItems?.edges.map((edge: { node: any }) => {
                        const item = edge.node
                        return {
                            id: item?.id,
                            quantity: item?.quantity,
                            name: item?.title,
                            url: '/p/' + item?.variant?.product.handle,
                            price: item?.variant?.priceV2?.amount,
                            thumbnail: {
                                src: item?.variant?.image?.transformedSrc,
                                alt: item?.variant?.image?.altText,
                                type: "image"
                            },
                        }
                    })
                }
            }
            // response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData.checkout.id));
            return result
        } catch (error) {
            const checkoutData = (await Client.mutate({
                mutation: CREATE_CHECKOUT,
                variables: {
                    input: {
                        lineItems: [
                            {
                                quantity: product?.quantity,
                                variantId: product?.product?.variantBySelectedOptions?.id
                            }
                        ]
                    }
                }
            }))?.data?.checkoutCreate

            const result: CartResponse = {
                cart: {
                    items: checkoutData?.checkout?.lineItems?.edges.map((edge: { node: any }) => {
                        const item = edge.node
                        return {
                            id: item.id,
                            quantity: item.quantity,
                            name: item.title,
                            url: '/p/' + item.variant.product.handle,
                            price: item.variant.priceV2.amount,
                            thumbnail: {
                                src: item.variant.image.transformedSrc,
                                alt: item.variant.image.altText,
                                type: "image"
                            },
                        }
                    })
                }
            }
            response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData?.checkout?.id));
            return result
        }
    },
    updateCartItem: async (
        item: CartItem,
        quantity: number,
        request: any,
        response: any
    ) => {

        const checkoutData = (await Client.mutate({
            mutation: UPDATE_CHECKOUT_LINES,
            variables: {
                checkoutId: cookie.parse(request.headers.cookie).checkoutId,
                lineItems: [
                    {
                        quantity: quantity,
                        id: item.id
                    }
                ]
            }
        }))?.data?.checkoutLineItemsUpdate

        const result: CartResponse = {
            cart: {
                items: checkoutData?.checkout?.lineItems?.edges.map((edge: { node: any }) => {
                    const item = edge.node
                    return {
                        id: item.id,
                        quantity: item.quantity,
                        name: item.title,
                        url: '/p/' + item.variant.product.handle,
                        price: item.variant.priceV2.amount,
                        thumbnail: {
                            src: item.variant.image.transformedSrc,
                            alt: item.variant.image.altText,
                            type: "image"
                        },
                    }
                })
            }
        }
        // response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData.checkout.id));
        return result
    },
    removeCartItem: async (item: CartItem, request: any, response: any) => {
        const checkoutData = (await Client.mutate({
            mutation: REMOVE_CHECKOUT_LINES,
            variables: {
                checkoutId: cookie.parse(request.headers.cookie).checkoutId,
                lineItemIds: [item.id]
            }
        }))?.data?.checkoutLineItemsRemove
        const result: CartResponse = {
            cart: {
                items: checkoutData?.checkout?.lineItems?.edges.map((edge: { node: any }) => {
                    const item = edge.node
                    return {
                        id: item.id,
                        quantity: item.quantity,
                        name: item.title,
                        url: '/p/' + item.variant.product.handle,
                        price: item.variant.priceV2.amount,
                        thumbnail: {
                            src: item.variant.image.transformedSrc,
                            alt: item.variant.image.altText,
                            type: "image"
                        },
                    }
                })
            }
        }
        // response.setHeader('Set-Cookie', serialize('checkoutId', checkoutData.checkout.id));
        return result
    },
    search: async (
        // params: SearchParams,
        request: any,
        response: any
    ) => {
        const ITEM_PER_PAGE = 10
        const params: SearchParams = request.query
        const res = (await Client.query({
            query: PRODUCTS_BY_QUERY,
            variables: {
                first: 2,
                after: params.afterCursor,
                query: params.productType ? `${params.q} AND ${params.productType}` : params.q,
                sortKey: params.sort ?? 'UPDATED_AT',
            }
        }))
        const products = res.data?.products?.edges.map((edge: { node: { handle: string; title: any; priceRange: { minVariantPrice: { amount: string; currencyCode: string }; maxVariantPrice: { amount: string } }; images: { edges: { node: { transformedSrc: string, altText: any } }[] } } }) => ({
            id: edge.node.handle,
            url: '/p/' + edge.node.handle,
            name: edge.node.title,
            price: getPrice(edge.node.priceRange.minVariantPrice.amount,
                edge.node.priceRange.maxVariantPrice.amount,
                edge.node.priceRange.minVariantPrice.currencyCode),
            thumbnail: {
                src: edge.node.images?.edges?.[0]?.node.transformedSrc,
                alt: edge.node.images?.edges?.[0]?.node.altText,
                type: "image"
            },

        }))
        const afterCursor: string = res.data?.products.pageInfo.hasNextPage ? res.data?.products?.edges?.slice(-1)[0].cursor : undefined

        const collections = await client.collection.fetchAll()
        const items: Array<MenuItem> = collections?.map(c => ({
            text: c?.title,
            href: `/s/[subcategoryId]`,
            as: `/s/${c?.handle}`
        }))
        const result: Result<SearchResult> = {
            appData: { menu: { items: [] }, tabs: items },
            pageData: {
                afterCursor,
                total: products?.length, page: 0, totalPages: 0, sort: '', sortOptions: [{
                    name: 'UPDATED_AT',
                    code: 'UPDATED_AT',
                },
                {
                    name: 'PRICE',
                    code: 'PRICE',
                }, {
                    name: 'RELEVANCE',
                    code: 'RELEVANCE',
                }, {
                    name: 'BEST_SELLING',
                    code: 'BEST_SELLING',
                },], products, cmsSlots: {},
                facets: [{
                    name: 'ProductType',
                    options: res.data.productTypes.edges.map((edge: { node: any }) => ({
                        name: edge.node,
                        code: edge.node
                    })),
                    ui: "buttons"
                }]

            }
        }
        response.json(result)
        return result
    },
    signIn: async (
        email: string,
        password: string,
        request: any,
        response: any
    ) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    signOut: async (request: any, response: any) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    signUp: async (data: SignUpData, request: any, response: any) => {
        const result: Session = {
            cart: { items: [] },
            signedIn: false
        }
        return result
    },
    routes: [] as Route[]
}
export default connector 