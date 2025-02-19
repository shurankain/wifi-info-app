import { useState } from "react";
import { info } from "@tauri-apps/plugin-log";

function WifiList({ wifiData }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const toggleDetails = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div>
            {wifiData.map((network, index) => (
                <div key={index}>
                    <h2 
                        onClick={() => toggleDetails(index)} 
                        style={{ cursor: "pointer", color: network.is_current ? "green" : "black", textDecoration: "underline" }}
                    >
                        {network.name}
                    </h2>
                    {expandedIndex === index && (
                        <div>
                            {network.details.map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WifiList;
