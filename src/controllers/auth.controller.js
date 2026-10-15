import {loginUser, refreshSession} from "../services/auth.service.js";

function getRefreshCookieOptions(){
    const days = Number(process.env.REFRESH_TOKEN_DAYS || 7)
    return {
        httpOnly: true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge:days * 24 * 60 * 60 * 1000
    }
}
export async function login(req, res, next){
    try{
      const {email,password} = req.body;
      if(!email || !password){
        return res.status(400).json({message:"Email and password are required"})
      }
      const result = await loginUser(email,password)
      res.cookie("refreshToken",result.refreshToken,
        getRefreshCookieOptions()
      );
      return res.status(200).json({
        accessToken: result.accessToken
      })
    }catch(error){
       next(error);
    }
}
export async function refresh(req,res,next) {
    try{
        const rawRefreshToken = req.cookies.refreshToken;
        const result = await refreshSession(rawRefreshToken);
        res.cookie("refreshToken",result.refreshToken,getRefreshCookieOptions())
        return res.status(200).json({accessToken: result.accessToken});
    }catch(error){
        next(error)
    }
}