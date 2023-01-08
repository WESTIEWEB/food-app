import { DataTypes, Model } from 'sequelize'
import {v4 as uuidv4 } from 'uuid';
import {db} from '../config'
import { FoodInstance } from './foodModel'

export interface VendorAttributes{
    id: string;
    name: string;
    pincode: string;
    phone: string;
    restaurantName: string;
    address:string;
    email:string;
    password:string;
    salt:string;
    coverImage:string;
    serviceAvailable:boolean;
    rating:number;
    role:string;
}

export class VendorInstance extends Model<VendorAttributes>{}

VendorInstance.init({
    id: {
        type:DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type:DataTypes.STRING,
        allowNull:true,

    },
    email: {
        type:DataTypes.STRING,
        allowNull: false,
        unique:true,
        validate: {
            notNull: {
                msg: 'Email address is required'
            },
            isEmail: {
                msg: "please provide only valid email"
            }
        }
    },
    restaurantName: {
        type:DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'owner name is required'
            },
            notEmpty: {
                msg: 'provide a name'
            }
        }
    },
    pincode: {
        type:DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            notNull: {
                msg: "password is required"
            },
            notEmpty: {
                msg: "provide a password",
            },
        }
    },
    salt: {
        type:DataTypes.STRING,
        allowNull:false,
    },
    address: {
        type:DataTypes.STRING,
        allowNull:true,
    },
    phone: {
        type:DataTypes.STRING,
        allowNull:false,
        unique: true,
        validate: {
            notNull:{
                msg: "phone number is required"
            },
            notEmpty: {
                msg: "provide a phone number",
            },
        }
    },
    serviceAvailable: {
        type:DataTypes.BOOLEAN,
        allowNull:true,
    },
    rating: {
        type:DataTypes.NUMBER,
        allowNull:true,
    },
    coverImage: {
        type:DataTypes.STRING,
        allowNull:true,
    },
    role: {
        type:DataTypes.STRING,
        allowNull:true,
    },
},
    {
        sequelize:db,
        tableName: 'vendor'
    }
);


VendorInstance.hasMany(FoodInstance, {
    foreignKey: 'vendorId',
    as: 'food'
})

FoodInstance.belongsTo(VendorInstance, { 
    foreignKey: 'vendorId', 
    as: 'vendor'
})