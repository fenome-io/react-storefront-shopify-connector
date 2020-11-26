import { gql } from '@apollo/client';

export const UPDATE_CHECKOUT_LINES = gql`
  mutation checkoutLineItemsUpdate($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
    checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
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