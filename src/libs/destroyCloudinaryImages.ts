import { getPublicIdByImagePath } from "./getPublicIdByImagePath"
import { _cloudinary } from "./_cloudinary"

export const destroyCloudinaryImages = async (object: {
    [imagepath: string]: string
}) => {
    if (!object) return
    if (Object.entries(object).length < 1) return

    for (const [key, path] of Object.entries(object)) {
        if (path) {
            const publicId = getPublicIdByImagePath(path)
            if (publicId)
                await _cloudinary.uploader.destroy(publicId)
        }
    }
}