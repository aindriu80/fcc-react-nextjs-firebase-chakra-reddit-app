import { Box, Text } from '@chakra-ui/react'
import React from 'react'
import PageContent from '../../../components/Layout/PageContent'
import NewPostForm from '../../../components/Posts/NewPostForm'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/src/firebase/clientApp'
import { communityState } from '@/src/atoms/communitiesAtom'
import { useRecoilValue } from 'recoil'
import useCommunityData from '@/src/hooks/useCommunityData'
import About from '@/src/components/Community/About'
const SubmitPostPage: React.FC = () => {
  const [user] = useAuthState(auth)
  // const communityStateValue = useRecoilValue(communityState)
  const { communityStateValue } = useCommunityData()
  console.log(`community`, communityStateValue)

  return (
    <PageContent>
      <>
        <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
          <Text>Create a post</Text>
        </Box>
        {user && (
          <NewPostForm
            user={user}
            communityImageURL={communityStateValue.currentCommunity.imageURL}
          />
        )}
      </>
      <>
        {communityStateValue.currentCommunity && (
          <About communityData={communityStateValue.currentCommunity} />
        )}
      </>
    </PageContent>
  )
}
export default SubmitPostPage
