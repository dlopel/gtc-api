class PaginatedResponseHelper {
    rows: any[]
    totalRows: number
    totalPages: number
    limitPerPage: number
    currentPage: number
    nextPage: number | null
    prevPage: number | null

    constructor(
        rows: any[],
        totalRows: number,
        totalPages: number,
        limitPerPage: number,
        currentPage: number,
        nextPage: number | null,
        prevPage: number | null) {
        this.rows = rows
        this.totalRows = totalRows
        this.totalPages = totalPages
        this.limitPerPage = limitPerPage
        this.currentPage = currentPage
        this.nextPage = nextPage
        this.prevPage = prevPage
    }
}


export default PaginatedResponseHelper