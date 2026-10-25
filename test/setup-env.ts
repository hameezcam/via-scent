// Keep test-created orders, returns, claims and settings out of src/data
import fs from "fs";
import os from "os";
import path from "path";

if (!process.env.VIA_DATA_DIR) {
  process.env.VIA_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "via-scent-test-"));
}
