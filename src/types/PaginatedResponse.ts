interface PaginatedResponse<T> {
    rows: T[]
    totalRows: number
    totalPages: number
    limitPerPage: number
    currentPage: number
    nextPage: number | null
    prevPage: number | null
}

export { PaginatedResponse }