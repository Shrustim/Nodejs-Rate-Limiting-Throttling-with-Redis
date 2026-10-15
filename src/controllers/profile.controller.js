import { userRepository } from "../repositories/user.repository.js";
export async function getProfile(req,res,next){
    try{
      const user = await userRepository.findById(req.auth.userId);
      if(!user){
        return res.status(404).json({message:"User not found"});
      }
      const roles = user.roles.map((userRole) => userRole.role.name);
      return res.status(200).json({id:user.id,name:user.name,email:user.email,roles})
    }catch(error){

    }
}