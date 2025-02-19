import React from "react";
import { IconButton, Text, Image } from "@chakra-ui/react";
import { Button } from "../ui/button";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useDisclosure } from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <DialogRoot size="lg">
        {children ? (
          <DialogTrigger asChild>{children}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <IconButton
              display={{ base: "flex" }}
              variant="subtle"
              onClick={onOpen}
            >
              <i class="fas fa-eye"></i>
            </IconButton>
          </DialogTrigger>
        )}

        <DialogContent h="410px">
          <DialogHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            <DialogTitle>{user.name}</DialogTitle>
          </DialogHeader>
          <DialogBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic}
              alt={user.name}
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
            >
              Email: {user.email}
            </Text>
          </DialogBody>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default ProfileModal;
