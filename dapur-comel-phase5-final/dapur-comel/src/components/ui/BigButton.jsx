/**
 * BigButton.jsx — Phase 4: Visual polish upgrade
 *
 * Enhanced styling aligned with Dapur Comel brand identity.
 * Primary button now has the signature warm orange gradient.
 * All variants refined for toddler-friendly visual weight.
 */

import { useState, useCallback } from 'react'
import { hapticTap } from '../../utils/haptics.js'

const VARIANTS = {
  primary: {
    background: 'linear-gradient(145deg, #FF9A5A 0%, #FF7A3A 100%)',
    color: '#FFFFFF',
    boxShadow: '0 5px 0 #C4521E, 0 8px 20px rgba(232,82,50,0.30)',
    boxShadowPressed: '0 2px 0 #C4521E, 0 4px 10px rgba(232,82,50,0.20)',
  },
  secondary: {
    background: 'linear-gradient(145deg, #6ED4C6 0%, #4AB8AA 100%)',
    color: '#FFFFFF',
    boxShadow: '0 5px 0 #2A8E82, 0 8px 20px rgba(78,184,170,0.25)',
    boxShadowPressed: '0 2px 0 #2A8E82',
  },
  ghost: {
    background: 'transparent',
    color: '#FF8C5A',
    boxShadow: 'inset 0 0 0 3px #FF8C5A',
    boxShadowPressed: 'inset 0 0 0 3px #FF7040',
  },
  danger: {
    background: 'linear-gradient(145deg, #EC6A8C 0%, #D04468 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 0 #A03050, 0 6px 16px rgba(208,68,104,0.25)',
    boxShadowPressed: '0 2px 0 #A03050',
  },
}

const SIZES = {
  sm: { minHeight: 48,  padding: '10px 24px', fontSize: '1.1rem',  gap: 8,  borderRadius: 999 },
  md: { minHeight: 60,  padding: '14px 32px', fontSize: '1.3rem',  gap: 10, borderRadius: 999 },
  lg: { minHeight: 72,  padding: '18px 40px', fontSize: '1.5rem',  gap: 12, borderRadius: 999 },
}

export function BigButton({
  children,
  onClick,
  variant   = 'primary',
  size      = 'md',
  emoji,
  pulse     = false,
  disabled  = false,
  className = '',
  type      = 'button',
  'aria-label': ariaLabel,
}) {
  const [pressed, setPressed] = useState(false)

  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size]       ?? SIZES.md

  const handlePointerDown = useCallback((e) => {
    if (disabled || !e.isPrimary) return
    setPressed(true)
    hapticTap()
  }, [disabled])

  const handlePointerUp = useCallback((e) => {
    if (!e.isPrimary) return
    setPressed(false)
  }, [])

  const handleClick = useCallback((e) => {
    if (disabled) return
    onClick?.(e)
  }, [disabled, onClick])

  return (
    <button
      type={type}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={`
        relative inline-flex items-center justify-center
        font-display font-900 select-none outline-none
        transition-all duration-75 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${pulse && !disabled ? 'animate-pulse-glow' : ''}
        ${className}
      `}
      style={{
        minHeight:     s.minHeight,
        padding:       s.padding,
        fontSize:      s.fontSize,
        gap:           s.gap,
        borderRadius:  s.borderRadius,
        background:    v.background,
        color:         v.color,
        boxShadow:     pressed ? v.boxShadowPressed : v.boxShadow,
        transform:     pressed ? 'translateY(3px) scale(0.97)' : 'translateY(0) scale(1)',
        touchAction:   'manipulation',
        letterSpacing: '-0.01em',
        textShadow:    variant === 'primary' || variant === 'secondary' || variant === 'danger'
          ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      {emoji && (
        <span className="leading-none" style={{ fontSize: '1.1em' }} aria-hidden="true">
          {emoji}
        </span>
      )}
      {children}
    </button>
  )
}
