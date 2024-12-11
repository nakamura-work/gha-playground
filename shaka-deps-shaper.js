const fs = require("fs");
const readline = require("readline");

const stream = fs.createReadStream("./out.d.ts", "utf8");

const reader = readline.createInterface({ input: stream });

// Step1. Except below namespace of "ಠ_ಠ.clutz"
const lines = [];
reader.on("line", (data) => {
    if (/ ಠ_ಠ.clutz /.test(data)) reader.close();
    lines.push(data);
});

reader.on("close", () => {
    let dts = lines.slice(0, -1).join("\n");

    // Step2. Except "ಠ_ಠ.clutz."
    dts = dts.replace(/ಠ_ಠ.clutz./g, "");

    // Step3. Except local path
    dts = dts.replace(/\/\/ Generated from (.*)/g, (m, /** @type {string}*/p) => {
        const filePath = p.substring(p.indexOf("shaka"));
        return `// Generated from ${filePath}`;
    });

    // Step4. Replace clutz specific Object alias
    const map = {
        "GlobalDate": "Date",
        "GlobalElement": "Element",
        "GlobalError": "globalThis.Error",
        "GlobalEvent": "Event",
        "GlobalEventTarget": "EventTarget",
        "GlobalFloat32Array": "Float32Array",
        "GlobalFloat64Array": "Float64Array",
        "GlobalObject": "Object",
        "GlobalStorage": "Storage",
    };
    Object.entries(map).forEach(([from, to]) => {
        dts = dts.replace(new RegExp(from, "g"), to);
    });

    // Step5. Add export
    dts += `

// Shaped by WebStream Corp.
export default shaka;
export type { shakaExtern };
`;

    fs.writeFileSync("./shaka/shaka-player.d.ts", dts);
});
