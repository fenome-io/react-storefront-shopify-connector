import { gql } from '@apollo/client';
export const PRODUCTS_BY_QUERY = gql`
  query products($first: Int!,$after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse, after: $after) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
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
        }
      }
    }
    productTypes(first: 100) {
      edges{
        node
      }
    }
  }
`;