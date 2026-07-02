import { useState, useCallback } from 'react'

const KEY = 'beauty_saved_products'

function readStorage() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') }
  catch { return [] }
}

export function useSavedProducts() {
  const [products, setProducts] = useState(readStorage)

  const save = useCallback((name, form) => {
    const next = [
      ...readStorage(),
      {
        id: Date.now().toString(),
        name: name.trim() || 'Unnamed product',
        form,
        savedAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(KEY, JSON.stringify(next))
    setProducts(next)
  }, [])

  const remove = useCallback((id) => {
    const next = readStorage().filter(p => p.id !== id)
    localStorage.setItem(KEY, JSON.stringify(next))
    setProducts(next)
  }, [])

  return { products, save, remove }
}
