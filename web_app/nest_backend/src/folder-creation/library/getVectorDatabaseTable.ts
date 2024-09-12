import { connect } from "vectordb";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Schema, Field, Float32, FixedSizeList, Int32, Float16, Utf8 } from "apache-arrow";
import * as crypto from 'crypto';

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); // If stored in base64


function encrypt(text, key) {
    const iv = crypto.randomBytes(16); // AES block size is 16 bytes
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

export const getVectorDatabaseTable = async (directoryPath : string) : Promise<any> => {

    const databaseDirectory = path.join(directoryPath, "/.dev/lancedb")

    console.log('%c' + 'databaseDirectory\n' +  databaseDirectory, 'color: red;');


    // checker si la database existe deja

    try {
        await fs.access(databaseDirectory)
    } catch (error) {
    await fs.mkdir(databaseDirectory, { recursive: true });
        }

    let db : any
    try {
        db = await connect(databaseDirectory);
    } catch (error) {
        return error
    }

    try {
        // Check if the database path already exists, if not, throw an error
        console.log("Database already created.");
        const table = await db.openTable("general_db");
        return table;

    } catch (error) {
        // If an error occurs, the path doesn't exist
        // Proceed to create the directory and the database

        const empty = encrypt("", key);


        const table = await db.createTable("general_db", [
          { vector: Array(1536), text: empty, fileNamePath: '', pageNumber: 0,  },
        ]);

        // const schema = new Schema([
        //     new Field("text", new Utf8()),
        //     new Field("fileNamePath", new Utf8()),
        //     new Field("pageNumber", new Int32()),
        //     // Add other fields as required
        //   ]);

        //   const empty_tbl = await db.createTable({ name: "general_db", schema });
        return table
    }

}

