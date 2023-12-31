#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const inquirer = require("inquirer");
const lodash_1 = require("lodash");
const init_1 = require("./init");
const sync_1 = require("./sync");
const export_1 = require("./export");
const export_all_1 = require("./export_all");
const import_1 = require("./import");
const unused_1 = require("./unused");
const mock_1 = require("./mock");
const extract_1 = require("./extract/extract");
const translate_1 = require("./translate");
const utils_1 = require("./utils");
const ora = require("ora");
/**
 * 进度条加载
 * @param text
 * @param callback
 */
function spining(text, callback) {
    const spinner = ora(`${text}中...`).start();
    if (callback) {
        if (callback() !== false) {
            spinner.succeed(`${text}成功`);
        }
        else {
            spinner.fail(`${text}失败`);
        }
    }
}
commander
    .version("1.1.10")
    .option("--init [type]", "初始化项目")
    .option("--import [file] [lang]", "导入翻译文案")
    .option("--export [file] [lang]", "导出未翻译的文案")
    .option("--export_diff [diffPrefixName]", "导出未确认的文案[diffPrefixName = prev]")
    .option("--export_all [haveCN] [prefix]", "导出全部的文案")
    .option("--export_tsv [prefix] [lang...]", "导出全部的文案")
    .option("--sync", "同步各种语言的文案")
    .option("--mock", "使用 Google 或者 Baidu 翻译 输出mock文件")
    .option("--translate", "使用 Google 或者 Baidu 翻译 翻译结果自动替换目标语种文案")
    .option("--unused", "导出未使用的文案")
    .option("--extract [dirPath]", "一键替换指定文件夹下的所有中文文案")
    .option("--prefix [prefix]", "指定替换中文文案前缀")
    .parse(process.argv);
if (commander.init) {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield inquirer.prompt({
            type: "confirm",
            name: "confirm",
            default: true,
            message: "项目中是否已存在kiwi相关目录？"
        });
        if (!result.confirm) {
            spining("初始化项目", () => __awaiter(void 0, void 0, void 0, function* () {
                if (["js", "ts"].includes(commander.init)) {
                    init_1.initProject(void 0, commander.init);
                }
                else if (commander.init === true) {
                    init_1.initProject();
                }
                else {
                    console.log("指定初始化类型 [type] 只支持js、ts");
                    return false;
                }
            }));
        }
        else {
            const value = yield inquirer.prompt({
                type: "input",
                name: "dir",
                message: "请输入相关目录："
            });
            spining("初始化项目", () => __awaiter(void 0, void 0, void 0, function* () {
                if (["js", "ts"].includes(commander.init)) {
                    init_1.initProject(value.dir, commander.init);
                }
                else if (commander.init === true) {
                    init_1.initProject(value.dir);
                }
                else {
                    console.log("指定初始化类型 [type] 只支持js、ts");
                    return false;
                }
            }));
        }
    }))();
}
if (commander.import) {
    spining("导入翻译文案", () => {
        if (commander.import === true || commander.args.length === 0) {
            console.log("请按格式输入：--import [file] [lang]");
            return false;
        }
        else if (commander.args) {
            import_1.importMessages(commander.import, commander.args[0]);
        }
    });
}
if (commander.export) {
    spining("导出未翻译的文案", () => {
        if (commander.export === true && commander.args.length === 0) {
            export_1.exportMessages();
        }
        else if (commander.args) {
            export_1.exportMessages(commander.export, commander.args[0]);
        }
    });
}
if (commander.export_diff) {
    spining("导出未翻译的文案", () => {
        console.log("diff表格前缀名字, 默认prev");
        export_1.exportDiffMessages(commander.args[0] || "prev");
    });
}
if (commander.export_all) {
    spining("导出全部文案", () => {
        if (commander.export_all === true && commander.args.length === 0) {
            export_all_1.exportAllMessage();
        }
        else if (commander.args) {
            // 导出不含中文的语言  kiwi --export_all false prev
            // 导出包含中文的语言  kiwi --export_all true prev
            export_all_1.exportAllMessage(commander.export_all, commander.args[0]);
        }
    });
}
if (commander.export_tsv) {
    spining("导出文案到一个表格", () => {
        export_all_1.exportTsv(commander.export_tsv, ...commander.args);
    });
}
if (commander.sync) {
    spining("文案同步", () => {
        sync_1.sync();
    });
}
if (commander.unused) {
    spining("导出未使用的文案", () => {
        unused_1.findUnUsed();
    });
}
if (commander.mock) {
    sync_1.sync(() => __awaiter(void 0, void 0, void 0, function* () {
        const { pass, origin } = yield utils_1.getTranslateOriginType();
        if (pass) {
            const spinner = ora(`使用 ${origin} 翻译中...`).start();
            yield mock_1.mockLangs(origin);
            spinner.succeed(`使用 ${origin} 翻译成功`);
        }
    }));
}
if (commander.translate) {
    sync_1.sync(() => __awaiter(void 0, void 0, void 0, function* () {
        const { pass, origin } = yield utils_1.getTranslateOriginType();
        if (pass) {
            const spinner = ora(`使用 ${origin} 翻译中...`).start();
            yield translate_1.translate(origin);
            spinner.succeed(`使用 ${origin} 翻译成功`);
        }
    }));
}
if (commander.extract) {
    console.log(lodash_1.isString(commander.prefix));
    if (commander.prefix === true) {
        console.log("请指定翻译后文案 key 值的前缀 --prefix xxxx");
    }
    else if (lodash_1.isString(commander.prefix) &&
        !new RegExp(/^I18N(\.[-_a-zA-Z1-9$]+)+$/).test(commander.prefix)) {
        console.log("前缀必须以I18N开头,后续跟上字母、下滑线、破折号、$ 字符组成的变量名");
    }
    else {
        const extractAllParams = {
            prefix: lodash_1.isString(commander.prefix) && commander.prefix,
            dirPath: lodash_1.isString(commander.extract) && commander.extract
        };
        extract_1.extractAll(extractAllParams);
    }
}
//# sourceMappingURL=index.js.map