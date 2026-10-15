import {Router} from "express";
import { authenticate } from "../../middlerware/authenticate.js";
import { authorize } from "../../middlerware/authorize.js"
import { dashboard } from "../../controllers/admin.controller.js";
import {versionHeaders} from "../../middlerware/versionHeaders.js";

const router = Router();
router.use(versionHeaders("1.0.0"))
router.get("/dashboard",authenticate,authorize("ADMIN"),dashboard);

export default router;