import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import db from '../../../db.server';
import { User } from '@prisma/client';

class UserRepository {
    public async getUserByStoreUrl(admin: AdminApiContext, storeUrl: string): Promise<User> {
        const user = await db.user.findUnique({
            where: {
                storeUrl: storeUrl,
            },
        });

        if (!user) {
            throw new Error(`User with store url ${storeUrl} not found`);
        }

        return user;
    }
}

const userRepository = new UserRepository();

export default userRepository;
