import { Community } from '../../../atoms/communitiesAtom'
import { doc, getDoc } from 'firebase/firestore'
import { GetServerSidePropsContext } from 'next'
import React from 'react'
import safeJsonStringify from 'safe-json-stringify'
import { firestore } from '../../../firebase/clientApp'
import NotFound from '../../../components/Community/NotFound'
import Header from '../../../components/Community/Header'
import PageContent from '../../../components/Layout/PageContent'
import CreatePostLink from '@/src/components/Community/CreatePosLink'
import Posts from '@/src/components/Posts/Posts'

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  // console.log('here is the data', communityData)

  if (!communityData) {
    return <NotFound />
  }
  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <div>RHS</div>
        </>
      </PageContent>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get community data and pass it to the client
  try {
    const communityDocRef = doc(
      firestore,
      'communities',
      context.query.communityId as string
    )
    const communityDoc = await getDoc(communityDocRef)

    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
            )
          : '',
      },
    }
  } catch (error) {
    // Possible to add an error page here
    // console.log('GetServersideProps error', error)
  }
}
export default CommunityPage
