export interface Metadata {
    model: 'slim' | 'wide';
}

export interface CAPE {
    url: string;
}

export interface SKIN {
    url: string;
    metadata?: Metadata;
}

export interface Textures {
    SKIN?: SKIN;
    CAPE?: CAPE;
}

export default interface MinecraftProfileTextures {
    timestamp?: number;
    profileId?: string;
    profileName: string;
    textures: Textures;
}

