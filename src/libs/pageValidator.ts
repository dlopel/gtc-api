export function isPageFormatValid(page: number): boolean {
    return typeof page === 'number' && page > 0 ? true : false
}