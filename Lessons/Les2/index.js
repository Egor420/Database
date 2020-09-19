//загрузка .env в process.env
require('dotenv').config()
const {Client}=require('pg')
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})


// client.connect()
// client.query(`
// SELECT *
// FROM CLIENT
// WHERE ID =1
// `,(err, res)=>{
//     console.log(err, res)
//     client.end()
// })
// console.log(1)

const id=1

client
.query(`
SELECT *
// FROM CLIENT
// WHERE ID =$1
`, [id])
.then(result => console.log(result))
.catch(e=>console.error(e.stack))
.then(()=>client.end())
