/**
 * GameSprite.jsx — renders an open source sprite for a logical name or emoji.
 *
 * Usage:
 *   <GameSprite name="egg" size={80} />
 *   <GameSprite emoji="🥚" size={80} />          // resolves emoji → sprite
 *   <GameSprite name="whisk" size={64} tint="#C98A4B" />
 *
 * Falls back to rendering the emoji as text when no sprite exists, so it is
 * always safe to drop in place of a raw emoji.
 */

import { memo } from 'react'
import { spriteSrc, emojiToSprite } from '../../data/assets.js'

export const GameSprite = memo(function GameSprite({
  name,
  emoji,
  size  = 64,
  tint,
  alt,
  className = '',
  style = {},
}) {
  const key      = name ?? (emoji ? emojiToSprite(emoji) : null)
  const resolved = key ? spriteSrc(key) : null
  const label    = alt ?? key ?? ''

  // No dedicated sprite → fall back to the emoji glyph.
  if (!resolved) {
    return (
      <span
        className={className}
        aria-hidden={alt ? undefined : 'true'}
        aria-label={alt || undefined}
        style={{
          display:    'inline-block',
          fontSize:    size * 0.92,
          lineHeight:  1,
          textAlign:  'center',
          ...style,
        }}
      >
        {emoji ?? ''}
      </span>
    )
  }

  // Single-colour silhouette → CSS mask so we can tint it.
  if (resolved.tint) {
    return (
      <span
        role="img"
        aria-label={label}
        className={className}
        style={{
          display:           'inline-block',
          width:              size,
          height:             size,
          backgroundColor:    tint ?? '#8B5A2B',
          WebkitMaskImage:   `url(${resolved.src})`,
          maskImage:         `url(${resolved.src})`,
          WebkitMaskRepeat:  'no-repeat',
          maskRepeat:        'no-repeat',
          WebkitMaskPosition:'center',
          maskPosition:      'center',
          WebkitMaskSize:    'contain',
          maskSize:          'contain',
          ...style,
        }}
      />
    )
  }

  // Full-colour sprite.
  return (
    <img
      src={resolved.src}
      alt={label}
      width={size}
      height={size}
      className={className}
      draggable={false}
      loading="eager"
      decoding="async"
      style={{ display: 'inline-block', objectFit: 'contain', ...style }}
    />
  )
})
