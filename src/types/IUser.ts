interface ISigninUser {
    id: string
    email: string
    password: string
}

interface IUser extends ISigninUser {
    roleId: string
    name: string
    lastname: string
}

export {
    IUser,
    ISigninUser
}