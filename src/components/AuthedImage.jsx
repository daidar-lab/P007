import { useEffect, useState } from 'react'
import { getToken, clearSession } from '../lib/auth.js'

/*
 * <img> comum não envia Authorization automaticamente.
 * Este componente baixa a imagem via fetch (com Bearer token) e exibe
 * através de uma object URL temporária, que é revogada no unmount.
 */
export default function AuthedImage({ src, alt = '', className = '', onClick, ...rest }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ok | error

  useEffect(() => {
    let cancelled = false
    let created = null
    setStatus('loading')
    setBlobUrl(null)

    const token = getToken()
    fetch(src, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        if (res.status === 401) {
          clearSession()
          throw new Error('unauthorized')
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then(blob => {
        if (cancelled) return
        created = URL.createObjectURL(blob)
        setBlobUrl(created)
        setStatus('ok')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
    }
  }, [src])

  if (status === 'error') {
    return (
      <div className={`authed-image authed-image--error ${className}`} {...rest}>
        <span>—</span>
      </div>
    )
  }

  if (status !== 'ok' || !blobUrl) {
    return <div className={`authed-image authed-image--loading ${className}`} {...rest} />
  }

  return (
    <img
      src={blobUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      {...rest}
    />
  )
}
