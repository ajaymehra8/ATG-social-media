import axios from 'axios';

export const doPostApi=async(post,user,token)=>{
if(!post.text&&!post.image){
    return {
        success:false,
        message:"Please provide any content in your post"
    }
}
const form=new FormData();
form.append('text', post.text);
if(post.image){
    form.append('image', post.image);

}  

const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
const {data}=await axios.post(`https://atg-social-media-backend-blush.vercel.app/api/v1/post/${user._id}`,form,config);
return data;
}
export const getAllPost=async(token)=>{
    const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const {data}=await axios.get(`https://atg-social-media-backend-blush.vercel.app/api/v1/post`,config);
    return data;
}