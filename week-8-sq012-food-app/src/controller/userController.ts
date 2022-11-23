import express, {Request, Response, NextFunction} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { registerSchema ,loginSchema, updateUserSchema, option, GeneratePassword, GenerateSalt, GenerateOtp,requestOTP, mailSender, emailHtml, GenerateSignature, verifySignature, validatePassword } from '../utils'
import { UserIstance, UserAttributes } from '../model/userModel';
import { FromAdminMail, userSubject } from '../config'
import { JwtPayload } from 'jsonwebtoken';


export const Register = async(req: Request, res: Response, next: NextFunction) => {
    try {
       const {
        email,
        phone,
        password,
        confirm_password
       } = req.body;

       const id = uuidv4()
       const validateResult = registerSchema.validate(req.body,option);
       const { error } = validateResult
    //    console.log(error)
       if(error) return res.status(400).json({ message: error.details[0].message }) 

    //    res.json({
    //     message:"success"
    //    })

       //generate salt and hash pwd
       const salt = await GenerateSalt()
       const userPassword = await GeneratePassword(password, salt);
       //    console.log(userPassword);

       //generate Otp
       const { otp, expiry } = GenerateOtp();

       //check if user exist
       const UserEmail = await UserIstance.findOne({
        where: {email:email}
       });

       const UserPhone = await UserIstance.findOne({
        where: {phone:phone}
       })
     

       if(!UserEmail && !UserPhone) {
        const User = await UserIstance.create({
            id,
            email,
            password: userPassword,
            firstName: '',
            lastName:'',
            salt,
            address: '',
            phone,
            otp,
            otp_expiry:expiry,
            lng: 0,
            lat: 0,
            verified: false,
            role:"user",
           }) as unknown as UserAttributes
    
        //    send Otp to user
         //   await requestOTP(otp, phone);

           const html = emailHtml(otp);

         //   send email to user
           await mailSender(FromAdminMail, email ,userSubject, html)

         //   check if user exist
         //   const user = await UserIstance.findOne({
         //    where:{ email:email } 
         //   }) as unknown as  UserAttributes

           let signature = await GenerateSignature({
            id:User.id,
            email:User.email,
            verified:User.verified
           })
           return res.status(201).json({
            message: "User created succesfully, check your email or phone for OTP verification",
            signature,
            verified: User.verified,
           })
       }

       
    //    const User = await UserIstance.findOne({
    //     where: { email:email}
    //    })
       
       return res.status(400).json({
        message: "User already exist"
       })


    } catch (error) {
        return res.status(500).json({
            message: "Internal server Error",
            route: "/users/signup",
            Error : error
        })
    }
}

/**
 * 
 * @param req req.params.signature
 * @param res 
 * @returns res.status(201) if verified
 * 
 */

export const verifyUser = async( req:Request, res:Response) => {
   try {

      //users/verify/id

      //verify if its user
      const token = req.params.signature;
      const toVerify = await verifySignature(token)

      // console.log(toVerify)

      const User = await UserIstance.findOne({
         where: { email: toVerify.email}
      }) as unknown as JwtPayload;

      if(User) {
         const { otp } = req.body;

         if(User.otp === Number(otp) && User.otp_expiry >= new Date()) {
            // const updatedUser = await UserIstance.findOne({
            //    where: { email: toVerify.email }
            // }) as unknown as UserAttributes
            const updatedUser = await User.update({
               verified:true,
            })
            // updatedUser.verified = true

            //Generate a new signature

            let signature = await GenerateSignature({
               id:updatedUser.id,
               email:updatedUser.email,
               verified:updatedUser.verified
              })

              return res.status(200).json({
               message: "Your account was succesfully updated",
               signature,
               verified: `${User.verified}`
              })
         }
         return res.status(400).json({
            Error : "invalid credential or token already expired"
           })
      }
   } catch(error) {
      res.status(500).json({
         Error: "Internal server Error occoured",
         route: "/users/verify/:signature"
      })
   }
}

/**
 * User login
 */

export const Login = async ( req:Request, res:Response) => {
   try {
      const {
       email,
       password,
      } = req.body;

      const validateResult = loginSchema.validate(req.body,option);
      const { error } = validateResult
   //    console.log(error)
      if(error) return res.status(400).json({ message: error.details[0].message }) 

   // check if user exist
      const User = await UserIstance.findOne({
         where: { email: email}
      }) as unknown as UserAttributes;
      

      if(User.verified === true){
         const validation = await validatePassword(password, User.password, User.salt);

         if(validation){
            let signature = await GenerateSignature({
               id:User.id,
               email:User.email,
               verified:User.verified
              }) 

            return res.status(200).json({
               message: "succesfully logged in",
               signature,
               email: User.email,
               verified: User.verified,
               role: User.role
            })
         }

         return res.status(400).json({
            Error: "wrong credentials/not ver"
         })

      }

      return res.status(400).json({
         message: "User not verified"
      })

   } catch(error) {
      return res.status(500).json({
         Error: "Internal server Error",
         route: "/users/login"
      })
   }
}

/**
 * Resend OTP router , if User does not receive otp
 */

export const resendOTP = async (req:Request, res:Response) => {
   try {

      const token = req.params.signature;
      const toVerify = await verifySignature(token)

      //check if User
      const User = await UserIstance.findOne({
         where:{ email:toVerify.email } 
        }) as unknown as  JwtPayload

      if(User) {
         const { 
            otp,
            expiry
         } = GenerateOtp();

         const updatedUser = await User.update({
            otp,
            otp_expiry:expiry,
         }) as unknown as JwtPayload;

         // resend otp to user
         // await requestOTP(otp, updatedUser.phone);

         const html = emailHtml(otp);

         //   re send email to user
         await mailSender(FromAdminMail, updatedUser.email ,userSubject, html)

         return res.status(200).json({
         message: "OTP resend to your Email and Phone number",

         })
      }

      return res.status(400).json({
         Error: "Error sending OTP"
      })

   } catch(error) {
      return res.status(500).json({
         Error: "Internal server Error",
         route: "/users/resend-otp/:signature"
      })
   }

}

/**
 * get user profile
 */

export const getAllUser = async (req:Request, res:Response) => {

   try {
      //setting a search limit
      const limit = req.query.limit as number | undefined;

      // const Users = await UserIstance.findAll({});
      const Users = await UserIstance.findAndCountAll({
         limit: limit
      })

      return res.status(200).json({
         message: "Users successfully fetched",
         Count: Users.count,
         Users: Users.rows,
      })
   } catch(error) {
      return res.status(500).json({
         Error: "Internal Server error occoures",
         message: "No Users found",
         route: "/users/get-all-users"
      })
   }

}

export const getUser = async(req:JwtPayload, res:Response) => {
   try {
     
      const id = req.user

      console.log(req.user)

      //find user by id
      const User = await UserIstance.findOne({
         where: {
            id: id.id
         },
      })

      if(User) {
         return res.status(200).json({
            message: "user fetched successfully",
            User,
         })
         
      }
      return res.status(404).json({
         Error: "user not found;"
      })


      
   } catch(error) {
      return res.status(500).json({
         error,
         route: "/users/get-user"
      })
   }
}

/**
 * Update user profile
 */

export const updateUserProfile = async(req:JwtPayload, res:Response) => {
   try {
      const { id } = req.user;
      const { firstName, lastName, address, phone} = req.body;

      const { error } = updateUserSchema.validate(req.body, option);

      if(error) return res.status(400).json({Error: error.details[0].message});

      const User = await UserIstance.findOne({
         where: {id: id},
      }) as unknown as JwtPayload
      if(!User) return res.status(401).json({ Error: "Not authorized to update profile "});

      const updateUser = await User.update({
         firstName,
         lastName,
         phone,
         address
      },
      {
         where: { id: id }
      })as unknown as JwtPayload

      // if(updateUser) {
      //    const User = await UserIstance.findOne({
      //       where: { id: id}
      //    }) as unknown as UserAttributes;

      //    return res.status(200).json({
      //       message: "profile successfully update",
      //       User
      //    })
      // }
      return res.status(200).json({
         message: "profile successfully update",
         updateUser,
      })

      return res.status(401).json({
         Error: "User not authorized to update profile"
      })

   }catch(error) {

   }
}