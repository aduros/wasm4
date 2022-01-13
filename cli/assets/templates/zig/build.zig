const std = @import("std");

// Returns true if the version includes https://github.com/ziglang/zig/pull/10572/commits.
// When this is false, trying to place the stack first will result in data corruption.
fn version_supports_stack_first(zig_version: std.SemanticVersion) !bool {
    if (zig_version.order(try std.SemanticVersion.parse("0.10.0")).compare(.gte)) {
        // Merged here: https://github.com/ziglang/zig/pull/10572
        return true;
    }
    if (zig_version.major == 0 and zig_version.minor == 10) {
        // Check for 0.10.0-dev.258+. Conservatively check the prefix of the tag
        // in case zig uses other prefixes that don't respect semver ordering.
        if (zig_version.pre) |pre| {
            // Merged here: https://github.com/ziglang/zig/pull/10572
            return std.mem.startsWith(u8, pre, "dev.") and zig_version.order(try std.SemanticVersion.parse("0.10.0-dev.258")).compare(.gte);
        }
    }
    // Backported here: https://github.com/ziglang/zig/commit/6f49233ac6a6569b909b689f22fc260dc8c19234
    return zig_version.order(try std.SemanticVersion.parse("0.9.1")).compare(.gte);
}

test "stack version check" {
    const expect = std.testing.expect;
    const parse = std.SemanticVersion.parse;
    try expect(!try version_supports_stack_first(try parse("0.8.0")));

    try expect(!try version_supports_stack_first(try parse("0.9.0")));
    try expect(!try version_supports_stack_first(try parse("0.9.1-dev.259")));
    try expect(try version_supports_stack_first(try parse("0.9.1")));

    // Conservatively don't recognize tags other than 'dev'.
    try expect(!try version_supports_stack_first(try parse("0.10.0-aev.259")));
    try expect(!try version_supports_stack_first(try parse("0.10.0-zev.259")));

    try expect(!try version_supports_stack_first(try parse("0.10.0-dev.257")));
    try expect(try version_supports_stack_first(try parse("0.10.0-dev.258")));
    try expect(try version_supports_stack_first(try parse("0.10.0-dev.259")));
    try expect(try version_supports_stack_first(try parse("0.10.0")));

    try expect(try version_supports_stack_first(try parse("0.10.1-dev.100")));
    try expect(try version_supports_stack_first(try parse("0.10.1-dev.300")));
    try expect(try version_supports_stack_first(try parse("0.10.1")));

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
        std.log.warn("Update to Zig >=0.9.1 (or >=0.10.0-dev.258 for nightly) to detect stack overflows at runtime.", .{});
        lib.global_base = 6560;
        lib.stack_size = 8192;
    }
    // Workaround https://github.com/ziglang/zig/issues/2910, preventing
    // functions from compiler_rt getting incorrectly marked as exported, which
    // prevents them from being removed even if unused.
    lib.export_symbol_names = &[_][]const u8{ "start", "update" };
    lib.install();
}
