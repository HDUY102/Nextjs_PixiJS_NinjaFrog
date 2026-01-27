// 0: Không khí, 1: Gạch, 2: Trái cây
export type MapChunk = number[][];

export const PATTERNS: Record<string, MapChunk> = {
    // 1. Đường bằng phẳng cơ bản (An toàn)
    FLAT: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0], // Trái cây rải rác
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 2, 2, 2, 3],
        [1, 1, 1, 1, 1], // Đất liền mạch
    ],

    // 2. Một cái hố nhỏ (Phải nhảy)
    GAP_SMALL: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 2, 0, 0], // Trái cây dụ người chơi nhảy
        [0, 0, 0, 0, 3],
        [1, 1, 0, 1, 1], // Có lỗ hổng ở giữa
    ],

    // 3. Bậc thang lên cao
    STAIRS_UP: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 1, 1],
        [0, 0, 0, 1, 1, 1],
        [0, 0, 2, 0, 0, 0],
        [3, 1, 1, 0, 3, 0], // Bậc thấp
        [1, 1, 1, 1, 1, 1], // Nền đất
    ],

    // 4. Các bệ đỡ bay lơ lửng (Floating Platforms)
    PLATFORMS: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 2, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0], // Bệ trên cao
        [0, 0, 0, 0, 0, 0, 0],
        [0, 2, 3, 0, 0, 2, 0],
        [1, 1, 1, 0, 0, 1, 1], // Bệ thấp
        [0, 0, 0, 0, 0, 0, 0], // Dưới cùng là vực thẳm (Nguy hiểm)
    ],

    // 5. Đường gập ghềnh
    BUMPY: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 1, 0], // Chướng ngại vật
        [0, 0, 1, 0, 1, 0],
        [0, 2, 1, 2, 1, 2],
        [1, 1, 1, 1, 1, 1],
    ],

    // 6. Coin
    MYSTERY_BOX: [
        [0, 0, 0, 0, 0],
        [0, 2, 2, 2, 0],
        [0, 4, 0, 4, 0], // Hai cục gạch đặc biệt
        [0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
    ]
};

// Hàm lấy ngẫu nhiên 1 Pattern
export function getRandomPattern(): MapChunk {
    const keys = Object.keys(PATTERNS);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return PATTERNS[keys[randomIndex]];
}