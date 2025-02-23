import db from "../../../db.server";
import { Settings, User } from "@prisma/client";

class GlobalSettingsRepository {
    public async getSettingsByStoreUrl(storeUrl: string): Promise<Settings | null> {
        const globalSettings = await db.settings.findUnique({
            where: {
                shop: storeUrl,
            },
        });

        return globalSettings;
    }

    public async updateGlobalSettings(newGlobalSettings: Settings): Promise<boolean> {
        const updatedSettings = await db.settings.update({
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
