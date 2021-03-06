import fs from "fs-extra";
import path from "path";

export interface Article {
    filePath: string,
    projectDirectoryPath: string,
    htmlPath: string,
}


export async function findArticles(dir: string, articleEntryName: string): Promise<Article[]> {

    async function* _findArticles(dir: string): AsyncGenerator<Article> {
        const entryNames = await fs.readdir(dir);

        for (const name of entryNames) {
            const entryPath = path.join(dir, name);
            const entryStat = await fs.stat(entryPath);

            if (entryStat.isDirectory()) {
                for await (const article of _findArticles(entryPath)) {
                    yield article;
                }
                continue;
            }

            if (entryStat.isFile()) {
                if (name != articleEntryName) {
                    continue;
                }

                const filename = path.basename(name, path.extname(name));

                const article: Article = {
                    filePath: entryPath,
                    projectDirectoryPath: dir,
                    htmlPath: path.join(dir, filename + ".html"),
                };

                yield article;
            }

        }
    }

    let articles = [];
    for await (const a of _findArticles(dir)) {
        articles.push(a);
    }

    return articles;
}