const { execSync } = require('child_process');

/**
 * Generate the zoompan filter based on selected effect.
 */
function getZoompanFilter({ effect = 'zoom-in', durationSec = 5, fps = 30, width = 1080, height = 1920 }) {
    const totalFrames = Math.ceil(durationSec * fps);
    let filter = '';

    switch (effect) {
        case 'zoom-in':
            filter = `zoompan=z='min(zoom+0.001,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;
            break;
        case 'zoom-out':
            filter = `zoompan=z='max(1.15-0.001*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`;
            break;
        case 'pan-left':
            filter = `zoompan=z='1.2':x='(1.2-1)*iw * (1 - on/${totalFrames})':y='ih/2-(ih/zoom/2)'`;
            break;
        case 'pan-right':
            filter = `zoompan=z='1.2':x='(1.2-1)*iw * (on/${totalFrames})':y='ih/2-(ih/zoom/2)'`;
            break;
        case 'still':
        default:
            return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},format=yuv420p`;
    }

    return `${filter}:d=${totalFrames}:s=${width}x${height},format=yuv420p`;
}

/**
 * Animate a static image into a short MP4 clip using FFmpeg.
 */
function animateScreenshot(inputPath, outputPath, options = {}) {
    const {
        effect = 'zoom-in',
        durationSec = 5,
        fps = 30,
        width = 1080,
        height = 1920
    } = options;

    const filter = getZoompanFilter({ effect, durationSec, fps, width, height });
    const cmd = `ffmpeg -hide_banner -y -loop 1 -i "${inputPath}" -vf "${filter}" -c:v libx264 -preset veryfast -crf 20 -t ${durationSec} -pix_fmt yuv420p "${outputPath}"`;
    
    try {
        execSync(cmd, { stdio: 'pipe' });
    } catch (err) {
        throw new Error(`FFmpeg animateScreenshot failed: ${err.stderr ? err.stderr.toString() : err.message}`);
    }
}

module.exports = {
    animateScreenshot,
    getZoompanFilter
};
