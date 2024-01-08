/**
 * @author linhuiw
 * @desc 导出未翻译文件
 */
require("ts-node").register({
  compilerOptions: {
    module: "commonjs"
  }
});
import * as fs from "fs";
import { tsvFormatRows } from "d3-dsv";
import { getAllMessages, getProjectConfig } from "./utils";
import * as path from "path";
import * as _ from "lodash";
import { getMessagesToImport } from "./import";

function exportMessages(file?: string, lang?: string) {
  const CONFIG = getProjectConfig();
  const langs = lang ? [lang] : CONFIG.distLangs.concat(CONFIG.srcLang);

  langs.map((_lang: string) => {
    const allMessages = getAllMessages(_lang);
    const existingTranslations = getAllMessages(
      lang,
      (message, key) =>
        !/[\u4E00-\u9FA5]/.test(allMessages[key]) ||
        allMessages[key] !== message
    );
    const messagesToTranslate = Object.keys(allMessages)
      .filter(key => !existingTranslations.hasOwnProperty(key))
      .map(key => {
        let message = allMessages[key];
        message = JSON.stringify(message).slice(1, -1);
        return [key, message];
      });

    if (messagesToTranslate.length === 0) {
      console.log("All the messages have been translated.");
      return;
    }

    const content = tsvFormatRows(messagesToTranslate);
    const sourceFile =
      (file ||
        path.join(process.cwd(), CONFIG.kiwiDir, _lang, `export-cn-${_lang}`)) +
      ".tsv";
    fs.writeFileSync(sourceFile, content);
    console.log("\n");
    console.log(
      `[${_lang}] - Exported ${messagesToTranslate.length} message(s).`
    );
  });
}
function exportDiffMessages(diffPrefix: string) {
  const CONFIG = getProjectConfig();
  const langs = CONFIG.distLangs.concat(CONFIG.srcLang);

  langs.map((_lang: string) => {
    const allMessages = getAllMessages(_lang);
    const prevFilePath =
      path.join(
        process.cwd(),
        CONFIG.kiwiDir,
        _lang,
        `${diffPrefix || "prev"}-${_lang}`
      ) + ".tsv";
    let diffKey = [];
    try {
      const rst = getMessagesToImport(prevFilePath);
      diffKey = _.keys(allMessages).filter(k => !rst[k]);
    } catch (e) {
      console.log(e);
      diffKey = _.keys(allMessages);
    }
    const messagesToTranslate = diffKey.map(key => {
      let message = allMessages[key];
      message = JSON.stringify(message).slice(1, -1);
      return [key, message];
    });

    if (messagesToTranslate.length === 0) {
      console.log("All the messages have been translated.");
      return;
    }

    const content = tsvFormatRows(messagesToTranslate);
    const sourceFile =
      path.join(process.cwd(), CONFIG.kiwiDir, _lang, `export-diff-${_lang}`) +
      ".tsv";
    fs.writeFileSync(sourceFile, content);
    console.log("\n");
    console.log(
      `[${_lang}] - Exported ${messagesToTranslate.length} message(s).[${sourceFile}]`
    );
  });
}

export { exportMessages, exportDiffMessages };
