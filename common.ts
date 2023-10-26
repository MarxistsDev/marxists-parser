import path from "path";
import fs from 'fs/promises';

export async function getUniqueFileName(filename:string, dir:string = './data', ext:string='.json') {
    let fileNumber = 1; // Start with 2 to get the desired format like full2.json
  
    while (true) {
      let newFileName = `${filename}${fileNumber}${ext}`;
      if(fileNumber == 1)
        newFileName = `${filename}${ext}`;
      const newPath = path.join(dir, newFileName);
  
      try {
        await fs.access(newPath);
        // If this line is reached, the file exists; increment the number and try again.
        fileNumber++;
      } catch (err:any) {
        console.log(err);
        if (err.code === 'ENOENT') {
          // File does not exist; return the unique filename.
          return newPath;
        } else {
          throw err; // Handle other errors.
        }
      }
    }
  }