require('dotenv').config()
const express = require('express')
const pool = require('./config/db')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const app = express()
const clientService = require('./services/client')
const menuService = require('./services/menu')
const orderService = require('./services/order')
const secret = 'jwt_secret_token'
const authMiddleware = require('./middleware/auth')

app.use(bodyParser.json())
app.route('/now').get(async (req, res) => {
    const pgclient = await pool.connect()
    const { rows }=await pgclient.query('SELECT now() as now')
    await pgclient.release()
    res.send(rows[0].now)
})

/**
 * checkAuth валидирует токен
 * в случае успеха возвращает payLoad
 * @param {*} req 
 */
async function checkAuth(req) {
    const authHeader = req.headers.authorization
  
    let token
    if (authHeader) {
      const h = authHeader.split(' ')
      if (h[0] !== 'Bearer') {
        throw new Error('Allowed only Bearer token')
      }
  
      token = h[1]
    } else {
      throw new Error('Token not found')
    }
  
    // eslint-disable-next-line no-useless-catch
    try {
      return jwt.verify(token, secret)
    } catch (err) {
      throw err
    }
  }

  app.route('/user_order').get(async (req, res) => {
    let tokenPaylod
  try {
    tokenPaylod = await checkAuth(req)
  } catch (err) {
    res.status(401).send({
      error: err.message,
    })
    return
  }

  try {
    const order = await orderService.findOrderByClientID(tokenPaylod.id)
    res.send(order)
  } catch (err) {
    res.status(500).send({
      error: err.message,
    })
  }
  })

  app.route('/make_order/:id').post(async (req, res) => {
    try {
      const { id } = req.params
      const orderID = await orderService.makeOrder(id, req.body)
  
      res.send({
        order_id: orderID,
      })
    } catch (err) {
      res.status(500).send({
        error: err.message,
      })
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

    try {
        const token = await clientService.signUp({name, address, password, phone, email,})
res.send({
    id: token,
  })
} catch (err) {
  res.status(500).send({
    error: err.message,
  })
}
})

app.route('/sign_in').post(async (req,res)=>{
    const { email, password } = req.body

  try {
    const token = await clientService.signIn(email, password)

    res.send({
      token,
    })
  } catch (err) {
    res.status(500).send({
      error: err.message,
    })
  }
})


app.route('/menu').get(async (req, res) => {
    const { name } = req.query
  
    try {
      const menu = await menuService.findMenu(name)
      res.send(menu)
    } catch (err) {
      res.status(500).send({
        error: err.message,
      })
    }
  })