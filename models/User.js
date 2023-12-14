var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
        },
        email: {
            type: "varchar",
        },
        password: {
            type: "varchar",
        },
        role: {
            type: "varchar",
        },
        status: {
            type: "varchar",
        },
        created_at: {
            type: "datetime",
        },
        updated_at: {
            type: "datetime",
        },
    },
})
