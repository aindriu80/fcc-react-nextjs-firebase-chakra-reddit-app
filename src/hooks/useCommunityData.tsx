import { collection, getDocs } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState } from 'recoil'
import {
  Community,
  CommunitySnippet,
  communityState,
} from '../atoms/communitiesAtom'
import { auth, firestore } from '../firebase/clientApp'

const useCommunityData = () => {
  const [user] = useAuthState(auth)
  const [loading, setLoading] = useState('')
  const [communitySateValue, setCommunityStateValue] =
    useRecoilState(communityState)

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    if (isJoined) {
      leaveCommunity(communityData.id)
      return
    }
    joinCommunity(communityData)
  }

  const getMySnippets = async () => {
    setLoading(true)

    try {
      // get users snippets
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      )
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }))
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }))
      console.log('Here are the snippets', snippets)
    } catch (error) {
      console.log('getMySnippets error', error)
    }
    setLoading(false)
  }

  const joinCommunity = (communityData: Community) => {}

  const leaveCommunity = (communityId: string) => {}

  useEffect(() => {
    if (!user) return
    getMySnippets()
  }, [user])

  return {
    // data and functions
    communitySateValue,
    onJoinOrLeaveCommunity,
    loading,
  }
}
export default useCommunityData
