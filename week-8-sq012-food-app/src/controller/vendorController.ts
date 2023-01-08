import {Request, Response, NextFunction} from 'express';
import { v4 as uuidv4 } from 'uuid';
import { loginSchema, option, GenerateSignature, validatePassword, foodSchema, updateVendorSchema } from '../utils'
import { JwtPayload } from 'jsonwebtoken';
import { VendorAttributes, VendorInstance } from '../model/vendorModel';
import { FoodInstance, FoodAttributes } from '../model/foodModel';


/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * 
 *  CREATE VENDOR, VENDORLOGIN, 
 */


/** ============================== Vendor Login ============================== **/
export const vendorLogin = async ( req:Request, res:Response, next:NextFunction) => {
    try {
       const {
        email,
        password,
       } = req.body;
 
       const validateResult = loginSchema.validate(req.body,option);
       const { error } = validateResult
    //    console.log(error)
       if(error) return res.status(400).json({ Error: error.details[0].message }) 
 
    // check if user exist
       const Vendor = await VendorInstance.findOne({
          where: { email: email}
       }) as unknown as VendorAttributes;
       
 
       if(Vendor){
          const validation = await validatePassword(password, Vendor.password, Vendor.salt);
 
          if(validation){
             let signature = await GenerateSignature({
                id:Vendor.id,
                email:Vendor.email,
                serviceAvailable:Vendor.serviceAvailable
               }) 
 
             return res.status(200).json({
                message: "succesfully logged in",
                signature,
                email: Vendor.email,
                serviceAvailable:Vendor.serviceAvailable,
                role: Vendor.role
             })
          }
 
          return res.status(400).json({
             Error: "wrong credentials"
          })
 
       }
 
       return res.status(400).json({
          Error: "account does not exist,contact Admin"
       })
 
    } catch(error) {
       return res.status(500).json({
          Error: "Internal server Error",
          route: "/vendors/login"
       })
    }
 }


 /**
 * =========================== Vendor Add food ================================
 */

export const createFood = async(req:JwtPayload, res:Response) => {
    try {
        const { id } = req.vendor;
        const fooduuid = uuidv4()
        const {
            name,
            image,
            price,
            foodType,
            readyTime,
            description,
            category,
        } = req.body;

        const validateResult = foodSchema.validate(req.body,option);
        const { error } = validateResult;
     //    console.log(error)
        if(error) return res.status(400).json({ Error: error.details[0].message });

        const isExistVendor = await VendorInstance.findOne({
            where: {
                id: id,
            }
        }) as unknown as VendorAttributes;

        if(isExistVendor) {
            const createfood = await FoodInstance.create({
                id: fooduuid,
                name,
                image: req.file.path,
                price,
                foodType,
                readyTime,
                description,
                category,
                rating: 0,
                vendorId: id,
            }) as unknown as FoodAttributes;
            return res.status(200).json({
                message: "successfully created food",
                createfood,
            });
        }
        return res.status(400).json({
            Error: "not authorised"
         })

    } catch(error) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/create-food"
         });
    }
}

export const GetAllVendors = async (req: Request, res: Response) => {
   try {
     
     const Vendor = await VendorInstance.findAndCountAll({
     }) 
 
     return res.status(200).json({
       vendor: Vendor.rows,
     });
   } catch (err) {
     res.status(500).json({
       Error: "Internal server Error",
       route: "/vendors/get-profile",
     });
   }
 };
 

 /**
 * =========================== Get Vendor Profile ================================
 */

export const vendorProfile = async(req:JwtPayload, res:Response) => {
    try {
        const { id } = req.vendor;

        //check if vendor exist
         const Vendor = await VendorInstance.findOne({
            where: {
               id: id,
            },
            attributes:[
               "id",
               "name",
               "pincode",
               "phone",
               "email",
               "serviceAvailable",
               "rating"
            ],
            include:[
               {
                  model:FoodInstance,
                  as: 'food',
                  attributes:["id","description","category","price","foodType","readyTime","name","rating","vendorId"]
               }
            ]
         }) as unknown as VendorAttributes;

         return res.status(200).json({
            message: "Vendor successfully fetched",
            Vendor,
         })
        

    } catch(error) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/get-profile"
         });
    }
}

 /**
 * ===========================Vendor Delete Food ================================
 */

  export const updateVendorProfile = async(req:JwtPayload, res:Response) => {
   try {
      const { id } = req.vendor;
      const { name, coverImage, address, phone} = req.body;

      const { error } = updateVendorSchema.validate(req.body, option);

      if(error) return res.status(400).json({Error: error.details[0].message});

      const Vendor = await VendorInstance.findOne({
         where: {id: id},
      }) as unknown as JwtPayload
      if(!Vendor) return res.status(401).json({ Error: "Not authorized to update profile "});

      const updateVendor = await VendorInstance.update({
         name,
         address,
         phone,
         coverImage: req.file.path,
      },
      {
         where: { id: id }
      })as unknown as VendorAttributes

      if(updateVendor) {
         const vendor = await VendorInstance.findOne({
            where: { id: id},
            // attributes: ["firstName","coverImage","lastName","email","address","phone","verified","role"]
         }) as unknown as VendorAttributes;

         return res.status(200).json({
            message: "profile successfully update",
            vendor,
         })
      }
      // return res.status(200).json({
      //    message: "profile successfully update",
      //    updateUser,
      // })

   }catch(error) {
      return res.status(500).json({
         Error: "Internal error occoured",
         route: "patch/vendors/update-vendor"
      })
   }
}

 /**
 * =========================== Vendor Delete Food ================================
 */

export const deleteFood = async(req:JwtPayload, res:Response) => {
    try {
         const { id } = req.vendor;
         const foodid = req.params.foodId

         const Vendor = await VendorInstance.findOne({
            where: {
               id: id,
               // attribute: [""]
            },
         })

        //check if vendor exist
        if(Vendor) {
            const deletedfood = await FoodInstance.destroy({
               where: {
                  id: foodid,
               },
            }) as unknown as FoodAttributes;

            
            
            // const deletedfood = 


            return res.status(200).json({
               message: "Deleted successfully",
               deletedfood,
            })
         }

         return res.status(400).json({
            message: "unauthorized",
            route: "/vendors/delete-food/"
         })
        
        

    } catch(error) {
        return res.status(500).json({
            Error: "Internal server Error",
            route: "/vendors/delete-food"
         });
    }
}


export const GetFoodByVendor = async (req: Request, res: Response) => {
   try {
     const id = req.params.id;
     // check if the vendor exist
     const Vendor = (await VendorInstance.findOne({
       where: { id: id },
       include: [
         {
           model: FoodInstance,
           as: "food",
           attributes: [
             "id",
             "name",
             "description",
             "category",
             "foodType",
             "readyTime",
             "price",
             "image",
             "rating",
             "vendorId",
           ],
         },
       ],
     })) as unknown as VendorAttributes;
     return res.status(200).json({
       Vendor,
     });
   } catch (err) {
     res.status(500).json({
       Error: "Internal server Error",
       route: "/vendors/get-profile",
     });
   }
 };
