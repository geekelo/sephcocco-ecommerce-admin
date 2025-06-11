import { apiClient } from "./axios";


export const uploadSingleImage = async (file) => {
  const apiKey = import.meta.env.VITE_API_IMGBB_API_KEY; 

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await apiClient().post(
      `https://api.imgbb.com/1/upload?expiration=600&key=${apiKey}`,
      formData
    );
    return response.data.data;
  } catch (err) {
    console.error("Image upload failed:", err);
    throw err;
  }
};
