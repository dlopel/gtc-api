import path from 'path'
import multer, { StorageEngine, Options } from 'multer'
import { v4 as uuidv4 } from 'uuid'

const storage: StorageEngine = multer.diskStorage({
    destination: path.join(__dirname, '../public'),
    filename: function (req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname))
    }
})

const opts: Options = {
    storage,
    fileFilter: function (req, file, cb) {
        // const fileTypes = /jpeg|jpg/
        const fileTypes = /pdf/
        const isValidMimeType = fileTypes.test(file.mimetype)
        const isValidExtName = fileTypes.test(path.extname(file.originalname).toLowerCase())

        if (isValidExtName && isValidMimeType) {
            cb(null, true)
        } else {
            // cb(null, false)
            cb(new Error('Forbbiden file type'))
        }
    },
    limits: {
        fileSize: 1000000
    }
}

const _multer = multer(opts)

export {
    _multer,
}