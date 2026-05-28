/**
 * GameScreen.jsx — Visual polish update
 *
 * Added KitchenBg behind all steps.
 * HUD redesigned as floating game-style bar.
 * CompletionFlash on step advance.
 * Removed background gradient (KitchenBg replaces it).
 */

import { useCallback, useState } from 'react'
import { useGameContext, useProgressContext, useVoiceContext } from '../../App.jsx'
import { STAGE, STEP, OYEN_EXPRESSION } from '../../utils/constants.js'
import { ParentGate }    from '../../components/gates/ParentGate.jsx'
import { ProgressDots }  from '../../components/ui/ProgressDots.jsx'
import { Oyen }          from '../../components/mascot/Oyen.jsx'
import { KitchenBg }     from './KitchenBg.jsx'

import { TapStep }       from './steps/TapStep.jsx'
import { PourStep }      from './steps/PourStep.jsx'
import { StirStep }      from './steps/StirStep.jsx'
import { SwipeStep }     from './steps/SwipeStep.jsx'
import { DragStep }      from './steps/DragStep.jsx'
import { PressStep }     from './steps/PressStep.jsx'
import { StackStep }     from './steps/StackStep.jsx'
import { FeedOyenStep }  from './steps/FeedOyenStep.jsx'
import { CelebStage }    from './stages/CelebStage.jsx'

const STEP_COMPONENTS = {
  [STEP.CRACK_EGG]:     TapStep,
  [STEP.FRY]:           TapStep,
  [STEP.BAKE]:          TapStep,
  [STEP.POUR]:          PourStep,
  [STEP.STIR]:          StirStep,
  [STEP.SPREAD_SAUCE]:  StirStep,
  [STEP.FLIP]:          SwipeStep,
  [STEP.SLICE]:         SwipeStep,
  [STEP.DECORATE]:      DragStep,
  [STEP.ADD_TOPPINGS]:  DragStep,
  [STEP.FLATTEN_DOUGH]: PressStep,
  [STEP.STACK]:         StackStep,
  [STEP.FEED_OYEN]:     FeedOyenStep,
}

const STEP_OYEN = {
  [STEP.CRACK_EGG]:     OYEN_EXPRESSION.SURPRISED,
  [STEP.POUR]:          OYEN_EXPRESSION.HAPPY,
  [STEP.STIR]:          OYEN_EXPRESSION.EXCITED,
  [STEP.FRY]:           OYEN_EXPRESSION.THINKING,
  [STEP.FLIP]:          OYEN_EXPRESSION.SURPRISED,
  [STEP.BAKE]:          OYEN_EXPRESSION.THINKING,
  [STEP.FLATTEN_DOUGH]: OYEN_EXPRESSION.HAPPY,
  [STEP.SPREAD_SAUCE]:  OYEN_EXPRESSION.HAPPY,
  [STEP.ADD_TOPPINGS]:  OYEN_EXPRESSION.EXCITED,
  [STEP.STACK]:         OYEN_EXPRESSION.HAPPY,
  [STEP.DECORATE]:      OYEN_EXPRESSION.HAPPY,
  [STEP.SLICE]:         OYEN_EXPRESSION.CHEEKY,
  [STEP.FEED_OYEN]:     OYEN_EXPRESSION.EXCITED,
}

export function GameScreen() {
  const {
    currentStage, currentRecipe, currentStep,
    stepIndex, totalSteps,
    advanceStep, completeFeedOyen, completeStage,
    openSettings, restTimer,
  } = useGameContext()

  const { progress }   = useProgressContext()
  const { isSpeaking } = useVoiceContext()
  const [flash, setFlash] = useState(false)

  const shouldRest = () => {
    const r = restTimer?.shouldShowRest ?? false
    if (r) restTimer?.acknowledgeRest()
    return r
  }

  const withFlash = (fn) => {
    setFlash(true)
    setTimeout(() => setFlash(false), 420)
    setTimeout(fn, 60)
  }

  let ActiveComponent = null
  let onComplete      = null

  if (currentStage === STAGE.COOKING) {
    ActiveComponent = currentStep ? STEP_COMPONENTS[currentStep.type] : null
    onComplete = () => withFlash(() => advanceStep(shouldRest()))
  } else if (currentStage === STAGE.FEED_OYEN) {
    ActiveComponent = FeedOyenStep
    onComplete = () => withFlash(() => completeFeedOyen(shouldRest()))
  } else if (currentStage === STAGE.CELEBRATE) {
    ActiveComponent = CelebStage
    onComplete = () => completeStage(shouldRest())
  }

  const oyenExpr = currentStep
    ? (STEP_OYEN[currentStep.type] ?? OYEN_EXPRESSION.HAPPY)
    : currentStage === STAGE.CELEBRATE ? OYEN_EXPRESSION.PROUD : OYEN_EXPRESSION.HAPPY

  const earnedStars = progress?.starsEarned?.[currentRecipe?.id] ?? 0

  const feedStep = currentStage === STAGE.FEED_OYEN
    ? { type: STEP.FEED_OYEN, label: 'Bagi Oyen Makan!', emoji: '😸',
        gesture: 'drag', sfx: 'munch', oyenReact: 'excited', durationHint: 2500 }
    : null

  const activeStep = currentStage === STAGE.FEED_OYEN ? feedStep : currentStep

  if (!currentRecipe) return null

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden"
         style={{ background: '#FDF6E8' }}>

      {/* Kitchen environment — z-index 0 */}
      <KitchenBg recipe={currentRecipe} />

      {/* Completion flash overlay */}
      {flash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.85)',
            animation:  'completionFlash 0.42s ease-out forwards',
            zIndex:     90,
          }}
          aria-hidden="true"
        />
      )}

      {/* ── HUD — floating game bar ─────────────────────────────── */}
      <div
        className="relative flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{
          zIndex:     10,
          background: 'rgba(255,248,236,0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(200,149,108,0.25)',
          boxShadow: '0 2px 12px rgba(80,40,10,0.12)',
        }}
      >
        <Oyen expression={oyenExpr} size="sm" isSpeaking={isSpeaking} />

        <ProgressDots
          currentIndex={stepIndex}
          totalStages={totalSteps > 0 ? totalSteps : 1}
        />

        <ParentGate onUnlock={openSettings}>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full"
               style={{ background: 'rgba(255,215,0,0.15)' }}>
            <span style={{ fontSize: '1.1rem' }} aria-hidden="true">⭐</span>
            <span className="font-display font-900 text-ink tabular-nums"
                  style={{ fontSize: '1rem' }}>
              {earnedStars}
            </span>
          </div>
        </ParentGate>
      </div>

      {/* ── Step content ────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-hidden"
        key={`${currentStage}-${stepIndex}`}
      >
        {ActiveComponent && activeStep ? (
          <ActiveComponent recipe={currentRecipe} step={activeStep} onComplete={onComplete} />
        ) : ActiveComponent ? (
          <ActiveComponent
            recipe={currentRecipe}
            stageConfig={{ starsAwarded: 3, stickerReward: `sticker-${currentRecipe.id}` }}
            onComplete={onComplete}
          />
        ) : null}
      </div>
    </div>
  )
}
