import * as PIXI from 'pixi.js';

/**
 * Hàm cắt một Texture lớn (Sprite Sheet/Strip) thành mảng các Texture nhỏ (Animation Frames)
 * @param baseTexture Texture gốc (ảnh dài)
 * @param frameWidth Chiều rộng 1 khung hình (ví dụ 32px)
 * @param frameHeight Chiều cao 1 khung hình (ví dụ 32px)
 * @param frameCount Số lượng khung hình trong ảnh
 */
export const getFramesFromSpriteSheet = (
    baseTexture: PIXI.Texture,
    frameWidth: number,
    frameHeight: number,
    frameCount: number
): PIXI.Texture[] => {
    const frames: PIXI.Texture[] = [];
    
    for (let i = 0; i < frameCount; i++) {
        const frame = new PIXI.Texture({
            source: baseTexture.source,
            frame: new PIXI.Rectangle(i * frameWidth, 0, frameWidth, frameHeight)
        });
        frames.push(frame);
    }
    
    return frames;
};