import sys
import os
import math

try:
    from PIL import Image
except ImportError:
    print("Error: Module 'Pillow' is not installed. Vui lòng chạy: pip install Pillow")
    sys.exit(1)

def is_green_screen(r, g, b, tolerance=100):
    """
    Thuật toán nhận biết màu nền xanh (green screen / chroma key).
    Bản gốc màu lý tưởng: #00FF00 (0, 255, 0).
    """
    dist = math.sqrt((r - 0)**2 + (g - 255)**2 + (b - 0)**2)
    if dist < tolerance:
        return True
    if g > r + 40 and g > b + 40 and g > 130:
        return True
    return False

def align_grid(img, cols, rows):
    width, height = img.size
    orig_cell_w = width // cols
    orig_cell_h = height // rows
    
    frames = []
    for r in range(rows):
        for c in range(cols):
            box = (c * orig_cell_w, r * orig_cell_h, c * orig_cell_w + orig_cell_w, r * orig_cell_h + orig_cell_h)
            frames.append(img.crop(box))
            
    contents = []
    valid_w = []
    valid_h = []
    
    for frame in frames:
        bbox = frame.getbbox()
        if bbox:
            content = frame.crop(bbox)
            w = bbox[2] - bbox[0]
            h = bbox[3] - bbox[1]
            valid_w.append(w)
            valid_h.append(h)
            contents.append((content, w, h))
        else:
            contents.append(None)
            
    if not valid_w:
        return img
        
    valid_w.sort()
    valid_h.sort()
    # Dùng median thay vì max để loại trừ khung bị lỗi do AI vẽ quá dài (outliers)
    median_w = valid_w[len(valid_w) // 2]
    median_h = valid_h[len(valid_h) // 2]
            
    padding = 20
    cell_w = median_w + padding * 2
    cell_h = median_h + padding * 2
    
    aligned_frames = []
    for item in contents:
        new_frame = Image.new("RGBA", (cell_w, cell_h), (0,0,0,0))
        if item:
            content, content_w, content_h = item
            shift_x = (cell_w - content_w) // 2
            shift_y = (cell_h - padding) - content_h
            if shift_y < 0: shift_y = 0
            new_frame.paste(content, (shift_x, shift_y))
        aligned_frames.append(new_frame)
        
    out_img = Image.new("RGBA", (cell_w * cols, cell_h * rows), (0,0,0,0))
    for i, frame in enumerate(aligned_frames):
        row = i // cols
        col = i % cols
        out_img.paste(frame, (col * cell_w, row * cell_h))
        
    return out_img

def remove_green_screen(input_path, output_path, align_cols=0, align_rows=0):
    print(f"[*] Bắt đầu đọc tệp ảnh: {input_path}")
    try:
        img = Image.open(input_path).convert("RGBA")
    except Exception as e:
        print(f"[!] Không thể mở file ảnh gốc: {e}")
        sys.exit(1)
        
    data = img.getdata()
    new_data = []
    
    # Lặp qua các mảng Pixels và lọc màu Chroma-key
    for r, g, b, a in data:
        if a > 0 and is_green_screen(r, g, b, tolerance=110):
            # Các viền pixel ám xanh sẽ được hạ alpha xuống trong suốt tuyệt đối (0)
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    
    # Căn chỉnh lưới (Auto-Align) hoặc cắt gọn (Auto-Crop)
    if align_cols > 0 and align_rows > 0:
        print(f"[*] Đang căn chỉnh tự động các frame theo lưới {align_cols}x{align_rows} (đáy chạm đất, giữa tâm)...")
        img = align_grid(img, align_cols, align_rows)
    else:
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
    # Tạo cấu trúc thư mục nếu chưa tồn tại
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"[*] Thành công! Đã xoá nền và lưu Sprite thành phẩm tại: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Cú pháp: python process_sprites.py <file_raw.png> <file_output.png> [--align CxR]")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    align_c = 0
    align_r = 0
    
    if len(sys.argv) >= 5 and sys.argv[3] == "--align":
        try:
            dims = sys.argv[4].lower().split('x')
            align_c = int(dims[0])
            align_r = int(dims[1])
        except:
            print("[!] Lỗi tham số --align. Ví dụ đúng: --align 3x2")
    
    if not os.path.exists(input_file):
        print(f"[!] Lỗi: Không tìm thấy đường dẫn file ảnh gốc! ({input_file})")
        sys.exit(1)
        
    remove_green_screen(input_file, output_file, align_c, align_r)
