import { Search } from './Icon.jsx'
import './SearchBar.css'

export default function SearchBar({ placeholder = 'Buscar', value, onChange }) {
  return (
    <label className="searchbar">
      <Search className="searchbar__icon" width={18} height={18} />
      <input
        className="searchbar__input"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </label>
  )
}
