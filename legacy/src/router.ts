import { useEffect, useState } from 'react'

// Minimaler Hash-Router: #/medikamente, #/mehr/tagebuch, #/krise/sturz …
const read = () => window.location.hash.replace(/^#/, '') || '/heute'

export function useRoute() {
  const [path, setPath] = useState(read)
  useEffect(() => {
    const on = () => {
      setPath(read())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return path
}

export const go = (path: string) => {
  window.location.hash = path
}

export const back = (fallback = '/heute') => {
  if (window.history.length > 1) window.history.back()
  else go(fallback)
}
