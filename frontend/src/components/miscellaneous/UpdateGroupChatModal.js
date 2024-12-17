import React, { useState } from "react";
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
import { Field } from "../ui/field";
import {
  Fieldset,
  Input,
  Group,
  InputAddon,
  Box,
  IconButton,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { Button } from "../ui/button";
import { ChatState } from "../../Context/ChatProvider";
import { toaster } from "../ui/toaster";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toaster.create({
        title: "User Already in group!",
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toaster.create({
        title: "Only admins can add someone!",
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.message,
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toaster.create({
        title: "Only admins can remove someone!",
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.message,
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.message,
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
    }
    setGroupChatName("");
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${query}`, config);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
    }
  };

  return (
    <DialogRoot size="lg">
      <DialogTrigger asChild>
        <IconButton display={{ base: "flex" }} variant="subtle">
          <i class="fas fa-eye"></i>
        </IconButton>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader
          fontSize="40px"
          fontFamily="Work sans"
          display="flex"
          justifyContent="center"
        >
          <DialogTitle
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </DialogTitle>
        </DialogHeader>
        <DialogBody display="flex" flexDir="column" alignItems="center">
          <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
            {selectedChat.users.map((user) => (
              <UserBadgeItem
                key={user._id}
                user={user}
                handleFunction={() => handleRemove(user)}
              />
            ))}
            <Fieldset.Root>
              <Fieldset.Content>
                <Field mb={3}>
                  <Group w="100%" attached>
                    <Input
                      placeholder="Chat Name"
                      value={groupChatName}
                      onChange={(e) => setGroupChatName(e.target.value)}
                    />
                    <Button
                      variant="solid"
                      colorPalette="teal"
                      size="sm"
                      isLoading={renameLoading}
                      onClick={handleRename}
                    >
                      Update
                    </Button>
                  </Group>
                </Field>
                <Field gapY={0}>
                  <Input
                    placeholder="Add User to group"
                    mb={1}
                    onChange={(e) => {
                      handleSearch(e.target.value);
                    }}
                  />
                  {loading ? (
                    <Spinner size="lg" />
                  ) : (
                    searchResult?.map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleAddUser(user)}
                      />
                    ))
                  )}
                </Field>
              </Fieldset.Content>
            </Fieldset.Root>
          </Box>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => {
              handleRemove(user);
              onClose();
            }}
            colorPalette="red"
          >
            Leave Group
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default UpdateGroupChatModal;
