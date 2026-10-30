import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Glow } from '../types'

// A question or permission prompt is open and waiting on the person.
const isAsking = atom({ plugin: 'pane-glow', key: 'isAsking' } as const, false)
// Subagents still pending or running.
const children = atom({ plugin: 'pane-glow', key: 'children' } as const, 0)

const LOOK = {
  running: { color: '#3fb950', label: '● Running' },
  children: { color: '#58a6ff', label: '◌ Waiting on child agents' },
  you: { color: '#f0b429', label: '◆ Waiting on you' },
} as const

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    $.clock.every(2000, async () => {
      const agents = await $.agent.list()
      const live = agents.filter(a => a.status === 'running' || a.status === 'pending').length

      if (live !== (await read($, children))) {
        await update($, children, () => live)
      }
    })

    return next(e)
  })

  on('tool.check', async ($, e, next) => {
    const verdict = await next(e)

    if (verdict.decision === 'ask' && e.approver === 'person' && e.agentId === undefined) {
      await update($, isAsking, () => true)
    }

    return verdict
  })

  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    await update($, isAsking, () => true)

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const result = await next(e)

    if (await read($, isAsking)) {
      await update($, isAsking, () => false)
    }

    return result
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, isAsking, () => false)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)

    if (e.props.hasSurvey) {
      return below
    }

    const asking = await read($, isAsking)
    const live = await read($, children)
    const state: Glow = asking ? 'you' : e.props.isWorking ? 'running' : live > 0 ? 'children' : 'you'
    const { color, label } = LOOK[state]
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box borderStyle="round" borderColor={color} flexDirection="column" paddingX={1}>
        <Text color={color} bold>
          {label}
          {state === 'children' ? ` (${live})` : ''}
        </Text>
        {below}
      </Box>
    )
  })
}
