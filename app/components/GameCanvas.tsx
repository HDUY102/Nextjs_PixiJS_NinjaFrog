'use client'
// components/GameCanvas.tsx
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameManager } from '../game/GameManager';

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const gameManagerRef = useRef<GameManager | null>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        // Func Initialize async for PixiJS v8
        const initGame = async () => {
            // 1. Create Application instance
            const app = new PIXI.Application();

            // 2. Initialize (Await is required for PixiJS v8)
            await app.init({
                width: 800,
                height: 480,
                backgroundColor: 0x87CEEB,
                preference: 'webgl', // Prioritize WebGL
            });

            appRef.current = app;

            // 3. Gắn Canvas vào DOM (Ở v8 dùng app.canvas thay vì app.view)
            if (canvasRef.current) {
                canvasRef.current.appendChild(app.canvas); 
            }

            // 4. Initialize Game Manager
            gameManagerRef.current = new GameManager(app);
        };

        initGame();

        // Cleanup
        return () => {
            // Cancel GameManager first
            if (gameManagerRef.current) {
                gameManagerRef.current.destroy();
            }
            
            // Cancel Pixi App
            if (appRef.current) {
                // removeView: true to automatically remove canvas from DOM
                appRef.current.destroy({ removeView: true }, { children: true, texture: true });
            }
        };
    }, []);

    return <div ref={canvasRef} className="rounded-lg overflow-hidden shadow-2xl border-4 border-white" />;
};

export default GameCanvas;