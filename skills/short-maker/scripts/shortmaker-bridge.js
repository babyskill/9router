const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { animateScreenshot } = require('./effects');

// Fallback music URL if Pixabay key is missing or API fails
const FALLBACK_MUSIC_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

/**
 * Helper to fetch and download a file.
 */
async function downloadFile(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download from ${url}: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
}

/**
 * Locate Pixabay API Key from env, project .env, or global config.
 */
function getPixabayApiKey() {
    if (process.env.PIXABAY_API_KEY) return process.env.PIXABAY_API_KEY;
    if (process.env.PIXABAY_KEY) return process.env.PIXABAY_KEY;

    // Check local .env
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/^PIXABAY_API_KEY\s*=\s*(.+)$/m);
            if (match) return match[1].trim().replace(/['"]/g, '');
        } catch (_) {}
    }

    return null;
}

/**
 * Search Pixabay for videos matching a background music query, and return a download URL.
 */
async function fetchPixabayBgmUrl(apiKey) {
    const queries = ['lofi+beats', 'ambient+background+music', 'instrumental+music', 'cinematic+music'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=10`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Pixabay API status: ${res.status}`);
        const data = await res.json();
        
        if (data.hits && data.hits.length > 0) {
            const hit = data.hits[Math.floor(Math.random() * data.hits.length)];
            const videoUrl = hit.videos.medium?.url || hit.videos.small?.url || hit.videos.large?.url;
            if (videoUrl) {
                console.log(`[Bridge] Found Pixabay video clip for BGM: ${hit.pageURL}`);
                return { videoUrl, isVideo: true };
            }
        }
    } catch (err) {
        console.warn(`[Bridge] Warning: Pixabay search failed: ${err.message}`);
    }
    return null;
}

/**
 * Get media duration using ffprobe.
 */
function getMediaDuration(filepath) {
    try {
        const output = execSync(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filepath}"`,
            { encoding: 'utf-8', timeout: 5000 }
        ).trim();
        return parseFloat(output) || 0;
    } catch (e) {
        return 0;
    }
}

/**
 * Map storyboard transition effect to effects.js standard animations.
 */
function mapEffect(effectName) {
    if (!effectName) return 'zoom-in';
    const norm = effectName.toLowerCase();
    if (norm.includes('push_in') || norm.includes('zoom_in') || norm.includes('zoom-in')) {
        return 'zoom-in';
    }
    if (norm.includes('zoom_out') || norm.includes('zoom-out') || norm.includes('pulse')) {
        return 'zoom-out';
    }
    if (norm.includes('pan') && (norm.includes('left') || norm.includes('vertical'))) {
        return 'pan-left';
    }
    if (norm.includes('pan') && norm.includes('right')) {
        return 'pan-right';
    }
    return 'still';
}

/**
 * Run the Bridge process.
 */
async function runBridge({ shortmakerDir, outDir, bgmVolume = 0.2 }) {
    console.log(`[Bridge] Importing ShortMaker project from: ${shortmakerDir}`);
    
    const sbPath = path.join(shortmakerDir, 'storyboard.json');
    if (!fs.existsSync(sbPath)) {
        throw new Error(`storyboard.json not found in ${shortmakerDir}`);
    }

    const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
    const scenes = sb.scenes || [];
    if (scenes.length === 0) {
        throw new Error('Storyboard has no scenes.');
    }

    // Ensure output directories exist
    fs.mkdirSync(outDir, { recursive: true });
    const mediaDir = path.join(outDir, 'media');
    fs.mkdirSync(mediaDir, { recursive: true });

    // 1. Identify/Download Music BGM
    const bgmOut = path.join(mediaDir, 'music.mp3');
    let bgmSourceUsed = 'fallback';

    const apiKey = getPixabayApiKey();
    if (apiKey) {
        console.log('[Bridge] Pixabay API Key found. Searching Pixabay for BGM source...');
        const bgmData = await fetchPixabayBgmUrl(apiKey);
        if (bgmData) {
            const tempVideo = path.join(outDir, 'temp_bgm_video.mp4');
            try {
                console.log(`[Bridge] Downloading Pixabay video clip: ${bgmData.videoUrl}`);
                await downloadFile(bgmData.videoUrl, tempVideo);
                
                console.log('[Bridge] Extracting audio track to bgm.mp3...');
                execSync(`ffmpeg -hide_banner -y -i "${tempVideo}" -vn -c:a libmp3lame -b:a 192k "${bgmOut}"`, { stdio: 'ignore' });
                bgmSourceUsed = 'pixabay';
            } catch (err) {
                console.warn(`[Bridge] Pixabay download/extract failed: ${err.message}. Falling back to default.`);
            } finally {
                if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
            }
        }
    }

    if (bgmSourceUsed === 'fallback') {
        let localMusic = sb.audio?.music;
        if (localMusic) {
            if (!path.isAbsolute(localMusic)) {
                localMusic = path.resolve(shortmakerDir, localMusic);
            }
            if (fs.existsSync(localMusic)) {
                console.log(`[Bridge] Copying BGM from storyboard configuration: ${localMusic}`);
                fs.copyFileSync(localMusic, bgmOut);
                bgmSourceUsed = 'storyboard-local';
            }
        }
        
        if (bgmSourceUsed === 'fallback') {
            console.log(`[Bridge] Downloading fallback BGM: ${FALLBACK_MUSIC_URL}`);
            await downloadFile(FALLBACK_MUSIC_URL, bgmOut);
        }
    }

    // 2. Parse Scenes and build EDL
    console.log('[Bridge] Mapping storyboard scenes to EDL format...');
    const shots = [];
    const dialogue = [];
    const captions = [];

    let currentTimelineStart = 0;
    const duckingIntervals = [];

    const screenshotsDir = sb.inputs?.screenshotsDir 
        ? (path.isAbsolute(sb.inputs.screenshotsDir) ? sb.inputs.screenshotsDir : path.resolve(shortmakerDir, sb.inputs.screenshotsDir))
        : path.join(shortmakerDir, 'assets');

    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const sceneIndexStr = String(i + 1).padStart(2, '0');
        const id = scene.id || `shot-${sceneIndexStr}`;
        
        let videoFile = path.join(shortmakerDir, 'segments', `${scene.id || `scene-${sceneIndexStr}`}.mp4`);
        if (!fs.existsSync(videoFile)) {
            videoFile = path.join(shortmakerDir, 'segments', `scene-${sceneIndexStr}.mp4`);
        }

        const targetVideoFile = `shot-${sceneIndexStr}.mp4`;
        const targetVideoPath = path.join(mediaDir, targetVideoFile);
        let sceneDuration = parseFloat(scene.duration) || 5.0;

        if (fs.existsSync(videoFile)) {
            fs.copyFileSync(videoFile, targetVideoPath);
        } else if (scene.image) {
            const imagePath = path.isAbsolute(scene.image) ? scene.image : path.join(screenshotsDir, scene.image);
            if (fs.existsSync(imagePath)) {
                console.log(`[Bridge] Segment ${sceneIndexStr} not found. Animating static image: ${scene.image}`);
                const animEffect = mapEffect(scene.effect);
                animateScreenshot(imagePath, targetVideoPath, {
                    effect: animEffect,
                    durationSec: sceneDuration,
                    width: sb.project?.width || 1080,
                    height: sb.project?.height || 1920
                });
            } else {
                console.warn(`[Bridge] Warning: Neither video segment nor screenshot found for scene: ${id}. A placeholder is needed.`);
            }
        } else {
            console.warn(`[Bridge] Warning: No video segment or image found for scene: ${id}.`);
        }

        let ttsFile = path.join(shortmakerDir, 'tts', `${scene.id || `scene-${sceneIndexStr}`}.mp3`);
        if (!fs.existsSync(ttsFile)) {
            ttsFile = path.join(shortmakerDir, 'tts', `scene-${sceneIndexStr}.mp3`);
        }
        if (!fs.existsSync(ttsFile)) {
            ttsFile = path.join(shortmakerDir, 'tts', `scene-${sceneIndexStr}.wav`);
        }

        const hasTts = fs.existsSync(ttsFile);

        if (hasTts) {
            const targetTtsFile = `dialogue-${sceneIndexStr}${path.extname(ttsFile)}`;
            const targetTtsPath = path.join(mediaDir, targetTtsFile);
            fs.copyFileSync(ttsFile, targetTtsPath);

            const ttsDur = getMediaDuration(targetTtsPath);
            if (ttsDur > 0) {
                sceneDuration = ttsDur;
            }

            dialogue.push({
                id: `dialogue-${sceneIndexStr}`,
                source: `./media/${targetTtsFile}`,
                sourceStart: 0,
                duration: sceneDuration,
                timelineStart: currentTimelineStart,
                volume: 1.0,
                fadeIn: 0.05,
                fadeOut: 0.12,
                subtitle: scene.speech || ""
            });

            duckingIntervals.push({
                start: currentTimelineStart,
                end: currentTimelineStart + sceneDuration
            });
        }

        shots.push({
            id: id,
            source: `./media/${targetVideoFile}`,
            sourceStart: 0,
            duration: sceneDuration,
            timelineStart: currentTimelineStart
        });

        if (scene.speech || scene.text || scene.overlay) {
            captions.push({
                id: `caption-${sceneIndexStr}`,
                timelineStart: currentTimelineStart,
                duration: sceneDuration,
                text: scene.speech || scene.text || scene.overlay
            });
        }

        currentTimelineStart += sceneDuration;
    }

    const edlConfig = {
        project: {
            width: sb.project?.width || 1080,
            height: sb.project?.height || 1920,
            fps: sb.project?.fps || 30,
            duration: currentTimelineStart,
            title: sb.project?.name || "ShortMaker Mixed Video",
            kicker: sb.project?.framework || "AIDA Promo"
        },
        music: {
            path: "./media/music.mp3",
            start: sb.audio?.start || 0,
            duration: currentTimelineStart,
            volume: parseFloat(bgmVolume) || 0.2,
            fadeIn: sb.audio?.fadeIn !== undefined ? sb.audio.fadeIn : 1.0,
            fadeOut: sb.audio?.fadeOut !== undefined ? sb.audio.fadeOut : 2.0,
            ducking: duckingIntervals
        },
        shots: shots,
        dialogue: dialogue,
        captions: captions,
        style: {
            flashColors: ["#f7f0cf", "#93ffd4", "#fff0b4", "#ffd28b"]
        },
        assets: {
            gsap: "./gsap.min.js"
        }
    };

    const edlPath = path.join(outDir, 'edl.json');
    fs.writeFileSync(edlPath, JSON.stringify(edlConfig, null, 2), 'utf8');
    console.log(`[Bridge] ✅ Successfully created EDL: ${edlPath}`);
    console.log(`[Bridge] BGM source used: ${bgmSourceUsed}`);
    console.log(`[Bridge] Total scenes: ${shots.length}, Duration: ${currentTimelineStart.toFixed(2)}s`);
}

module.exports = {
    runBridge
};

if (require.main === module) {
    const args = process.argv.slice(2);
    const shortmakerDirArg = args.find(a => a.startsWith('--project-dir='))?.split('=')[1];
    const outDirArg = args.find(a => a.startsWith('--out-dir='))?.split('=')[1];
    const bgmVolumeArg = args.find(a => a.startsWith('--bgm-volume='))?.split('=')[1] || "0.2";

    if (!shortmakerDirArg || !outDirArg) {
        console.error('Usage: node scripts/shortmaker-bridge.js --project-dir=<path> --out-dir=<path> [--bgm-volume=0.2]');
        process.exit(1);
    }

    runBridge({
        shortmakerDir: path.resolve(shortmakerDirArg),
        outDir: path.resolve(outDirArg),
        bgmVolume: parseFloat(bgmVolumeArg)
    }).catch(err => {
        console.error(`[Bridge] Error: ${err.message}`);
        process.exit(1);
    });
}
