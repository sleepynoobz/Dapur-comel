/**
 * GameScreen.jsx — Persistent cooking scene
 *
 * CookingScene wraps all step interactions.
 * KitchenBg removed — CookingScene provides its own rich environment.
 * Oyen moved from HUD to bottom-right peek position inside scene.
 * HUD now minimal: home button + progress dots + coins.
 */

import { useCallback, useState } from 'react'
import { useGameContext, useProgressContext, useVoiceContext } from '../../App.jsx'
import { STAGE, STEP, OYEN_EXPRESSION } from '../../utils/constants.js'
import { ParentGate }    from '../../components/gates/ParentGate.jsx'
import { ProgressDots }  from '../../components/ui/ProgressDots.jsx'
import { CookingScene }  from './CookingScene.jsx'

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
    setTimeout(() => setFlash(false), 380)
    setTimeout(fn, 50)
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

  // Celebrate uses its own full-screen layout
  if (currentStage === STAGE.CELEBRATE) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <CelebStage
          recipe={currentRecipe}
          stageConfig={{ starsAwarded: 3, stickerReward: `sticker-${currentRecipe.id}` }}
          onComplete={onComplete}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">

      {/* ── Minimal floating HUD ─────────────────────────────────── */}
      <div
        className="relative flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{
          zIndex:     10,
          background: 'rgba(255,248,230,0.88)',
          backdropFilter:       'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '2px solid rgba(200,149,108,0.2)',
          boxShadow:    '0 2px 10px rgba(80,40,10,0.1)',
        }}
      >
        {/* Recipe name badge */}
        <div style={{
          background: currentRecipe.color + '22',
          border:     `1.5px solid ${currentRecipe.color}44`,
          borderRadius: 999,
          padding:    '4px 10px',
          display:    'flex', alignItems:'center', gap:6,
        }}>
          <span style={{ fontSize:'1rem' }}>{currentRecipe.emoji}</span>
          <span style={{ fontSize:'0.78rem', fontWeight:800, color:'#3D2B1F',
                          fontFamily:"'Nunito', sans-serif" }}>
            {currentRecipe.name}
          </span>
        </div>

        {/* Progress dots */}
        <ProgressDots
          currentIndex={stepIndex}
          totalStages={totalSteps > 0 ? totalSteps : 1}
        />

        {/* Stars + settings */}
        <ParentGate onUnlock={openSettings}>
          <div style={{
            display:'flex', alignItems:'center', gap:4,
            background:'rgba(255,215,0,0.15)',
            borderRadius:999, padding:'4px 8px',
          }}>
            <span style={{ fontSize:'1rem' }}>⭐</span>
            <span style={{ fontSize:'0.85rem', fontWeight:900, color:'#3D2B1F',
                            fontFamily:"'Nunito', sans-serif" }}>
              {earnedStars}
            </span>
          </div>
        </ParentGate>
      </div>

      {/* ── Cooking scene (persistent) ──────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">

        {/* Completion flash */}
        {flash && (
          <div style={{
            position:'absolute', inset:0, zIndex:90, pointerEvents:'none',
            background:'rgba(255,255,255,0.8)',
            animation:'completionFlash 0.38s ease-out forwards',
          }} aria-hidden="true" />
        )}

        <CookingScene
          recipe={currentRecipe}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          oyenExpression={oyenExpr}
          isSpeaking={isSpeaking}
        >
          {/* Step interaction — keyed for clean unmount */}
          <div className="w-full h-full" key={`${currentStage}-${stepIndex}`}>
            {ActiveComponent && activeStep && (
              <ActiveComponent recipe={currentRecipe} step={activeStep} onComplete={onComplete} />
            )}
          </div>
        </CookingScene>
      </div>
    </div>
  )
}
