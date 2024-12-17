import React, { useState } from "react";
import { Fieldset, Input, Group, InputAddon } from "@chakra-ui/react";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Toaster, toaster } from "../ui/toaster";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [password, setPassword] = useState();
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toaster.create({
        title: "Please select an Image",
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dneqwi3qd");
      fetch("https://api.cloudinary.com/v1_1/dneqwi3qd/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          console.log(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toaster.create({
        title: "Please select an Image",
        type: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !pic) {
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
    if (password !== confirmpassword) {
      toaster.create({
        title: "Passwords Do Not Match",
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
        "/api/user",
        { name, email, password, pic },
        config
      );
      toaster.create({
        title: "Registration Successful",
        type: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chat");
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
        <Field id="first-name" label="Name" w="100%" required>
          <Input
            placeholder="Enter Your Name"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field id="email" label="Email address" required>
          <Input
            placeholder="Enter Your Email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field id="password" label="Password" required>
          <Group w="100%" attached>
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
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

        <Field id="confirm-password" label="Confirm Password" required>
          <Group w="100%" attached>
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter Your Password"
              onChange={(e) => setConfirmpassword(e.target.value)}
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

        <Field id="pic" label="Upload your Picture">
          <Input
            type="file"
            p={1.5}
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])}
          />
        </Field>
      </Fieldset.Content>

      <Button
        colorPalette="blue"
        w="100%"
        type="submit"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        loading={loading}
      >
        Sign Up
      </Button>
    </Fieldset.Root>
  );
};

export default Signup;
