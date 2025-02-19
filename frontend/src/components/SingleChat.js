import React, { useState, useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Text,
  IconButton,
  Spinner,
  Input,
  Group,
  Fieldset,
} from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { toaster } from "./ui/toaster";
import { Avatar } from "./ui/avatar";
import axios from "axios";
import "./styles.css";
import io from "socket.io-client";
import Lottie from "react-lottie";
import * as animationData from "../animations/typing.json";

const ENDPOINT = process.env.ENDPOINT;
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState([]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.message,
        type: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", (userData) => {
      setIsTyping(true);
      setTypingUser([...typingUser, userData]);
      console.log("typingUser:", [...typingUser, userData]);
    });
    socket.on("stop typing", (userData) => {
      setIsTyping(false);
      setTypingUser(typingUser.filter((user) => user._id !== userData._id));
      console.log(
        "stop typingUser:",
        typingUser.filter((user) => user._id !== userData._id)
      );
    });
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  });

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      const userData = { _id: user._id, name: user.name, pic: user.pic };
      socket.emit("stop typing", selectedChat._id, userData);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);

        setMessages([...messages, data]);
      } catch (error) {
        toaster.create({
          title: "Error Occured!",
          description: error.message,
          type: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing Indicator Logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      const userData = { _id: user._id, name: user.name, pic: user.pic };
      socket.emit("typing", selectedChat._id, userData);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        const userData = { _id: user._id, name: user.name, pic: user.pic };
        socket.emit("stop typing", selectedChat._id, userData);
        setTyping(false);
      }
    }, timerLength);
  };

  // console.log(notification);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              variant="subtle"
              onClick={() => setSelectedChat("")}
            >
              <i class="fas fa-arrow-left"></i>
            </IconButton>
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <Fieldset.Root>
              <Fieldset.Content>
                <Field mt={3} onKeyDown={sendMessage} isRequired>
                  {isTyping && (
                    <Box
                      display="flex"
                      flexDir="row"
                      alignItems="center"
                      mt="7px"
                    >
                      {typingUser.map((user) => (
                        <Avatar
                          mr={1}
                          size="sm"
                          cursor="pointer"
                          name={user.name}
                          src={user.pic}
                        />
                      ))}
                      <Lottie
                        options={defaultOptions}
                        width={70}
                        height={30}
                        style={{ marginBottom: 15, marginLeft: 0 }}
                      />
                    </Box>
                  )}
                  <Group w="100%" attached>
                    <Input
                      variant="filled"
                      bg="#E0E0E0"
                      placeholder="Enter a message.."
                      onChange={typingHandler}
                      value={newMessage}
                    />
                  </Group>
                </Field>
              </Fieldset.Content>
            </Fieldset.Root>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
