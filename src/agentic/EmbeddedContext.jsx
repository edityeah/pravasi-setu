import React from 'react'

// Pages can ask "am I rendered inside the agentic canvas?". When true, they
// suppress their phone chrome (StatusBar, BottomNav) — the chat shell already
// owns the global navigation.
const EmbeddedContext = React.createContext(false)

export function EmbeddedProvider({ children }) {
  return <EmbeddedContext.Provider value={true}>{children}</EmbeddedContext.Provider>
}

export function useIsEmbedded() {
  return React.useContext(EmbeddedContext)
}
