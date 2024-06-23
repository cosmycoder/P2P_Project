import { useEffect, useState } from 'react';
import  { FaSun, FaMoon } from 'react-icons/fa';

import CreateRoom from './CreateRoom';
import JoinGame from './JoinGame';
const MainView = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [view, setView] = useState('');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="top-0 w-1/2 m-auto h-16 mt-7 rounded-3xl dark:bg-blue-500 bg-blue-300 shadow-lg flex justify-center items-center">
        <div className="text-black dark:text-white text-lg lg:text-2xl">Bingo ETH</div>
      </div>
      {view === '' && (
        <div className="flex-grow flex justify-center items-center pt-[5em]">
          <div className="gap-2">
            <div className="flex flex-col lg:flex-row gap-4 mb-10">
              <button className="tile" onClick={() => { setView('createRoom'); }}>
                Crea stanza
              </button>
              <button className="tile" onClick={() => { setView('joinRandomGame'); }}>
                Entra in una stanza random
              </button>
              <button className="tile" onClick={() => { setView('joinGame'); }}>
                Entra in una stanza
              </button>
            </div>
            <div className="flex justify-center items-center">
              {isDarkMode ? (
                <button
                  className="theme-btn"
                  onClick={() => {
                    setIsDarkMode(false);
                    document.documentElement.classList.remove('dark');
                  }}
                >
                  <FaSun className="m-auto" size="20" />
                </button>
              ) : (
                <button
                  className="theme-btn"
                  onClick={() => {
                    setIsDarkMode(true);
                    document.documentElement.classList.add('dark');
                  }}
                >
                  <FaMoon className="m-auto" size="20" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {view === 'createRoom' && (
        <div className="flex justify-center items-center h-[calc(100vh-6.5rem)] w-screen">
          <CreateRoom setView={setView} />
        </div>
      )}
      {view === 'joinRandomGame' && (
        <div className="flex justify-center items-center h-[calc(100vh-6.5rem)] w-screen">
          <JoinGame setView={setView} randomGame={true} />
        </div>
      )}
      {view === 'joinGame' && (
        <div className="flex justify-center items-center h-[calc(100vh-6.5rem)] w-screen">
          <JoinGame setView={setView} randomGame={false} />
        </div>
      )}
    </div>
  );


};

export default MainView;
