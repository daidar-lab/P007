import './Card.css'

export default function Card({
  as: Tag = 'div',
  padding = 'md',
  elevated = false,
  className = '',
  children,
  ...rest
}) {
  const cls = [
    'card',
    `card--p-${padding}`,
    elevated && 'card--elevated',
    className,
  ].filter(Boolean).join(' ')
  return <Tag className={cls} {...rest}>{children}</Tag>
}
