import { gql } from '@apollo/client';
export const COLLECTION_BY_SLUG = gql`
  query collectionBySlug($handle: String!) {
    collectionByHandle(handle: $handle) {
      handle
      title
      products(first: 10) {
        edges {
          node {
            handle
            title
            priceRange {
              maxVariantPrice {
                amount
                currencyCode
              }
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  transformedSrc: transformedSrc(maxWidth:200, crop: CENTER)
                  altText
                }
              }
            }
            options {
              name,
              values
            }
            variants(first: 1) {
              pageInfo {
                hasNextPage
              }
              edges {
                node {
                  quantityAvailable
                  compareAtPriceV2 {
                    amount
                    currencyCode
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;