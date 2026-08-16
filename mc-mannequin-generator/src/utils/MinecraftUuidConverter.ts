/**
 * Minecraft UUID 转换工具
 * 实现十六进制表示法与整型数组表示法之间的相互转换
 * 参考: https://zh.minecraft.wiki/w/通用唯一识别码
 */

/**
 * 将十六进制 UUID（含或不含连字符）转换为 4 个 int32 组成的数组
 * 
 * @param uuid - 十六进制 UUID 字符串，可含连字符也可不含
 * @returns 长度为 4 的 int32 数组，按从高到低排列
 * 
 * @example
 * hexToIntArray('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
 * // => [-132296786, 2112623056, -1486552928, -920753162]
 */
export function hexToIntArray(uuid: string): number[] {
    // 移除所有连字符，得到 32 位十六进制字符串
    const hex = uuid.replace(/-/g, '');

    if (hex.length !== 32) {
        throw new Error(`Invalid UUID length: expected 32 hex characters, got ${hex.length}`);
    }

    const result: number[] = [];

    // 每 8 个十六进制字符（32 位）为一组
    for (let i = 0; i < 4; i++) {
        const segment = hex.substring(i * 8, (i + 1) * 8);
        // 将 32 位十六进制字符串转换为有符号 32 位整数
        const value = parseInt(segment, 16);
        // 如果值大于 2^31-1，则转换为有符号整数（JavaScript 的位操作符会自动处理）
        result[i] = value | 0;
    }

    return result;
}

/**
 * 将 4 个 int32 组成的数组转换为十六进制 UUID 字符串
 * 
 * @param intArray - 长度为 4 的 int32 数组，按从高到低排列
 * @param withHyphens - 是否在输出中包含连字符，默认为 true
 * @returns 十六进制 UUID 字符串
 * 
 * @example
 * intArrayToHex([-132296786, 2112623056, -1486552928, -920753162])
 * // => 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
 * 
 * intArrayToHex([-132296786, 2112623056, -1486552928, -920753162], false)
 * // => 'f81d4fae7dec11d0a76500a0c91e6bf6'
 */
export function intArrayToHex(intArray: number[], withHyphens: boolean = true): string {
    if (intArray.length !== 4) {
        throw new Error(`Invalid int array length: expected 4, got ${intArray.length}`);
    }

    // 将每个 int32 转换为 8 位十六进制字符串（补零到 8 位）
    const hexParts = intArray.map((num) => {
        // 将 JavaScript number 转换为无符号 32 位整数再转十六进制
        const unsigned = num >>> 0;
        return unsigned.toString(16).padStart(8, '0');
    });

    const hex = hexParts.join('');

    if (!withHyphens) {
        return hex;
    }

    // 按 8-4-4-4-12 格式插入连字符
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

/**
 * 将十六进制 UUID 字符串转换为格式化的 NBT 整型数组字符串
 * 适用于 Minecraft 1.16+ 的 NBT 格式
 * 
 * @param uuid - 十六进制 UUID 字符串（含或不含连字符）
 * @returns NBT 格式的整型数组字符串，如 '[I;1,2,3,4]'
 * 
 * @example
 * toNbtIntArray('f81d4fae-7dec-11d0-a765-00a0c91e6bf6')
 * // => '[I;-132296786,2112623056,-1486552928,-920753162]'
 */
export function toNbtIntArray(uuid: string): string {
    const intArray = hexToIntArray(uuid);
    return `[I;${intArray.join(',')}]`;
}

/**
 * 从 NBT 格式的整型数组字符串解析并转换为十六进制 UUID
 * 
 * @param nbtString - NBT 格式的整型数组字符串，如 '[I;1,2,3,4]'
 * @param withHyphens - 是否在输出中包含连字符，默认为 true
 * @returns 十六进制 UUID 字符串
 * 
 * @example
 * fromNbtIntArray('[I;-132296786,2112623056,-1486552928,-920753162]')
 * // => 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6'
 */
export function fromNbtIntArray(nbtString: string, withHyphens: boolean = true): string {
    // 匹配 [I;num,num,num,num] 格式
    const match = nbtString.match(/^\[I;([^,]+),([^,]+),([^,]+),([^\]]+)\]$/);
    if (!match) {
        throw new Error(`Invalid NBT int array format: ${nbtString}`);
    }

    const intArray = match.slice(1, 5).map((s) => parseInt(s.trim(), 10));
    return intArrayToHex(intArray, withHyphens);
}