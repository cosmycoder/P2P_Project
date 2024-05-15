import { useState } from 'react';
import './App.css';
import MainView from './components/MainView';
import { EthProvider } from './contexts/EthContext'
function App() {
  return (
    <EthProvider >
      <div id="App">
        <MainView />
      </div>
    </EthProvider>
  );
}

export default App;
