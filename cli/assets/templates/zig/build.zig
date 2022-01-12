const std = @import("std");

fn version_supports_stack_first(zig_version: std.SemanticVersion) !bool {
    if (zig_version.minor == 9 and zig_version.order(try std.SemanticVersion.parse("0.9.0")).compare(.gt))
        return true;
    return zig_version.order(try std.SemanticVersion.parse("0.10.0-dev.258")).compare(.gte);
}

test "stack version check" {
    const expect = std.testing.expect;
    const parse = std.SemanticVersion.parse;
    try expect(!try version_supports_stack_first(try parse("0.8.0")));

    try expect(!try version_supports_stack_first(try parse("0.9.0")));
    try expect(try version_supports_stack_first(try parse("0.9.1")));

    try expect(!try version_supports_stack_first(try parse("0.10.0-dev.257")));
    try expect(try version_supports_stack_first(try parse("0.10.0-dev.258")));
    try expect(try version_supports_stack_first(try parse("0.10.0-dev.259")));
    try expect(try version_supports_stack_first(try parse("0.10.0")));

    try expect(try version_supports_stack_first(try parse("1.0.0")));
}

pub fn build(b: *std.build.Builder) !void {
    const zig_version = @import("builtin").zig_version;
    const mode = b.standardReleaseOptions();
    const lib = b.addSharedLibrary("cart", "src/main.zig", .unversioned);
    lib.setBuildMode(mode);
    lib.setTarget(.{ .cpu_arch = .wasm32, .os_tag = .freestanding });
    lib.import_memory = true;
    lib.initial_memory = 65536;
    lib.max_memory = 65536;
    if (try version_supports_stack_first(zig_version)) {
        lib.stack_size = 14752;
    } else {
        // `--stack-first` option have been reenabled on wasm targets with https://github.com/ziglang/zig/pull/10572
        std.log.warn("Zig {} doesn't support stack-first. Stack overflows will result in silent data corruption.", .{zig_version});
        lib.global_base = 6560;
        lib.stack_size = 8192;
    }
    // Workaround https://github.com/ziglang/zig/issues/2910, preventing
    // functions from compiler_rt getting incorrectly marked as exported, which
    // prevents them from being removed even if unused.
    lib.export_symbol_names = &[_][]const u8{ "start", "update" };
    lib.install();
}
