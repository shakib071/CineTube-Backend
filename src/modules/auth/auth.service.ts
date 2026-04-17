import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterPayload } from "./auth.interface";
import status from "http-status";
import { envVars } from "../../config/env";
import { jwtUtils } from "../../utils/jwt";




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

      const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && !existingUser.emailVerified) {
    if (existingUser.status === UserStatus.BLOCKED) {
      throw new AppError(status.FORBIDDEN, "User is blocked");
    }
    if (existingUser.status === UserStatus.SUSPENDED) {
      throw new AppError(status.FORBIDDEN, "User is Suspended");
    }
    if (existingUser.isDeleted || existingUser.status === UserStatus.DELETED) {
      throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
      userId: existingUser.id,
      role: existingUser.role,
      name: existingUser.name,
      email: existingUser.email,
      status: existingUser.status,
      isDeleted: existingUser.isDeleted,
      emailVarified: false,
    });
    const refreshToken = tokenUtils.getRefreshToken({
      userId: existingUser.id,
      role: existingUser.role,
      name: existingUser.name,
      email: existingUser.email,
      status: existingUser.status,
      isDeleted: existingUser.isDeleted,
      emailVarified: false,
    });

    return {
      user: { ...existingUser, emailVerified: false },
      accessToken,
      refreshToken,
      token: null,
    };
  }

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


const changePassword = async (payload : IChangePasswordPayload, sessionToken : string) =>{
    const session = await auth.api.getSession({
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    if(!session){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const {currentPassword, newPassword} = payload;

    const result = await auth.api.changePassword({
        body :{
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })



    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });
    

    return {
        ...result,
        accessToken,
        refreshToken,
    }
}

const getNewToken = async (refreshToken : string, sessionToken : string) => {

    const isSessionTokenExists = await prisma.session.findUnique({
        where : {
            token : sessionToken,
        },
        include : {
            user : true,
        }
    })

    if(!isSessionTokenExists){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)


    if(!verifiedRefreshToken.success && verifiedRefreshToken.error){
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const {token} = await prisma.session.update({
        where : {
            token : sessionToken
        },
        data : {
            token : sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    })

    return {
        accessToken : newAccessToken,
        refreshToken : newRefreshToken,
        sessionToken : token,
    }

}


const googleLoginSuccess = async (session: Record<string, any>) => {
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVarified: session.user.emailVerified,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVarified: session.user.emailVerified,
  });

  return { accessToken, refreshToken };
};



const verifyEmail = async (email:string, otp:string) => {
    const result = await auth.api.verifyEmailOTP({
        body : {
            email,
            otp,
        }
    })

    if(result.status && !result.user.emailVerified){
        await prisma.user.update({
            where : {
                email
            },
            data : {
                emailVerified : true,
            }
        })
    }


    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(status.NOT_FOUND, "User not found");

     const sessionToken = crypto.randomUUID();
    await prisma.session.create({
        data: {
        id: crypto.randomUUID(),
        token: sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 24 * 1000),
        
        },
    });

 
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVarified: true,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVarified: true,
  });

  return { accessToken, refreshToken, token: sessionToken };
}


const forgetPassword = async (email : string) => {
    const isUserExist = await prisma.user.findUnique({
        where : {
            email,
        }
    })

    if(!isUserExist){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if(isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
        throw new AppError(status.NOT_FOUND, "User not found"); 
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email,
        }
    })
}

const resetPassword = async (email : string, otp : string, newPassword : string) => {
    const isUserExist = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password : newPassword,
        }
    })

    

    await prisma.session.deleteMany({
        where:{
            userId : isUserExist.id,
        }
    })
}


const resendVerifyEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.emailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "Email already verified"
    );
  }
  const data = await auth.api.sendVerificationOTP({
    body: {
        email: email,
        type: "email-verification",
    },
});

//   await fetch(`${envVars.BETTER_AUTH_URL}/api/auth/email-otp/send-verification-otp`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, type: "email-verification" }),
//   });
};

const resendForgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (!user.emailVerified) {
    throw new AppError(
      status.BAD_REQUEST,
      "Email not verified"
    );
  }

  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};


export const authService = {
    register,
    login,
    getMe,
    logout,
    changePassword,
    getNewToken,
    googleLoginSuccess,
    verifyEmail,
    forgetPassword,
    resetPassword,
    resendVerifyEmail,
    resendForgetPassword
   
}