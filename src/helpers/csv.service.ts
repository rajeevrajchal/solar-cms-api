import { Global, Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';

@Global()
@Injectable()
export class CsvService {
  async parseCsv(csv: Express.Multer.File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const buffer = csv.buffer;

      Papa.parse(buffer.toString(), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        skipLines: 1,
        complete: (parsedResults) => {
          results.push(...parsedResults.data);
          resolve(results);
        },
        error: (error) => {
          reject(error.message);
        },
      });
    });
  }

  async jsonToCSV(jsonData: any): Promise<any> {
    if (!Array.isArray(jsonData)) {
      throw new Error('Input data should be an array.');
    }
    if (jsonData.length === 0) {
      throw new Error('Input data array should not be empty.');
    }
    const headers = Object.keys(jsonData[0]);

    const csvData = Papa.unparse({
      fields: headers,
      data: jsonData,
    });
    return csvData;
  }
}
