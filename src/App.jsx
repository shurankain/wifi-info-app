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
            {/* Prints current network data, if awailable */}
            {wifiData && wifiData.length > 0 && (
                <>
                    <h1>Current network: </h1>
                    <h2>{wifiData[0].name}</h2>
                    {wifiData[0].details.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </>
            )}

            {/* Prints other networks data, if awailable */}
            {wifiData && wifiData.length > 1 && (
                <>
                    <h1>Other available networks:</h1>
                    {wifiData.slice(1).map((networkData, index) => (
                        <div key={index}>
                            <h2>{networkData.name}</h2>
                            {networkData.details.map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                        </div>
                    ))}
                </>
            )}
        </main>
    );
}

export default App;
