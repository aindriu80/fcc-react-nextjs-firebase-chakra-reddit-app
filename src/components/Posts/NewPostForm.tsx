import { Flex, Icon } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { BiPoll } from 'react-icons/bi'
import { BsLink45Deg, BsMic } from 'react-icons/bs'
import { IoDocumentText, IoImageOutline } from 'react-icons/io5'
import { AiFillCloseCircle } from 'react-icons/ai'
import TabItem from './TabItem'
import TextInputs from './PostForm/TextInputs'
import ImageUpload from './PostForm/ImageUpload'
import { Post } from '@/src/atoms/postsAtom'
import { User } from 'firebase/auth'
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { firestore, storage } from '@/src/firebase/clientApp'
import { getDownloadURL, ref } from 'firebase/storage'

type NewPostFormProps = {
  // user?: User | null
  user: User
}

const formTabs: TabItem[] = [
  {
    title: 'Post',
    icon: IoDocumentText,
  },
  {
    title: 'Images & Video',
    icon: IoImageOutline,
  },
  {
    title: 'Link',
    icon: IoImageOutline,
  },
  {
    title: 'Poll',
    icon: BiPoll,
  },
  {
    title: 'Talk',
    icon: BsMic,
  },
]

export type TabItem = {
  title: string
  icon: typeof Icon.arguments
}

const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
  const [loading, setLoading] = useState(false)
  const [textInputs, setTextInputs] = useState({ title: '', body: '' })
  const [selectedFile, setSelectedFile] = useState<string>()

  const handleCreatePost = async () => {
    const { communityId } = router.query

    // create the new post object => type Post
    const newPost: Post = {
      communityId: communityId as string,
      creatorId: user?.uid,
      creatorDisplayName: user.email!.split('@')[0],
      title: textInputs.title,
      body: textInputs.body,
      numberOfComments: 0,
      voteStatus: 0,
      createdAt: serverTimestamp() as Timestamp,
      // id: ''
    }

    setLoading(true)
    try {
      // store the post in database
      const postDocRef = await addDoc(collection(firestore, 'posts'), newPost)

      // check for selectedFile
      if (selectedFile) {
        // store in storage => getDownloadURL (return imageURL)
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`)
        await uploadImage(imageRef, selectedFile, 'data_url')
        const downloadURL = await getDownloadURL(imageRef)

        // update post doc by adding imageURL
        await updateDoc(postDocRef, {
          imageURL: downloadURL,
        })
      }
    } catch (error: any) {
      console.log('handleCreatePost error', error.message)
    }
    setLoading(false)
    // redirect the user back to the communityPage using the router
    // router.back()
  }

  const onSelectImage = async (event: React.ChangeEvent<HTMLImageElement>) => {
    const reader = new FileReader()

    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0])
    }
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target.result as string)
      }
    }
  }

  const onTextChange = async (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Flex direction="column" bg="white" borderRadius={4} mt={2}>
      <Flex width="100%">
        {formTabs.map((item) => (
          <TabItem
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex p="4px">
        {selectedTab === 'Post' && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={handleCreatePost}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === 'Images & Video' && (
          <ImageUpload
            selectedFile={selectedFile}
            onSelectImage={onSelectImage}
            setSelectedTab={selectedTab}
            setSelectedFile={setSelectedFile}
          />
        )}
      </Flex>
    </Flex>
  )
}
export default NewPostForm
function uploadImage(imageRef: any, selectedFile: any, arg2: string) {
  throw new Error('Function not implemented.')
}
