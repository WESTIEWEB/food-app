import {Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { App_Secret } from '../config';
import { UserIstance, UserAttributes } from '../model/userModel';
import { VendorAttributes, VendorInstance } from '../model/vendorModel'


//req.header or req.cookies are used for middleware
export const auth = async(req:JwtPayload, res:Response, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization
        // const authorization = req.headers.jwt
        
        if(!authorization) return res.status(401).json({
            message: "user not authorised, please signin"
        })

        //most developers structures authorization like 'Bearer yh64hjihdijjkh'
        const token = authorization.slice(7, authorization.length)
        let verified = jwt.verify(token, App_Secret)

        if(!verified) {
            return res.status(401).json({
                Error: "User not authorized, please signin"
            })
        }

        const { id } = verified as {[key:string]: string}

        const user = await UserIstance.findOne({
            where: { id: id}
        })

        if(!user) return res.status(401).json({
            Error: ""
        })

        req.user = verified;
        next()

    } catch(error) {
        Error: "Unauthorized signin"
    }
}
export const authVendor = async(req:JwtPayload, res:Response, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization
        // const authorization = req.headers.jwt
        
        if(!authorization) return res.status(401).json({
            message: "user not authorised, please signin"
        })

        //most developers structures authorization like 'Bearer yh64hjihdijjkh'
        const token = authorization.slice(7, authorization.length)
        let verified = jwt.verify(token, App_Secret)

        if(!verified) {
            return res.status(401).json({
                Error: "user not authorized, please signin"
            })
        }

        const { id } = verified as {[key:string]: string}

        const vendor = await VendorInstance.findOne({
            where: { id: id}
        })

        if(!vendor) return res.status(401).json({
            Error: ""
        })

        req.vendor = verified;
        next()

    } catch(error) {
        res.status(500).json({
            error
        })
    }
}