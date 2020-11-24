import Client from 'shopify-buy';

export const client = Client.buildClient({
    domain: process.env.SHOPIFY_DOMAIN ?? '',
    storefrontAccessToken: process.env.STOREFRONT_ACCESS_TOKEN ?? ''
})

export default client
