const std = @import("std");
const expect = std.testing.expect;
const expectEqualStrings = std.testing.expectEqualStrings;

/// Panics if current zig version is below the minimal required.
fn check_zig_version() !void {
    const zig_version = @import("builtin").zig_version;
    if (zig_version.major > 0) return;
    if (zig_version.minor > 10) return;

    if (zig_version.minor == 10) {
        if (zig_version.pre) |pre| {
            std.debug.print("{s}", .{pre});
            try expect(pre.len >= 5);
            try expectEqualStrings(pre[0..4], "dev.");
            const number = try std.fmt.parseUnsigned(u32, pre[4..], 10);
            if (number >= 258) return;
        } else return;
    }

    if (zig_version.minor == 9
        and zig_version.pre == null
        and zig_version.patch >= 1) return;
    
    // `--stack-first` option have been reenabled on wasm targets with https://github.com/ziglang/zig/pull/10572
    std.debug.panic("0.9.1 or 0.10.0-dev.258 are minimal required versions of zig (got {})", .{zig_version});
}

pub fn build(b: *std.build.Builder) !void {
    try check_zig_version();

    const mode = b.standardReleaseOptions();
    const lib = b.addSharedLibrary("cart", "src/main.zig", .unversioned);
    lib.setBuildMode(mode);
    lib.setTarget(.{ .cpu_arch = .wasm32, .os_tag = .freestanding });
    lib.import_memory = true;
    lib.initial_memory = 65536;
    lib.max_memory = 65536;
    lib.stack_size = 14752;
    // Workaround https://github.com/ziglang/zig/issues/2910, preventing
    // functions from compiler_rt getting incorrectly marked as exported, which
    // prevents them from being removed even if unused.
    lib.export_symbol_names = &[_][]const u8{ "start", "update" };
    lib.install();
}
