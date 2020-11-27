import { gql } from '@apollo/client';
export const PRODUCT_RECOMMENDATIONS_BY_ID = gql`
  query productRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      handle
      title
      description
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
      images(first: 5) {
        edges {
          node {
            originalSrc
            transformedSrc: transformedSrc(maxWidth:200, crop: CENTER)
            altText
          }
        }
      }
      options {
        name
        values
      }
      variants(first: 1) {
        pageInfo {
          hasNextPage
        }
        edges {
          node {
            id
            sku
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
`;