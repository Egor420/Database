require('dotenv').config()
const express = require('express')
const pool = require('./config/db')
const app = express()

app.route('/now').get(async (req, res) => {
    const pgclient = await pool.connect()
    const { rows }=await pgclient.query('SELECT now() as now')
    await pgclient.release()
    res.send(rows[0].now)
})

app.route('/user_order/:id').get(async (req,res) => {
    
    let pgclient
    try {
    //id from URL
    pgclient = await pool.connect()
    const { id }=req.params
    const { rows } =await pgclient.query(`SELECT id, client_id, created_at
    FROM public.order_
    WHERE client_id = $1
    ORDER BY created_at DESC`,[id])
    res.send(rows)
    }catch (err){
res.status(500).send({
    error: err.message
})
    } finally {
        await pgclient.release()
        console.log('close db connection')
    }
})

app.route('/make_order/:id').post(async (req, res) => {
    let pgclient
    try{
    pgclient = await pool.connect()
    const { id }=req.params
    const { rows } =await pgclient.query(`
    INSERT INTO order_ (client_id) VALUES ($1) RETURNING id
    `, [id])
    const orderID =rows[0].id
    res.send({
        order_id: orderID
    })
} catch (err){
    res.status(500).send({
        error: err.message
    })
        } finally {
            await pgclient.release()
            console.log('close db connection')
        }
    })
app.listen(8080, (r)=>{
    console.log('Server started (http://localhost:8080)')
})