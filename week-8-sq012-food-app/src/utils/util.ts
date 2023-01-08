import Joi from 'joi';
import bcrypt from 'bcrypt';
import { AuthPayload } from '../interface'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { App_Secret } from '../config';


export const registerSchema = Joi.object().keys({
    email: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    // confirm_password: Joi.ref('password')
    confirm_password: Joi.any().equal(Joi.ref('password')).required().label('Confirm password').messages({'any.only':'{{#label}} does not match'})
    
})
export const updateUserSchema = Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),   
})
export const adminSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    email: Joi.string().required(),   
})
export const vendorSchema = Joi.object().keys({
    name: Joi.string().required(),
    restaurantName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    email: Joi.string().required(),
    pincode: Joi.string().required(), 
    coverImage: Joi.string(),  
})

export const updateVendorSchema = Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    coverImage: Joi.string(),
})

export const foodSchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    readyTime: Joi.number().required(),
    foodType: Joi.string().required(),
    price: Joi.number().required(),
    rating: Joi.number(),   
})

export const loginSchema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
})

export const option = {
    abortEarly: false,
    errors: {
        wrap:{
            label: ''
        }
    }
    
};

export const GenerateSalt = async() => {
    return await bcrypt.genSalt();
}

export const GeneratePassword = async(password:string, salt:string) => {
    return await bcrypt.hash(password, salt);
}


export const GenerateSignature = async(payload:AuthPayload) => {
       return jwt.sign(payload, App_Secret, { expiresIn: '1w'})
}

export const verifySignature = async (signature:string) => {
    return jwt.verify(signature, App_Secret) as JwtPayload;

}

export const validatePassword = async (inputPWD:string, savedPWD:string, salt:string) =>{
    return await GeneratePassword(inputPWD, salt) === savedPWD;

}