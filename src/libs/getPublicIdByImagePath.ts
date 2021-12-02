import validator from "validator"

/**Get public id from cloudianry image url  */
export const getPublicIdByImagePath = (path: string): string | null => {
    if (validator.isURL(path || '', { require_protocol: true })) {
        return path.substr(path.lastIndexOf('/') + 1, 20)
    } else {
        return null
    }
}