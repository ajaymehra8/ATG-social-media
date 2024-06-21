import React, { useEffect ,useState} from "react";
import Header from "../Component/Header";
import DoPost from "../Component/DoPost";
import { Box, useRangeSlider, useToast,Spinner } from "@chakra-ui/react";
import Post from "../Component/Post";
import { useChange } from "../context/StateProvider";
import { getAllPost } from "../Api/post";
import data from '../fakeData/data.json';
import Trend from "../Component/Trend"
import axios from "axios";
const LogHomePage = () => {
  const { posts, setPosts, token } = useChange();
  const [loading,setLoading]=useState(false);
  const toast = useToast();
  const fetchAllPost = async () => {
    setLoading(true);
    const data = await getAllPost(token);
    if (data.success) {
      setPosts(data.posts);
    } else {
      toast({
        title: data.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

    }
    setLoading(false);
  };
  useEffect(() => {
    fetchAllPost();
  }, []);

  const deleteMyPost = async (post) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    await axios.delete(`http://localhost:8000/api/v1/post/${post._id}`, config);
    toast({
      title: "Your post deleted successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
    setPosts(posts.filter((p) => p._id !== post._id));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        width: "100vw",
      }}
    >
      <Header />
      <div
        style={{
          display: "flex",
          width: "100vw",
          padding: "20px",
          paddingLeft:"0",
          justifyContent: "center",
          gap: "50px",
        }}
      >
        <Box
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="center"
          height="90vh"
          width="40vw"
          style={{
            position: "sticky",
            top: "80px",
            bottom:"0",
            left:0
          }}
          background="#E2E8F0"
        >
          <h1 style={{fontSize:"30px",marginTop:"20px",fontWeight:"500"}}>Trends for you</h1>
         {data?.map(t=>{
          
          return <Trend trend={t}/>
         })}
        </Box>

        <div
          style={{
            width: "60vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
        {!loading&&  <DoPost />}
          <Box
            display="flex"
            flexDirection="column"
            gap="15px"
            alignItems="center"
            pb="20px"
            minWidth={"300px"}
          >
           {!loading? posts?.map((post) => (
              <Post
                key={post.id}
                post={post}
                deleteMyPost={() => deleteMyPost(post)}
              />
            )):(<Spinner
              size={"xl"}
              w={20}
              h={20}
              alignSelf={"center"}
              margin={"auto"}
            />)
          }
          </Box>
        </div>
      </div>
    </div>
  );
};

export default LogHomePage;
