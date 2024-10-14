import { AdminApiContext } from '@shopify/shopify-app-remix/server';
import db from '../../../db.server';
import { User } from '@prisma/client';

class UserRepository {
    public async getUserByStoreUrl(storeUrl: string): Promise<User | null> {
        const user = await db.user.findUnique({
            where: {
                storeUrl: storeUrl,
            },
        });

        return user;
    }

    public async createUser(storeUrl: string, storeEmail: string, storeName: string, primaryDomain: string, onlineStorePublicationId: string): Promise<User> {
        const user = await db.user.create({
            data: {
                ownerName: '',
                storeUrl: storeUrl,
                email: storeEmail,
                storeName: storeName,
                primaryDomain: primaryDomain,
                onlineStorePublicationId: onlineStorePublicationId,
            },
        });

        if (!user) {
            throw new Error(`Could not create user with store url ${storeUrl}`);
        }

        return user;
    }

    public async updateUser(newUser: User): Promise<boolean> {
        const updatedUser = await db.user.update({
            where: {
                id: newUser.id,
            },
            data: newUser,
        });

        if (!updatedUser) {
            return false;
        }

        return true;
    }
}

const userRepository = new UserRepository();

export default userRepository;
