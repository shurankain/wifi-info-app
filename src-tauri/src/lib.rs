use log::info;
use regex::Regex;
use serde::Serialize;
use std::process::Command;

#[derive(Serialize, Clone)]
struct Network {
    name: String,
    details: Vec<String>,
    is_current: bool,
}

#[tauri::command]
async fn get_wifi_data() -> Result<Vec<Network>, String> {
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

    let current = trim_current_network_data(res.clone()?);
    let others = trim_other_networks_data(res.clone()?);

    let splitted: Vec<String> = current.lines().map(|s| s.to_string()).collect();

    let current_network: Network = Network {
        name: splitted.first().cloned().unwrap_or_default(),
        details: splitted.iter().skip(1).cloned().collect(),
        is_current: true,
    };

    let other_networks_lines: Vec<&str> = others.lines().collect();

    let mut other_networks_vec: Vec<Network> = Vec::new();

    for i in (0..other_networks_lines.len()).step_by(6) {
        if let Some(name) = other_networks_lines.get(i) {
            let network = Network {
                name: name.to_string(),
                details: Vec::new(),
                is_current: false,
            };

            other_networks_vec.push(network);
        }
    }

    let mut all_networks_vec = vec![current_network];
    all_networks_vec.extend(other_networks_vec);

    Ok(all_networks_vec)
}

pub fn trim_current_network_data(input_data: String) -> String {
    let regx =
        Regex::new(r"(?s)Current Network Information:\s*(.*?)\s*Other Local Wi-Fi Networks:")
            .ok()
            .unwrap();

    trim_data(input_data, regx)
}

pub fn trim_other_networks_data(input_data: String) -> String {
    let regx = Regex::new(r"(?s)Other Local Wi-Fi Networks:\s*(.*?)\s*awdl0")
        .ok()
        .unwrap();

    trim_data(input_data, regx)
}

pub fn trim_data(input_data: String, regx: Regex) -> String {
    regx.captures(&input_data)
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
