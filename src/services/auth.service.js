import bcrypt from "bcrypt";
import { prisma } from "../config/database.js";
import {userRepository} from "../repositories/user.repository.js";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { generateAccessToken,generateRefreshToken,createRefreshExpiry} from "../services/token.service.js";
import {hashToken} from "../utils/tokenHash.js";

function createUnauthorizedError(message){
    const error =  new Error(message);
    error.statusCode = 401;
    return error
}

export async function loginUser(email,password){
    const user = await userRepository.findByEmail(email);
    if(!user){
        throw createUnauthorizedError("Invalid email or password")
    }
    if(!user.isActive){
        throw createUnauthorizedError("Invalid email or password");
    }
    const passwordMatches = await bcrypt.compare(password,user.passwordHash);
    if(!passwordMatches){
        throw createUnauthorizedError("Invalid email or password");
    }
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    await refreshTokenRepository.create({
        tokenHash,
        userId:user.id,
        expiresAt: createRefreshExpiry()
    })
    return {accessToken,refreshToken}
}


export async function refreshSession(rawRefreshToken){
    if(!rawRefreshToken){
      throw  createUnauthorizedError("Refresh token required")
    }
    const oldTokenHash = hashToken(rawRefreshToken);
    return prisma.$transaction(
        async(tx) => {
            const oldToken  = await refreshTokenRepository.findByHash(oldTokenHash,tx);
            if(!oldToken){
                throw createUnauthorizedError("Invalid refresh Token")
            }
            if(oldToken.revokedAt){
                throw createUnauthorizedError("Invalid refresh token")
            }
            if(oldToken.expiresAt <= new Date()){
                throw createUnauthorizedError("Invalid refresh token")
            }
            if(!oldToken.user.isActive){
                throw createUnauthorizedError("Invalid refresh token")
            }
            const newRefreshToken = generateRefreshToken();
            const tokenHash = hashToken(newRefreshToken);
            await refreshTokenRepository.create({
             tokenHash: newRefreshToken,
             userId: oldToken.user.id,
             expiresAt: createRefreshExpiry()
            },tx)
            const revokeResult = await refreshTokenRepository.revokeIfActive(oldToken.id,newRefreshToken,tx)
            if(revokeResult.count !== 1){
                throw createUnauthorizedError("Invalid refresh token")
            }
            const accessToken = generateAccessToken(oldToken.user);

            return {accessToken:accessToken,refreshToken: newRefreshToken}
        }
    )
}