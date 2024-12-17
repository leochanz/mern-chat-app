import React, { useState } from "react";
import { Fieldset, Input, Group, InputAddon } from "@chakra-ui/react";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { toaster } from "../ui/toaster";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toaster.create({
        title: "Please Fill all the Fields",
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        "api/user/login",
        { email, password },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toaster.create({
        title: "Error Occured!",
        description: error.message,
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <Fieldset.Root size="lg" w="100%">
      <Fieldset.Content>
        <Field id="email" label="Email address" required>
          <Input
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </Field>

        <Field id="password" label="Password" required>
          <Group w="100%" attached>
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <InputAddon w="4.5rem">
              <Button
                variant="ghost"
                p={0}
                h="1.75rem"
                size="sm"
                onClick={handleClick}
              >
                {show ? "Hide" : "Show"}
              </Button>
            </InputAddon>
          </Group>
        </Field>

        <Button
          colorPalette="blue"
          w="100%"
          type="submit"
          style={{ marginTop: 15 }}
          onClick={submitHandler}
          isLoading={loading}
        >
          Login
        </Button>
        <Button
          colorPalette="red"
          w="100%"
          type="submit"
          onClick={() => {
            setEmail("guest@example.com");
            setPassword("123456");
          }}
        >
          Get Guest User Credentials
        </Button>
      </Fieldset.Content>
    </Fieldset.Root>
  );
};

export default Login;
