import React from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const toast = useToast();
  const history = useHistory();

  const handleClick = () => {
    setShow(!show);
  };
  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/user/login",
        { email, password },
        config
      );
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      console.log("{data}", data);
      setLoading(false);
      history.push("/chats");
      window.location.reload();
    } catch (err) {
      toast({
        title: "Error Occured!",
        description: err.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing={"5px"}>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <InputRightElement width={"4.5rem"}>
            <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl>
        <Button
          colorScheme="blue"
          width={"100%"}
          style={{ marginTop: 15 }}
          onClick={submitHandler}
          isLoading={loading}
        >
          Login
        </Button>
        <Button
          colorScheme="red"
          width={"100%"}
          style={{ marginTop: 15 }}
          onClick={() => {
            setEmail("guest@example.com");
            setPassword("123456");
          }}
        >
          Get Guest User Credentials
        </Button>
      </FormControl>
    </VStack>
  );
};

export default Login;
