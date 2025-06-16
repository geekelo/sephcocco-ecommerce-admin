import axios from 'axios';

const IMGBB_API_KEY = 'd44d270b693fcf092b6ebb50e7e6c781';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadToImgbb = async (imageFile) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('image', imageFile);

    // Make the request
    const response = await axios.post(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.url,
        display_url: response.data.data.display_url,
        thumb_url: response.data.data.thumb.url,
        delete_url: response.data.data.delete_url
      };
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading to imgbb:', error);
    throw error;
  }
}; 