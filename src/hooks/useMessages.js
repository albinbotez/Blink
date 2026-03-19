import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to manage conversations and messages with realtime updates.
 */
export function useMessages(userId) {
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load conversations for user
  const loadConversations = useCallback(async () => {
    if (!userId) return
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Enrich with participant names
      const enriched = await Promise.all((data || []).map(async (conv) => {
        const otherId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1

        // Try to get profile name
        let otherName = 'Ukjent bruker'
        let otherAvatar = null
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', otherId)
          .single()

        if (profileData) {
          otherName = profileData.name
          otherAvatar = profileData.avatar_url
        } else {
          const { data: companyData } = await supabase
            .from('companies')
            .select('company_name, logo_url')
            .eq('id', otherId)
            .single()
          if (companyData) {
            otherName = companyData.company_name
            otherAvatar = companyData.logo_url
          }
        }

        // Count unread
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('is_read', false)

        return {
          ...conv,
          other_id: otherId,
          other_name: otherName,
          other_avatar: otherAvatar,
          unread: count || 0,
        }
      }))

      setConversations(enriched)
      setUnreadCount(enriched.reduce((sum, c) => sum + c.unread, 0))
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) return
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      return
    }

    setMessages(data || [])

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    // Refresh conversations to update unread counts
    loadConversations()
  }, [userId, loadConversations])

  // Send a message
  async function sendMessage(conversationId, content) {
    if (!userId || !conversationId || !content.trim()) return

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return null
    }

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message: content.trim(),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId)

    return data
  }

  // Start or get conversation with another user
  async function getOrCreateConversation(otherUserId) {
    if (!userId) return null

    const { data, error } = await supabase
      .rpc('get_or_create_conversation', {
        user1: userId,
        user2: otherUserId,
      })

    if (error) {
      console.error('Error creating conversation:', error)
      return null
    }

    await loadConversations()
    return data // returns conversation UUID
  }

  // Subscribe to realtime messages
  useEffect(() => {
    if (!userId) return

    loadConversations()

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new

          // If it's in our active conversation, add to messages
          if (activeConversation && newMsg.conversation_id === activeConversation) {
            setMessages(prev => [...prev, newMsg])

            // Auto-mark as read if we're viewing this conversation
            if (newMsg.sender_id !== userId) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id)
            }
          }

          // Refresh conversations list
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, activeConversation, loadConversations])

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation)
    }
  }, [activeConversation, loadMessages])

  return {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    sendMessage,
    getOrCreateConversation,
    unreadCount,
    loading,
    refresh: loadConversations,
  }
}
