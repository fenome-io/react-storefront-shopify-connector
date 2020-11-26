import { gql } from '@apollo/client';

export const REMOVE_CHECKOUT_LINES = gql`
  mutation checkoutLineItemsRemove($checkoutId: ID!, $lineItemIds: [ID!]!) {
    checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
      checkout {
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
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`;