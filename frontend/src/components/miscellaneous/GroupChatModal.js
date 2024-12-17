import React, { useState } from "react";
import { Flex, Input } from "@chakra-ui/react";
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
import { toaster } from "../ui/toaster";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import { useDisclosure } from "@chakra-ui/react";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

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

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toaster.create({
        title: "Please Fill all the Fields",
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      toaster.create({
        title: "New Group Chat Created!",
        type: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toaster.create({
        title: "Failed to Create the Chat!",
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toaster.create({
        title: "User already added",
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  return (
    <DialogRoot isOpen={isOpen} onClose={onClose} size="lg">
      <DialogTrigger asChild>{children}</DialogTrigger>

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
            Create Group Chat
          </DialogTitle>
        </DialogHeader>
        <DialogBody display="flex" flexDir="column" alignItems="center">
          <Input
            placeholder="Chat Name"
            mb={3}
            onChange={(e) => setGroupChatName(e.target.value)}
          />
          <Input
            placeholder="Add Users: eg: John, Jane"
            mb={1}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Flex w="100%" flexWrap="wrap">
            {selectedUsers.map((user) => (
              <UserBadgeItem
                key={user._id}
                user={user}
                handleFunction={() => handleDelete(user)}
              />
            ))}
          </Flex>

          {loading ? (
            <div>loading...</div>
          ) : (
            searchResult
              .slice(0, 4)
              .map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleGroup(user)}
                />
              ))
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            colorPalette="blue"
            onClick={() => {
              handleSubmit();
              onClose();
            }}
          >
            Create Chat
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default GroupChatModal;
