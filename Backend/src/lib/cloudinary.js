import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: "dxqxfiv0t",
  api_key: "321129382968492",
  api_secret: "4DSxkFMS3gHnLWk-77XFsS-J7Fw",
});

export default cloudinary;
