"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeVectorDatabase = void 0;
const lancedb_1 = require("@langchain/community/vectorstores/lancedb");
const openai_1 = require("@langchain/openai");
const vectordb_1 = require("vectordb");
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const storeVectorDatabase = async (textFromOCR, pageNumber) => {
    const dir = await fs.mkdtemp(path.join(node_os_1.default.tmpdir(), "lancedb-"));
    const db = await (0, vectordb_1.connect)(dir);
    const table = await db.createTable("vectors", [
        { vector: Array(1536), text: "sample", id: 1 },
    ]);
    const vectorStore = await lancedb_1.LanceDB.fromTexts([textFromOCR], [{ id: pageNumber }], new openai_1.OpenAIEmbeddings(), { table });
    const resultOne = await vectorStore.similaritySearch("Telephone domicile", 1);
    console.log(resultOne);
    // [ Document { pageContent: 'hello nice world', metadata: { id: 3 } } ]
};
exports.storeVectorDatabase = storeVectorDatabase;
