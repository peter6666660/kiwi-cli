import * as path from "path";
import * as fs from "fs";
import { tsvFormatRows } from "d3-dsv";
import { getAllMessages, getProjectConfig } from "./utils";
import { arguments } from "commander";
import { getMessagesToImport } from "./import";

function exportTranslateMessages(prefix: string) {
  console.log(prefix, "prefix");
  const CONFIG = getProjectConfig();
  const langs = CONFIG.distLangs.concat(CONFIG.srcLang);
  const enUS = getAllMessages(
    "en-US",
    message => !/[\u4E00-\u9FA5]/.test(message)
  );

  langs.map((_lang: string) => {
    // 只获取翻译后的文案, 中文的忽略
    let allMessages = getAllMessages(_lang);
    const messagesToTranslate = Object.keys(enUS).map(key => {
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
      path.join(
        process.cwd(),
        CONFIG.kiwiDir,
        _lang,
        (prefix || `export-all`) + "-" + _lang
      ) + ".tsv";
    fs.writeFileSync(sourceFile, content);
    console.log("\n");
    console.log(
      `[${_lang}] - Exported ${messagesToTranslate.length} message(s). [${sourceFile}]`
    );
  });
}
function exportAllMessageBase(prefix: string) {
  const CONFIG = getProjectConfig();
  const langs = CONFIG.distLangs.concat(CONFIG.srcLang);

  langs.map((_lang: string) => {
    const allMessages = getAllMessages(_lang);
    const messagesToTranslate = Object.keys(allMessages).map(key => {
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
      path.join(
        process.cwd(),
        CONFIG.kiwiDir,
        _lang,
        (prefix || `export-all`) + "-" + _lang
      ) + ".tsv";
    fs.writeFileSync(sourceFile, content);
    console.log("\n");
    console.log(
      `[${_lang}] - Exported ${messagesToTranslate.length} message(s).[${sourceFile}]`
    );
  });
}

function exportAllMessage(haveCN?: string, prefix?: string) {
  if (haveCN === "true") {
    exportAllMessageBase(prefix);
  } else {
    exportTranslateMessages(prefix);
  }
}

function exportTsv(prefix, ...other) {
  if (!other?.length) {
    console.log("请输入导出的语言. eg： zh-CN en-US");
    return;
  }
  const CONFIG = getProjectConfig();
  const langs = other.map(_lang => {
    const prevFilePath =
      path.join(
        process.cwd(),
        CONFIG.kiwiDir,
        _lang,
        `${prefix || "prev"}-${_lang}`
      ) + ".tsv";
    const rst = getMessagesToImport(prevFilePath);
    return rst;
  });
  const tsvVlaues = Object.keys(langs[0]).map(k => {
    const langValues = other.map((_lang, i) => {
      console.log(`langs[i]`, langs[i]);
      return langs[i][k];
    });
    return [k, ...langValues];
  });
  tsvVlaues.unshift(["key", ...other]);
  const content = tsvFormatRows(tsvVlaues);
  const sourceFile =
    path.join(
      process.cwd(),
      `export-${new Date().toLocaleDateString().replace(/\//g, "-")}`
    ) + ".tsv";
  fs.writeFileSync(sourceFile, content);
  console.log("\n");
  console.log(`Exported ${tsvVlaues.length - 1} message(s).[${sourceFile}]`);
}

export { exportAllMessage, exportTsv };
