export interface Raw {
    value: string;
    signature: string;
}

export interface Cape {
    url: string;
    data: string;
}

export interface Skin {
    url: string;
    data: string;
}

export interface Textures {
    slim: boolean;
    custom: boolean;
    skin: Skin;
    cape?: Cape;
    raw: Raw;
}

export interface UsernameHistory {
    username: string;
    changed_at?: string;
}

export default interface AshconProfile {
    uuid: string;
    username: string;
    username_history: UsernameHistory[];
    textures: Textures;
    legacy?: boolean;
    demo?: boolean;
    created_at?: string;
}

