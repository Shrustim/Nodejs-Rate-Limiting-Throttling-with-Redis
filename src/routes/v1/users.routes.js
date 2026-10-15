import express from 'express';
import { createUser} from "../../services/user.service.js"
import {versionHeaders} from "../../middlerware/versionHeaders.js";


 const router = express.Router();
 router.use(versionHeaders("1.0.0"))
 router.post("/", async(req, res) => {
    try{
        const {name, email, roleName}  = req.body;
        const result = await createUser({name, email, roleName})

        res.status(200).json({
            status: 'ok',
            data:result
        })

    }catch(error){
        res.status(503).json({
            status:"error",
            message: error?.message || "something went wrong"
        })
    }
 })
 export default router;