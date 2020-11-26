import { SearchParamsBase } from './SearchParams'

export default interface SubcategoryParams extends SearchParamsBase {
  /**
   * The id of the subcategory
   */
  slug: string[] | string
}
