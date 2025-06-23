import axios from 'axios';

const IMGBB_API_KEY = import.meta.env.VITE_API_IMGBB_API_KEY;
const IMGBB_API_URL = import.meta.env.VITE_API_IMGBB_API_URL;



export const uploadToImgbb = async (imageFile) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', imageFile);

    // Make the request
    const response = await axios.post(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        "Accept": "application/json"
      },
    });
console.log(response);

    if (response.data.success) {
      return {
        success: true,
        url: response.data?.data?.image?.url,
        display_url: response?.data?.data?.display_url,
        thumb_url: response?.data?.data?.thumb.url,
        delete_url: response?.data?.data?.delete_url
      };
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading to imgbb:', error);
    throw error;
  }
}; 