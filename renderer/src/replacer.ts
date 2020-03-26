import fs from "fs-extra";

export async function replaceInFile(path: string, re: string, value: string) {
    const text = await fs.readFile(path, "utf8");
    const regex = new RegExp(re, "gm");
    const ans = text.replace(regex, value);
    await fs.writeFile(path, ans);
}