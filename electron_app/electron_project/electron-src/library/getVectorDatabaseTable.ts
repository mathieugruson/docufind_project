import { connect } from "vectordb";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export const getVectorDatabaseTable = async (directoryPath : string) : Promise<any> => {

    const databaseDirectory = path.join(directoryPath, "lancedb")

    // checker si la database existe deja

    try {
        await fs.access(databaseDirectory)
    } catch (error) {
        await fs.mkdir(databaseDirectory)
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
        const table = await db.createTable("general_db", [
          { vector: Array(1536), text: "sample", fileNamePath: '', pageNumber: 1,  },
        ]);
        return table
    }

}

/**
 * 
 *       //       'fileNamePath' : 'xxxxxxxxxx',
      //       'pageNumber' : 'xxxxxxxxxx',
 */