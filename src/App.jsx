import AppRouter from "./routes/AppRouter";
import {  QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/lib";
import { ToastContainer } from "react-toastify";

function App() {


  return       <QueryClientProvider client={queryClient}>
    
        <AppRouter />
         <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light" // or "dark"
      />
      </QueryClientProvider>
}

export default App;
