import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Menu, Bell, PanelRight, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ThreadSidebar    from './ThreadSidebar'
import ChatThread       from './ChatThread'
import CanvasPanel      from './CanvasPanel'
import WelcomeView      from './WelcomeView'
import NotificationsPanel from './NotificationsPanel'
import {
  loadThreads, saveThreads,
  loadActiveThreadId, saveActiveThreadId,
  createThread, appendMessage, deleteThread, setThreadCanvas,
} from './agenticStore'
import { matchIntent, replyForApp, getAppById, APPS } from './intentRouter'

// Top-level three-pane experience for signed-in users:
//
//   ┌──────────────┬────────────────────────────┬────────────────────┐
//   │  THREADS     │   CHAT THREAD              │   CANVAS           │
//   │  (sidebar)   │   (center)                 │   (right panel,    │
//   │              │                            │    mounts existing │
//   │              │                            │    Pravasi pages)  │
//   └──────────────┴────────────────────────────┴────────────────────┘
//
// On tablet the canvas overlays the chat; on mobile the sidebar slides in.

export default function AgenticShell() {
  const { profile } = useApp()
  const [threads, setThreads]       = useState({})
  const [activeId, setActiveId]     = useState(null)
  const [canvasApp, setCanvasApp]   = useState(null)
  const [canvasOpen, setCanvasOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [notifsOpen, setNotifsOpen]     = useState(false)

  // ── Hydrate from localStorage ──────────────────────────────────────────
  useEffect(() => {
    setThreads(loadThreads() || {})
    setActiveId(loadActiveThreadId() || null)
  }, [])

  useEffect(() => { saveActiveThreadId(activeId) }, [activeId])

  // ── Derived ────────────────────────────────────────────────────────────
  const threadList = useMemo(
    () => Object.values(threads).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    [threads],
  )
  const activeThread = activeId ? threads[activeId] : null

  // ── Actions ────────────────────────────────────────────────────────────
  const refresh = useCallback(() => setThreads({ ...loadThreads() }), [])

  const handleNewChat = useCallback(() => {
    setActiveId(null)
    setCanvasApp(null)
    setCanvasOpen(false)
    setSidebarOpen(false)
  }, [])

  const handlePickThread = useCallback((id) => {
    setActiveId(id)
    setSidebarOpen(false)
    const t = loadThreads()[id]
    if (t?.pinnedCanvas) {
      const app = getAppById(t.pinnedCanvas.appId)
      if (app) {
        setCanvasApp(app)
        setCanvasOpen(true)
      }
    } else {
      setCanvasOpen(false)
    }
  }, [])

  const handleDeleteThread = useCallback((id) => {
    deleteThread(id)
    if (activeId === id) {
      setActiveId(null)
      setCanvasOpen(false)
    }
    refresh()
  }, [activeId, refresh])

  const openAppInCanvas = useCallback((app, threadId) => {
    setCanvasApp(app)
    setCanvasOpen(true)
    if (threadId) {
      setThreadCanvas(threadId, { appId: app.id })
      refresh()
    }
  }, [refresh])

  // ── Sending a message ──────────────────────────────────────────────────
  // Flow: ensure a thread exists → append user msg → match intent →
  //       append bot reply with canvas invocation chips → optionally auto-open
  //       the top match in the canvas.
  const handleSend = useCallback((text, opts = {}) => {
    let tid = activeId
    if (!tid) {
      const created = createThread({ title: 'New chat', initialMessages: [] })
      tid = created.id
      setActiveId(tid)
    }
    appendMessage(tid, { role: 'user', text })

    const matched = matchIntent(text, 3)
    if (matched.length === 0) {
      appendMessage(tid, {
        role: 'bot',
        text: "I couldn't pin that to a specific tool. Try asking about jobs, money transfers, costs, documents, employment, grievances, or emergencies. You can also pick an app from the welcome screen.",
      })
    } else {
      const top = matched[0]
      appendMessage(tid, {
        role: 'bot',
        text: replyForApp(top),
        canvasInvocations: matched.map(a => ({ appId: a.id })),
      })
      // Auto-open the top match unless caller asked us not to.
      if (opts.autoOpen !== false) {
        openAppInCanvas(top, tid)
      }
    }
    refresh()
  }, [activeId, openAppInCanvas, refresh])

  const handleStarterApp = useCallback((app) => {
    let tid = activeId
    if (!tid) {
      const created = createThread({ title: app.title, initialMessages: [] })
      tid = created.id
      setActiveId(tid)
    }
    appendMessage(tid, { role: 'user',  text: `Open ${app.title}` })
    appendMessage(tid, {
      role: 'bot',
      text: replyForApp(app),
      canvasInvocations: [{ appId: app.id }],
    })
    openAppInCanvas(app, tid)
    refresh()
  }, [activeId, openAppInCanvas, refresh])

  const handleOpenAppFromMessage = useCallback((app) => {
    openAppInCanvas(app, activeId)
  }, [activeId, openAppInCanvas])

  // ── Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex bg-white overflow-hidden">
      {/* Sidebar — always visible on lg+, slide-over below */}
      <div className="hidden lg:flex w-[280px] flex-shrink-0">
        <ThreadSidebar
          threads={threadList}
          activeId={activeId}
          onPick={handlePickThread}
          onNew={handleNewChat}
          onDelete={handleDeleteThread}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 animate-slide-in">
            <ThreadSidebar
              threads={threadList}
              activeId={activeId}
              onPick={handlePickThread}
              onNew={() => { handleNewChat() }}
              onDelete={handleDeleteThread}
              onClose={() => setSidebarOpen(false)}
              mobile
            />
          </div>
        </>
      )}

      {/* Center + right canvas */}
      <div className="flex-1 flex min-w-0 relative">
        {/* Mobile/tablet top utility bar */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-12 px-2 flex items-center gap-1 bg-white border-b border-bdr-light z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-surface-secondary text-txt-primary flex items-center justify-center"
            aria-label="Open chats"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1 text-[13px] font-bold text-txt-primary truncate text-center">
            {activeThread?.title || 'Setu Assistant'}
          </div>
          <button
            onClick={() => setNotifsOpen(true)}
            className="w-10 h-10 rounded-full hover:bg-surface-secondary text-txt-primary flex items-center justify-center relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger" />
          </button>
          {canvasApp && (
            <button
              onClick={() => setCanvasOpen(o => !o)}
              className="w-10 h-10 rounded-full hover:bg-surface-secondary text-txt-primary flex items-center justify-center"
              aria-label="Toggle canvas"
            >
              <PanelRight size={18} />
            </button>
          )}
        </div>

        {/* Center — chat thread or welcome */}
        <div className={`flex-1 flex flex-col min-w-0 lg:pt-0 pt-12 ${canvasOpen ? 'hidden md:flex' : 'flex'}`}>
          {activeThread ? (
            <ChatThread
              thread={activeThread}
              onSend={(t) => handleSend(t)}
              onOpenApp={handleOpenAppFromMessage}
              onToggleCanvas={canvasApp ? () => setCanvasOpen(o => !o) : null}
              onOpenNotifications={() => setNotifsOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col min-h-0 relative">
              {/* Bell sits inside the welcome pane so it doesn't overlap the canvas */}
              <div className="hidden lg:flex absolute top-3 right-4 z-10">
                <button
                  onClick={() => setNotifsOpen(true)}
                  className="w-10 h-10 rounded-full bg-white border border-bdr-light hover:bg-surface-secondary text-txt-primary flex items-center justify-center relative shadow-card"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-danger" />
                </button>
              </div>
              <WelcomeView
                profile={profile}
                onStarter={(s) => handleSend(s)}
                onApp={handleStarterApp}
              />
            </div>
          )}
        </div>

        {/* Right canvas — overlay on tablet, side-by-side on lg+ */}
        {canvasOpen && canvasApp && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/20 z-30"
              onClick={() => setCanvasOpen(false)}
            />
            <div className="
              fixed inset-0 z-40
              md:relative md:inset-auto md:z-auto
              md:w-[55%] lg:w-[640px] xl:w-[760px]
              md:flex-shrink-0
              md:border-l md:border-bdr-light
              flex flex-col
            ">
              <CanvasPanel
                open={canvasOpen}
                app={canvasApp}
                onClose={() => setCanvasOpen(false)}
              />
            </div>
          </>
        )}
      </div>

      {/* Notifications drawer */}
      <NotificationsPanel open={notifsOpen} onClose={() => setNotifsOpen(false)} />
    </div>
  )
}
