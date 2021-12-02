import fs from 'fs'
import { MulterImagesObject } from '../types/MulterImagesObject'

export const deleteLocallyUploadedFiles = async (
    files: MulterImagesObject): Promise<void> => {
    for (let [key, value] of Object.entries(files)) {
        if (key) {
            await fs.promises.unlink(value[0].path)
        }
    }
}

