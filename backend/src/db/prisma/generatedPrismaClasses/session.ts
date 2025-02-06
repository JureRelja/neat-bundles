export class Session {
    id: string;

    shop: string;

    state: string;

    isOnline: boolean;

    scope?: string;

    expires?: Date;

    accessToken: string;

    userId?: BigInt;

    collaborator: boolean;

    email?: string;

    emailVerified: boolean;

    firstName?: string;

    lastName?: string;

    locale?: string;

    accountOwner: boolean;
}
