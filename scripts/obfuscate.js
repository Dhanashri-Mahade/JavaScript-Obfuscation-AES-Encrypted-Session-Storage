const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "../prod-build/static/js");

fs.readdirSync(buildDir).forEach((file) => {
  const filePath = path.join(buildDir, file);

  if (file.endsWith(".map")) {
    fs.unlinkSync(filePath);
    console.log("Deleted MAP:", file);
    return;
  }

  if (file.endsWith(".js")) {
    const code = fs.readFileSync(filePath, "utf8");

    const obfuscated = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      stringArrayThreshold: 1,
      disableConsoleOutput: true,
    });

    fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
    console.log(`Obfuscated: ${file}`);
  }
});
