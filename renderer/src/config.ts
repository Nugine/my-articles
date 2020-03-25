import { IsNotEmpty } from "class-validator"
import fs from "fs";
import { promisify } from "util";
import { plainToClassFromExist } from "class-transformer";
import { validateOrReject } from "class-validator";

export class ArticlesConfig {
    @IsNotEmpty()
    public articleFolder: string = "articles";

    @IsNotEmpty()
    public destFolder: string = "docs";

    @IsNotEmpty()
    public articleEntryName: string = "index.md";
}

export const defaultConfigName = "articles.json";

export async function getConfig(path: string): Promise<ArticlesConfig> {
    const readFile = promisify(fs.readFile);
    const exists = promisify(fs.exists);

    const defaultConfig = new ArticlesConfig();
    if (!(await exists(path))) {
        return defaultConfig;
    }

    const text = (await readFile(path)).toString();

    const config = plainToClassFromExist(defaultConfig, JSON.parse(text));

    try {
        await validateOrReject(config, { whitelist: true, forbidNonWhitelisted: true });
    } catch (errs) {
        for (const err of errs) {
            console.error(err);
        }
        throw new Error("invalid config");
    }

    return config;
}
