import type MinecraftProfile from "../types/MinecraftProfile";
import type GeneratingOptions from "../types/GeneratingOptions";
import { getAshconProfile, getProfileTextures } from "./MojangAPI";
import { toNbtIntArray } from "./MinecraftUuidConverter";

export async function constructProfile(options: GeneratingOptions): Promise<MinecraftProfile> {
    switch (options.profileOrigin) {
        case 'realtime':
            return constructRealtimeProfile(options.playerName);
        case 'stored':
            return constructStoredProfile(options.playerName);
        case 'url':
            // Implementation for URL-based profiles
            break;
        case 'pack':
            // Implementation for pack-based profiles
            break;
    }
    throw new Error(`Unsupported profile origin: ${options.profileOrigin}`);
}

export async function constructRealtimeProfile(username: string): Promise<MinecraftProfile> {
    const ashconProfile = await getAshconProfile(username);
    const profile: MinecraftProfile = {
        id: toNbtIntArray(ashconProfile.uuid),
        name: ashconProfile.username
    }
    return profile;
}

export async function constructStoredProfile(username: string): Promise<MinecraftProfile> {
    const ashconProfile = await getAshconProfile(username);
    const profile: MinecraftProfile = {
        id: toNbtIntArray(ashconProfile.uuid),
        name: ashconProfile.username,
        properties: [{
            name: 'textures',
            value: btoa(JSON.stringify(getProfileTextures(ashconProfile)))
        }]
    }
    return profile;
}