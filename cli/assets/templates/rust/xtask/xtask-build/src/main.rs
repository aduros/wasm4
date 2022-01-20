use binary_install::Cache;
use cargo_metadata::{camino::Utf8PathBuf, Artifact, Message};
use log::{debug, error, info, warn};
use std::{
    env,
    io::{self, BufRead, Write},
    panic::resume_unwind as silent_panic,
    path::{Path, PathBuf},
    process::{self, Command},
};

fn main() {
    env_logger::init_from_env("CARGO_XTASK_LOG");

    let args = env::args().skip(1).collect();
    build(args)
}

fn build(args: Vec<String>) {
    let wasm_modules = parse_executables(cargo_build(args));
    for wasm_module in &wasm_modules {
        info!(target: "cargo-build", "built cartridge at: {wasm_module}");
    }
    let wasm_opt_bin = pick_wasm_opt_binary();
    for wasm_module in &wasm_modules {
        let wasm_opt_bin = match &wasm_opt_bin {
            Some(b) => b,
            None => {
                debug!(target: "wasm-opt", "skipping wasm-opt size optimizations for {wasm_module}");
                continue;
            }
        };
        wasm_opt(&wasm_opt_bin, wasm_module.as_str());
    }
}

fn parse_executables(cargo_output: Vec<u8>) -> Vec<Utf8PathBuf> {
    Message::parse_stream(cargo_output.as_slice())
        .filter_map(|msg| match msg.expect("parsing `cargo build` output") {
            Message::CompilerArtifact(Artifact {
                executable: Some(e),
                ..
            }) if matches!(e.extension(), Some("wasm")) => {
                let e = e
                    .strip_prefix(env::current_dir().unwrap())
                    .unwrap_or(&e)
                    .to_owned();
                Some(e)
            }
            _ => None,
        })
        .collect()
}

fn cargo_build(args: Vec<String>) -> Vec<u8> {
    let release = args
        .iter()
        .all(|arg| {
            !(arg.starts_with("--profile") || arg.starts_with("-r") || arg.starts_with("--release"))
        })
        .then(|| "--release");

    let cargo = env::var("CARGO").unwrap_or_else(|_| "cargo".to_owned());
    let mut command = Command::new(cargo);
    command
        .args([
            "build",
            "--target=wasm32-unknown-unknown",
            "--message-format=json-render-diagnostics",
        ])
        .args(release)
        .args(args)
        .stderr(process::Stdio::inherit());

    debug!(target: "cargo-build", "running command: {command:?}");

    let process::Output { status, stdout, .. } = command.output().unwrap();
    if !status.success() {
        error!(target: "cargo-build", "build command failed with status: {status:?}");
        silent_panic(Box::new(status));
    }

    stdout
}

/// returns false if `wasm-opt` wasn't found
fn wasm_opt(wasm_opt_bin: &Path, wasm_module: &str) {
    let mut command = Command::new(wasm_opt_bin);
    command.args([
        "-Oz",
        "--strip-debug",
        "--strip-producers",
        "--zero-filled-memory",
        wasm_module,
        "--output",
        wasm_module,
    ]);
    debug!(target: "wasm-opt", "running command: {command:?}");

    let status = command.status().unwrap();

    if !status.success() {
        error!(target: "wasm-opt", "wasm-opt command failed with status: {status:?}");
        silent_panic(Box::new(status))
    }
}

fn pick_wasm_opt_binary() -> Option<PathBuf> {
    let bin = "wasm-opt".as_ref();
    if let Some(version) = wasm_opt_version(bin) {
        debug!(target: "wasm-opt", "using installed {version}");
        return Some(bin.into());
    }

    let cache = Cache::new("wasm4-cargo-xtask").expect("creating a cache directory");
    if let Some(bin) = wasm_opt_cache(&cache) {
        debug!(target: "wasm-opt", "using cached wasm-opt at {}", bin.display());
        return Some(bin);
    }

    None
}

fn wasm_opt_version(path: &Path) -> Option<String> {
    let mut command = Command::new(path);
    command.arg("--version");
    debug!(target: "wasm-opt", "running: {command:?}");

    command
        .output()
        .map(|o| Some(String::from_utf8_lossy(&o.stdout).into_owned()))
        .or_else(|e| match e.kind() {
            io::ErrorKind::NotFound => Ok(None),
            _ => Err(e),
        })
        .expect("querying wasm-opt version")
}

fn wasm_opt_cache(cache: &Cache) -> Option<PathBuf> {
    let version = env::var("WASM_OPT_INSTALL_VERSION").unwrap_or_else(|_| "version_105".into());
    let arch = {
        if cfg!(target_arch = "x86_64") {
            "x86_64"
        } else if cfg!(target_arch = "aarch64") {
            "arm64"
        } else {
            unimplemented!("this target is not supported")
        }
    };
    let platform = {
        if cfg!(target_os = "windows") {
            "windows"
        } else if cfg!(target_os = "linux") {
            "linux"
        } else if cfg!(target_os = "macos") {
            "macos"
        } else {
            unimplemented!("this target is not supported")
        }
    };
    let url = format!(
        "https://github.com/WebAssembly/binaryen/releases/download/{version}/binaryen-{version}-{arch}-{platform}.tar.gz",
    );

    let try_download = |install_permitted| {
        cache
            .download_version(install_permitted, "wasm-opt", &["wasm-opt"], &url, &version)
            .expect("downloading wasm-opt")
    };
    try_download(false)
        .or_else(|| {
            warn!(target: "wasm-opt", "neither installed nor cached wasm-opt was found");
            info!(target: "wasm-opt", "wasm-opt may significantly decrease size of your cartridges, so it is strongly recommended to install it");

            let mut buf = String::new();
            let stdin = io::stdin();
            let mut lock = stdin.lock();

            let install_permitted = if env::var("WASM_OPT_NOINSTALL").map(|v| v == "1").unwrap_or(false) {
                    false
                } else {
                    loop {
                        print!("Download and install wasm-opt in the cache for further use? [Y/n] ");
                        io::stdout().lock().flush().expect("flushing user prompt");

                        if lock.read_line(&mut buf).expect("reading user's answer to the prompt") == 0 {
                            panic!("unexpected EOF from stdin, while reading user's answer to the prompt");
                        }

                        match buf.as_str() {
                            "\n" | "y\n" | "Y\n" => break true,
                            "n\n" | "N\n" => break false,
                            _ => buf.clear(),
                        }
                }
            };

            if install_permitted {
                info!(target: "wasm-opt", "downloading wasm-opt, please wait...");
                Some(try_download(true).unwrap())
            } else {
                info!(target: "wasm-opt", "skipping wasm-opt's size optimizations might lead to oversized cartridges");
                None
            }
        })
        .map(|d| {
            let bin = d.binary("wasm-opt").expect("unable to accuire wasm-opt from the fresh cache install");
            info!(target: "wasm-opt", "wasm-opt has been successfully cached");
            bin
        })
}
