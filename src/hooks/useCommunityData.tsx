import { setDefaultResultOrder } from 'dns'
import {
  collection,
  doc,
  getDocs,
  increment,
  writeBatch,
} from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { authModalState } from '../atoms/authModalAtom'
import {
  Community,
  CommunitySnippet,
  communityState,
} from '../atoms/communitiesAtom'
import { auth, firestore } from '../firebase/clientApp'

const useCommunityData = () => {
  const [user] = useAuthState(auth)
  const setAuthModalState = useSetRecoilState(authModalState)
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [communitySateValue, setCommunityStateValue] =
    useRecoilState(communityState)

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // is the user logged in?
    // if not open the auth modal !
    if (!user) {
      // open modal
      setAuthModalState({ open: true, view: 'login' })
      return
    }

    setLoading(false)
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
    } catch (error: any) {
      console.log('getMySnippets error', error)
      setError(error.message)
    }
    setLoading(false)
  }

  const joinCommunity = async (communityData: Community) => {
    // Batch write ->
    // updating the number of members on this community (1)
    try {
      const batch = writeBatch(firestore)

      // creating a new community snippet
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || '',
      }
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      )

      batch.update(doc(firestore, 'communities', communityData.id), {
        numberOfMembers: increment(1),
      })

      await batch.commit()
      // Update recoil state - communityState.mySnippetrs
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }))
      setLoading(false)
    } catch (error: any) {
      console.log('joinCommunity Error', error)
      setError(error.message)
    }
  }

  const leaveCommunity = async (communityId: string) => {
    // Batch write ->
    try {
      const batch = writeBatch(firestore)
      //  deleting the community snippet from user
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      )

      // updating the number of members on this community (-1)
      batch.update(doc(firestore, 'communities', communityId), {
        numberOfMembers: increment(-1),
      })
      await batch.commit()

      // Update recoil state - communityState.mySnippetrs
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }))
    } catch (error: any) {
      console.log('leaveCommunity error', error.message)
      setError(error.message)
    }
    setLoading(false)
  }

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
