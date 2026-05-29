/**
 * App.jsx — Pass 1 update
 *
 * Added COOKING and FEED_OYEN to the screen router.
 * Both route to GameScreen — GameScreen will render the appropriate
 * step component based on currentStep.type (wired in Pass 3).
 *
 * All other routing, contexts, and settings modal behaviour unchanged.
 */

import { createContext, useContext, useMemo, useRef, useEffect } from 'react'

import { SafeArea }      from './components/layout/SafeArea.jsx'
import { useVoice }      from './hooks/useVoice.js'
import { useProgress }   from './hooks/useProgress.js'
import { useGameEngine } from './hooks/useGameEngine.js'
import { useRestTimer }  from './hooks/useRestTimer.js'
import { STAGE }         from './utils/constants.js'

import { HomeScreen }         from './screens/HomeScreen.jsx'
import { RecipeSelectScreen } from './screens/RecipeSelectScreen.jsx'
import { GameScreen }         from './screens/game/GameScreen.jsx'
import { RestScreen }         from './screens/RestScreen.jsx'
import { SettingsScreen }     from './screens/SettingsScreen.jsx'

// ─── Shared Contexts ──────────────────────────────────────────────────────────
export const VoiceContext    = createContext(null)
export const ProgressContext = createContext(null)
export const GameContext     = createContext(null)

export const useVoiceContext    = () => useContext(VoiceContext)
export const useProgressContext = () => useContext(ProgressContext)
export const useGameContext     = () => useContext(GameContext)

// ─── Screen router ────────────────────────────────────────────────────────────
function renderStage(stage) {
  switch (stage) {
    case STAGE.HOME:          return <HomeScreen />
    case STAGE.RECIPE_SELECT: return <RecipeSelectScreen />

    // New cooking-loop states — both render GameScreen
    case STAGE.COOKING:
    case STAGE.FEED_OYEN:

    // Legacy states (kept for backward compat during Pass 2→3 transition)
    case STAGE.GATHER:
    case STAGE.COUNT:
    case STAGE.MIX:
    case STAGE.OVEN:
    case STAGE.DECORATE:
    case STAGE.CELEBRATE:     return <GameScreen />

    case STAGE.REST_NUDGE:    return <RestScreen />
    default:                  return <HomeScreen />
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const voice     = useVoice()
  const progress  = useProgress()
  const game      = useGameEngine()
  const restTimer = useRestTimer()

  // Track pre-settings stage so correct screen shows dimmed behind modal
  const preSettingsStageRef = useRef(STAGE.HOME)
  const isSettings = game.currentStage === STAGE.SETTINGS

  useEffect(() => {
    if (!isSettings) {
      preSettingsStageRef.current = game.currentStage
    }
  }, [game.currentStage, isSettings])

  const gameContextValue = useMemo(() => ({
    ...game,
    restTimer,
  }), [game, restTimer])

  const backgroundScreen = isSettings
    ? renderStage(preSettingsStageRef.current)
    : renderStage(game.currentStage)

  return (
    <VoiceContext.Provider value={voice}>
      <ProgressContext.Provider value={progress}>
        <GameContext.Provider value={gameContextValue}>
          <SafeArea className="bg-cream">

            {isSettings
              ? (
                <div
                  className="w-full h-full"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                  aria-hidden="true"
                >
                  {backgroundScreen}
                </div>
              )
              : backgroundScreen
            }

            {isSettings && <SettingsScreen />}

          </SafeArea>
        </GameContext.Provider>
      </ProgressContext.Provider>
    </VoiceContext.Provider>
  )
}
