import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import WifiList from "./components/WifiList/WifiList";
import { info } from "@tauri-apps/plugin-log";

function App() {
    const [wifiData, setWifiData] = useState(null);
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
            {wifiData && (
                <>
                    <h1>Available Wi-Fi Networks</h1>
                    <button onClick={loadWifiData} disabled={loading}>
                        {loading ? "Updating..." : "Update WiFi Data"}
                    </button>
                </>
            )}

            {wifiData ? (
                <WifiList wifiData={wifiData} />
            ) : (
                <p>{loading ? "Loading data..." : "No data loaded"}</p>
            )}
        </div>
    );
}

export default App;
