import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://127.0.0.1:8001'

export default function App() {
  const [urls, setUrls] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  useEffect(() => { fetchUrls() }, [])

  async function fetchUrls() {
    try {
      const res = await fetch(`${API}/urls`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setUrls(await res.json())
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function shorten(e) {
    e.preventDefault()
    if (!input.trim()) return
    setError(null)
    try {
      const res = await fetch(`${API}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        const msg = Array.isArray(err.detail) ? err.detail[0]?.msg : err.detail
        throw new Error(msg || `HTTP ${res.status}`)
      }
      const created = await res.json()
      setUrls((prev) => [created, ...prev])
      setInput('')
    } catch (e) { setError(e.message) }
  }

  async function deleteUrl(code) {
    try {
      const res = await fetch(`${API}/urls/${code}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setUrls((prev) => prev.filter((u) => u.short_code !== code))
    } catch (e) { setError(e.message) }
  }

  async function copyToClipboard(code) {
    await navigator.clipboard.writeText(`${API}/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="app">
      <div className="card">
        <header className="header">
          <h1>🔗 Link Shortener</h1>
          <p className="subtitle">Paste a long URL, get a short one</p>
        </header>

        <form onSubmit={shorten} className="add-form">
          <input
            className="add-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/very/long/url"
          />
          <button type="submit" className="add-btn">Shorten</button>
        </form>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <p className="empty">Loading…</p>
        ) : urls.length === 0 ? (
          <p className="empty">🌱 No links yet. Shorten your first URL above!</p>
        ) : (
          <ul className="list">
            {urls.map((u) => (
              <li key={u.id} className="item">
                <div className="item-main">
                  <a
                    href={`${API}/${u.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="short-code"
                  >
                    /{u.short_code}
                  </a>
                  <p className="original" title={u.original_url}>
                    {u.original_url}
                  </p>
                  <span className="clicks">👁 {u.clicks} clicks</span>
                </div>
                <div className="actions">
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(u.short_code)}
                  >
                    {copied === u.short_code ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    className="delete"
                    onClick={() => deleteUrl(u.short_code)}
                    aria-label="Delete"
                  >×</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}