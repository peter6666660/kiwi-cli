"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDiffMessages = exports.exportMessages = void 0;
/**
 * @author linhuiw
 * @desc 导出未翻译文件
 */
require("ts-node").register({
    compilerOptions: {
        module: "commonjs"
    }
});
const fs = require("fs");
const d3_dsv_1 = require("d3-dsv");
const utils_1 = require("./utils");
const path = require("path");
const _ = require("lodash");
const import_1 = require("./import");
function exportMessages(file, lang) {
    const CONFIG = utils_1.getProjectConfig();
    const langs = lang ? [lang] : CONFIG.distLangs.concat(CONFIG.srcLang);
    langs.map((_lang) => {
        const allMessages = utils_1.getAllMessages(_lang);
        const existingTranslations = utils_1.getAllMessages(lang, (message, key) => !/[\u4E00-\u9FA5]/.test(allMessages[key]) ||
            allMessages[key] !== message);
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
        const content = d3_dsv_1.tsvFormatRows(messagesToTranslate);
        const sourceFile = (file ||
            path.join(process.cwd(), CONFIG.kiwiDir, _lang, `export-cn-${_lang}`)) +
            ".tsv";
        fs.writeFileSync(sourceFile, content);
        console.log("\n");
        console.log(`[${_lang}] - Exported ${messagesToTranslate.length} message(s).`);
    });
}
exports.exportMessages = exportMessages;
function exportDiffMessages(diffPrefix) {
    const CONFIG = utils_1.getProjectConfig();
    const langs = CONFIG.distLangs.concat(CONFIG.srcLang);
    langs.map((_lang) => {
        const allMessages = utils_1.getAllMessages(_lang);
        const prevFilePath = path.join(process.cwd(), CONFIG.kiwiDir, _lang, `${diffPrefix || "prev"}-${_lang}`) + ".tsv";
        let diffKey = [];
        try {
            const rst = import_1.getMessagesToImport(prevFilePath);
            diffKey = _.keys(allMessages).filter(k => !rst[k]);
        }
        catch (e) {
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
        const content = d3_dsv_1.tsvFormatRows(messagesToTranslate);
        const sourceFile = path.join(process.cwd(), CONFIG.kiwiDir, _lang, `export-diff-${_lang}`) +
            ".tsv";
        fs.writeFileSync(sourceFile, content);
        console.log("\n");
        console.log(`[${_lang}] - Exported ${messagesToTranslate.length} message(s).[${sourceFile}]`);
    });
}
exports.exportDiffMessages = exportDiffMessages;
//# sourceMappingURL=export.js.map