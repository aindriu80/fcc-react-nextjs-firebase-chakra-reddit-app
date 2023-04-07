import React, { useEffect } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { Post, PostVote, postState } from '../atoms/postsAtom'
import { deleteObject, ref } from 'firebase/storage'
import { auth, firestore, storage } from '../firebase/clientApp'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { communityState } from '../atoms/communitiesAtom'
import { authModalState } from '../atoms/authModalAtom'

const usePosts = () => {
  const [user] = useAuthState(auth)
  const [postStateValue, setPostStateValue] = useRecoilState(postState)
  const currentCommunity = useRecoilValue(communityState).currentCommunity
  const setAuthModalState = useSetRecoilState(authModalState)

  const onVote = async (post: Post, vote: number, communityId: string) => {
    // if no user => open auth modal
    if (!user?.uid) {
      setAuthModalState({ open: true, view: 'login' })
      return
    }

    // check for a user => if not, open auth modal
    try {
      const { voteStatus } = post

      const existingVote = postStateValue.postVotes.find(
        (vote) => vote.postId === post.id
      )
      const batch = writeBatch(firestore)
      const updatedPost = { ...post }
      const updatedPosts = [...postStateValue.posts]
      let updatedPostVotes = [...postStateValue.postVotes]
      let voteChange = vote

      if (!existingVote) {
        // either add/subtract 1 to/from post.voteStatus
        // create a new postvote document
        const postVoteRef = doc(
          collection(firestore, 'users', `${user.uid}/postVotes`)
        )

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId,
          voteValue: vote,
        }
        batch.set(postVoteRef, newVote)

        // add/subtract 1 to/from post.voteStatus
        updatedPost.voteStatus = voteStatus + vote
        updatedPostVotes = [...updatedPostVotes, newVote]
      }
      // Existing vote - they have voted on the post already
      else {
        const postVoteRef = doc(
          firestore,
          'users',
          `${user?.uid}/postVotes/${existingVote.id}`
        )

        // Remove the vote which has already been placed (Up or Down)
        if (existingVote.voteValue === vote) {
          // add/subtract 1 to/from post.voteStatus
          updatedPost.voteStatus = voteStatus - vote
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          )

          // delete the postVote document
          batch.delete(postVoteRef)

          voteChange *= -1
        }
        // Flipping their vote (From Up to Down & vice versa)
        else {
          // add/subtract 2 to/from post.voteStatus
          updatedPost.voteStatus = voteStatus + 2 * vote

          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          )

          updatedPostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote,
          }

          // updating the existing postVote document
          batch.update(postVoteRef, {
            voteValue: vote,
          })
          voteChange = 2 * vote
        }
      }

      // update state with updated values
      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      )
      updatedPosts[postIdx] = updatedPost
      setPostStateValue((prev) => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes,
      }))

      // update our post document
      const postRef = doc(firestore, 'posts', post.id!)
      batch.update(postRef, { voteStatus: voteStatus + voteChange })

      await batch.commit()
    } catch (error) {
      console.log('OnVote Error', error)
    }
  }

  const onSelectPost = () => {}

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      // check if there is an image, delete if there is
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`)
        await deleteObject(imageRef)
      }

      // delete post document from firestore
      const postDocRef = doc(firestore, 'posts', post.id!)
      await deleteDoc(postDocRef)

      // update recoil state
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id != post.id),
      }))
      return true
    } catch (error) {
      return false
    }
  }

  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, 'users', `${user?.uid}/postVotes`),
      where('communityId', '==', communityId)
    )

    const postVoteDocs = await getDocs(postVotesQuery)
    const postVotes = postVoteDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    setPostStateValue((prev) => ({
      ...prev,
      postVotes: postVotes as PostVote[],
    }))
  }

  useEffect(() => {
    if (!user || !currentCommunity?.id) return
    getCommunityPostVotes(currentCommunity?.id)
  }, [user, currentCommunity])

  useEffect(() => {
    if (!user) {
      // Clear user post votes on logout
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
      }))
    }
  }, [user])

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
  }
}
export default usePosts
