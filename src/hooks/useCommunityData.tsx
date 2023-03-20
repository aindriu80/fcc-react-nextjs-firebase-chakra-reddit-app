import React from 'react'
import { useRecoilState } from 'recoil'
import { communityState } from '../atoms/communitiesAtom'

const useCommunityData = () => {
  const [communitySateValue, setCommunityStateValue] =
    useRecoilState(communityState)

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // is the user signed in?
    // if not => open the auth modal

    if (isJoined) {
      leaveCommunity(communityData.id)
      return
    }
    joinCommunity(communityData)
  }

  const joinCommunity = (communityData: Community) => {}

  const leaveCommunity = (communityId: string) => {}

  return {
    // data and functions
    communitySateValue,
    onJoinOrLeaveCommunity,
  }
}
export default useCommunityData
