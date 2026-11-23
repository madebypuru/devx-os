// The browser the devx-illos scripts use: Playwright from the project you run them in, else from Illos's runtime
// folder (~/.config/illos/runtime), else from next to these skills; the installed Chrome, else Playwright's Chromium.
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function chromium() {
  const from = [join(process.cwd(), "noop.js"), join(homedir(), ".config", "illos", "runtime", "noop.js"), new URL(import.meta.url).pathname];
  for (const f of from) {
    for (const name of ["playwright", "playwright-core"]) {
      try {
        const pw = await import(pathToFileURL(createRequire(pathToFileURL(f).href).resolve(name)).href);
        const c = pw.chromium ?? pw.default?.chromium;
        if (c) return c;
      } catch {
        // not there
      }
    }
  }
  throw new Error("No Playwright found. Run `npm i -D playwright` in your project (or `npx -y illos@latest setup`), then try again.");
}

export async function launch(options = {}) {
  const c = await chromium();
  try {
    return await c.launch({ ...options, channel: "chrome" });
  } catch {
    return c.launch(options);
  }
}
