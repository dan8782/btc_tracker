import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const bitcoinData = await prisma.bitcoinPrice.findMany({
            orderBy: {
                updated_at: 'asc',
              },},
        );
        return bitcoinData;
    } catch (error) {
        
    }
})
