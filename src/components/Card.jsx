import React from 'react'

export default function Card({ as: Tag = 'div', children, className = '', interactive = false, ...rest }) {
  return (
    <Tag
      {...rest}
      className={[
        'bg-white rounded-card shadow-card',
        interactive ? 'active:scale-[0.99] transition-transform cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
