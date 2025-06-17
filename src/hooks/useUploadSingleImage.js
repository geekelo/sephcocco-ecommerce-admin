
import { useMutation } from "@tanstack/react-query";
import { uploadToImgbb } from "../services/imgbbUpload";

export const useUploadSingleImage = () => {
 
    return useMutation({
      mutationFn: async (file) => {
        const response = await uploadToImgbb(file); 
        return response
      }
    });
  };
  