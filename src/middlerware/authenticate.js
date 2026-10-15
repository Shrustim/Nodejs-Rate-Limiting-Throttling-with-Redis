import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
export function authenticate(req,res,next){
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({
         message: "Authentication required"
        })
    }
    const [scheme, token] = header.split(" ");
    if(scheme !== "Bearer" || !token){
        return res.status(401).json({message:"Authentication required"});
    }
    try{
        const payload = jwt.verify(token,process.env.JWT_ACCESS_SECRET,{
            algorithms: ["HS256"]
        });
        if(typeof payload !== "object" || !payload.sub){
            return res.status(401).json({
                message:"Invalid access token"
            })  
        }
        req.auth = {
            userId: Number(payload.sub),
            roles:Array.isArray(payload.roles) ? payload.roles :[]
        }
       next();
    }catch(error){
        return res.status(401).json({
            message:"Invalid or expired access token"
        })

    }
}
const partnerTokens = new Set([
  "partner-token-123",
  "partner-token-456",
]);

export function requirePartner(req, res, next) {
  const token = req.get("X-API-Key");

  if (!token || !partnerTokens.has(token)) {
    return res.sendStatus(401);
  }

  // Hash the token before using it as a Redis key
  req.tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  next();
}
