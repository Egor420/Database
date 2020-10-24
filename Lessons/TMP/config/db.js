const { Pool } = require('pg')
const pool = new Pool(
    {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        max: 1,
    }
)


//экспорт объекта pool для работы в других файлах
module.exports = pool