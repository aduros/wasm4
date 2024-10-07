use std::{env, io, process::Command};

fn main() {
    let mut args = env::args().skip(1);
    let task = args.next();

    match task.as_ref().map(|t| t.as_str()) {
        Some("build") => run_task(build(args)).unwrap(),
        _ => print_help(),
    }
}

fn print_help() {
    eprintln!(
        "\
Usage:
        
        cargo xtask <task>
        
Tasks:
        
        build [args]    builds and optimizes cartridge in release mode
                        pass `--profile dev` for debug mode"
    )
}

fn build(args: impl Iterator<Item = String>) -> Command {
    let cargo = env::var("CARGO").unwrap_or_else(|_| "cargo".to_owned());
    let mut command = Command::new(cargo);
    command
        .args(["run", "--package", "xtask-build", "--"])
        .args(args);
    command
}

fn run_task(mut cmd: Command) -> io::Result<()> {
    let status = cmd.status()?;
    if status.success() {
        Ok(())
    } else {
        panic!("task failed with a status: {}", status);
    }
}
