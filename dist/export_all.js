"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTsv = exports.exportAllMessage = void 0;
const path = require("path");
const fs = require("fs");
const d3_dsv_1 = require("d3-dsv");
const utils_1 = require("./utils");
const import_1 = require("./import");
function exportTranslateMessages(prefix) {
    console.log(prefix, "prefix");
    const CONFIG = utils_1.getProjectConfig();
    const langs = CONFIG.distLangs.concat(CONFIG.srcLang);
    const enUS = utils_1.getAllMessages("en-US", message => !/[\u4E00-\u9FA5]/.test(message));
    langs.map((_lang) => {
        // 只获取翻译后的文案, 中文的忽略
        let allMessages = utils_1.getAllMessages(_lang);
        const messagesToTranslate = Object.keys(enUS).map(key => {
            let message = allMessages[key];
            message = JSON.stringify(message).slice(1, -1);
            return [key, message];
        });
        if (messagesToTranslate.length === 0) {
            console.log("All the messages have been translated.");
            return;
        }
        const content = d3_dsv_1.tsvFormatRows(messagesToTranslate);
        const sourceFile = path.join(process.cwd(), CONFIG.kiwiDir, _lang, (prefix || `export-all`) + "-" + _lang) + ".tsv";
        fs.writeFileSync(sourceFile, content);
        console.log("\n");
        console.log(`[${_lang}] - Exported ${messagesToTranslate.length} message(s). [${sourceFile}]`);
    });
}
function exportAllMessageBase(prefix) {
    const CONFIG = utils_1.getProjectConfig();
    const langs = CONFIG.distLangs.concat(CONFIG.srcLang);
    langs.map((_lang) => {
        const allMessages = utils_1.getAllMessages(_lang);
        const messagesToTranslate = Object.keys(allMessages).map(key => {
            let message = allMessages[key];
            message = JSON.stringify(message).slice(1, -1);
            return [key, message];
        });
        if (messagesToTranslate.length === 0) {
            console.log("All the messages have been translated.");
            return;
        }
        const content = d3_dsv_1.tsvFormatRows(messagesToTranslate);
        const sourceFile = path.join(process.cwd(), CONFIG.kiwiDir, _lang, (prefix || `export-all`) + "-" + _lang) + ".tsv";
        fs.writeFileSync(sourceFile, content);
        console.log("\n");
        console.log(`[${_lang}] - Exported ${messagesToTranslate.length} message(s).[${sourceFile}]`);
    });
}
function exportAllMessage(haveCN, prefix) {
    if (haveCN === "true") {
        exportAllMessageBase(prefix);
    }
    else {
        exportTranslateMessages(prefix);
    }
}
exports.exportAllMessage = exportAllMessage;
function exportTsv(prefix, ...other) {
    if (!(other === null || other === void 0 ? void 0 : other.length)) {
        console.log("请输入导出的语言. eg： zh-CN en-US");
        return;
    }
    const CONFIG = utils_1.getProjectConfig();
    const langs = other.map(_lang => {
        const prevFilePath = path.join(process.cwd(), CONFIG.kiwiDir, _lang, `${prefix || "prev"}-${_lang}`) + ".tsv";
        const rst = import_1.getMessagesToImport(prevFilePath);
        return rst;
    });
    const tsvVlaues = Object.keys(langs[0]).map(k => {
        const langValues = other.map((_lang, i) => {
            return langs[i][k];
        });
        return [k, ...langValues];
    });
    tsvVlaues.unshift(["key", ...other]);
    const content = d3_dsv_1.tsvFormatRows(tsvVlaues);
    const sourceFile = path.join(process.cwd(), `export-${new Date().toLocaleDateString().replace(/\//g, "-")}`) + ".tsv";
    fs.writeFileSync(sourceFile, content);
    console.log("\n");
    console.log(`Exported ${tsvVlaues.length - 1} message(s).[${sourceFile}]`);
}
exports.exportTsv = exportTsv;
//# sourceMappingURL=export_all.js.map