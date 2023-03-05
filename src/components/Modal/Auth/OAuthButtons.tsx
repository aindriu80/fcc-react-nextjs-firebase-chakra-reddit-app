import { Button, Flex, Image } from '@chakra-ui/react'
import React from 'react'

const OAuthButtons: React.FC = () => {
  return (
    <Flex direction="column" width="100%" mb={4}>
      <Button variant="oauth" mb={2} mt={2}>
        <Image src="/images/googlelogo.png" height="20px" mr={2} />
        Continue with Google
      </Button>

      <Button variant="oauth">
        <Image src="/images/microsoftlogo.svg" height="20px" mr={2} />
        Continue with Microsoft
      </Button>
    </Flex>
  )
}
export default OAuthButtons
