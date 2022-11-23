import express, {Request, Response, NextFunction} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { adminSchema,vendorSchema,  loginSchema, updateUserSchema, option, GeneratePassword, GenerateSalt, GenerateOtp, GenerateSignature, verifySignature, validatePassword } from '../utils'
import { UserIstance, UserAttributes } from '../model/userModel';
import { VendorAttributes , VendorInstance } from '../model/vendorModel'
import { JwtPayload } from 'jsonwebtoken';


/*==============================Register Admin======================*/
export const createAdmin = async (req:JwtPayload, res:Response ) => {
    try {
    const { id } = req.user
        const {
         email,
         phone,
         password,
         address,
         firstName,
         lastName,
        } = req.body;
 
        const uuiduser = uuidv4()
        const validateResult = adminSchema.validate(req.body,option);
        const { error } = validateResult
     //    console.log(error)
        if(error) return res.status(400).json({ message: error.details[0].message }) 
 
        //generate salt and hash pwd
        const salt = await GenerateSalt()
        const vendorPassword = await GeneratePassword(password, salt);
        //    console.log(vendorPassword);
 
        //generate Otp
        const { otp, expiry } = GenerateOtp();
 
        const Admin = await UserIstance.findOne( {
            where: {id: id }
        }) as unknown as UserAttributes;

        if(Admin.email === email) return res.status(400).json({ message: "Email already exist"})
        
        if(Admin.phone === phone) return res.status(400).json({ message: "Phone number already exist"})
        
        // check if Amin exist
        if(Admin.role === "superAdmin") {

            const adminEmail = await UserIstance.findOne({
                where: {email: email}
            });

            const adminPhone = await UserIstance.findOne({
                where: {phone: phone}
            });
            if(adminEmail === email) return res.status(400).json({ message: "Email already exist"})
        
            if(adminPhone === phone) return res.status(400).json({ message: "Phone number already exist"})

            if(!adminEmail && ! adminPhone) {
                const User = await UserIstance.create({
                    id:uuiduser,
                    email,
                    password: vendorPassword,
                    firstName,
                    lastName,
                    salt,
                    address,
                    phone,
                    otp,
                    otp_expiry:expiry,
                    lng: 0,
                    lat: 0,
                    verified: true,
                    role:"admin",
                    }) as unknown as UserAttributes
                    
                    let signature = await GenerateSignature({
                    id:User.id,
                    email:email,
                    verified:User.verified
                    })
                    return res.status(201).json({
                    message: "Admin created succesfully",
                    signature,
                    verified: User.verified,
                    })
            }

            return res.status(400).json({
                message: "Admin with Email or Phone credentials already exist"
            })
        }
 
        
        return res.status(400).json({
         message: "please signin to create admin"
        })
 
 
     } catch (error) {
         return res.status(500).json({
             message: "Internal server Error",
             route: "/admins/signup",
         })
     }
}

/*==============================Super Admin======================*/

export const createSuperAdmin = async (req:JwtPayload, res:Response ) => {
    try {
        const {
         email,
         phone,
         password,
         address,
         firstName,
         lastName,
        } = req.body;
 
        const id = uuidv4()
        const validateResult = adminSchema.validate(req.body,option);
        const { error } = validateResult
     //    console.log(error)
        if(error) return res.status(400).json({ message: error.details[0].message }) 
 
        //generate salt and hash pwd
        const salt = await GenerateSalt()
        const vendorPassword = await GeneratePassword(password, salt);
        //    console.log(vendorPassword);
 
        //generate Otp
        const { otp, expiry } = GenerateOtp();
 
        const Admin = await UserIstance.findOne( {
            where: {email: email }
        }) as unknown as UserAttributes;

        
        // check if Amin exist
        if(!Admin) {
         const User = await UserIstance.create({
             id:id,
             email,
             password: vendorPassword,
             firstName,
             lastName,
             salt,
             address,
             phone,
             otp,
             otp_expiry:expiry,
             lng: 0,
             lat: 0,
             verified: true,
             role:"superAdmin",
            }) as unknown as UserAttributes
 
            let signature = await GenerateSignature({
             id:User.id,
             email:email,
             verified:User.verified
            })
            return res.status(201).json({
             message: "Admin created succesfully",
             signature,
             verified: User.verified,
             role: User.role
            })
        }
 
        
        return res.status(400).json({
         message: "Admin already exist"
        })
 
 
     } catch (error) {
         return res.status(500).json({
             message: "Internal server Error",
             route: "/admins/signup",
         })
     }
}


/**============================== Create Vendor ============================== **/
export const createVendor = async(req: JwtPayload, res: Response, next: NextFunction) => {
    try{
        const { id } = req.user;
        const {
            name,
            ownerName,
            pincode,
            phone,
            address,
            email,
            password,
        } = req.body;

        const uuidvendor = uuidv4()
        const validateResult = vendorSchema.validate(req.body,option);
        const { error } = validateResult
     //    console.log(error)
        if(error) return res.status(400).json({ message: error.details[0].message }) 
 
        //generate salt and hash pwd
        const salt = await GenerateSalt()
        const vendorPassword = await GeneratePassword(password, salt);

        const Vendor = await VendorInstance.findOne( {
            where: {email: email }
        }) as unknown as VendorAttributes;

        const Admin = await UserIstance.findOne( {
            where: {id: id }
        }) as unknown as JwtPayload;

        
        // check if Amin exist
        if(Admin.role === 'superAdmin' || Admin.role === 'admin') {
            if(!Vendor) {
                const vendor = await VendorInstance.create({
                    id:uuidvendor,
                    email,
                    password: vendorPassword,
                    ownerName,
                    name,
                    salt,
                    address,
                    phone,
                    rating: 0,
                    pincode,
                    serviceAvailable: false,
                    role:"vendor",
                }) as unknown as VendorAttributes;
    
    
                return res.status(201).json({
                    message: "Vendor created succesfully",
                    vendor,
                })
            }
            return res.status(400).json({
                message: "vendor already exist"
               })
        }
        return res.status(400).json({
            message: "unauthorized"
           })
    }catch(error){
        return res.status(500).json({
            message: "Internal server Error",
            route: "/admins/create-vendors",
        })
    }
}
