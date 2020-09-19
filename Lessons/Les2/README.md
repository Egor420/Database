nmp init
db-conn
package.json информация о зависимостях, которые мы будем использовать внутри приложения
npm i pg установка pg
index.js - точка входа в проект
const { Client } = require('pg')

pool
пул подключений (для нескольких одновременных подключений)


npm i dotenv


(err, res)=>{
    console.log(err, res)
    client.end()
}
коллбек

res-response
err-ошибка

избегать конкатенацию строк (SQLINJECTION)
