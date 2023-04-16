import { Stack } from '@chakra-ui/react'
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilValue } from 'recoil'
import { communityState } from '../atoms/communitiesAtom'
import { Post } from '../atoms/postsAtom'
import CreatePostLink from '../components/Community/CreatePosLink'
import PageContent from '../components/Layout/PageContent'
import PostItem from '../components/Posts/PostItem'
import PostLoader from '../components/Posts/PostLoader'
import { auth, firestore } from '../firebase/clientApp'
import useCommunityData from '../hooks/useCommunityData'
import usePosts from '../hooks/usePosts'

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const {
    setPostStateValue,
    postStateValue,
    onSelectPost,
    onDeletePost,
    onVote,
  } = usePosts()
  const { communityStateValue } = useCommunityData()

  const buildUserHomeFeed = async () => {
    // fetch some posts from each community that the user is in
    setLoading(true)
    try {
      if (communityStateValue.mySnippets.length) {
        // get posts from users communities
        const myCommunitiesIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        )
        const postQuery = query(
          collection(firestore, 'posts'),
          where('communityID', 'in', myCommunitiesIds),
          limit(10)
        )
        const postDocs = await getDocs(postQuery)
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setPostStateValue((prev) => ({
          ...prev,
          posts: posts as Post[],
        }))
      } else {
        buildNoUserHomeField()
      }
    } catch (error) {
      console.log('buildUserHomeFeed error', error)
    }
    setLoading(false)
  }

  const buildNoUserHomeField = async () => {
    setLoading(true)
    try {
      const postQuery = query(
        collection(firestore, 'posts'),
        orderBy('voteStatus', 'desc'),
        limit(10)
      )
      const postDocs = await getDocs(postQuery)
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }))
    } catch (error) {
      console.log('buildNoUserHomeField error', error)
    }
    setLoading(false)
  }

  const getUserPostVotes = () => {}

  // useEffects

  useEffect(() => {
    if (communityStateValue.snippetsFetched) buildUserHomeFeed()
  }, [communityStateValue.snippetsFetched])

  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeField()
  }, [user, loadingUser])

  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id
                  )?.voteValue
                }
                userIsCreator={user?.uid === post.creatorId}
                homePage
              />
            ))}
          </Stack>
        )}
      </>
      <>{/* Recommendations  */}</>
    </PageContent>
  )
}

export default Home
