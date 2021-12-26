const std = @import("std");

pub fn build(b: *std.build.Builder) void {
    const mode = b.standardReleaseOptions();

    const lib = b.addSharedLibrary("cart", "src/main.zig", .unversioned);
    lib.setBuildMode(mode);
    lib.setTarget(.{ .cpu_arch = .wasm32, .os_tag = .freestanding });
    lib.import_memory = true;
    lib.initial_memory = 65536;
    lib.max_memory = 65536;
    lib.global_base = 6560;
    lib.stack_size = 8192;
    // Workaround https://github.com/ziglang/zig/issues/2910, preventing
    // functions from compiler_rt getting incorrectly marked as exported, which
    // prevents them from being removed even if unused.
    lib.export_symbol_names = &[_][]const u8{ "start", "update" };
    lib.install();
}
