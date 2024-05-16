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
			<div>
				{
				isDarkMode ?
				<button 
				className="w-10 h-10 bg-blue-500 text-white items-center rounded-xl shadow-xl hover:bg-blue-600 transition duration-300"
				onClick={
					() => {
						setIsDarkMode(false);
						document.documentElement.classList.remove('dark');
					}}><FaSun className="m-auto" size="20"/></button> :
				<button
				className="w-10 h-10 bg-blue-500 text-white items-center rounded-xl shadow-xl hover:bg-blue-600 transition duration-300"
				onClick={
					() => {
						setIsDarkMode(true);
						document.documentElement.classList.add('dark');
					}}><FaMoon className="m-auto" size="20"/></button>
				}
			</div>
		{ view === "" &&
			<div className="flex justify-center items-center h-screen">
			<div className="grid grid-cols-3 gap-4">
			  <div className="tile" onClick={() => {setView("createRoom")}}>
				Crea stanza
			  </div>
			  <div className="tile" onClick={() => {setView("joinRandomGame")}}>
				Entra in una stanza random
			  </div>
			  <div className="tile" onClick={() => {setView("joinGame")}}>
				Entra in una stanza
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