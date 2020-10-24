require('dotenv').config()
const express = require('express')
const pool = require('./config/db')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
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
    let pgclient = await pool.connect()
    try{
    const { id }=req.params
    await pgclient.query('BEGIN')
    const { rows } =await pgclient.query(`
    INSERT INTO order_ (client_id) VALUES ($1) RETURNING id`, [id])
    const orderID =rows[0].id

    //Цикл для подготовки запроса на цену
    let params = []//параметры для IN [$1 $2 $3]
    let values = [] //[1 2 3]
    for (const [i,item] of req.body.entries()) {
        params.push(`$${i+1}`)
        values.push(item.menu_id)
    
    }
    const { rows: costQueryRes } = await pgclient.query(`
    SELECT id, price::numeric
    FROM menu
    WHERE id IN (${params.join(',')})
    `,values)
    
    let orderWithCost = []
    for (item of req.body) {
        let cost = null
        for (const i of costQueryRes){
            if (i.id ==item.menu_id){
                cost = i.price
            }
        }
    
    if (!cost) {
        throw new Error(`Not found in menu: ${item.menu_id}`)
    }
    orderWithCost.push({
        ... item,
        cost : cost* item.count
    })
    }

    let promises = []
    for (const item of orderWithCost) {
      promises.push(pgclient.query(
        `INSERT INTO order_menu (order_id, menu_id, count, price) 
          VALUES ($1, $2, $3, $4);`,
        [orderID, item.menu_id, item.count, item.cost]
      ))
    }

    await Promise.all(promises)

    await pgclient.query('COMMIT')
    res.send({
        order_id: orderID
    })
} catch (err){
    await pgclient.query('ROLLBACK')
    res.status(500).send({
        error: err.message
    })
        } finally {
            await pgclient.release()
            console.log('close db connection')
        }
    })

app.route('/sign_up').post(async (req,res)=>{
    const {
        name,
        address,
        phone,
        email,
        password
    } =req.body

    let pgclient = await pool.connect()
    try {
        const { rows } = await pgclient.query(`
    INSERT INTO client (name, address, phone, email, password)
    VALUES ($1,$2,$3,$4,$5) RETURNING id;
    `,[name, address, phone, email, password])
res.send({
    id: rows[0].id
  })
} catch (err) {
  res.status(500).send({
    error: err.message
  })
  console.error(err)
} finally {
  // освобождаем соединение с postgresql
  await pgclient.release()
}
})


app.listen(8080, (r)=>{
    console.log('Server started (http://localhost:8080)')
})