import express from 'express';
import cookieParser from 'cookie-parser';
import healthRoutes from './routes/v1/health.routes.js';
import userRoutes from "./routes/v1/users.routes.js";
import profileRoutes from "./routes/v1/profile.routes.js";
import adminRoutes from "./routes/v1/admin.routes.js";
import authRoutes from "./routes/v1/auth.routes.js";
import { errorHandler } from './middlerware/errorHandler.js';
import { acceptVersion } from './middlerware/acceptVersion.js';
import { deprecation } from "./middlerware/deprecation.js";
import swaggerUi  from 'swagger-ui-express';
import swaggerSpec from './config/openapi.js';
import { createRateLimiter } from './middlerware/rateLimiter.js';
import {requirePartner,authenticate}  from "./middlerware/authenticate.js";

export function createApp(redisClient){
const app = express();
app.disable("x-powered-by");
//Only enable proxy trust when the actual development proxy configuration is known
if(process.env.TRUST_PROXY === "true"){
 app.set("trust proxy",1);
}
app.use(express.json());
app.use(cookieParser());
  //IP-based limit
  const publicLimiter = createRateLimiter({
    redisClient,
    limit:5,
    windowMs:60*1000,
    policyName:"public-endpoint",
    keyGenerator:(req)=>{
      return req.ip;
    }
  })
  //Authenticated user-based limit
  const authenticatedLimiter = createRateLimiter({
    redisClient,
    limit:10,
    windowMs:60*1000,
    policyName:"authenticated-endpoint",
    keyGenerator:(req)=>{
      console.log("---",req.auth)
      return `authenticated-${req.auth.userId}`;
    }
  })
  //Validated API-token-based limit
  const apiTokenLimiter = createRateLimiter({
    redisClient,
    limit:8,
    windowMs:60*1000,
    policyName:"api-token-endpoint",
    keyGenerator:(req)=>{
      return req.tokenHash;
    }
  })
  // Health endpoint remains outside the limiter
  app.get("/healthz", (req, res) => {
    res.status(200).json({
      status: "OK",
    });
  });
  app.get(
    "/api/public",
    publicLimiter,
    (req, res) => {
      res.json({
        message: "Public API response",
      });
    }
  );
  app.get(
    "/api/partner",
    requirePartner,
    apiTokenLimiter,
    (req, res) => {
      res.json({
        message: "Partner API response",
      });
    }
  );




app.use('/api/auth',acceptVersion,(req,res,next)=>{
  if(req.apiVersion.startsWith('1.')){
    return authRoutes(req,res,next)
  }
   return res.status(406).json({
    error: 'Unsupported API version',
  });

})
app.use(
  "/api/v1/auth",
  authRoutes
);

app.use('/api/profile',acceptVersion,deprecation({
  deprecationDate: '2026-10-01T00:00:00Z',
  sunsetDate: '2027-03-31T23:59:59Z',
  documentationUrl: 'https://example.com/docs/api-migration',

}),authenticate,authenticatedLimiter,(req,res,next)=>{
  if(req.apiVersion.startsWith('1.')){
    return profileRoutes(req,res,next)
  }
   return res.status(406).json({
    error: 'Unsupported API version',
  });

})
app.use(
  "/api/v1/profile",deprecation({
  deprecationDate: '2026-10-01T00:00:00Z',
  sunsetDate: '2027-03-31T23:59:59Z',
  documentationUrl: 'https://example.com/docs/api-migration',

}),authenticate,authenticatedLimiter,
  profileRoutes
);

app.use(
  "/api/v1/users/me",authenticate,authenticatedLimiter,
  profileRoutes
);
app.use('/api/admin',acceptVersion,(req,res,next)=>{
  if(req.apiVersion.startsWith('1.')){
    return adminRoutes(req,res,next)
  }
   return res.status(406).json({
    error: 'Unsupported API version',
  });

})
app.use(
  "/api/v1/admin",
  adminRoutes
);

app.use('/health', healthRoutes);
app.use('/api/users',acceptVersion,(req,res,next)=>{
  if(req.apiVersion.startsWith('1.')){
    return userRoutes(req,res,next)
  }
   return res.status(406).json({
    error: 'Unsupported API version',
  });

})

app.use('/api/v1/users',userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

  return app;
}