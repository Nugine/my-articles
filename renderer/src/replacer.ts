import fs from "fs-extra";

export async function replaceInFile(path: string, replacers: Array<[string, string]>) {
    let text = await fs.readFile(path, "utf8");
    for (const [re, value] of replacers) {
        const regex = new RegExp(re, "gm");
        text = text.replace(regex, value);
    }
    await fs.writeFile(path, text);
}