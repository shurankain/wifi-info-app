import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import WifiList from "./WifiList";
import { info } from "@tauri-apps/plugin-log";

function App() {
    const wD = [
        { name: "Network 1", details: ["Signal: -45 dBm", "Channel: 11", "Security: WPA2"] },
        { name: "Network 2", details: ["Signal: -50 dBm", "Channel: 6", "Security: WPA2"] },
    ];
    
    const [wifiData, setWifiData] = useState(wD);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadWifiData();
    }, []);

    async function loadWifiData() {
        setLoading(true);
        try {
            let loadingResult = await invoke("get_wifi_data");
            info("Wifi data loaded: " + loadingResult);
            setWifiData(loadingResult);
            setLoading(false);
        } catch (error) {
            setWifiData("error during data retrieval");
        }
    }

    return (
        <div className="container">
            <button onClick={loadWifiData} disabled={loading}>
                "{loading ? "Updating..." : "Update WiFi Data"}"
            </button>

            {wifiData ? (
                <>
                    <h1>Available Wi-Fi Networks</h1>
                    <WifiList wifiData={wifiData} />
                </>
            ) : (
                <p>{loading ? "Loading data..." : "No data loaded"}</p>
            )}            
        </div>
    );
}

export default App;
