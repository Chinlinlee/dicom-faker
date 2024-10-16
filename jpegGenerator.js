const { createCanvas } = require("canvas");

const FRAME_WIDTH = 512;
const FRAME_HEIGHT = 512;

class JpegGenerator {

    /**
     * 
     * @param {string} text 
     */
    static generate(text) {
        const canvas = createCanvas(FRAME_WIDTH, FRAME_HEIGHT);
        const context = canvas.getContext('2d');

        context.font = 'bold 50pt Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#fff';
        context.fillText(text, FRAME_WIDTH / 2, FRAME_HEIGHT / 2);
    
        context.strokeStyle = '#fff';
        context.setLineDash([3, 3]);
        context.strokeRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    
        return canvas.toBuffer('image/jpeg', 1);
    }
}

module.exports = {
    JpegGenerator
};