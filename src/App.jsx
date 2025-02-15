import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { info } from "@tauri-apps/plugin-log";

function App() {
    const [wifiData, setWifiData] = useState(null);

    useEffect(() => {
        async function loadWifiData() {
            try {
                let loadingResult = await invoke("get_wifi_data");
                info("Wifi data loaded: " + loadingResult);
                setWifiData(loadingResult);
            } catch (error) {
                setWifiData("error during data retrieval");
            }
        }
        loadWifiData();
    }, []);

    return (
        <main className="container">
            {wifiData && <h1>{wifiData[0].name}</h1>}
            {wifiData && wifiData.length > 0 && wifiData[0].details.map((line, index) => (
                <p key={index}>{line}</p>
            ))}
        </main>
    );
}

export default App;
