import React, { useState } from "react";
import { Box, Text, Input, Spinner } from "@chakra-ui/react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { Avatar } from "../ui/avatar";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../ui/menu";
import ProfileModal from "./ProfileModal";
import { ChatState } from "../../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import {
  DrawerActionTrigger,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { toaster } from "../ui/toaster";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const navigate = useNavigate();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toaster.create({
        title: "Please Enter something in search",
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
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

      const { data } = await axios.get(`/api/user?search=${search}`, config);
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
      return;
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      // onClose();
    } catch (error) {
      toaster.create({
        title: "Error fetching the chat",
        description: error.message,
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      <DrawerRoot placement="start">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="white"
          w="100%"
          p="5px 10px 5px 10px"
          borderWidth="5px"
        >
          <Tooltip
            content="Search Users to chat"
            hasArrow
            placement="bottom-end"
          >
            <DrawerTrigger asChild>
              <Button variant="ghost">
                <i class="fas fa-search"></i>
                <Text display={{ base: "none", md: "flex" }} px="4">
                  Search User
                </Text>
              </Button>
            </DrawerTrigger>
          </Tooltip>
          <Text fontSize="2xl" fontFamily="Work sans">
            Talk-A-Tive
          </Text>
          <div>
            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="plain" size="sm">
                  <i class="fas fa-bell"></i>
                  <NotificationBadge
                    count={notification.length}
                    effect={Effect.SCALE}
                  />
                </Button>
              </MenuTrigger>
              <MenuContent pl={2}>
                {!notification.length && "No New Messages"}
                {notification.map((notif, i) => (
                  <MenuItem
                    key={notif._id}
                    value={i}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>
            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="plain" size="sm">
                  <Avatar
                    size="sm"
                    cursor="pointer"
                    name={user.name}
                    src={user.pic}
                  />
                  <i class="fas fa-chevron-down"></i>
                </Button>
              </MenuTrigger>
              <MenuContent>
                <ProfileModal user={user}>
                  {/* <MenuItem value="profile">My Profile</MenuItem> */}
                </ProfileModal>
                <MenuItem value="logout" onClick={logoutHandler}>
                  Logout
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </div>
        </Box>

        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <DrawerTitle>Search Users</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>

          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>
    </>
  );
};

export default SideDrawer;
