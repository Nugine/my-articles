import { IsNotEmpty, ArrayMinSize } from "class-validator"
import fs from "fs-extra";
import { plainToClassFromExist } from "class-transformer";
import { validateOrReject } from "class-validator";

export class ArticlesConfig {
    @IsNotEmpty()
    public articleFolder: string = "articles";

    @IsNotEmpty()
    public destFolder: string = "dist";

    @IsNotEmpty()
    public articleEntryName: string = "index.md";

    @IsNotEmpty({ each: true })
    @ArrayMinSize(2, { each: true })
    @ArrayMinSize(2, { each: true })
    public replacers: Array<[string, string]> = [];
}

export const defaultConfigName = "articles.json";

async function validateConfig(config: ArticlesConfig) {
    try {
        await validateOrReject(config, { whitelist: true, forbidNonWhitelisted: true });
    } catch (errs) {
        for (const err of errs) {
            console.error(err);
        }
        throw new Error("invalid config");
    }

    config.replacers.forEach(([re, value], idx) => {
        try {
            new RegExp(re, "gm");
        } catch (e) {
            console.error(e);
            throw new Error(`invalid replacer: idx = ${idx}, ${re}" => "${value}"`);
        }
    })
}

export async function getConfig(path: string): Promise<ArticlesConfig> {

    const defaultConfig = new ArticlesConfig();
    if (!fs.existsSync(path)) {
        return defaultConfig;
    }

    const plain = await fs.readJSON(path);
    const config = plainToClassFromExist(defaultConfig, plain);

    await validateConfig(config);

    return config;
}
