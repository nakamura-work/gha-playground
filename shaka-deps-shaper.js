// @ts-check

const fs = require("fs");

let dts = fs.readFileSync("./out.d.ts", "utf-8");


// Step1. Except below namespace of "ಠ_ಠ.clutz"
dts = removeNamespaceBlock(dts);

// Step2. Except "ಠ_ಠ.clutz."
dts = dts.replace(/ಠ_ಠ.clutz./g, "");

// Step3. Except extra output by clutz
dts = dts.replace(/extends GlobalEventTarget extends GlobalEventTarget/g, "extends GlobalEventTarget");

// Step4. Except local path
dts = dts.replace(/\/\/ Generated from (.*)/g, (m, /** @type {string}*/p) => {
    const filePath = p.substring(p.indexOf("shaka"));
    return `// Generated from ${filePath}`;
});

// Step5. Replace clutz specific Object alias
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
    "webCrypto.CryptoKey": "CryptoKey",
};
Object.entries(map).forEach(([from, to]) => {
    dts = dts.replace(new RegExp(from, "g"), to);
});

// Step5. Add export
dts += `

// Shaped by WebStream Corp.
export default shaka;
`;

fs.writeFileSync("./shaka/shaka-player.d.ts", dts);

/**
 * 
 * @param {string} input 
 * @returns 
 */
function removeNamespaceBlock(input) {
    const startPattern = /^declare namespace ಠ_ಠ\.clutz(?:\.u2f)?\s*{/;
    let output = '';
    let stack = 0;
    let inBlock = false;
    for (let i = 0; i < input.length; i++) {
        const match = input.slice(i).match(startPattern);
        if (!inBlock && match) {
            inBlock = true;
            stack++;
            i += match[0].length;
            continue;
        }
        if (inBlock && input.at(i) === '{') {
            stack++;
        } else if (inBlock && input.at(i) === '}') {
            stack--;
            if (stack === 0) {
                inBlock = false;
            }
        } else {
            if (!inBlock) {
                output += input.at(i);
            }
        }
    }
    return output;
}