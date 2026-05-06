import { useEffect, useRef, useState } from 'react'
import Button from './Button.jsx'
import { Camera, Image, Close } from './Icon.jsx'
import { resizeImage } from '../lib/imageResize.js'
import './PhotoUploader.css'

export default function PhotoUploader({ value = [], onChange, max = 10 }) {
  const galRef = useRef(null)
  const camRef = useRef(null)
  const [processing, setProcessing] = useState(0) // quantas estão sendo redimensionadas

  useEffect(() => {
    return () => {
      value.forEach(p => URL.revokeObjectURL(p.src))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return
    const room = Math.max(0, max - value.length)
    const incoming = Array.from(fileList).slice(0, room)
    if (incoming.length === 0) return

    setProcessing(p => p + incoming.length)
    try {
      const accepted = await Promise.all(incoming.map(async (raw) => {
        const file = await resizeImage(raw)
        return {
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          src:  URL.createObjectURL(file),
          file,
        }
      }))
      onChange([...value, ...accepted])
    } finally {
      setProcessing(p => Math.max(0, p - incoming.length))
    }
  }

  const remove = (id) => {
    const next = []
    value.forEach(p => {
      if (p.id === id) URL.revokeObjectURL(p.src)
      else next.push(p)
    })
    onChange(next)
  }

  const openCamera = () => camRef.current?.click()
  const openGallery = () => galRef.current?.click()

  const onPick = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const reachedLimit = value.length >= max
  const busy = processing > 0

  return (
    <div className="photo-uploader">
      <div className="photo-uploader__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={openCamera}
          icon={busy ? <span className="spinner" aria-hidden="true" /> : <Camera width={18} height={18} />}
          disabled={reachedLimit || busy}
        >
          Câmera
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={openGallery}
          icon={busy ? <span className="spinner" aria-hidden="true" /> : <Image width={18} height={18} />}
          disabled={reachedLimit || busy}
        >
          Galeria
        </Button>
      </div>

      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={onPick}
        className="photo-uploader__input"
      />
      <input
        ref={galRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPick}
        className="photo-uploader__input"
      />

      {value.length === 0 && !busy ? (
        <div className="photo-uploader__empty">
          <span className="photo-uploader__empty-icon">
            <Image width={22} height={22} />
          </span>
          <p className="photo-uploader__empty-title">Nenhuma foto adicionada</p>
          <p className="photo-uploader__empty-hint">
            Você pode adicionar até {max} fotos da galeria ou tirar na hora.
            Imagens grandes são automaticamente redimensionadas.
          </p>
        </div>
      ) : (
        <ul className="photo-grid">
          {value.map(p => (
            <li key={p.id} className="photo-thumb">
              <img src={p.src} alt={p.name} />
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Remover ${p.name}`}
                className="photo-thumb__remove"
              >
                <Close width={14} height={14} />
              </button>
            </li>
          ))}
          {busy && Array.from({ length: processing }).map((_, i) => (
            <li key={`processing-${i}`} className="photo-thumb photo-thumb--processing" aria-label="Otimizando…" />
          ))}
        </ul>
      )}

      {(value.length > 0 || busy) && (
        <p className="photo-uploader__meta">
          {busy
            ? `Otimizando ${processing} ${processing === 1 ? 'foto' : 'fotos'}…`
            : `${value.length} de ${max} ${value.length === 1 ? 'foto' : 'fotos'}`}
        </p>
      )}
    </div>
  )
}
