import  {createClient} from 'redis';
export const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient.on('error', (err) => console.log('Redis Client Error', err.message));

export async function connectRedis(){
    if(!redisClient.isOpen){
        await redisClient.connect();
    }
}

