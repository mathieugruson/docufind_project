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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVectorDatabaseTable = void 0;
const vectordb_1 = require("vectordb");
const fs = __importStar(require("node:fs/promises"));
const path = __importStar(require("node:path"));
const getVectorDatabaseTable = async (directoryPath) => {
    const databaseDirectory = path.join(directoryPath, "lancedb");
    // checker si la database existe deja
    try {
        await fs.access(databaseDirectory);
    }
    catch (error) {
        await fs.mkdir(databaseDirectory);
    }
    let db;
    try {
        db = await (0, vectordb_1.connect)(databaseDirectory);
    }
    catch (error) {
        return error;
    }
    try {
        // Check if the database path already exists, if not, throw an error
        console.log("Database already created.");
        const table = await db.openTable("general_db");
        return table;
    }
    catch (error) {
        // If an error occurs, the path doesn't exist
        // Proceed to create the directory and the database
        const table = await db.createTable("general_db", [
            { vector: Array(1536), text: "sample", fileNamePath: '', pageNumber: 1, },
        ]);
        return table;
    }
};
exports.getVectorDatabaseTable = getVectorDatabaseTable;
/**
 *
 *       //       'fileNamePath' : 'xxxxxxxxxx',
      //       'pageNumber' : 'xxxxxxxxxx',
 */ 
