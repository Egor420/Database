const express = require('express')
const app = express()

app.route('/get').get((req,res)=>{
res.send('Hello world')
})

app.route('/group/:group').get((req,res)=>{
    const group =req.params.group
    res.send(`Hello ${group}`)
})

app.listen(8080, (r)=>{
    console.log('Server started (http://localhost:8080)')
})