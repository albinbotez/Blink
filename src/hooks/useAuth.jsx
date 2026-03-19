import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)         // Supabase auth user
  const [profile, setProfile] = useState(null)    // Profile or company data
  const [userType, setUserType] = useState(null)  // 'influencer' or 'business'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setUserType(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserProfile(userId) {
    try {
      // Get user type
      const { data: typeData } = await supabase
        .from('user_types')
        .select('user_type')
        .eq('id', userId)
        .single()

      if (typeData) {
        setUserType(typeData.user_type)

        if (typeData.user_type === 'influencer') {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          setProfile(profileData)
        } else {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('id', userId)
            .single()
          setProfile(companyData)
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sign up as influencer
  async function signUpInfluencer(email, password, profileData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) throw authError

    const userId = authData.user.id

    // Set user type
    await supabase.from('user_types').insert({ id: userId, user_type: 'influencer' })

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      name: profileData.name,
      bio: profileData.bio,
      instagram_username: profileData.instagram,
      age: profileData.age ? parseInt(profileData.age) : null,
      city: profileData.city,
      country: profileData.country,
      niche: profileData.niche,
      followers: profileData.followers ? parseInt(profileData.followers) : 0,
      engagement_rate: profileData.engagement_rate ? parseFloat(profileData.engagement_rate) : 0,
      audience_age_13_17: parseInt(profileData.age_13_17) || 0,
      audience_age_18_24: parseInt(profileData.age_18_24) || 0,
      audience_age_25_34: parseInt(profileData.age_25_34) || 0,
      audience_age_35_44: parseInt(profileData.age_35_44) || 0,
      audience_age_45_plus: parseInt(profileData.age_45) || 0,
      audience_female: parseInt(profileData.gender_female) || 50,
      audience_male: parseInt(profileData.gender_male) || 50,
      top_markets: JSON.stringify([
        { city: profileData.market1_city || '', country: profileData.market1_country || '' },
        { city: profileData.market2_city || '', country: profileData.market2_country || '' },
        { city: profileData.market3_city || '', country: profileData.market3_country || '' },
      ]),
    })
    if (profileError) throw profileError

    setUserType('influencer')
    await loadUserProfile(userId)
    return authData
  }

  // Sign up as business
  async function signUpBusiness(email, password, companyData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authError) throw authError

    const userId = authData.user.id

    await supabase.from('user_types').insert({ id: userId, user_type: 'business' })

    const { error: companyError } = await supabase.from('companies').insert({
      id: userId,
      company_name: companyData.company_name,
      industry: companyData.industry,
      description: companyData.description,
    })
    if (companyError) throw companyError

    setUserType('business')
    await loadUserProfile(userId)
    return authData
  }

  // Sign in
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setUserType(null)
  }

  // Update profile
  async function updateProfile(updates) {
    if (!user) return
    const table = userType === 'influencer' ? 'profiles' : 'companies'
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  // Upload avatar
  async function uploadAvatar(file) {
    if (!user) return
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const field = userType === 'influencer' ? 'avatar_url' : 'logo_url'
    await updateProfile({ [field]: publicUrl })
    return publicUrl
  }

  const value = {
    user,
    profile,
    userType,
    loading,
    signUpInfluencer,
    signUpBusiness,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar,
    refreshProfile: () => user && loadUserProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
