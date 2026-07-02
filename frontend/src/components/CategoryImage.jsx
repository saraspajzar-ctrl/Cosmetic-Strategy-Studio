import React from 'react'
import { CategorySVG } from '../categoryImages.jsx'

export default function CategoryImage({ category, size = 80, className = '', style = {} }) {
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 12,
        overflow: 'hidden',
        ...style,
      }}
      aria-hidden="true"
    >
      <CategorySVG category={category} size={size} />
    </span>
  )
}
