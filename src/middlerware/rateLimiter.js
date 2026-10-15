import {checkRateLimit} from "../services/slidingWindow.js";
import {logEvent} from "../utils/logger.js";

export function createRateLimiter({
    redisClient, limit,windowMs,keyGenerator,
    policyName
}){
    if(!Number.isInteger(limit) || limit <= 0 ||
     !Number.isInteger(windowMs) || windowMs <= 0){
       throw new Error("Invalid limit or windowMs value for rate limiter");
     }
    return async (req,res,next) =>{
        let key;
        try{
            key = keyGenerator(req);
            if(typeof key !== "string" || !key){
                throw new Error("Invalid rate-limit key");
            }
            const result = await checkRateLimit(redisClient,
                'rate-limit:policyName:{key}',limit,windowMs
            )
            if(!result.allowed){
                const retryAfter = Math.max(1,Math.ceil(result.retryAfterMs/1000))
                res.set("Retry-After",String(retryAfter))
                logEvent("warn","rate-limit-exceeded",{key,policy:policyName,path:req.path,limit,retryAfter})
                return res.status(429).json({
                    error:"Too many requests",
                    message:`Rate limit exceeded for ${policyName}. Try again in ${retryAfter} seconds`,
                    retryAfter
                })
            }
            return next();
        }catch(error){
            logEvent("error","rate-limit-check-failed",{error:error.message,policy:policyName})
            return res.status(530).json({
                success:false,
                message:"Rate limit check failed. Please try again later"
            })
        }
    }
}