import { gql } from '@apollo/client';

export const GET_CHECKOUT_BY_ID = gql`
  query getCheckout($id:ID!) {
      node(id: $id) {
      id
      ... on Checkout {
          id
          ready
          currencyCode
          subtotalPriceV2{
            amount
            currencyCode
          }
          lineItems(first: 250) {
            edges {
              node {
                id
                title
                quantity
                
                variant {
                  id
                  priceV2{
                    amount
                    currencyCode
                  }
                  image {
                    originalSrc
                    transformedSrc: transformedSrc(maxWidth:200, crop: CENTER)
                    altText
                  }
                  product{
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
`;