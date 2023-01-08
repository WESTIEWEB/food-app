// import { Cloud_API_KEY, Cloud_NAME, Cloud_SECRET} from '../config'
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { setTextRange } from 'typescript';

const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: process.env.Cloud_Name , 
    api_key: process.env.Cloud_API_KEY, 
    api_secret: process.env.Cloud_API_SECRET,
  });

const storage = new CloudinaryStorage({
    cloudinary,
    params: async(req, file)=>{
        return {
            folder:"FoodAlbums"
        }
    },

});

export const upload = multer({storage:storage})
