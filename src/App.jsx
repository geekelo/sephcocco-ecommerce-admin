import AppRouter from "./routes/AppRouter";
import {  QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./services/lib";

function App() {


  return       <QueryClientProvider client={queryClient}>
        <AppRouter />;
      </QueryClientProvider>
}

export default App;
