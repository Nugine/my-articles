#!/usr/bin/env node

import * as mume from "@shd101wyy/mume";

import { getConfig, defaultConfigName, ArticlesConfig } from "./config";
import { findArticles, Article } from "./article";

import { replaceInFile } from "./replacer"

import fs from "fs-extra";

async function prompt_task(prompt: string, task: Promise<void>, end: string) {
    process.stdout.write(prompt);
    await task;
    process.stdout.write(end);
    process.stdout.write("\n");
}

async function perpareDest(config: ArticlesConfig) {
    if (!fs.existsSync(config.articleFolder)) {
        throw new Error("article folder does not exist");
    }

    if (fs.existsSync(config.destFolder)) {
        await prompt_task(
            `remove folder: ${config.destFolder} ... `,
            fs.remove(config.destFolder),
            "ok"
        )
    }

    await prompt_task(
        `copy folder: ${config.articleFolder} => ${config.destFolder} ... `,
        fs.copy(config.articleFolder, config.destFolder),
        "ok"
    )

    console.log()
}

async function renderArticle(article: Article, config: ArticlesConfig) {
    const engine = new mume.MarkdownEngine(article);
    await engine.htmlExport({});

    await replaceInFile(article.htmlPath, config.replacers);
}

async function main() {
    await mume.init();

    const config = await getConfig(defaultConfigName);
    console.log(`config: ${JSON.stringify(config, undefined, 4)}\n`);

    try {
        await perpareDest(config);
    } catch (e) {
        console.error(e);
        throw new Error(`can not perpare folder: ${config.destFolder}`);
    }

    const articles = await findArticles(config.destFolder, config.articleEntryName);
    console.log(`found ${articles.length} articles\n`);

    for (let i = 0; i < articles.length; ++i) {
        const article = articles[i];

        console.log(`article ${i + 1}: ${JSON.stringify(article, undefined, 4)}`);

        await prompt_task(
            `rendering ${article.filePath} => ${article.htmlPath} ... `,
            renderArticle(article, config),
            "ok"
        );

        console.log();
    }

    return process.exit();
}

main();