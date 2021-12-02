import pool from '../connectDB'
import bcrypt from 'bcryptjs'
import { User, SigninUser } from '../dtos/User'
import { IUser, ISigninUser } from '../types/IUser'

const areHashAndPasswordSame = async (
    normalPassword: string,
    hashPassword: string) => {
    if (normalPassword && hashPassword)
        return await bcrypt.compare(normalPassword, hashPassword)
}

const areUniqueConstraintsValid = async (
    name: string,
    lastname: string,
    email: string) => {

    if (name && lastname && email) {
        const query = {
            text: `
                   SELECT id
                   FROM public."USERS" 
                   WHERE (UPPER(name || '')=$1 AND UPPER(lastname || '')=$2) OR UPPER(email || '')=$3`,
            values: [name.toUpperCase(), lastname.toUpperCase(), email.toUpperCase()]
        }
        const result = await pool.query(query)
        if (result.rows.length) {
            return false
        } else {
            return true
        }
    }
}

const areUniqueConstraintsValidExceptCurrentId = async (
    name: string,
    lastname: string,
    userId: string) => {

    if (name && lastname && userId) {
        const query = {
            text: `
                       SELECT id
                       FROM public."USERS" 
                       WHERE UPPER(id || '')!=$1 AND UPPER(name || '')=$2 AND UPPER(lastname || '')=$3`,
            values: [userId.toUpperCase(), name.toUpperCase(), lastname.toUpperCase()]
        }

        const result = await pool.query(query)
        if (result.rows.length) {
            return false
        } else {
            return true
        }
    }

}

const isManager = async (userId: string) => {
    if (userId) {
        const query = {
            text: `
                   SELECT U.id, U.name 
                   FROM public."USERS" AS U
                   INNER JOIN public."ROLES" AS R ON U.role_id = R.id
                   WHERE U.id = $1 AND UPPER(R.name || '') LIKE '%GERENTE%' `,
            values: [userId]
        }
        const result = await pool.query(query)

        if (result.rows.length) {
            return true
        } else {
            return false
        }
    }
}

const createUser = async (user: IUser) => {

    if (user) {
        user.password = await bcrypt.hash(user.password, 10)
        const query = {
            text: `
                   INSERT INTO public."USERS" (id, name, lastname, email, password, role_id)
                   VALUES ($1, $2, $3, $4, $5, $6)`,
            values: [user.id, user.name, user.lastname, user.email, user.password, user.roleId]
        }
        await pool.query(query)
    }

}

const updateUserPartiallyById = async (
    id: string,
    name: string,
    lastname: string,
    roleId: string) => {
    if (name && lastname && roleId && id) {
        const query = {
            text: `
                    UPDATE public."USERS" SET
                    name=$1, 
                    lastname=$2, 
                    role_id=$3
                    WHERE id=$4`,
            values: [name, lastname, roleId, id]
        }
        await pool.query(query)
    }
}

const updateUserPasswordById = async (newPassword: string, userId: string) => {

    if (newPassword && userId) {
        newPassword = await bcrypt.hash(newPassword, 10)
        const query = {
            text: `
                    UPDATE public."USERS"
                    SET password=$1
                    WHERE id=$2`,
            values: [newPassword, userId]
        }
        await pool.query(query)
    }

}

const getUsers = async (): Promise<IUser[]> => {
    const query: string = `
                      SELECT id, name, lastname, email, password, role_id
                      FROM public."USERS"
                      ORDER BY lastname, name`
    const result = await pool.query(query)

    const parsedUsers: IUser[] = result.rows.map(user => {
        return new User(
            user.id,
            user.email,
            null,
            user.name,
            user.lastname,
            user.role_id)
    })

    return parsedUsers
}

const getUserById = async (id: string): Promise<IUser | null> => {
    if (id) {
        const query = {
            text: `
                   SELECT id, name, lastname, email, password, role_id
                   FROM public."USERS" WHERE id = $1`,
            values: [id]
        }
        const result = await pool.query(query)

        if (result.rowCount) {
            const user: IUser = new User(
                result.rows[0].id,
                result.rows[0].email,
                null,
                result.rows[0].name,
                result.rows[0].lastname,
                result.rows[0].role_id)
            return user
        } else {
            return null
        }
    }
}

const getCurrentUserById = async (id: string): Promise<IUser | null> => {
    if (id) {
        const query = {
            text: `
                   SELECT id, name, lastname, email, password, role_id
                   FROM public."USERS" WHERE id = $1`,
            values: [id]
        }
        const result = await pool.query(query)

        if (result.rowCount) {
            const user: IUser = new User(
                result.rows[0].id,
                result.rows[0].email,
                result.rows[0].password,
                result.rows[0].name,
                result.rows[0].lastname,
                result.rows[0].role_id)
            return user
        } else {
            return null
        }
    }
}

const getSigninUserByEmail = async (email: string): Promise<ISigninUser | null> => {

    if (email) {
        const query = {
            text: `
                       SELECT id,email, password
                       FROM public."USERS" WHERE email = $1`,
            values: [email]
        }
        const result = await pool.query(query)

        if (result.rowCount) {
            const user: ISigninUser = result.rows[0]
            return new SigninUser(
                user.id,
                user.email,
                user.password)
        } else {
            return null
        }
    }

}

const deleteUserById = async (id: string) => {
    if (id) {
        const query = {
            text: `
                       DELETE FROM public."USERS"
                       WHERE id = $1`,
            values: [id]
        }
        await pool.query(query)
    }
}

/**Los que dependen de la tabla USERS */
const hasDependentRecords = async (userId: string) => {

    if (userId) {
        const query = {
            text: `
                    SELECT user_id
                    FROM public."OUTPUTS"
                    WHERE user_id=$1
                    UNION
                    SELECT user_id
                    FROM public."USERS_CLIENTS"
                    WHERE user_id=$1`,
            values: [userId]
        }
        const result = await pool.query(query)
        return result.rowCount ? true : false
    }
}


export {
    areHashAndPasswordSame,
    areUniqueConstraintsValid,
    areUniqueConstraintsValidExceptCurrentId,
    isManager,
    createUser,
    getSigninUserByEmail,
    getUsers,
    getUserById,
    getCurrentUserById,
    updateUserPartiallyById,
    updateUserPasswordById,
    deleteUserById,
    hasDependentRecords
}
