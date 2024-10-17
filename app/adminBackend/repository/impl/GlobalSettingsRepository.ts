import db from '../../../db.server';
import { GlobalSettings, User } from '@prisma/client';

class GlobalSettingsRepository {
    public async getSettingsByStoreUrl(storeUrl: string): Promise<GlobalSettings | null> {
        const globalSettings = await db.globalSettings.findUnique({
            where: {
                storeUrl: storeUrl,
            },
        });

        return globalSettings;
    }

    public async updateUser(newGlobalSettings: GlobalSettings): Promise<boolean> {
        const updatedSettings = await db.user.update({
            where: {
                id: newGlobalSettings.id,
            },
            data: newGlobalSettings,
        });

        if (!updatedSettings) {
            return false;
        }

        return true;
    }
}

const globalSettingsRepository = new GlobalSettingsRepository();

export default globalSettingsRepository;
