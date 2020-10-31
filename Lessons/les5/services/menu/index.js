const pool = require('../../config/db')

/**
 * @param {string} name
 */
async function findMenu(name) {
  let query = `
  SELECT *
  FROM menu
  WHERE 1=1
  `
  const values = []

  if (name) {
    query += 'AND name ILIKE $1'
    values.push(`%${name}%`)
  }
//решить проблему, с $1 <- параметром

  const { rows } = await pool.query(query, values)
  return rows
}

module.exports = {
  findMenu,
}