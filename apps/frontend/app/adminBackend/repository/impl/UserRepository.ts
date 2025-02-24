import db, { User } from "@db/server";

class UserRepository {
    public async getUserByStoreUrl(shop: string): Promise<User | null> {
        const user = await db.user.findUnique({
            where: {
                shop: shop,
            },
        });

        return user;
    }

    public async createUser(shop: string, storeEmail: string, storeName: string, primaryDomain: string, ownerName: string, storefrontAccessToken: string): Promise<User> {
        const user = await db.user.create({
            data: {
                ownerName: ownerName,
                shop: shop,
                email: storeEmail,
                storeName: storeName,
                primaryDomain: primaryDomain,
                settings: {
                    create: {
                        BundleColors: {
                            create: {
                                addToBundleBtn: "#000000",
                                addToBundleText: "#000000",
                                removeProductsBtn: "#000000",
                                removeProductsBtnText: "#000000",
                                stepsIcon: "#000000",
                                nextStepBtn: "#000000",
                                nextStepBtnText: "#000000",
                                titleAndDESC: "#000000",
                                prevStepBtnText: "#000000",
                                viewProductBtn: "#000000",
                                viewProductBtnText: "#000000",
                                prevStepBtn: "#000000",
                            },
                        },
                        BundleLabels: {
                            create: {
                                addToBundleBtn: "Add to bundle",
                                prevStepBtn: "Previous step",
                                nextStepBtn: "Next step",
                                viewProductBtn: "View product",
                            },
                        },
                    },
                },
                storefrontAccessToken: storefrontAccessToken,
            },
        });

        if (!user) {
            throw new Error(`Could not create user with store url ${shop}`);
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
