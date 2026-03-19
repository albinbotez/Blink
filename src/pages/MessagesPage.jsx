import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { Avatar, Button, Spinner } from '../components/ui'
import { Icons } from '../components/Icons'
import { formatTime, formatTimeShort } from '../lib/utils'

export default function MessagesPage() {
  const { user } = useAuth()
  const {
    conversations, messages, activeConversation,
    setActiveConversation, sendMessage, loading
  } = useMessages(user?.id)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConversation) return
    setSending(true)
    await sendMessage(activeConversation, newMsg)
    setNewMsg('')
    setSending(false)
  }

  const selectConvo = (id) => {
    setActiveConversation(id)
    setMobileShowChat(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-txt-muted">
        <Spinner /> <span className="ml-3">Laster meldinger...</span>
      </div>
    )
  }

  const activeConvoData = conversations.find(c => c.id === activeConversation)

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8" style={{ height: 'calc(100vh - 96px)' }}>
      <h1 className="animate-fade-in text-[28px] font-display font-bold mb-6 tracking-tight">Meldinger</h1>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-0 bg-bg-card rounded-[18px] overflow-hidden border border-white/[0.06]"
        style={{ height: 'calc(100% - 60px)' }}>

        {/* Conversations list */}
        <div className={`border-r border-white/[0.06] overflow-y-auto ${mobileShowChat ? 'hidden md:block' : ''}`}>
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-txt-muted p-6 text-center">
              <Icons.Mail />
              <p className="mt-3 text-sm">Ingen samtaler ennå</p>
              <p className="text-xs mt-1">Meldinger fra bedrifter vil vises her</p>
            </div>
          ) : (
            conversations.map(convo => (
              <div key={convo.id}
                onClick={() => selectConvo(convo.id)}
                className={`
                  px-5 py-4 cursor-pointer transition-all duration-150 border-b border-white/[0.06]
                  ${activeConversation === convo.id
                    ? 'bg-accent-purple/[0.08] border-l-[3px] border-l-accent-purple'
                    : 'border-l-[3px] border-l-transparent hover:bg-bg-card-hover'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={convo.other_name} size={42} src={convo.other_avatar} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate">{convo.other_name}</span>
                      <span className="text-[11px] text-txt-muted flex-shrink-0 ml-2">
                        {formatTime(convo.last_message_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[13px] text-txt-muted truncate max-w-[180px]">
                        {convo.last_message || 'Ny samtale'}
                      </span>
                      {convo.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent-purple text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat area */}
        {activeConversation ? (
          <div className={`flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
              <button onClick={() => setMobileShowChat(false)}
                className="md:hidden bg-transparent border-none text-txt-muted cursor-pointer">
                <Icons.ChevronLeft />
              </button>
              <Avatar name={activeConvoData?.other_name || ''} size={36}
                src={activeConvoData?.other_avatar} />
              <span className="font-semibold">{activeConvoData?.other_name}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              {messages.map(msg => (
                <div key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[70%] px-4 py-3 rounded-2xl
                    ${msg.sender_id === user?.id
                      ? 'bg-accent-purple rounded-br-sm'
                      : 'bg-bg-elevated rounded-bl-sm'}
                  `}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <span className={`text-[11px] mt-1 block ${
                      msg.sender_id === user?.id ? 'text-white/60' : 'text-txt-muted'
                    }`}>
                      {formatTimeShort(msg.created_at)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
              <input
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Skriv en melding..."
                className="flex-1 py-3 px-4 bg-bg-secondary border border-white/[0.06] rounded-xl text-txt-primary text-sm outline-none focus:border-accent-purple transition-colors font-body placeholder:text-txt-muted"
              />
              <Button onClick={handleSend} disabled={!newMsg.trim() || sending}>
                <Icons.Send />
              </Button>
            </div>
          </div>
        ) : (
          <div className={`flex-col items-center justify-center text-txt-muted gap-3 ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
            <Icons.Mail />
            <p className="text-sm">Velg en samtale for å begynne</p>
          </div>
        )}
      </div>
    </div>
  )
}
