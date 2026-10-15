import {prisma} from "../config/database.js";
export const userRepository = {
    create( data, db = prisma ){
        return db.user.create({
            data: data
        });
    },
    findByEmail( email, db = prisma ){
        return db.user.findUnique({
            where: {
                email: email
            },
            include:{
                roles:{
                    include:{
                        role:true
                    }
                }
            }
        });
    },
    findById( id, db = prisma ){
        return db.user.findUnique({
            where: {
                id: id
            },
             include:{
                roles:{
                    include:{
                        role:true
                    }
                }
            }
        });
    },
    findAll( db = prisma ){
        return db.user.findMany(
            {
               include:{
                roles:{
                    include:{
                        role:true
                    }
                }
            },
            orderBy:{
                createdAt: 'desc'
            }
            }
        );
    },
    
    // assignRole( userId, roleId, db = prisma ){
    //     return db.user.update({
    //         where: {
    //             id: userId
    //         },
    //         data: {
    //             roles: {
    //                 connect: {
    //                     id: roleId
    //                 }
    //             }
    //         }
    //     });
    // },
    assignRole(userId, roleId, db = prisma) {
            return db.userRole.create({
            data: {
                userId,
                roleId,
            },
            });
        },


}