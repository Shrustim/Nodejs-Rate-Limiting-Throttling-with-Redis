import express from 'express';
import {prisma} from '../../config/database.js';

 const router = express.Router();
 router.get("/db", async(req, res) => {
    try{
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: 'ok',
            database:'up'
        })

    }catch(error){
        res.status(503).json({
            status:"error",
            database: "down"
        })
    }
 })
 export default router;