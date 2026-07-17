#!/usr/bin/env python3
import sys
import os
import argparse
import subprocess
from PIL import Image

def create_animation(input_path, output_path, cols, rows, duration=100, scale=1.0):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
    except Exception as e:
        print(f"Error opening {input_path}: {e}")
        sys.exit(1)

    width, height = img.size
    frame_width = width // cols
    frame_height = height // rows

    frames = []
    for r in range(rows):
        for c in range(cols):
            # Crop the frame
            box = (c * frame_width, r * frame_height, (c + 1) * frame_width, (r + 1) * frame_height)
            frame = img.crop(box)
            
            # Scale if necessary
            if scale != 1.0:
                new_size = (int(frame_width * scale), int(frame_height * scale))
                frame = frame.resize(new_size, Image.Resampling.NEAREST)
                
            frames.append(frame)

    if not frames:
        print("Error: No frames could be extracted.")
        sys.exit(1)

    # If output is mp4, generate a temporary gif first
    is_mp4 = output_path.lower().endswith('.mp4')
    gif_path = output_path.replace('.mp4', '.gif') if is_mp4 else output_path

    try:
        # Save as GIF
        frames[0].save(
            gif_path,
            save_all=True,
            append_images=frames[1:],
            duration=duration,
            loop=0,
            disposal=2  # Restore to background color
        )
        print(f"Successfully generated GIF: {gif_path}")

        # Convert to MP4 if requested
        if is_mp4:
            print(f"Converting GIF to MP4 using ffmpeg...")
            # Requires ffmpeg installed
            cmd = [
                'ffmpeg', '-y', '-i', gif_path,
                '-movflags', 'faststart', '-pix_fmt', 'yuv420p',
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                output_path
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"Successfully generated MP4: {output_path}")
            
            # Keep or remove the temp gif? We'll keep it as a bonus, or remove it.
            # os.remove(gif_path) # uncomment to remove
            
    except Exception as e:
        print(f"Error saving animation: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Convert a Sprite Sheet to an animated GIF or MP4.")
    parser.add_argument("input", help="Path to the input sprite sheet image.")
    parser.add_argument("output", help="Path to the output file (.gif or .mp4).")
    parser.add_argument("--grid", required=True, help="Grid format (cols x rows), e.g., 4x1 or 3x2.")
    parser.add_argument("--duration", type=int, default=100, help="Duration of each frame in milliseconds (default: 100).")
    parser.add_argument("--scale", type=float, default=1.0, help="Scale factor for the output frames (default: 1.0).")
    
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: Output file not found '{args.input}'")
        sys.exit(1)

    try:
        dims = args.grid.lower().split('x')
        if len(dims) != 2:
            raise ValueError()
        cols, rows = int(dims[0]), int(dims[1])
        if cols <= 0 or rows <= 0:
            raise ValueError()
    except ValueError:
        print(f"Error: Invalid grid format '{args.grid}'. Use <cols>x<rows>, e.g., 4x1.")
        sys.exit(1)

    create_animation(args.input, args.output, cols, rows, args.duration, args.scale)

if __name__ == "__main__":
    main()
