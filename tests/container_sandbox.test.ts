import { describe, expect, it } from "vitest";
import { ContainerSandbox } from "../src/container-sandbox";

describe("ContainerSandbox configuration and input guards", () => {
  const dockerTest = process.env.WIBUSCRIPT_DOCKER_TESTS === "1" ? it : it.skip;

  dockerTest("executes a WibuScript program in the no-network runner image", async () => {
    const sandbox = new ContainerSandbox({
      image: "wibuscript-runner:ci",
      timeoutMs: 15_000,
      memoryLimitMb: 128,
      cpuLimit: 1,
    });
    const result = await sandbox.execute('kore angka = 40 + 2; mite(angka);');
    expect(result.success).toBe(true);
    expect(result.output).toContain("42");
    expect(result.error).toBeUndefined();
  });

  it("rejects invalid Docker image references", () => {
    expect(() => new ContainerSandbox({ image: "--privileged;echo pwned" })).toThrow(
      "Nama image container tidak valid"
    );
  });

  it("rejects unsafe resource limits", () => {
    expect(() => new ContainerSandbox({ memoryLimitMb: 32 })).toThrow(RangeError);
    expect(() => new ContainerSandbox({ cpuLimit: 0 })).toThrow(RangeError);
  });

  it("rejects oversized source before starting the Docker process", async () => {
    const sandbox = new ContainerSandbox({
      dockerBinary: "/path/that/does/not/exist",
      maxSourceLength: 8,
    });
    const result = await sandbox.execute("kore terlaluPanjang = 1;");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Ukuran kode melebihi batas");
    expect(result.executionTimeMs).toBe(0);
  });
});
