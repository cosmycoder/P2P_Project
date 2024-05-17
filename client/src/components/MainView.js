import { useState } from "react";
import { Button } from "@mui/material"; 
import CreateRoom from "./CreateRoom";
import JoinRandomGame from "./JoinRandomGame";
import  { FaSun, FaMoon } from 'react-icons/fa'

const MainView = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [view, setView] = useState("")
	return(
		<div>
			 <div class="w-1/2 m-auto h-12 mt-7 rounded-lg dark:bg-blue-500 bg-blue-300 shadow-lg flex justify-center items-center">
        <div class="text-black dark:text-white text-lg">Bingo ETH</div>
    </div>
		{ view === "" &&
			<div className="flex justify-center items-center h-screen">
			<div className="grid grid-rows-2 gap-4">

			<div className="grid grid-cols-3 gap-4">
			  <button className="tile" onClick={() => {setView("createRoom")}}>
				Crea stanza
			  </button>
			  <button className="tile" onClick={() => {setView("joinRandomGame")}}>
				Entra in una stanza random
			  </button>
			  <button className="tile" onClick={() => {setView("joinGame")}}>
				Entra in una stanza
			  </button>
			  </div>
				<div className="flex justify-center items-center">
					{
					isDarkMode ?
					<button 
					className="theme-btn"
					onClick={
						() => {
							setIsDarkMode(false);
							document.documentElement.classList.remove('dark');
						}}><FaSun className="m-auto" size="20"/></button> :
					<button
					className="theme-btn"
					onClick={
						() => {
							setIsDarkMode(true);
							document.documentElement.classList.add('dark');
						}}><FaMoon className="m-auto" size="20"/></button>
					}
				</div>
			</div>
		  </div>
		
		} {
			view === "createRoom" &&
			<CreateRoom setView={setView} />
		}{
			view === "joinRandomGame" &&
			<JoinRandomGame setView={setView} />
		}{
			view === "joinGame" &&
			<div className="flex justify-center items-center h-screen">
				<Button variant="outlined" onClick={() => {setView("")}}>Torna indietro</Button>
			</div>
		}
		
		</div>
		)
		
};

export default MainView;