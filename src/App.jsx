import "./App.css";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
// import { info } from '@tauri-apps/plugin-log';

function App() {

 const [wifiData, setWifiData] = useState("Loading...");

 useEffect(() => {
    async function loadWifiData() {
      try {
        // info("Trying to load wifi data from Rust");
        let loadingResult = await invoke("get_wifi_data");
        // info("Wifi data loaded: " + loadingResult);
        setWifiData(loadingResult);
      } catch (error) {
        setWifiData("error during data retrieval");
      }
    }
    loadWifiData();
  }, []);

  return (
    <main className="container">
      <h1>{wifiData}</h1>
    </main>
  );
}

export default App;
