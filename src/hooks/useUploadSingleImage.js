
import { useMutation } from "@tanstack/react-query";

import { uploadSingleImage } from "../services/imageUpload";

export const useUploadSingleImage = () => {
 
    return useMutation({
      mutationFn: async (file) => {
        const response = await uploadSingleImage(file); 
        return response
      }
    });
  };
  