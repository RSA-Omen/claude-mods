export type Glow = 'running' | 'children' | 'you'

declare module 'claude-code' {
  interface PluginState {
    'pane-glow': { isAsking: boolean; children: number }
  }
}
