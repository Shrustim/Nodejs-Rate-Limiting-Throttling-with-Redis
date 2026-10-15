import {prisma} from "../config/database.js";
export const refreshTokenRepository = {
    create(data,db=prisma){
        return db.refreshToken.create({
            data
        })
    },
    findByHash(tokenHash, db=prisma){
        return db.refreshToken.findUnique({
            where:{
                tokenHash
            },
            include: {
                user: {
                    include: {
                        roles: {
                            include: {
                                role: true
                            }
                        }
                    }
                }
            }
        })
    },
    revokeIfActive(id, replacedByTokenHash,
        db=prisma
    ) {
        return db.refreshToken.updateMany({
            where:{
                id,
                revokedAt: null
            },
            data:{
                revokedAt: new Date(),
                replacedByTokenHash
            }
        })
    }
}