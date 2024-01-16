import cron from 'node-cron';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BitcoinApiResponse {
    bpi: {
        USD: {
            rate_float: number;
        };
    };
}

async function fetchBitcoinPrice(): Promise<number> {
    try {
        const response = await axios.get<BitcoinApiResponse>('https://api.coindesk.com/v1/bpi/currentprice.json');
        return response.data.bpi.USD.rate_float;
    } catch (error) {
        console.error('Error fetching Bitcoin price:', error);
        throw error;
    }
}


async function saveBitcoinPrice() {
    const price = await fetchBitcoinPrice();
    await prisma.bitcoinPrice.create({
        data: {
            currency: 'USD',
            rate: price,
            updated_at: new Date(),
        },
    });
}

cron.schedule('* * * * *', () => {
    console.log('saving to db =)');
    saveBitcoinPrice().catch(console.error);
});
