export interface LevelConfig {
    level: number;
    targetScore: number;       // Điểm để lên cấp tiếp theo
    moveSpeed: number;         // Tốc độ map (càng cao càng khó)
    spawnRate: number;         // Tỉ lệ sinh quái (1.0 là bình thường, 2.0 là gấp đôi)
    backgroundColor: string;   // Mã màu nền (Hex)
    message: string;           // Thông báo hiển thị khi đạt cấp này
}

export const LEVELS: LevelConfig[] = [
    { 
        level: 1, 
        targetScore: 0, 
        moveSpeed: 5, 
        spawnRate: 1.0, 
        backgroundColor: '#87CEEB', // Xanh da trời
        message: "LEVEL 1: START!" 
    },
    { 
        level: 2, 
        targetScore: 100, 
        moveSpeed: 7, 
        spawnRate: 1.3, // Quái xuất hiện nhiều hơn 30%
        backgroundColor: '#FFD700', // Vàng buổi chiều
        message: "LEVEL 2: SPEED UP!" 
    },
    { 
        level: 3, 
        targetScore: 300, 
        moveSpeed: 9, 
        spawnRate: 1.8, 
        backgroundColor: '#FF4500', // Cam hoàng hôn
        message: "LEVEL 3: DANGER!" 
    },
    { 
        level: 4, 
        targetScore: 500, 
        moveSpeed: 11, 
        spawnRate: 2.5, 
        backgroundColor: '#2F4F4F', // Tối sầm (Night mode)
        message: "LEVEL 4: NIGHTMARE" 
    }
];