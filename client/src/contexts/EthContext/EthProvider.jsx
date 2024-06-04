import React, { useReducer, useCallback, useEffect } from "react";
import Web3, { HexProcessingError } from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";
import toast from "react-hot-toast";
function EthProvider({ children, setAuth }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  let accounts;

  const init = useCallback(
    async artifact => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || `ws://${process.env.REACT_APP_SERVICE_HOST}:${process.env.REACT_APP_SERVICE_PORT}`);

        try {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch {}
        if (!accounts) {
          toast("Please authenticate into your MetaMask account", {icon: '🔐'});
          setAuth(false);
        } else {
          setAuth(true);
        }
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract }
        });
      }
    }, []);



  useEffect(() => {
    const tryInit = async () => {
      try {
        const artifact = require("../../contracts/Bingo.json");
        init(artifact);
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = (accounts) => {
      init(state.artifact);
      if (!accounts || accounts.length === 0) {
        toast("Please authenticate into your MetaMask account", {icon: '🔐'});
        setAuth(false);
      } else {
        setAuth(true);
      }
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    window.ethereum.on("GameCreated", () => {console.log("GameCreated")})
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
