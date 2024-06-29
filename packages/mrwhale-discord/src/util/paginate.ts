/**
 * Paginates the given array.
 * @param array The array to paginate.
 * @param pageSize The number of items per page.
 * @param pageNumber The page number to get.
 */
export function paginate<T>(
  array: T[],
  pageSize: number,
  pageNumber: number
): { page: T[]; pages: number } {
  const pages = Math.ceil(array.length / pageSize);
  return {
    page: array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize),
    pages,
  };
}
