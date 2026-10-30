import { expect, test } from 'claude-code/testing'

const band = (isWorking: boolean) =>
  ({
    plugin: 'pane-glow',
    component: 'AbovePrompt',
    props: {
      hasSurvey: false,
      isWorking,
      maxRows: 10,
      bodyColumns: 60,
      scroll: { offset: 0, bodyRows: 9 },
      view: {},
    },
  }) as const

test('the band names each state', async ($, on) => {
  let agents: { id: string; description: string; type: string; status: 'running' | 'completed' }[] = []
  on('agent.list', () => ({ value: agents }))
  on('tool.call', () => ({ result: {} }))
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>other mod</Text>
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    agents = []
    let ui = await $.ui.mount({ ...band(true), surface })
    expect((await ui.find({ type: 'Text', text: /Running/ }))?.text).toContain('Running')
    expect(await ui.find({ type: 'Text', text: /other mod/ })).toBeTruthy()
    await ui.unmount()

    ui = await $.ui.mount({ ...band(false), surface })
    expect(await ui.find({ type: 'Text', text: /Waiting on you/ })).toBeTruthy()
    await ui.unmount()
  }
})
