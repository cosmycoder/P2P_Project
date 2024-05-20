import { useState } from "react";
import { Button } from "@mui/material";
import CreateRoom from "./CreateRoom";
import JoinRandomGame from "./JoinRandomGame";
import JoinGame from "./JoinGame";

const MainView = () => {
  const [view, setView] = useState("")
  return (
    <div>
      {view === "" && (
        <div className="flex justify-center items-center h-screen">
          <div className="grid grid-cols-3 gap-4">
            <div className="tile" onClick={() => setView("createRoom")}>
              Crea stanza
            </div>
            <div className="tile" onClick={() => setView("joinRandomGame")}>
              Entra in una stanza random
            </div>
            <div className="tile" onClick={() => setView("joinGame")}>
              Entra in una stanza
            </div>
          </div>
        </div>
      )}
      {view === "createRoom" && (
        <div className="flex justify-center items-center h-screen">
          <CreateRoom setView={setView} />
        </div>
      )}
      {view === "joinRandomGame" && (
        <div className="flex justify-center items-center h-screen">
          <JoinRandomGame setView={setView} />
        </div>
      )}
      {view === "joinGame" && (
        <div className="flex justify-center items-center h-screen">
          <JoinGame setView={setView} />
        </div>
      )}
    </div>
  );
};

export default MainView;