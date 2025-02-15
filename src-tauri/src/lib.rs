use log::info;
use regex::Regex;
use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
struct Network {
    name: String,
    details: Vec<String>,
}

#[derive(Serialize)]
struct AllNetworks {
    current: Network,
    others: Vec<Network>,
}

#[tauri::command]
async fn get_wifi_data() -> Result<AllNetworks, String> {
    info!("Getting wifi data");
    let output = Command::new("system_profiler")
        .arg("SPAirPortDataType")
        .output();

    let res =
        match output {
            Ok(output) if output.status.success() => Ok(String::from_utf8(output.stdout)
                .unwrap_or_else(|_| "Invalid UTF-8 output".to_string())),
            Ok(output) => Err(format!("Command failed with status: {}", output.status)),
            Err(e) => Err(format!("Failed to execute command: {}", e)),
        };

    let trimmed = trim_data(res?);

    let splitted: Vec<String> = trimmed.lines().map(|s| s.to_string()).collect();

    let current_network: Network = Network {
        name: splitted.first().cloned().unwrap_or_default(),
        details: splitted.iter().skip(1).cloned().collect(),
    };

    let all_networks: AllNetworks = AllNetworks {
        current: current_network,
        others: Vec::new(),
    };

    Ok(all_networks)
}

pub fn trim_data(input_data: String) -> String {
    let re = Regex::new(r"(?s)Current Network Information:\s*(.*?)\s*Other Local Wi-Fi Networks:")
        .ok()
        .unwrap();

    re.captures(&input_data)
        .and_then(|caps| caps.get(1))
        .map(|m| m.as_str().trim().to_string())
        .unwrap() // Возвращаем пустую строку, если нет совпадений
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_wifi_data])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
