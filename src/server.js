import 'dotenv/config';
import { createApp } from './app.js';
import { prisma } from './config/database.js'
import {redisClient, connectRedis} from './config/redis.js';

async function startServer(){
    await connectRedis();
    const app = createApp(redisClient);
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
    async function shutdown(signal){
        console.log(`Received ${signal}. Closing server...`);
        server.close(async() => {
            console.log('Server closed');
            await prisma.$disconnect();
            console.log('Database connection closed');
            process.exit(0);
        })
    }
    process.on('SIGINT', () => shutdown('SIGNINT'));
    process.on('SIGTERM', () => shutdown('SIGNTERM'));
}
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
