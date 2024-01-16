import { PrismaClient } from '@prisma/client'
import fs from 'fs';
import csvParser from 'csv-parser';
import axios from 'axios';

const prisma = new PrismaClient()

interface CsvData {
    Date: string;
    Close: string;
}

interface ApiData {
    [key: string]: string;
}

async function processCSV(filePath: string): Promise<CsvData[]> {
    const results: CsvData[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data: CsvData) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', reject);
    });
}


async function main() {
    try {
        const response = await axios.get('https://api.coindesk.com/v1/bpi/historical/close.json')

        const historicalData = response.data.bpi;

        const csvData = await processCSV('./prisma/data.csv'); // Укажите путь к вашему CSV файлу
        for (const { Date: date, Close: rate } of csvData) {
            await prisma.bitcoinPrice.create({
                data: {
                    currency: 'USD',
                    rate: Number(rate),
                    updated_at: new Date(date)
                }
            });
        }

        for (const [date, rate] of Object.entries(historicalData)) {
            await prisma.bitcoinPrice.create({
                data: {
                    currency: 'USD',
                    rate: Number(rate),
                    updated_at: new Date(date)
                }
            });
        }

        console.log('seed done')
    } catch (error) {
        console.log(error)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })