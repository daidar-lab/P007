import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search as SearchIcon, Check, Close } from './Icon.jsx'
import './Combobox.css'

export default function Combobox({
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  searchPlaceholder = 'Buscar…',
  emptyLabel = 'Nenhum resultado',
  clearable = true,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const searchRef = useRef(null)

  const selected = options.find(o => o.value === value)
  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? options.filter(o => o.label.toLowerCase().includes(normalized))
    : options

  useEffect(() => {
    if (!open) return
    const onOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close()
    }
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('pointerdown', onOutside)
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => searchRef.current?.focus(), 20)
    return () => {
      document.removeEventListener('pointerdown', onOutside)
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open])

  const close = () => { setOpen(false); setQuery('') }
  const toggle = () => setOpen(o => !o)

  const select = (opt) => {
    onChange?.(opt.value)
    close()
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange?.('')
    setQuery('')
  }

  return (
    <div ref={rootRef} className={`combobox${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="combobox__trigger"
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`combobox__value${selected ? '' : ' is-placeholder'}`}>
          {selected ? selected.label : placeholder}
        </span>
        {clearable && selected && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Limpar seleção"
            className="combobox__clear"
            onClick={clear}
          >
            <Close width={14} height={14} />
          </span>
        )}
        <ChevronDown className="combobox__chevron" width={18} height={18} />
      </button>

      {open && (
        <div className="combobox__panel" role="listbox">
          <label className="combobox__search">
            <SearchIcon width={16} height={16} />
            <input
              ref={searchRef}
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <ul className="combobox__list">
            {filtered.length === 0 ? (
              <li className="combobox__empty">{emptyLabel}</li>
            ) : filtered.map(opt => {
              const isSelected = opt.value === value
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`combobox__item${isSelected ? ' is-selected' : ''}`}
                    onClick={() => select(opt)}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check width={16} height={16} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
