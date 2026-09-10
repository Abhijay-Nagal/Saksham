import { useMemo, useReducer } from 'react'
import type { Building, Mood, SceneBg, StoryNode } from '@content/types'

/**
 * The story reducer. It is entirely data-driven: no building id ever appears
 * here. `bg`, `props` and `cast` carry forward between nodes; moods reset to
 * normal unless the node names them (engines rule).
 */

export interface Scene {
  bg: SceneBg
  props: string[]
  cast: string[]
  moods: Record<string, Mood>
}

export interface StoryState {
  nodeId: string
  scene: Scene
  /** The last node that offered choices — where `end: retry` jumps back to. */
  retryTarget: { nodeId: string; scene: Scene } | null
  retries: number
  /** True once a node with `end: 'good'` is reached. */
  finished: boolean
}

type Action = { type: 'goto'; to: string } | { type: 'retry' } | { type: 'restart' }

function applyNode(scene: Scene, node: StoryNode): Scene {
  return {
    bg: node.bg ?? scene.bg,
    props: node.props ?? scene.props,
    cast: node.cast ?? scene.cast,
    moods: node.moods ?? {},
  }
}

function makeReducer(nodes: Record<string, StoryNode>, startId: string) {
  const initial = (): StoryState => {
    const start = nodes[startId]
    const scene = applyNode({ bg: 'street', props: [], cast: [], moods: {} }, start)
    return {
      nodeId: startId,
      scene,
      retryTarget: start.choices ? { nodeId: startId, scene } : null,
      retries: 0,
      finished: false,
    }
  }

  const reducer = (state: StoryState, action: Action): StoryState => {
    switch (action.type) {
      case 'goto': {
        const node = nodes[action.to]
        if (!node) return state
        const scene = applyNode(state.scene, node)
        return {
          ...state,
          nodeId: node.id,
          scene,
          retryTarget: node.choices ? { nodeId: node.id, scene } : state.retryTarget,
          finished: node.end === 'good',
        }
      }
      case 'retry': {
        if (!state.retryTarget) return state
        return {
          ...state,
          nodeId: state.retryTarget.nodeId,
          scene: state.retryTarget.scene,
          retries: state.retries + 1,
        }
      }
      case 'restart':
        return initial()
      default:
        return state
    }
  }

  return { reducer, initial }
}

export interface StoryApi {
  state: StoryState
  node: StoryNode
  /** Cast currently on stage, in content order, capped at 3. */
  onStage: Building['cast']
  advance: () => void
  choose: (to: string) => void
  retry: () => void
  restart: () => void
}

export function useStory(building: Building): StoryApi {
  const nodes = useMemo(() => {
    const map: Record<string, StoryNode> = {}
    for (const n of building.story.nodes) map[n.id] = n
    return map
  }, [building])

  const { reducer, initial } = useMemo(
    () => makeReducer(nodes, building.story.start),
    [nodes, building.story.start],
  )

  const [state, dispatch] = useReducer(reducer, undefined, initial)
  const node = nodes[state.nodeId]

  const onStage = useMemo(
    () =>
      state.scene.cast
        .slice(0, 3)
        .map((id) => building.cast.find((c) => c.id === id))
        .filter((c): c is Building['cast'][number] => !!c),
    [state.scene.cast, building.cast],
  )

  return {
    state,
    node,
    onStage,
    advance: () => {
      if (node.next) dispatch({ type: 'goto', to: node.next })
    },
    choose: (to: string) => dispatch({ type: 'goto', to }),
    retry: () => dispatch({ type: 'retry' }),
    restart: () => dispatch({ type: 'restart' }),
  }
}
