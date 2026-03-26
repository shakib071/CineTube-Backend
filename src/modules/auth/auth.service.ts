import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterPayload } from "./auth.interface";
import status from "http-status";


const register = async (payload: IRegisterPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            role: Role.USER,
            status: UserStatus.ACTIVE,
            isDeleted: false,
        }
    })

    if(!data?.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register user");
    }

    try {
        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVarified: data.user.emailVerified,
        })

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVarified: data.user.emailVerified,
        })

        return {
            ...data,
            accessToken,
            refreshToken
        }
    }
    catch(error){
        await prisma.user.delete({where : {id : data.user.id}});
        throw new AppError(status.BAD_REQUEST, "Failed to register user");
    }

}


const login = async (payload:ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body : {
            email,
            password,
        }
    })

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, "User is blocked");
    }

    if (data.user.status === UserStatus.SUSPENDED) {
        throw new AppError(status.FORBIDDEN, "User is Suspended");
    }

    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is deleted");
    }


    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVarified: data.user.emailVerified,
    })

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVarified: data.user.emailVerified,
    })

    return {
        ...data,
        accessToken,
        refreshToken
    }

}


const getMe = async (user:IRequestUser) => {
    const data = await prisma.user.findUnique({
        where: {
            id: user.userId,
        },
        include: {
            admin: true,
        }
    });
    return data;
}


const logout = async (sessionToken:string) => {
    const result = await auth.api.signOut({
        headers : {
            Authorization : `Bearer ${sessionToken}`
        }
    })

    return result;
}   



export const authService = {
    register,
    login,
    getMe,
    logout,
}