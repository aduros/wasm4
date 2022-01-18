use std::{
    env, io,
    process::{self, Command},
};

use cargo_metadata::{Artifact, Message};

fn main() {
    if let Err(e) = try_main() {
        eprintln!("{}", e);
        process::exit(-1);
    }
}

fn try_main() -> anyhow::Result<()> {
    let mut args = env::args().skip(1);
    let (toolchain, task) = match args.next() {
        Some(toolchain) if toolchain.starts_with('+') => (
            Some(toolchain),
            match args.next() {
                Some(a) => a,
                None => return Ok(print_help()),
            },
        ),
        Some(task) => (None, task),
        None => return Ok(print_help()),
    };

    match task.as_str() {
        "build" => build(toolchain, args.collect()),
        _ => Ok(print_help()),
    }
}

fn print_help() {
    eprintln!(
        "\
Usage:
        
        cargo xtask [+toolchain] <task>
        
Tasks:
        
        build [args]    builds and optimizes cartridge in release mode"
    )
}

fn build(toolchain: Option<String>, args: Vec<String>) -> anyhow::Result<()> {
    let mut pre_args = vec![
        "--target=wasm32-unknown-unknown",
        "--message-format=json-render-diagnostics",
    ];

    if !args.iter().any(|arg| {
        arg.starts_with("--profile") || arg.starts_with("-r") || arg.starts_with("--release")
    }) {
        pre_args.push("--release");
    }

    let cargo = env::var("CARGO").unwrap_or_else(|_| "cargo".to_owned());
    let mut command = Command::new(cargo);
    command
        .args(toolchain)
        .arg("build")
        .args(pre_args)
        .args(args)
        .stderr(process::Stdio::inherit());
    eprintln!("INFO: running build command: {:?}", command);

    let output = command.output()?;
    if !output.status.success() {
        anyhow::bail!(
            "build command exited with a code: {:?}",
            output.status.code()
        );
    }

    let mut skip = false;
    for msg in Message::parse_stream(output.stdout.as_slice()) {
        let wasm_module = match msg? {
            Message::CompilerArtifact(Artifact {
                executable: Some(m),
                ..
            }) if matches!(m.extension(), Some("wasm")) => m,
            _ => continue,
        };

        let mut command = Command::new("wasm-opt");
        command.args([
            "-Oz",
            "--strip-debug",
            "--strip-producers",
            "--zero-filled-memory",
            wasm_module.as_str(),
            "--output",
            wasm_module.as_str(),
        ]);
        eprintln!("INFO: running wasm-opt command: {:?}", command);

        match command.status() {
            Ok(status) if !status.success() => {
                anyhow::bail!(
                    "wasm-opt command exited with a code: {:?}",
                    output.status.code()
                )
            }
            Ok(_success) => (),
            Err(e) if matches!(e.kind(), io::ErrorKind::NotFound) => {
                eprintln!("WARNING: wasm-opt wasn't found, cartridge size may be too large");
                skip = true
            }
            Err(e) => {
                return Err(e.into());
            }
        }

        if skip {
            eprintln!(
                "WARNING: skipping wasm-opt size optimizations for: {}",
                wasm_module
            );
            continue;
        }
    }

    Ok(())
}
