import { test, runIfMain } from "https://deno.land/std/testing/mod.ts";
import { assertEquals, assert } from "https://deno.land/std/testing/asserts.ts";
import { exists } from "https://deno.land/std/fs/exists.ts";
import { join } from "https://deno.land/std/fs/path/mod.ts";

import { EasyPath } from "./mod.ts";

const testRootPath = "./test_data";
const isNotWindows = Deno.build.os !== "win";

async function setupTestEnv(): Promise<void> {
  if (!(await exists(testRootPath))) {
    await Deno.mkdir(testRootPath);
  }
}

async function wipeTestEnv(): Promise<void> {
  if (await exists(testRootPath)) {
    await Deno.remove(testRootPath, { recursive: true });
  }
  await setupTestEnv();
}

// test({
//   name: "ls",
//   async fn() {
//     const d = await new Path(testRootPath)
//       .join("sub1")
//       .join("sub2")
//       .join("sub3")
//       .join("sub4")
//       .join("sub5")
//       .mkdir();
//     const ls = await new Path(testRootPath).ls();
//     console.log(ls);
//     // await wipeTestEnv();
//   }
// });

test({
  name: "Exec",
  async fn(): Promise<void> {
    await setupTestEnv();
    const e = new EasyPath(testRootPath)
      .join("subFolder")
      .mkdir()
      .join("foo.ts")
      .touch();
    await e.exec();
    assert(await exists(join(testRootPath, "subFolder", "foo.ts")));
    await wipeTestEnv();
  }
});

test({
  name: "Join",
  async fn(): Promise<void> {
    await setupTestEnv();
    const d = await new EasyPath(testRootPath)
      .join("sub1")
      .join("sub2")
      .join("sub3")
      .join("sub4")
      .join("sub5");
    assertEquals(
      d.toString(),
      join(testRootPath, "sub1", "sub2", "sub3", "sub4", "sub5")
    );
  }
});

test({
  name: "Touch",
  async fn(): Promise<void> {
    await setupTestEnv();
    await new EasyPath(testRootPath).join("foo.ts").touch();
    assert(await exists(join(testRootPath, "foo.ts")));
    await wipeTestEnv();
  }
});

test({
  name: "MkDir",
  async fn(): Promise<void> {
    await setupTestEnv();
    await new EasyPath(testRootPath).join("subdir").mkdir();
    assert(await exists(join(testRootPath, "subdir")));
    await wipeTestEnv();
  }
});

test({
  name: "chmod",
  async fn(): Promise<void> {
    await setupTestEnv();
    await new EasyPath(testRootPath).join("foo.ts").touch();
    await new EasyPath(testRootPath).join("foo.ts").chmod(0o755);
    if (isNotWindows) {
      const fileInfo = Deno.statSync(
        new EasyPath(testRootPath).join("foo.ts").toString()
      );
      assertEquals(fileInfo.mode & 0o755, 0o755);
    }
    await new EasyPath(testRootPath).join("foo.ts").chmod(0o644);
    if (isNotWindows) {
      const fileInfo = Deno.statSync(
        new EasyPath(testRootPath).join("foo.ts").toString()
      );
      assertEquals(fileInfo.mode & 0o644, 0o644);
    }
    await new EasyPath(testRootPath).join("foo.ts").chmod(0o666);
    if (isNotWindows) {
      const fileInfo = Deno.statSync(
        new EasyPath(testRootPath).join("foo.ts").toString()
      );
      assertEquals(fileInfo.mode & 0o666, 0o666);
    }
    await wipeTestEnv();
  }
});

runIfMain(import.meta);
