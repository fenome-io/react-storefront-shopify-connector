import Client from 'shopify-buy';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export const client = Client.buildClient({
    domain: process.env.SHOPIFY_DOMAIN ?? '',
    storefrontAccessToken: process.env.STOREFRONT_ACCESS_TOKEN ?? ''
})


const graphQl = new ApolloClient({
    uri: process.env.SHOPIFY_GRAPHQL_URL,
    cache: new InMemoryCache(),
    headers: {
        'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN ?? ''
    }
})

export default graphQl
