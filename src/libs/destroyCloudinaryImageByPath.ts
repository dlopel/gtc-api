import { getPublicIdByImagePath } from "./getPublicIdByImagePath"
import { _cloudinary } from "./_cloudinary"

export const destroyCloudinaryImageByPath = async (path: string) => {
    if (path) {
        const publicId = getPublicIdByImagePath(path)
        await _cloudinary.uploader.destroy(publicId)
    }
}