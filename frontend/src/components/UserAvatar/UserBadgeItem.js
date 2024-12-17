import React from "react";
import { Box, Text } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      varinant="solid"
      fontSize={12}
      background="purple"
      color="white"
      cursor="pointer"
      onClick={handleFunction}
    >
      <Text mr={1}>{user.name}</Text>
      <i class="fas fa-times"></i>
    </Box>
  );
};

export default UserBadgeItem;
