import { Response } from "express";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

console.log("JWT_SECRET: ", process.env.JWT_SECRET )
console.log("REFRESH_TOKEN_SECRET: ", process.env.REFRESH_TOKEN_SECRET )

export const generateToken = (res:Response, userId: string, role: string) => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!jwtSecret || !refreshSecret) {
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables");
    }

    try {
        console.log("User ID when generating token", userId)
        const accessToken = jwt.sign({userId, role}, jwtSecret, {expiresIn: "15m"})
        const refreshToken = jwt.sign({userId}, refreshSecret, {expiresIn: "30d"})
        console.log("access token:" ,accessToken)
        
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development", 
            sameSite: "strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });


         // Set Refresh Token as HTTP-Only Secure Cookie
         res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });


        return {accessToken, refreshToken}

    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
}

