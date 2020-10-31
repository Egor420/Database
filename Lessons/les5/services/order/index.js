const pool = require('../../config/db')

/**
 * Возвращает заказы по id клиента
 * @param {number} id 
 */
async function findOrderByClientID(id) {
    const { rows }=await pool.query(`
    SELECT id, client_id, created_at
    FROM order_
    WHERE client_id = $1
    ORDER BY created_at DESC`,
  [id])
  return rows
}

/**
 * 
 * @param {number} id ID клиента 
 * @param {Array.<{menu_id:Number, count: Number}>} название продукта и его количество
 */
async function makeOrder(id, order) {
    let pgclient = await pool.connect()
    try{
        await pgclient.query('BEGIN')
        const { rows } =await pgclient.query(`
        INSERT INTO order_ (client_id) VALUES ($1) RETURNING id`, [id])
        const orderID =rows[0].id
        
        //Цикл для подготовки запроса на цену
        let params = []//параметры для IN [$1 $2 $3]
        let values = [] //[1 2 3]
        for (const [i,item] of order.entries()) {
            params.push(`$${i+1}`)
            values.push(item.menu_id)
        }
        const { rows: costQueryRes } = await pgclient.query(`
        SELECT id, price::numeric
        FROM menu
        WHERE id IN (${params.join(',')})
        `,values)
        
        let orderWithCost = []
        for (const item of order) {
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
    } catch (err) {
        await pgclient.query('ROLLBACK')
        throw err
    } finally {await pgclient.release()}


}

module.exports = {
    findOrderByClientID,
    makeOrder,
}