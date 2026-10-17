import express from 'express'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const app = express()
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('select 1')
    res.json({ ok: true })
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message })
  }
})

app.get('/api/items', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'select id, title, created_at from items order by created_at desc, id desc'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

app.post('/api/items', async (req, res, next) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  if (!title) return res.status(400).json({ error: 'title is required' })

  try {
    const { rows } = await pool.query(
      'insert into items (title) values ($1) returning id, title, created_at',
      [title]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    next(err)
  }
})

app.delete('/api/items/:id', async (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' })

  try {
    const { rowCount } = await pool.query('delete from items where id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'not found' })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'internal error' })
})

const port = Number(process.env.PORT || 8000)
app.listen(port, '0.0.0.0', () => {
  console.log(`api listening on ${port}`)
})
