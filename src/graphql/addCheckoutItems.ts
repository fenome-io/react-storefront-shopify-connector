import { gql } from '@apollo/client';

export const ADD_CHECKOUT_LINES = gql`
  mutation checkoutLineItemsAdd($lineItems: [CheckoutLineItemInput!]!, $checkoutId: ID!) {
    checkoutLineItemsAdd(lineItems: $lineItems, checkoutId: $checkoutId) {
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