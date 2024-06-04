import { useState } from 'react';
import './App.css';
import MainView from './components/MainView';
import { EthProvider } from './contexts/EthContext'
import { Toaster } from 'react-hot-toast'
import { CircularProgress } from "@mui/material";
function App() {
  const [auth, setAuth] = useState(false);
  return (
    <>
    <Toaster
          position={auth ? "bottom-center" : "top-center"}
          reverseOrder={true}
        />
    <EthProvider setAuth={setAuth} >
      { auth ? (
        <div id="App">
          <MainView />
        </div>
      ) : (
		    <div className="flex justify-center items-center h-screen">
          <CircularProgress size={120} className="m-auto"/>
        </div>
      )}

    </EthProvider>
    </>
  );
}

export default App;
