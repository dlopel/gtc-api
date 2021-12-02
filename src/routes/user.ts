import express from 'express'
import * as  userController from '../controllers/user'
import * as userMiddlewares from '../middlewares/user'

const userRouter = express.Router()

userRouter.put(
    '/current/:id/password',
    userMiddlewares.validateExistenceOfUser,
    userController.updateCurrentUserPasswordById)

userRouter.put(
    '/:id/password',
    userMiddlewares.isManager,
    userController.updateUserPasswordById)

userRouter.put(
    '/current/:id',
    userMiddlewares.validateExistenceOfUser,
    userController.updateUserById)

userRouter.get(
    '/current',
    userMiddlewares.AddUserIdToUrlParams,
    userController.getUserById)

userRouter.get(
    '/:id',
    userMiddlewares.isManager,
    userController.getUserById)

userRouter.put(
    '/:id',
    userMiddlewares.isManager,
    userController.updateUserById)

userRouter.delete(
    '/:id',
    userMiddlewares.isManager,
    userController.deleteUserById)

userRouter.post(
    '/',
    userMiddlewares.isManager,
    userController.createUser)

userRouter.get(
    '/',
    userMiddlewares.isManager,
    userController.getUsers)

export { userRouter }