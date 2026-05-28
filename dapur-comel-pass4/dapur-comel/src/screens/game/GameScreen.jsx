/**
 * GameScreen.jsx — Pass 3: step components wired
 *
 * STEP_COMPONENTS map fully populated.
 * StepPlaceholder removed (no longer needed).
 * Step transitions: 100ms opacity only — no sequence, no sluggish fades.
 *
 * Each step component receives: recipe, step, onComplete
 * GameScreen owns the onComplete routing (advanceStep vs completeFeedOyen).
 */

import { useCallback, useEffect, useRef } from 'react'
import { useGameContext, useProgressContext, useVoiceContext } from '../../App.jsx'
import { STAGE, STEP, OYEN_EXPRESSION } from '../../utils/constants.js'
import { ParentGate }   from '../../components/gates/ParentGate.jsx'
import { ProgressDots } from '../../components/ui/ProgressDots.jsx'
import { Oyen }         from '../../components/mascot/Oyen.jsx'

// Step components
import { TapStep }       from './steps/TapStep.jsx'
import { PourStep }      from './steps/PourStep.jsx'
import { StirStep }      from './steps/StirStep.jsx'
import { SwipeStep }     from './steps/SwipeStep.jsx'
import { DragStep }      from './steps/DragStep.jsx'
import { PressStep }     from './steps/PressStep.jsx'
import { StackStep }     from './steps/StackStep.jsx'
import { FeedOyenStep }  from './steps/FeedOyenStep.jsx'

// Legacy celebrate stage still used for CELEBRATE FSM state
import { CelebStage }    from './stages/CelebStage.jsx'

// ── Step component map ────────────────────────────────────────────────────────
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

// ── Oyen expression per step type ─────────────────────────────────────────────
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
    currentStage,
    currentRecipe,
    currentStep,
    stepIndex,
    totalSteps,
    advanceStep,
    completeFeedOyen,
    completeStage,
    openSettings,
    restTimer,
  } = useGameContext()

  const { progress }   = useProgressContext()
  const { isSpeaking } = useVoiceContext()

  // ── Resolve component and completion handler ───────────────────────────────
  let ActiveComponent = null
  let onComplete      = null

  const shouldRest = () => {
    const r = restTimer?.shouldShowRest ?? false
    if (r) restTimer?.acknowledgeRest()
    return r
  }

  if (currentStage === STAGE.COOKING) {
    ActiveComponent = currentStep ? STEP_COMPONENTS[currentStep.type] : null
    onComplete      = () => advanceStep(shouldRest())
  } else if (currentStage === STAGE.FEED_OYEN) {
    ActiveComponent = FeedOyenStep
    onComplete      = () => completeFeedOyen(shouldRest())
  } else if (currentStage === STAGE.CELEBRATE) {
    ActiveComponent = CelebStage
    onComplete      = () => completeStage(shouldRest())
  }

  const oyenExpr  = currentStep
    ? (STEP_OYEN[currentStep.type] ?? OYEN_EXPRESSION.HAPPY)
    : (currentStage === STAGE.CELEBRATE ? OYEN_EXPRESSION.PROUD : OYEN_EXPRESSION.HAPPY)

  const bgStyle   = currentRecipe?.bgGradient ?? 'linear-gradient(175deg, #FFF8EC, #FFF0D6)'
  const earnedStars = progress?.starsEarned?.[currentRecipe?.id] ?? 0

  // Synthetic step for FEED_OYEN state (not in steps[] array)
  const feedStep  = currentStage === STAGE.FEED_OYEN
    ? { type: STEP.FEED_OYEN, label: 'Bagi Oyen Makan!', emoji: '😸',
        gesture: 'drag', sfx: 'munch', oyenReact: 'excited', durationHint: 2500 }
    : null

  const activeStep = currentStage === STAGE.FEED_OYEN ? feedStep : currentStep

  if (!currentRecipe) return null

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: bgStyle }}
    >
      {/* ── HUD ─────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{
          background:           'rgba(255,255,255,0.88)',
          backdropFilter:       'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom:         '1px solid rgba(61,43,31,0.06)',
        }}
      >
        <Oyen expression={oyenExpr} size="sm" isSpeaking={isSpeaking} />

        <ProgressDots
          currentIndex={stepIndex}
          totalStages={totalSteps > 0 ? totalSteps : 1}
        />

        <ParentGate onUnlock={openSettings}>
          <div className="flex items-center gap-1.5 pl-1 pr-1">
            <span className="text-lg leading-none" aria-hidden="true">⭐</span>
            <span className="font-display font-900 text-toddler-xs text-ink tabular-nums">
              {earnedStars}
            </span>
          </div>
        </ParentGate>
      </div>

      {/* ── Active step ─────────────────────────────────────────────── */}
      {/* key=stepIndex forces full unmount+remount on step change — clean slate */}
      <div className="flex-1 overflow-hidden" key={`${currentStage}-${stepIndex}`}>
        {ActiveComponent && activeStep ? (
          <ActiveComponent
            recipe={currentRecipe}
            step={activeStep}
            onComplete={onComplete}
          />
        ) : ActiveComponent ? (
          // CELEBRATE — CelebStage doesn't need step prop
          <ActiveComponent
            recipe={currentRecipe}
            stageConfig={currentRecipe.stages?.find(s => s.type === STAGE.CELEBRATE) ?? { starsAwarded: 3, stickerReward: `sticker-${currentRecipe.id}` }}
            onComplete={onComplete}
          />
        ) : null}
      </div>
    </div>
  )
}
