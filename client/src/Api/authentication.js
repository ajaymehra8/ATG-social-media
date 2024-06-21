import axios from "axios";
export const loginApi = async ( dataInfo ) => {
    if ( !dataInfo.email || !dataInfo.password ) {
        return {
          success: false,
          message: "Please provide all required things.",
        };
      }
      const {data}= await axios.post(`https://atg-social-media-backend-blush.vercel.app/api/v1/user/login`,{
        email: dataInfo.email,
        password: dataInfo.password,

      });
      return data;
    
      
};

export const signupApi = async (dataInfo) => {
  if (!dataInfo.name || !dataInfo.email || !dataInfo.password || !dataInfo.passwordConfirm) {
    return {
      success: false,
      message: "Please provide all required things.",
    };
  }
  const { data } = await axios.post(`https://atg-social-media-backend-blush.vercel.app/api/v1/user/signup`,{
    name: dataInfo.name,
    email: dataInfo.email,
    password: dataInfo.password,
    passwordConfirm: dataInfo.passwordConfirm,
  });
  return data;
};
