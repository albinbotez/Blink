import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMessages(userId) {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadConversations = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) {
        console.warn('Conversations query failed:', error.message)
        setConversations([])
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setConversations([])
        setUnreadCount(0)
        setLoading(false)
        return
      }

      const enriched = await Promise.all(data.map(async (conv) => {
        const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1
        let otherName = 'Ukjent bruker'
        let otherAvatar = null

        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', otherId)
            .maybeSingle()
          if (profileData) {
            otherName = profileData.name
            otherAvatar = profileData.avatar_url
          } else {
            const { data: companyData } = await supabase
              .from('companies')
              .select('company_name, logo_url')
              .eq('id', otherId)
              .maybeSingle()
            if (companyData) {
              otherName = companyData.company_name
              otherAvatar = companyData.logo_url
            }
          }
        } catch {}

        let unread = 0
        try {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .eq('is_read', false)
          unread = count || 0
        } catch {}

        return { ...conv, other_id: otherId, other_name: otherName, other_avatar: otherAvatar, unread }
      }))

      setConversations(enriched)
      setUnreadCount(enriched.reduce((sum, c) => sum + c.unread, 0))
    } catch (err) {
      console.warn('Error loading conversations:', err)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      setMessages(data || [])

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      loadConversations()
    } catch (err) {
      console.warn('Error loading messages:', err)
    }
  }, [userId, loadConversations])

  async function sendMessage(conversationId, content) {
    if (!userId || !conversationId || !content.trim()) return
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, sender_id: userId, content: content.trim() })
        .select()
        .single()
      if (error) throw error

      await supabase
        .from('conversations')
        .update({ last_message: content.trim(), last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
      return data
    } catch (err) {
      console.error('Error sending message:', err)
      return null
    }
  }

  async function getOrCreateConversation(otherUserId) {
    if (!userId) return null
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', { user1: userId, user2: otherUserId })
      if (error) throw error
      await loadConversations()
      return data
    } catch (err) {
      console.error('Error creating conversation:', err)
      return null
    }
  }

  useEffect(() => {
    if (!userId) return
    loadConversations()

    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload.new
        if (activeConversation && newMsg.conversation_id === activeConversation) {
          setMessages(prev => [...prev, newMsg])
          if (newMsg.sender_id !== userId) {
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id)
          }
        }
        loadConversations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, activeConversation, loadConversations])

  useEffect(() => {
    if (activeConversation) loadMessages(activeConversation)
  }, [activeConversation, loadMessages])

  return {
    conversations, messages, activeConversation, setActiveConversation,
    sendMessage, getOrCreateConversation, unreadCount, loading, refresh: loadConversations,
  }
}
