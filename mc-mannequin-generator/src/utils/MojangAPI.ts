import type MinecraftProfileTextures from '../types/MinecraftProfileTextures';
import type AshconProfile from '../types/AshconProfile';

export async function getAshconProfile(username: string): Promise<AshconProfile> {
    const response = await fetch(`https://api.ashcon.app/mojang/v2/user/${username}`);
    if (!response.ok) {
        throw new Error(`Error fetching Ashcon profile for ${username}`);
    }
    return response.json();
}

export function getProfileTextures(profile: AshconProfile): MinecraftProfileTextures {
    const textures: MinecraftProfileTextures = {
        timestamp: Date.now(),
        profileId: profile.uuid,
        profileName: profile.username,
        textures: {
            SKIN: {
                url: profile.textures.skin.url,
                metadata: {
                    model: profile.textures.slim ? 'slim' : 'wide'
                }
            },
            CAPE: profile.textures.cape ? {
                url: profile.textures.cape.url
            } : undefined
        }
    };
    return textures;
}
