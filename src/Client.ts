import Client from 'shopify-buy';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export const client = Client.buildClient({
    domain: process.env.SHOPIFY_STORE_NAME + '.myshopify.com',
    storefrontAccessToken: process.env.STOREFRONT_ACCESS_TOKEN ?? ''
})


const graphQl = new ApolloClient({
    uri: `https://${process.env.SHOPIFY_STORE_NAME}.myshopify.com/api/2020-10/graphql.json`,
    cache: new InMemoryCache(),
    headers: {
        'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN ?? ''
    }
})

export default graphQl
