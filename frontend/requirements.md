## Packages
framer-motion | Complex animations for chat bubbles and page transitions
recharts | Visualization for interview scores and skills breakdown
react-circular-progressbar | Nice progress circles for readiness score
date-fns | Formatting timestamps if needed

## Notes
- Interview flow requires careful state management:
  - Initial load: fetch interview
  - If no messages, trigger initial 'next' call to get greeting
  - Chat interface must handle streaming-like appearance (even if not SSE, we can simulate typing)
- "Analysis" field in messages is JSONB, needs proper parsing/display
