import './TextField.css'

export default function TextArea({ rows = 4, className = '', ...rest }) {
  return <textarea rows={rows} className={`textarea ${className}`} {...rest} />
}
