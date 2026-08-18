import type GeneratingOptions from "../types/GeneratingOptions";
import type MinecraftProfile from "../types/MinecraftProfile";
import type ResourcePackMcmeta from "../types/ResourcePackMcmeta";
import { downloadBlob } from "./DownloadBlob";
import packIconUrl from "../assets/pack-icon.png";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function generateResourcePack(options: GeneratingOptions, profile: MinecraftProfile, commands: Record<string, string>): Promise<void> {
    const zip = new JSZip();
    zip.file('profile.json', JSON.stringify(profile, null, 2));

    const commandFileContent = Object.entries(commands)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
    zip.file('commands.txt', commandFileContent);

    const mcmeta: ResourcePackMcmeta = {
        pack: {
            description: `${options.playerName}皮肤包\n由MC玩家模型生成工具生成`,
            min_format: 69,
            max_format: 69
        }
    };
    zip.file('pack.mcmeta', JSON.stringify(mcmeta, null, 2));

    const packIconBlob = await downloadBlob(packIconUrl);
    zip.file('pack.png', packIconBlob);

    if (options.skinFile) {
        zip.file(`assets/mc_mnqgrt/textures/player/${options.playerName}/skin.png`, options.skinFile);
    }
    if (options.capeFile) {
        zip.file(`assets/mc_mnqgrt/textures/player/${options.playerName}/cape.png`, options.capeFile);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `${options.playerName}_resources.zip`);
}