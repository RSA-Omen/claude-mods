# pane-glow

Draws a coloured, round-bordered band directly above the prompt box of every chat, so you can tell at a glance which of your side-by-side chats needs you:

- **● Running** (green): Claude is mid-turn.
- **◌ Waiting on child agents (n)** (blue): the chat is idle but subagents it started are still running.
- **◆ Waiting on you** (amber): a question card or permission prompt is open, or the turn has finished.

Any other band above the prompt (from another mod) is kept and drawn inside the border.
