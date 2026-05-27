/**
 * GameScreen.jsx — Phase 4: Oyen HUD upgraded, expression per stage
 *
 * Oyen in HUD now uses real asset (sm size).
 * Expression auto-switches to TALKING when voice plays.
 * Expression per stage maps to emotional context.
 */

import { useCallback } from 'react'
import { useGameContext, useProgressContext, useVoiceContext } from '../../App.jsx'
import { STAGE, OYEN_EXPRESSION } from '../../utils/constants.js'
import { ParentGate }   from '../../components/gates/ParentGate.jsx'
import { ProgressDots } from '../../components/ui/ProgressDots.jsx'
import { Oyen }         from '../../components/mascot/Oyen.jsx'

import { GatherStage }   from './stages/GatherStage.jsx'
import { CountStage }    from './stages/CountStage.jsx'
import { MixStage }      from './stages/MixStage.jsx'
import { OvenStage }     from './stages/OvenStage.jsx'
import { DecorateStage } from './stages/DecorateStage.jsx'
import { CelebStage }    from './stages/CelebStage.jsx'

const STAGE_COMPONENTS = {
  [STAGE.GATHER]:    GatherStage,
  [STAGE.COUNT]:     CountStage,
  [STAGE.MIX]:       MixStage,
  [STAGE.OVEN]:      OvenStage,
  [STAGE.DECORATE]:  DecorateStage,
  [STAGE.CELEBRATE]: CelebStage,
}

const STAGE_EXPRESSIONS = {
  [STAGE.GATHER]:    OYEN_EXPRESSION.THINKING,    // "Mana dia?"
  [STAGE.COUNT]:     OYEN_EXPRESSION.ENCOURAGING, // counting along
  [STAGE.MIX]:       OYEN_EXPRESSION.EXCITED,     // "Kacau kacau!"
  [STAGE.OVEN]:      OYEN_EXPRESSION.THINKING,    // waiting, curious
  [STAGE.DECORATE]:  OYEN_EXPRESSION.HAPPY,       // watching decoration
  [STAGE.CELEBRATE]: OYEN_EXPRESSION.PROUD,       // so proud!
}

const STAGE_BG = {
  [STAGE.GATHER]:    'linear-gradient(175deg, #FFF8EC, #FFF0D6)',
  [STAGE.COUNT]:     'linear-gradient(175deg, #F0FFF8, #E0F8EE)',
  [STAGE.MIX]:       'linear-gradient(175deg, #FFF8EC, #FFE8D0)',
  [STAGE.OVEN]:      'linear-gradient(175deg, #FFF5E0, #FFE8CC)',
  [STAGE.DECORATE]:  'linear-gradient(175deg, #FFF0F4, #FFE0EC)',
  [STAGE.CELEBRATE]: 'linear-gradient(175deg, #FFFDE0, #FFF8EC)',
}

export function GameScreen() {
  const {
    currentStage,
    currentRecipe,
    currentStageConfig,
    stageIndex,
    completeStage,
    openSettings,
    restTimer,
  } = useGameContext()

  const { progress }   = useProgressContext()
  const { isSpeaking } = useVoiceContext()

  const level          = progress?.level ?? 1
  const StageComponent = STAGE_COMPONENTS[currentStage]
  const oyenExpression = STAGE_EXPRESSIONS[currentStage] ?? OYEN_EXPRESSION.HAPPY
  const bgStyle        = STAGE_BG[currentStage] ?? 'linear-gradient(175deg, #FFF8EC, #FFF0D6)'

  const handleStageComplete = useCallback(() => {
    const shouldRest = restTimer?.shouldShowRest ?? false
    if (shouldRest) restTimer?.acknowledgeRest()
    completeStage(shouldRest)
  }, [restTimer, completeStage])

  if (!StageComponent || !currentRecipe) return null

  const earnedStars = progress?.starsEarned?.[currentRecipe.id] ?? 0
  const totalStages = currentRecipe.stages?.length ?? 6

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: bgStyle, transition: 'background 0.5s ease' }}
    >
      {/* ── HUD ───────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-3 py-2"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(61,43,31,0.06)',
          boxShadow: '0 2px 16px rgba(61,43,31,0.06)',
        }}
      >
        {/* Real Oyen in HUD — sm size, expression-aware */}
        <Oyen
          expression={oyenExpression}
          size="sm"
          isSpeaking={isSpeaking}
        />

        {/* Stage progress dots */}
        <ProgressDots currentIndex={stageIndex} totalStages={totalStages} />

        {/* Stars + parent gate */}
        <ParentGate onUnlock={openSettings}>
          <div className="flex items-center gap-1.5 pl-1 pr-1">
            <span className="text-lg leading-none" aria-hidden="true">⭐</span>
            <span className="font-display font-900 text-toddler-xs text-ink tabular-nums">
              {earnedStars}
            </span>
          </div>
        </ParentGate>
      </div>

      {/* ── Stage content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <StageComponent
          recipe={currentRecipe}
          stageConfig={currentStageConfig}
          level={level}
          onComplete={handleStageComplete}
        />
      </div>
    </div>
  )
}
