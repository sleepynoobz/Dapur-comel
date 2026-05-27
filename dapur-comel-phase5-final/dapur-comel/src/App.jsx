/**
 * App.jsx — Phase 3 hardened
 *
 * Root component. Provides contexts and routes screens.
 *
 * ── FIX: Settings modal background ───────────────────────────────────────
 *   Settings now shows the ACTUAL previous screen dimmed behind the modal,
 *   not always HomeScreen. We track `preSettingsStage` — the stage that
 *   was active when settings was opened — and render that as background.
 *
 * ── Screen model ──────────────────────────────────────────────────────────
 *   No URL router. Pure state switching.
 *   Settings is a modal overlay — not a full screen swap.
 *   The background screen stays mounted (dimmed) so context is preserved.
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

// ─── Screen renderer ──────────────────────────────────────────────────────────
function renderStage(stage) {
  switch (stage) {
    case STAGE.HOME:          return <HomeScreen />
    case STAGE.RECIPE_SELECT: return <RecipeSelectScreen />
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

  // FIX: Track the stage active BEFORE settings was opened
  // so the correct screen appears dimmed behind the modal
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

            {/* Background screen */}
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

            {/* Settings modal overlay */}
            {isSettings && <SettingsScreen />}

          </SafeArea>
        </GameContext.Provider>
      </ProgressContext.Provider>
    </VoiceContext.Provider>
  )
}
