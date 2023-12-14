var typeorm = require("typeorm")

var dataSource = new typeorm.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "admin",
    database: "test",
    synchronize: true,
    entities: [require("./entity/User"), require("./entity/Event")],
})