use std::process::Command;
use log::info;

#[tauri::command]
async fn get_wifi_data() -> Result<String, String> {
    info!("Getting wifi data");
    let output = Command::new("system_profiler")
        .arg("SPAirPortDataType")
        .output();

    let res = match output {
        Ok(output) if output.status.success() => {
            std::str::from_utf8(&output.stdout).unwrap_or("Invalid UTF-8 output").to_string()
        }
        Ok(output) => {
            output.status.to_string()
        }
        Err(e) => {
            e.to_string()
        }
    };

    Ok(res)
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
