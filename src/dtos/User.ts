import validator from 'validator'
import transformToCleanString from '../libs/transformToCleanString'

class SigninUser {
    id: string
    email: string
    password: string
    constructor(id: string, email: string, password: string) {
        this.id = id
        this.email = email
        this.password = password
    }
}

class User extends SigninUser {
    name: string
    lastname: string
    roleId: string
    constructor(
        id: string,
        email: string,
        password: string,
        name: string,
        lastname: string,
        roleId: string) {
        super(transformToCleanString(id), transformToCleanString(email), password)
        this.name = transformToCleanString(name)
        this.lastname = transformToCleanString(lastname)
        this.roleId = transformToCleanString(roleId)
    }

    isValid(): boolean {

        if (!validator.isUUID(this.id || '', 4)) return false
        if (!validator.isLength(this.name || '', { min: 3, max: 25 })) return false
        if (!validator.matches(this.name || '', /^([a-zA-Z]+ ?)+$/)) return false
        if (!validator.isLength(this.lastname || '', { min: 3, max: 50 })) return false
        if (!validator.isEmail(this.email || '') && !validator.isLength(this.email, { max: 100 })) return false
        if (!validator.isStrongPassword(this.password || '', { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) return false
        if (!validator.isUUID(this.roleId || '', 4)) return false

        return true
    }

    static isIdValid(id: string): boolean {
        return validator.isUUID(id || '', 4)
    }

    isIdValid(): boolean {
        return validator.isUUID(this.id || '', 4)
    }

    static isPasswordValid(password: string): boolean {
        return validator.isStrongPassword(password || '', { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    }

    isPasswordValid(): boolean {
        return validator.isStrongPassword(this.password || '', { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
    }

    isNameValid(): boolean {
        if (!validator.isLength(this.name || '', { min: 3, max: 25 })) return false
        if (!validator.matches(this.name || '', /^([a-zA-Z]+ ?)+$/)) return false
        return true
    }

    isLastNameValid(): boolean {
        if (!validator.isLength(this.lastname || '', { min: 3, max: 50 })) return false
        if (!validator.matches(this.lastname || '', /^([a-zA-Z]+ [a-zA-Z]+)+$/)) return false
        return true
    }

    isRoleIdValid(): boolean {
        return validator.isUUID(this.roleId || '', 4)
    }
}

export { User, SigninUser }