import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Flex,
} from '@chakra-ui/react'
import React from 'react'

import { useRecoilState } from 'recoil'
import { authModalState } from '@/src/atoms/authModalAtom'

const AuthModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [modalState, setModalState] = useRecoilState(authModalState)

  const handleClose = () => {
    setModalState((prev) => ({
      ...prev,
      open: false,
    }))
  }
  return (
    <>
      <Modal isOpen={modalState.open} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalState.view === 'login' && 'Login'}
            {modalState.view === 'signup' && 'Sign Up'}
            {modalState.view === 'resetPassword' && 'Reset Password'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center">
            <Flex
              direction="column"
              align="center"
              justify="center"
              border="1px solid red"
              width="70%"></Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AuthModal
