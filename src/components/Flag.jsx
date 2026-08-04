import { getFlagUrl, getCurrencyBadge } from '../data/flags'

export default function Flag({ code, size = 'md', className = '' }) {
  const flagUrl = getFlagUrl(code) || getCurrencyBadge(code)
  const sizeClasses = {
    sm: 'h-3.5 w-5',
    md: 'h-4 w-6',
    lg: 'h-5 w-8',
    xl: 'h-6 w-8',
  }
  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <img
      src={flagUrl}
      alt={`${code} flag`}
      className={`${sizeClass} flex-shrink-0 object-contain ${className}`}
      loading="lazy"
      onError={(e) => { e.currentTarget.src = getCurrencyBadge(code) }}
    />
  )
}