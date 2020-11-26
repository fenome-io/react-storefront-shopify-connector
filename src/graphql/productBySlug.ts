import { gql } from '@apollo/client';
export const PRODUCT_BY_SLUG = gql`
  query productByHandle($handle: String!) {
    productByHandle(handle: $handle) {
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
export const PRODUCT_BY_SLUG_WITH_OPTIONS = gql`
  query productByHandle($handle: String!, $selectedOptions:[SelectedOptionInput!]!) {
    productByHandle(handle: $handle) {
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
      variantBySelectedOptions(selectedOptions:$selectedOptions){
        id
        sku
        title
        image {
          originalSrc
          transformedSrc: transformedSrc(maxWidth:200, crop: CENTER)
          altText
        }
        availableForSale
        compareAtPriceV2 {
          amount
          currencyCode
        }
        priceV2 {
          amount
          currencyCode
        }
        quantityAvailable
      }
    }
  }
`;