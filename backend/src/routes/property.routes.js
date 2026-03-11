import express from "express";

import authenticate from "../middleware/authenticate.js";

import authorizeRole from "../middleware/authorizeRole.js";

import upload from "../middleware/upload.js";

import {

addProperty,

getAllProperties,

getPropertyDetails

} from "../controllers/property.controller.js";


const router = express.Router();


// PUBLIC
router.get("/", getAllProperties);

router.get("/:id", getPropertyDetails);


// ADMIN ONLY
router.post(

"/",

authenticate,

authorizeRole("ADMIN"),

upload.array("images", 10),

addProperty

);


export default router;