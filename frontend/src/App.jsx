import { useEffect, useState } from 'react'

export default function App() {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadItems() {
    try {
      const res = await fetch('/api/items')
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
      setItems(await res.json())
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function addItem(event) {
    event.preventDefault()
    const value = title.trim()
    if (!value) return

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: value }),
    })
    if (!res.ok) {
      setError(`Could not add item (${res.status})`)
      return
    }
    setTitle('')
    setError('')
    await loadItems()
  }

  async function deleteItem(id) {
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 404) {
      setError(`Could not delete item (${res.status})`)
      return
    }
    setError('')
    await loadItems()
  }

  return (
    <main className="page">
      <header className="header">
        <h1>AIO3 Starter</h1>
        <p className="subtitle">React + Vite front end, Express API, PostgreSQL — all in Docker.</p>
      </header>

      <form className="add-form" onSubmit={addItem}>
        <input
          className="input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New item title"
          aria-label="New item title"
        />
        <button className="button" type="submit">
          Add item
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="muted">No items yet.</p>
      ) : (
        <ul className="item-list">
          {items.map((item) => (
            <li className="item" key={item.id}>
              <span className="item-title">{item.title}</span>
              <button
                className="button ghost"
                type="button"
                onClick={() => deleteItem(item.id)}
                aria-label={`Delete ${item.title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
