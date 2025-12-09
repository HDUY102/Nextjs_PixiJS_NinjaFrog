'use client'
// components/GameCanvas.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameManager } from '../game/GameManager';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 480;

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const gameManagerRef = useRef<GameManager | null>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        const initGame = async () => {
            const app = new PIXI.Application();
            await app.init({
                backgroundColor: 0x87CEEB,
                preference: 'webgl',
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                resizeTo: canvasRef.current || window, 
            });

            appRef.current = app;

            if (canvasRef.current) {
                // Thêm canvas vào container
                canvasRef.current.appendChild(app.canvas);
                
                // ✨ FIX LỖI: Thiết lập hàm resize để duy trì tỉ lệ
                const resizeHandler = () => {
                    const parent = canvasRef.current!;
                    const parentWidth = parent.clientWidth;
                    const parentHeight = parent.clientHeight;
                    
                    const scaleX = parentWidth / GAME_WIDTH;
                    const scaleY = parentHeight / GAME_HEIGHT;
                    
                    // Lấy tỉ lệ nhỏ hơn để đảm bảo khung game luôn nằm gọn trong container
                    const scale = Math.min(scaleX, scaleY); 
                    
                    const newWidth = GAME_WIDTH * scale;
                    const newHeight = GAME_HEIGHT * scale;
                    
                    // Cập nhật kích thước canvas (DOM Style)
                    app.canvas.style.width = `${newWidth}px`;
                    app.canvas.style.height = `${newHeight}px`;
                    
                    // Căn giữa canvas (nếu cần)
                    app.canvas.style.marginLeft = `${(parentWidth - newWidth) / 2}px`;
                    app.canvas.style.marginTop = `${(parentHeight - newHeight) / 2}px`;
                };

                // Lắng nghe sự kiện resize của window và gọi hàm resize của chúng ta
                window.addEventListener('resize', resizeHandler);
                resizeHandler(); // Gọi lần đầu để thiết lập kích thước ban đầu
                
                // Khởi tạo Game Manager
                gameManagerRef.current = new GameManager(app);
                await gameManagerRef.current.init();
            } 
        };

        initGame();
    }, []);

    return <div ref={canvasRef} className="rounded-lg overflow-hidden shadow-2xl border-4 border-white w-full h-full" />;
};

export default GameCanvas;