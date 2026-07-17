#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

/**
 * CLI Argument Parser
 */
function parseArgs(args) {
    const flags = {};
    const positional = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const cleanArg = arg.slice(2);
            if (cleanArg.includes('=')) {
                const [key, val] = cleanArg.split('=');
                flags[key] = val;
            } else {
                if (args[i + 1] && !args[i + 1].startsWith('--')) {
                    flags[cleanArg] = args[i + 1];
                    i++;
                } else {
                    flags[cleanArg] = true;
                }
            }
        } else if (arg.startsWith('-')) {
            const cleanArg = arg.slice(1);
            flags[cleanArg] = true;
        } else {
            positional.push(arg);
        }
    }
    return { positional, flags };
}

/**
 * Escapes HTML string characters.
 */
function escapeHtml(text) {
    if (!text) return "";
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Ensure tool is in PATH
 */
function checkCommand(cmd) {
    const checkCmd = process.platform === 'win32' ? `where ${cmd}` : `which ${cmd}`;
    try {
        execSync(checkCmd, { stdio: 'ignore' });
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Get media duration using ffprobe.
 */
function getDuration(filepath) {
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
 * 1. ANALYZE Command
 */
function handleAnalyze(positional, flags) {
    if (!checkCommand('ffprobe')) {
        console.error("Error: ffprobe was not found on PATH.");
        process.exit(1);
    }

    const targetPath = positional[0];
    if (!targetPath) {
        console.error("Usage: node scripts/videomix.js analyze <file-or-directory-path> [--out-json=<path>]");
        process.exit(1);
    }

    const resolved = path.resolve(targetPath);
    let items = [];

    if (fs.statSync(resolved).isDirectory()) {
        const files = fs.readdirSync(resolved);
        const mediaExtensions = /\.(mp4|mov|mkv|webm|avi|mp3|wav|flac|aac)$/i;
        items = files
            .filter(f => mediaExtensions.test(f))
            .map(f => path.join(resolved, f));
    } else {
        items = [resolved];
    }

    const results = items.map(item => {
        try {
            const probeOut = execSync(
                `ffprobe -hide_banner -v error -show_format -show_streams -of json "${item}"`,
                { encoding: 'utf8' }
            );
            const probe = JSON.parse(probeOut);
            return {
                path: item,
                duration: parseFloat(probe.format.duration) || 0,
                format: probe.format.format_name,
                streams: (probe.streams || []).map(s => ({
                    type: s.codec_type,
                    codec: s.codec_name,
                    width: s.width || null,
                    height: s.height || null,
                    fps: s.r_frame_rate || null
                }))
            };
        } catch (err) {
            console.error(`Failed probing file ${item}: ${err.message}`);
            return { path: item, error: err.message };
        }
    });

    if (flags['out-json']) {
        const outPath = path.resolve(flags['out-json']);
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`Results written to ${outPath}`);
    } else {
        console.table(results.map(r => ({
            File: path.basename(r.path),
            Duration: r.duration ? `${r.duration.toFixed(2)}s` : 'N/A',
            Format: r.format || 'N/A',
            Streams: r.streams ? r.streams.map(s => `${s.type}(${s.codec})`).join(', ') : 'Error'
        })));
    }
}

/**
 * 2. NEW Command (VideoMix Project)
 */
function handleNew(positional, flags, isCinematic = false) {
    if (!checkCommand('ffmpeg')) {
        console.error("Error: ffmpeg was not found on PATH.");
        process.exit(1);
    }

    const edl = positional[0];
    const outDir = positional[1];

    if (!edl || !outDir) {
        const cmdName = isCinematic ? 'new:cinematic' : 'new';
        console.error(`Usage: node scripts/videomix.js ${cmdName} <edl.json> <out-dir> [--gsap=<path>] [--force]`);
        process.exit(1);
    }

    const edlPath = path.resolve(edl);
    if (!fs.existsSync(edlPath)) {
        console.error(`EDL file not found: ${edl}`);
        process.exit(1);
    }

    const targetDir = path.resolve(outDir);
    const force = flags.force || flags.f;

    if (fs.existsSync(targetDir) && !force) {
        console.error(`Error: OutDir already exists. Use --force to overwrite: ${outDir}`);
        process.exit(1);
    }

    // Load EDL
    const config = JSON.parse(fs.readFileSync(edlPath, 'utf8'));
    const project = config.project;
    const shots = config.shots || [];

    if (shots.length === 0) {
        console.error("Error: EDL has no shots.");
        process.exit(1);
    }

    // Setup project directory structure
    fs.mkdirSync(targetDir, { recursive: true });
    const mediaDir = path.join(targetDir, 'media');
    fs.mkdirSync(mediaDir, { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'renders'), { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'snapshots'), { recursive: true });

    const width = parseInt(project.width) || 1920;
    const height = parseInt(project.height) || 1080;
    const fps = parseInt(project.fps) || 30;
    const duration = parseFloat(project.duration);

    // Audio & Ducking Logic
    const audioObj = isCinematic ? config.music : config.audio;
    if (audioObj && audioObj.path) {
        const audioOut = path.join(mediaDir, isCinematic ? 'music.m4a' : 'music.mp3');
        const audioStart = parseFloat(audioObj.start) || 0;
        const audioDuration = parseFloat(audioObj.duration) || duration;
        const baseVolume = parseFloat(audioObj.volume) !== undefined ? parseFloat(audioObj.volume) : (isCinematic ? 0.42 : 1.0);
        const fadeIn = parseFloat(audioObj.fadeIn) !== undefined ? parseFloat(audioObj.fadeIn) : 0.2;
        const fadeOut = parseFloat(audioObj.fadeOut) !== undefined ? parseFloat(audioObj.fadeOut) : 0.8;
        const fadeOutStart = Math.max(0, audioDuration - fadeOut);

        const rawAudioPath = path.isAbsolute(audioObj.path) 
            ? audioObj.path 
            : path.resolve(path.dirname(edlPath), audioObj.path);

        let audioFilter = `volume=${baseVolume}`;
        
        if (isCinematic && audioObj.ducking && Array.isArray(audioObj.ducking) && audioObj.ducking.length > 0) {
            console.log(`[VideoMix] Applying audio ducking for ${audioObj.ducking.length} intervals.`);
            const betweenExprs = audioObj.ducking.map(interval => `between(t,${interval.start},${interval.end})`).join('+');
            const duckVolume = parseFloat(audioObj.duckVolume) || 0.15;
            audioFilter = `volume='if(${betweenExprs}, ${duckVolume}, ${baseVolume})':eval=frame`;
        }

        audioFilter += `,afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}`;

        const audioCodec = isCinematic ? '-c:a aac' : '-c:a libmp3lame';
        const audioCmd = `ffmpeg -hide_banner -y -ss ${audioStart} -t ${audioDuration} -i "${rawAudioPath}" -vn -af "${audioFilter}" ${audioCodec} -b:a 192k "${audioOut}"`;
        
        try {
            console.log(`[VideoMix] Formatting BGM track: ${path.basename(rawAudioPath)}`);
            execSync(audioCmd, { stdio: 'inherit' });
        } catch (err) {
            console.error(`BGM processing failed: ${err.message}`);
            process.exit(1);
        }
    }

    // Shot Extraction
    const videoTags = [];
    const cutTimes = [];

    for (let i = 0; i < shots.length; i++) {
        const shot = shots[i];
        const indexStr = String(i + 1).padStart(2, '0');
        const id = shot.id || `shot-${indexStr}`;
        const shotFile = `shot-${indexStr}.mp4`;
        const shotOut = path.join(mediaDir, shotFile);
        
        const srcStart = parseFloat(shot.sourceStart) || 0;
        const shotDuration = parseFloat(shot.duration);
        const timelineStart = parseFloat(shot.timelineStart) || 0;
        const trackIndex = shot.trackIndex !== undefined ? parseInt(shot.trackIndex) : 0;

        const rawSource = path.isAbsolute(shot.source)
            ? shot.source
            : path.resolve(path.dirname(edlPath), shot.source);

        if (!fs.existsSync(rawSource)) {
            console.error(`Source video not found: ${rawSource}`);
            process.exit(1);
        }

        console.log(`[VideoMix] Extracting shot ${i + 1}/${shots.length}: ${id} (duration ${shotDuration}s)`);

        const vf = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},format=yuv420p,fps=${fps}`;
        const shotCmd = `ffmpeg -hide_banner -y -ss ${srcStart} -t ${shotDuration + 0.05} -i "${rawSource}" -an -vf "${vf}" -c:v libx264 -preset veryfast -crf 20 -g ${fps} -keyint_min ${fps} -sc_threshold 0 -movflags +faststart "${shotOut}"`;
        
        try {
            execSync(shotCmd, { stdio: 'ignore' });
        } catch (err) {
            console.error(`Shot extraction failed for ${id}: ${err.message}`);
            process.exit(1);
        }

        if (timelineStart > 0) cutTimes.push(timelineStart);
        videoTags.push(`      <video id="${id}" class="clip video-shot" data-start="${timelineStart}" data-duration="${shotDuration}" data-track-index="${trackIndex}" src="./media/${shotFile}" muted playsinline preload="auto"></video>`);
    }

    // Dialogue (Cinematic only)
    const dialogueTags = [];
    const dialogue = config.dialogue || [];
    if (isCinematic && dialogue.length > 0) {
        for (let i = 0; i < dialogue.length; i++) {
            const line = dialogue[i];
            const indexStr = String(i + 1).padStart(2, '0');
            const id = line.id || `dialogue-${indexStr}`;
            const dialogueFile = `dialogue-${indexStr}${path.extname(line.source)}`;
            const dialogueOut = path.join(mediaDir, dialogueFile);

            const srcStart = parseFloat(line.sourceStart) || 0;
            const lineDuration = parseFloat(line.duration);
            const timelineStart = parseFloat(line.timelineStart) || 0;
            const lineVolume = line.volume !== undefined ? parseFloat(line.volume) : 1.0;
            const fadeIn = line.fadeIn !== undefined ? parseFloat(line.fadeIn) : 0.05;
            const fadeOut = line.fadeOut !== undefined ? parseFloat(line.fadeOut) : 0.12;
            const fadeOutStart = Math.max(0, lineDuration - fadeOut);

            const rawSource = path.isAbsolute(line.source)
                ? line.source
                : path.resolve(path.dirname(edlPath), line.source);

            console.log(`[VideoMix] Extracting dialogue ${i + 1}/${dialogue.length}: ${id}`);
            const diagFilter = `volume=${lineVolume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}`;
            const diagCmd = `ffmpeg -hide_banner -y -ss ${srcStart} -t ${lineDuration} -i "${rawSource}" -vn -af "${diagFilter}" -c:a aac -b:a 192k "${dialogueOut}"`;
            
            try {
                execSync(diagCmd, { stdio: 'ignore' });
            } catch (err) {
                console.error(`Dialogue extraction failed for ${id}: ${err.message}`);
                process.exit(1);
            }

            const track = 6 + i;
            dialogueTags.push(`      <audio id="${id}" class="clip" data-start="${timelineStart}" data-duration="${lineDuration}" data-track-index="${track}" data-volume="1" src="./media/${dialogueFile}" preload="auto"></audio>`);
        }
    }

    // Captions (Cinematic only)
    const captionTags = [];
    const captions = config.captions || [];
    const captionSource = captions.length > 0 ? captions : dialogue.filter(d => d.subtitle);
    if (isCinematic) {
        for (let i = 0; i < captionSource.length; i++) {
            const cue = captionSource[i];
            const indexStr = String(i + 1).padStart(2, '0');
            const id = cue.id || `caption-${indexStr}`;
            const cueStart = cue.timelineStart !== undefined ? parseFloat(cue.timelineStart) : parseFloat(cue.start);
            const cueDuration = parseFloat(cue.duration);
            const text = cue.text || cue.subtitle;
            captionTags.push(`      <div id="${id}" class="clip subtitle-cue" data-start="${cueStart}" data-duration="${cueDuration}" data-track-index="3">${escapeHtml(text)}</div>`);
        }
    }

    // Generate index.html from template
    const templateName = isCinematic ? 'cinematic-character.template.html' : 'index.template.html';
    const templatePath = path.resolve(__dirname, '..', 'templates', 'hyperframes', templateName);
    if (!fs.existsSync(templatePath)) {
        console.error(`Template not found: ${templatePath}`);
        process.exit(1);
    }

    let html = fs.readFileSync(templatePath, 'utf8');
    
    if (isCinematic) {
        const titleSize = Math.round(width * 0.035);
        const kickerSize = Math.round(width * 0.012);
        const subtitleSize = Math.round(width * 0.019);
        const titleOut = Math.min(4.8, Math.max(1.8, duration * 0.12));

        html = html
            .replace(/{{WIDTH}}/g, width.toString())
            .replace(/{{HEIGHT}}/g, height.toString())
            .replace(/{{DURATION}}/g, duration.toString())
            .replace(/{{VIDEO_CLIPS}}/g, videoTags.join('\n'))
            .replace(/{{DIALOGUE_AUDIO}}/g, dialogueTags.join('\n'))
            .replace(/{{CAPTIONS}}/g, captionTags.join('\n'))
            .replace(/{{MUSIC_VOLUME}}/g, "1")
            .replace(/{{KICKER}}/g, escapeHtml(project.kicker))
            .replace(/{{TITLE}}/g, escapeHtml(project.title))
            .replace(/{{TITLE_OUT}}/g, titleOut.toString())
            .replace(/{{TITLE_SIZE}}/g, titleSize.toString())
            .replace(/{{KICKER_SIZE}}/g, kickerSize.toString())
            .replace(/{{SUBTITLE_SIZE}}/g, subtitleSize.toString());
    } else {
        const flashColors = config.style?.flashColors || ["#f7f0cf", "#93ffd4", "#fff0b4", "#ffd28b"];
        html = html
            .replace(/{{WIDTH}}/g, width.toString())
            .replace(/{{HEIGHT}}/g, height.toString())
            .replace(/{{DURATION}}/g, duration.toString())
            .replace(/{{VIDEO_CLIPS}}/g, videoTags.join('\n'))
            .replace(/{{KICKER}}/g, escapeHtml(project.kicker))
            .replace(/{{TITLE}}/g, escapeHtml(project.title))
            .replace(/{{CUT_TIMES}}/g, JSON.stringify(cutTimes))
            .replace(/{{FLASH_COLORS}}/g, JSON.stringify(flashColors))
            .replace(/{{FINAL_VIGNETTE_START}}/g, Math.max(0, duration - 3.3).toString())
            .replace(/{{FINAL_TITLE_START}}/g, Math.max(0, duration - 3.6).toString())
            .replace(/{{FINAL_TITLE_END}}/g, Math.max(0, duration - 0.92).toString());
    }

    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');

    // Handle GSAP asset
    let resolvedGsap = flags.gsap;
    if (!resolvedGsap && config.assets?.gsap) {
        resolvedGsap = config.assets.gsap;
    }
    if (resolvedGsap) {
        const resolvedGsapPath = path.isAbsolute(resolvedGsap)
            ? resolvedGsap
            : path.resolve(path.dirname(edlPath), resolvedGsap);

        if (fs.existsSync(resolvedGsapPath)) {
            fs.copyFileSync(resolvedGsapPath, path.join(targetDir, 'gsap.min.js'));
        }
    } else {
        console.warn("Warning: No local gsap.min.js copied. Add --gsap or set assets.gsap in your EDL.");
    }

    // Save EDL copy in target
    fs.copyFileSync(edlPath, path.join(targetDir, 'edl.json'));
    console.log(`✅ Project successfully bootstrapped at: ${targetDir}`);
}

/**
 * 3. RENDER Command
 */
function handleRender(positional, flags) {
    const projectDir = positional[0];
    if (!projectDir) {
        console.error("Usage: node scripts/videomix.js render <project-dir> [--output=<path>] [--snapshots=<times>] [--skip-snapshots]");
        process.exit(1);
    }

    const resolvedDir = path.resolve(projectDir);
    if (!fs.existsSync(resolvedDir)) {
        console.error(`Project directory not found: ${projectDir}`);
        process.exit(1);
    }

    const output = flags.output || "renders/final.mp4";
    const snapshotAt = flags.snapshots || "0.5,3.1,6.1,9.1,12.1,15.1,18.1,21.1,24.1";
    const skipSnapshots = !!flags['skip-snapshots'];

    console.log(`[VideoMix] Rendering project in: ${resolvedDir}`);

    const originalCwd = process.cwd();
    process.chdir(resolvedDir);

    try {
        const lint = spawnSync('npx', ['hyperframes', 'lint'], { stdio: 'inherit' });
        if (lint.status !== 0) throw new Error("hyperframes lint failed.");

        const validate = spawnSync('npx', ['hyperframes', 'validate'], { stdio: 'inherit' });
        if (validate.status !== 0) throw new Error("hyperframes validate failed.");

        const inspect = spawnSync('npx', ['hyperframes', 'inspect'], { stdio: 'inherit' });
        if (inspect.status !== 0) throw new Error("hyperframes inspect failed.");

        if (!skipSnapshots) {
            fs.mkdirSync('snapshots', { recursive: true });
            const snapshot = spawnSync('npx', ['hyperframes', 'snapshot', '--at', snapshotAt], { stdio: 'inherit' });
            if (snapshot.status !== 0) throw new Error("hyperframes snapshot failed.");
        }

        const render = spawnSync('npx', ['hyperframes', 'render', '--output', output], { stdio: 'inherit' });
        if (render.status !== 0) throw new Error("hyperframes render failed.");

        console.log(`✅ Render completed. Output written to: ${path.resolve(output)}`);
    } catch (err) {
        console.error(`[VideoMix] Render error: ${err.message}`);
        process.exit(1);
    } finally {
        process.chdir(originalCwd);
    }
}

/**
 * 4. QA Command
 */
function handleQa(positional, flags) {
    if (!checkCommand('ffmpeg') || !checkCommand('ffprobe')) {
        console.error("Error: ffmpeg and ffprobe must be on PATH.");
        process.exit(1);
    }

    const projectDir = positional[0];
    if (!projectDir) {
        console.error("Usage: node scripts/videomix.js qa <project-dir> [--final-mp4=<path>] [--times=<times>]");
        process.exit(1);
    }

    const resolvedDir = path.resolve(projectDir);
    let finalMp4 = flags['final-mp4'];

    if (!finalMp4) {
        const rendersDir = path.join(resolvedDir, 'renders');
        if (!fs.existsSync(rendersDir)) {
            console.error(`Renders folder not found in ${resolvedDir}`);
            process.exit(1);
        }
        const files = fs.readdirSync(rendersDir).filter(f => f.endsWith('.mp4'));
        if (files.length === 0) {
            console.error("No rendered MP4 files found.");
            process.exit(1);
        }
        const sorted = files.map(f => {
            const filepath = path.join(rendersDir, f);
            return { filepath, mtime: fs.statSync(filepath).mtime };
        }).sort((a, b) => b.mtime - a.mtime);

        finalMp4 = sorted[0].filepath;
    }

    const qaDir = path.join(resolvedDir, 'qa');
    fs.mkdirSync(qaDir, { recursive: true });

    console.log(`[VideoMix] Running QA suite on: ${finalMp4}`);

    try {
        const probeCmd = `ffprobe -hide_banner -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of default=nw=1 "${finalMp4}"`;
        const probeOut = execSync(probeCmd, { encoding: 'utf8' });
        fs.writeFileSync(path.join(qaDir, 'ffprobe.txt'), probeOut, 'utf8');
    } catch (err) {
        console.error("QA: ffprobe run failed.");
    }

    try {
        const blackCmd = `ffmpeg -hide_banner -i "${finalMp4}" -vf "blackdetect=d=0.08:pix_th=0.08" -an -f null - 2>&1`;
        const blackOut = execSync(blackCmd, { encoding: 'utf8' });
        fs.writeFileSync(path.join(qaDir, 'blackdetect.txt'), blackOut, 'utf8');
    } catch (err) {
        console.error("QA: blackdetect run failed.");
    }

    const times = flags.times || "0.5,3.1,6.1,9.1,12.1,15.1,18.1,21.1,24.1";
    const timeList = times.split(',').map(t => t.trim()).filter(Boolean);

    for (let i = 0; i < timeList.length; i++) {
        const t = timeList[i];
        const label = t.replace('.', '_');
        const outImg = path.join(qaDir, `frame-${String(i).padStart(2, '0')}-at-${label}s.png`);
        try {
            execSync(`ffmpeg -hide_banner -y -ss ${t} -i "${finalMp4}" -frames:v 1 -update 1 "${outImg}"`, { stdio: 'ignore' });
        } catch (err) {
            console.error(`QA: Failed to extract frame at ${t}s`);
        }
    }

    console.log(`✅ QA suite finished. Outputs written to: ${qaDir}`);
}

/**
 * 5. VERTICAL Command
 */
function handleVertical(positional, flags) {
    if (!checkCommand('ffmpeg')) {
        console.error("Error: ffmpeg must be on PATH.");
        process.exit(1);
    }

    const inputMp4 = positional[0];
    const outputMp4 = positional[1];

    if (!inputMp4 || !outputMp4) {
        console.error("Usage: node scripts/videomix.js vertical <input-mp4> <output-mp4> [--hard-crop]");
        process.exit(1);
    }

    const resolvedInput = path.resolve(inputMp4);
    const resolvedOutput = path.resolve(outputMp4);

    let filter = "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.08:saturation=0.85[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p";
    if (flags['hard-crop'] || flags.h) {
        filter = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p";
    }

    console.log(`[VideoMix] Exporting vertical format to: ${resolvedOutput}`);
    const cmd = `ffmpeg -hide_banner -y -i "${resolvedInput}" -filter_complex "${filter}" -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 192k -movflags +faststart "${resolvedOutput}"`;

    try {
        execSync(cmd, { stdio: 'inherit' });
        console.log(`✅ Vertical format export successful.`);
    } catch (err) {
        console.error(`[VideoMix] Vertical export failed: ${err.message}`);
        process.exit(1);
    }
}

/**
 * Main Entry Point
 */
function main() {
    const rawArgs = process.argv.slice(2);
    const cmd = rawArgs[0];
    const { positional, flags } = parseArgs(rawArgs.slice(1));

    switch (cmd) {
        case 'analyze':
            handleAnalyze(positional, flags);
            break;
        case 'new':
            handleNew(positional, flags, false);
            break;
        case 'new:cinematic':
            handleNew(positional, flags, true);
            break;
        case 'render':
            handleRender(positional, flags);
            break;
        case 'qa':
            handleQa(positional, flags);
            break;
        case 'vertical':
            handleVertical(positional, flags);
            break;
        default:
            console.error("Unknown command. Available commands: analyze, new, new:cinematic, render, qa, vertical");
            process.exit(1);
    }
}

main();
