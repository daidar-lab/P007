import { useEffect, useRef } from 'react'
import Button from './Button.jsx'
import { Camera, Image, Close } from './Icon.jsx'
import './PhotoUploader.css'

export default function PhotoUploader({ value = [], onChange, max = 10 }) {
  const galRef = useRef(null)
  const camRef = useRef(null)

  useEffect(() => {
    return () => {
      value.forEach(p => URL.revokeObjectURL(p.src))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return
    const room = Math.max(0, max - value.length)
    const accepted = Array.from(fileList).slice(0, room).map(file => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      src: URL.createObjectURL(file),
      file,
    }))
    if (accepted.length === 0) return
    onChange([...value, ...accepted])
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

  return (
    <div className="photo-uploader">
      <div className="photo-uploader__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={openCamera}
          icon={<Camera width={18} height={18} />}
          disabled={reachedLimit}
        >
          Câmera
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={openGallery}
          icon={<Image width={18} height={18} />}
          disabled={reachedLimit}
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

      {value.length === 0 ? (
        <div className="photo-uploader__empty">
          <span className="photo-uploader__empty-icon">
            <Image width={22} height={22} />
          </span>
          <p className="photo-uploader__empty-title">Nenhuma foto adicionada</p>
          <p className="photo-uploader__empty-hint">
            Você pode adicionar até {max} fotos da galeria ou tirar na hora.
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
        </ul>
      )}

      {value.length > 0 && (
        <p className="photo-uploader__meta">
          {value.length} de {max} {value.length === 1 ? 'foto' : 'fotos'}
        </p>
      )}
    </div>
  )
}
