import {randomUUID} from "node:crypto";
const SLIDING_WINDOW_SCRIPT = `
 local key = KEYS[1]
 local limit = tonumber(ARGV[1])
 local windowMs = tonumber(ARGV[2])
 local member = ARGV[3]

 -- Use Redis server time 
 local time = redis.call("TIME")
 local now = time[1] * 1000 + math.floor(time[2]/1000)
 local cutoff = now - windowMs

 -- Remove requests outside the window
 redis.call("ZREMRANGEBYSCORE", key, '-inf', cutoff)
 
 --Count requests inside the window
 local count = redis.call("ZCARD", key)
 
 if count < limit then 
   -- Record this allowed request 
   redis.call("ZADD", key, now, member)
   -- Remove inactive keys automatically 
   redis.call("PEXPIRE", key, windowMs)
   return {1,limit - count - 1,0}
 end 

 --Calculating time until the oldest 
 --request leaves the window 
 local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
 local retryMs = math.max(1,math.ceil(oldest[2] + windowMs - now))
 return {0,0,retryMs}

 `;
 export async function checkRateLimit(redisClient,key,limit,windowMs){
    const result = await redisClient.eval(
        SLIDING_WINDOW_SCRIPT,
        {
            keys:[key],
            arguments:[
                String(limit),
                String(windowMs),
                randomUUID()
            ]
        }
    )
    return {
        allowed: Number(result[0] === 1),
        remaining: Number(result[1]),
        retryAfterMs: Number(result[2])
    }
 }