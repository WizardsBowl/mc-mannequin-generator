import type MinecraftProfile from "../types/MinecraftProfile";
import type MinecraftProfileTextures from "../types/MinecraftProfileTextures";
import type AshconProfile from "../types/AshconProfile";
import type GeneratingOptions from "../types/GeneratingOptions";
import { getProfileTextures } from "./MojangAPI";
import { toNbtIntArray } from "./MinecraftUuidConverter";

export function constructProfile(options: GeneratingOptions, ashconProfile?: AshconProfile): MinecraftProfile {
    switch (options.profileOrigin) {
        case 'realtime':
            return constructRealtimeProfile(ashconProfile!);
        case 'stored':
            return constructStoredProfile(ashconProfile!);
        case 'url':
            return constructUrlProfile(options);
        case 'pack':
            return constructPackProfile(options);
    }
    throw new Error(`Unsupported profile origin: ${options.profileOrigin}`);
}

export function constructRealtimeProfile(ashconProfile: AshconProfile): MinecraftProfile {
    const profile: MinecraftProfile = {
        id: toNbtIntArray(ashconProfile.uuid)
        //name: ashconProfile.username // MC特性：同时仅存在id和name时无法解析档案数据，这里去除name
    }
    return profile;
}

export function constructStoredProfile(ashconProfile: AshconProfile): MinecraftProfile {
    const profile: MinecraftProfile = {
        properties: [{
            name: 'textures',
            value: btoa(JSON.stringify(getProfileTextures(ashconProfile)))
        }]
    }
    return profile;
}

export function constructUrlProfile(options: GeneratingOptions): MinecraftProfile {
    const textures: MinecraftProfileTextures = {
        timestamp: Date.now(),
        profileName: options.playerName,
        textures: {
            SKIN: options.skinUrl ? {
                url: options.skinUrl || '',
                metadata: {
                    model: options.modelType
                }
            } : undefined,
            CAPE: options.capeUrl ? {
                url: options.capeUrl
            } : undefined
        }
    }
    const profile: MinecraftProfile = {
        properties: [{
            name: 'textures',
            value: btoa(JSON.stringify(textures))
        }]
    }
    return profile;
}

export function constructPackProfile(options: GeneratingOptions): MinecraftProfile {
    const profile: MinecraftProfile = {
        model: options.modelType,
        texture: options.skinFile ? `mc_mnqgrt:player/${options.playerName.toLowerCase()}/skin` : undefined,
        cape: options.capeFile ? `mc_mnqgrt:player/${options.playerName.toLowerCase()}/cape` : undefined
    }
    return profile;
}