/**
 * SafeArea.jsx — Phase 3 hardened
 *
 * ── Improvements ──────────────────────────────────────────────────────────
 *   - Uses both min-height AND height: 100dvh to fix iOS PWA launch
 *     where the viewport briefly shows as shorter than expected.
 *   - overflow-x: hidden prevents horizontal bleed from animations.
 *   - scrollable prop allows internal vertical scroll (settings screen).
 */

export function SafeArea({ children, className = '', scrollable = false }) {
  return (
    <div
      className={`
        relative w-full flex flex-col
        ${scrollable ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}
        ${className}
      `}
      style={{
        // dvh accounts for mobile browser chrome dynamically
        minHeight: '100dvh',
        height:    '100dvh',
        // Safe area insets for notch / Dynamic Island / home bar
        paddingTop:    'env(safe-area-inset-top,    0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft:   'env(safe-area-inset-left,   0px)',
        paddingRight:  'env(safe-area-inset-right,  0px)',
      }}
    >
      {children}
    </div>
  )
}
