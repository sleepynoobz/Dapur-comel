/**
 * KitchenBg.jsx — wrapper used in the cooking scene
 * Now delegates to the illustrated KitchenScene SVG background.
 */

import { memo } from 'react'
import { KitchenScene } from '../../components/ui/KitchenScene.jsx'

export const KitchenBg = memo(function KitchenBg({ recipe }) {
  return <KitchenScene className="kitchen-bg" style={{ position: 'absolute', inset: 0 }} />
})
