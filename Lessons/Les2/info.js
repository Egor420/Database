const a = {
    first: 1,
    second :2
}
console.log(a.first)
let firstVAR =a.first
const { first: firstA, second: secondA }=a
console.log(firstA)
console.log(secondA)


//const Client = require('pg').Client
//const {Client}=require('pg')

//Переменные окружения
console.log(process.env.PWD)