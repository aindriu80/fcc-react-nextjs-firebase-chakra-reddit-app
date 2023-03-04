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
  Link,
} from '@chakra-ui/react'
import React from 'react'
import { Text } from '@chakra-ui/react'
import { useRecoilState } from 'recoil'
import { authModalState } from '@/src/atoms/authModalAtom'
import AuthInputs from './AuthInputs'

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
          <ModalHeader textAlign="left">
            {modalState.view === 'login' && 'Login'}
            {modalState.view === 'signup' && 'Sign Up'}
            {modalState.view === 'resetPassword' && 'Reset Password'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            pb={6}>
            <Text fontSize="sm">
              By continuing, you agree are setting up a Reddit account and agree
              to our{' '}
              <Link color="#0079d3" href="#">
                User Agreement{' '}
              </Link>
              and{' '}
              <Link color="#0079d3" href="#">
                Privacy Policy.
              </Link>
            </Text>
            <Flex
              direction="column"
              align="center"
              justify="center"
              width="70%">
              {/* <OAuthButtons/> */}
              <AuthInputs />
              {/* <ResetPasswords/> */}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AuthModal
