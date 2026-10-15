import {prisma } from "../config/database.js";

export const roleRepository = {
    findByName( name, db =prisma) {
        return db.role.findUnique({
            where: {
                name: name
            }
        });
    },
    findAll( db =prisma){
        return db.role.findMany(
            {
                orderBy: {
                    name: "asc"
                }
            }
        );
    },
    create( data, db =prisma) {
        return db.role.create({
            data: data
        });
    }
}
