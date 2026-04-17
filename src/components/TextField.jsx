import './TextField.css'

export default function TextField({ type = 'text', className = '', ...rest }) {
  return <input type={type} className={`textfield ${className}`} {...rest} />
}
