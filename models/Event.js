var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Event",
    tableName: "events",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
        },
        description: {
            type: "varchar",
        },
        start_date: {
            type: "datetime",
        },
        end_date: {
            type: "datetime",
        },
        location: {
            type: "varchar",
        },
        organizer: {
            type: "int",
        },
        attendees: {
            type: "json",
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
