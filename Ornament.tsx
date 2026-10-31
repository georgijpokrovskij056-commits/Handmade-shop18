import { useId } from 'react'

type StarProps = {
  className?: string
  outline?: boolean
}

function getVerticalStarPoints(centerX: number, centerY: number, outerRadius: number, innerRadius: number) {
  return Array.from({ length: 16 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 16 - Math.PI / 2
    const radius = index % 2 === 0 ? outerRadius : innerRadius
    return `${centerX + Math.cos(angle) * radius},${centerY + Math.sin(angle) * radius}`
  }).join(' ')
}

export function OrnamentStar({ className = '', outline = false }: StarProps) {
  const points = getVerticalStarPoints(50, 50, 46, 22)

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <polygon
        points={points}
        fill={outline ? 'none' : 'currentColor'}
        stroke="currentColor"
        strokeWidth={outline ? 1.2 : 0}
      />
      <rect
        x="42"
        y="42"
        width="16"
        height="16"
        transform="rotate(45 50 50)"
        fill={outline ? 'currentColor' : 'var(--paper, #edece9)'}
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

export function OrnamentBand({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 1200 64" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id={id} width="120" height="64" patternUnits="userSpaceOnUse">
          <path d="M0 4H120M0 60H120" fill="none" stroke="currentColor" strokeWidth="1" />
          <polygon points={getVerticalStarPoints(60, 32, 25, 12)} fill="currentColor" />
          <path d="M60 26L66 32L60 38L54 32Z" fill="var(--paper, #edece9)" />
          <path d="M4 28L10 32L4 36L-2 32ZM110 28L116 32L110 36L104 32Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="1200" height="64" fill={`url(#${id})`} />
    </svg>
  )
}

export function DiamondDivider({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 20" aria-hidden="true">
      <path d="M0 10H90M150 10H240" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M120 1L129 10L120 19L111 10Z" fill="none" stroke="currentColor" />
      <path d="M120 6L124 10L120 14L116 10Z" fill="currentColor" />
      <path d="M98 7L101 10L98 13L95 10ZM142 7L145 10L142 13L139 10Z" fill="currentColor" />
    </svg>
  )
}
