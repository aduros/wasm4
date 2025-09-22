const std = @import("std");

pub fn build(b: *std.Build) !void {
    const exe = b.addExecutable(.{
        .name = "cart",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = b.resolveTargetQuery(.{
                .cpu_arch = .wasm32,
                .os_tag = .freestanding,
            }),
            .optimize = b.standardOptimizeOption(.{
                .preferred_optimize_mode = .ReleaseSmall,
            }),
        }),
    });

    exe.entry = .disabled;
    exe.root_module.export_symbol_names = &[_][]const u8{ "start", "update" };
    exe.import_memory = true;
    exe.initial_memory = 65536;
    exe.max_memory = 65536;
    exe.stack_size = 14752;

    b.installArtifact(exe);

    const run_exe = b.addSystemCommand(&.{ "w4", "run-native" });
    run_exe.addArtifactArg(exe);

    const step_run = b.step("run", "compile and run the cart");
    step_run.dependOn(&run_exe.step);

    const run_exe_web = b.addSystemCommand(&.{ "w4", "run"});
    run_exe_web.addArtifactArg(exe);

    const step_run_web = b.step("run-web", "compile and run the cart in a web browser");
    step_run_web.dependOn(&run_exe_web.step);
}
