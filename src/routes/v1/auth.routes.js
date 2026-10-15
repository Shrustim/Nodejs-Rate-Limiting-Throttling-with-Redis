import {Router} from "express";
import {login,refresh} from "../../controllers/auth.controller.js";
import {versionHeaders} from "../../middlerware/versionHeaders.js";

const router = Router();
router.use(versionHeaders("1.0.0"))
router.post("/login",login);
router.post("/refresh",refresh);
export default router;
