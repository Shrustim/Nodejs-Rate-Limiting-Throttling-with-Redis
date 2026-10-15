import {prisma} from '../config/database.js';
import {userRepository} from '../repositories/user.repository.js';
import {roleRepository }  from "../repositories/role.repository.js";

export async function createUser( {name, email, roleName}){
   return await prisma.$transaction(async (db) => {
        const existingUser = await userRepository.findByEmail(email, db);
        if (existingUser) {
            throw new Error(`User with email ${email} already exists.`);
        }
        const role = await roleRepository.findByName(roleName, db);
        if (!role) {
            throw new Error(`Role with name ${roleName} does not exist.`);
        }
       const user = await userRepository.create({ name, email }, db);
        await userRepository.assignRole(user.id, role.id, db);
        return userRepository.findById(user.id, db);

    });
}

