import jwt from 'jsonwebtoken';
import crypto from "node:crypto";

export function generateAccessToken(user){
    const roles = user.roles.map((userRole) => userRole.role.name)
    return jwt.sign(
        {
        roles
    },
process.env.JWT_ACCESS_SECRET,
{
    subject: String(user.id),
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    algorithm: "HS256"
})
}
export function generateRefreshToken(){
   return crypto.randomBytes(64).toString('hex');
}

export function createRefreshExpiry(){
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}