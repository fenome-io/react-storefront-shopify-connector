import Client from 'shopify-buy';

export const client = Client.buildClient({
    domain: 'graphql.myshopify.com',
    storefrontAccessToken: 'dd4d4dc146542ba7763305d71d1b3d38'
})

export default client
