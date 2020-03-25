import fs from "fs";
import { promisify } from "util";
import path from "path";

export interface Article {
    filePath: string,
    projectDirectoryPath: string,
    htmlPath: string,
    pdfPath: string,
}


export async function findArticles(dir: string, articleEntryName: string): Promise<Article[]> {

    async function* _findArticles(dir: string): AsyncGenerator<Article> {
        const readdir = promisify(fs.readdir);
        const stat = promisify(fs.stat);

        const entryNames = await readdir(dir);

        for (const name of entryNames) {
            const entryPath = path.join(dir, name);
            const entryStat = await stat(entryPath);
            if (entryStat.isFile()) {

                if (name == articleEntryName) {
                    const basename = path.basename(name);

                    const article: Article = {
                        filePath: entryPath,
                        projectDirectoryPath: dir,
                        htmlPath: path.join(dir, basename + ".html"),
                        pdfPath: path.join(dir, basename + ".pdf")
                    };

                    yield article;
                }
            }
            if (entryStat.isDirectory()) {
                for await (const article of _findArticles(entryPath)) {
                    yield article;
                }
            }
        }
    }

    let articles = [];
    for await (const a of _findArticles(dir)) {
        articles.push(a);
    }

    return articles;
}