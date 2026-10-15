

import {Router} from "express";
import { getProfile } from "../../controllers/profile.controller.js";
import {versionHeaders} from "../../middlerware/versionHeaders.js";


const router = Router();
router.use(versionHeaders("1.0.0"))
router.get("/",getProfile);
export default router;
