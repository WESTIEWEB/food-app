import { DataTypes, Model } from 'sequelize'
import {v4 as uuidv4 } from 'uuid';
import {db} from '../config'

export interface UserAttributes{
    id: string;
    email:string;
    password:string;
    firstName: string;
    lastName: string;
    salt:string;
    address:string;
    phone: string;
    otp: number;
    otp_expiry: Date;
    lng:number;
    lat: number;
    verified:boolean;
    role:string;
}

export class UserIstance extends Model<UserAttributes>{}

UserIstance.init({
    id: {
        type:DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
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
    firstName: {
        type:DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
        type:DataTypes.STRING,
        allowNull: true,
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
    otp: {
        type:DataTypes.NUMBER,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Otp is required"
            },
            notEmpty: {
                msg: "provdide an Otp",
            },
        }
    },
    otp_expiry: {
        type:DataTypes.DATE,
        allowNull:false,
        validate: {
            notNull: {
                msg: "Otp expired",
            },
            notEmpty: {
                msg: "provdide an Otp",
            },
        }
    },
    lat: {
        type:DataTypes.NUMBER,
        allowNull:true,
    },
    lng: {
        type:DataTypes.NUMBER,
        allowNull:true,
    },
    verified: {
        type:DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
            notNull: {
                msg: "User must be verified",
            },
            notEmpty: {
                msg: "User not verified",
            },
        }
    },
    role: {
        type:DataTypes.STRING,
        allowNull:true,
    },
},
    {
        sequelize:db,
        tableName: 'user'
    }
);