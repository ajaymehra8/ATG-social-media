
import {
  Box,
  Text,
  Image,
  Modal,
  IconButton,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Avatar,
  useDisclosure,
  Textarea,
  useToast,
  Input,
  FormControl,
  FormLabel
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useChange } from "../context/StateProvider";
import { doPostApi } from "../Api/post";
import axios from "axios";

const Option = ({ handleFunction, showOption,setShowOption,post }) => {
  const [click, setClick] = useState(false);
  const { user, token } = useChange();
  const [text, setText] = useState(post?.text);
  const [image,setImage]=useState();
  const [imageUrl,setImageUrl]=useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };


  //   FUNCTION FOR DOING POST
  const handleUpdatePost = async (post) => {
const form=new FormData();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    form.append("text",text);
    if(image){
      form.append("image",image)
    }
    const {data} = await axios.patch(`https://atg-social-media-backend-blush.vercel.app/api/v1/post/${post._id}`,form,config);
    if (data.success) {
      toast({
        title: "Your post updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    
    } else {
      toast({
        title: data.messge,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
    onClose();
  };
  return (
    <Box
      display={showOption ? "flex" : "none"}
      flexDirection={"column"}
      gap={2}
      alignItems={"center"}
      justifyContent={"center"}
      position={"absolute"}
      bg={"white"}
      color={"black"}
      p={4}
      boxShadow={"0 4px 8px 0 rgba(0, 0, 0, 0.2)"}
      className="option"
    >
      <Box
        cursor={"pointer"}
        bg={"#E8E8E8"}
        color={"black"}
        px={3}
        py={2}
        borderRadius={"lg"}
        className="updateBtn"
      >
        <Text onClick={onOpen}>Update Post</Text>
      </Box>
      <Box
        cursor={"pointer"}
        bg={"#E8E8E8"}
        color={"black"}
        px={3}
        py={2}
        borderRadius={"lg"}
        onClick={()=>{handleFunction();setShowOption(false)}}
        className="deleteBtn"
      >
        <Text>Delete Post</Text>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Box display={"flex"} justifyContent={"flex-start"} gap={2}>
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={user.name}
                src={user.pic}
              />
              <Text>{user.name}</Text>
            </Box>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea
              placeholder="What do you want to talk about"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
             
             {image && (
                <Image
                  src={imageUrl}
                  alt="post img"
                  width="400px"
                  height="300px"
                  marginTop={'30px'}
                />
              )}
                          <FormControl id="photo-upload">
                <FormLabel htmlFor="photo">
                  <IconButton
                    colorScheme="teal"
                    aria-label="Upload photo"
                    marginTop={"20px"}
                    icon={<i class="bi bi-card-image"></i>}
                  />
                </FormLabel>
                <Input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  position={"absolute"}
                  top={"20px"}
                  visibility={"hidden"}
                  onChange={handleImageChange}
                />
              </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={()=>{handleUpdatePost(post)}}>
              Update Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Option;
