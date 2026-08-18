export default interface GeneratingOptions {
    playerName: string;
    profileOrigin: 'realtime' | 'stored' | 'url' | 'pack';
    modelType: 'wide' | 'slim';

    skinUrl?: string;
    capeUrl?: string;
    skinFile?: File | null;
    capeFile?: File | null;

    advancedOptions?: AdvancedGeneratingOptions;
}

export interface AdvancedGeneratingOptions {
    minFormat?: number;
    maxFormat?: number;
    packIconFile?: File | null;

    description?: string;
    hideDescription?: boolean;
    immovable?: boolean;
    invulnerable?: boolean;
    mainHand?: 'left' | 'right';
    pose?: 'standing' | 'crouching' | 'swimming' | 'fall_flying' | 'sleeping';
}