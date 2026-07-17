#!/bin/bash
# Snapshot skills and workflows
TARGET_DIR="$HOME/.gemini/antigravity"
BACKUP_DIR="$TARGET_DIR/brain/versions"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📸 Tạo bản snapshot hệ thống AWK..."

# Tạo zip file chứa global_workflows và skills
if [ -d "$TARGET_DIR/global_workflows" ] && [ -d "$TARGET_DIR/skills" ]; then
    zip -q -r "$BACKUP_DIR/awk_snapshot_$TIMESTAMP.zip" "$TARGET_DIR/global_workflows" "$TARGET_DIR/skills" -x "*.DS_Store"
    
    # Giữ lại tối đa 10 bản snapshot gần nhất để tránh tốn dung lượng
    ls -tp "$BACKUP_DIR"/awk_snapshot_*.zip | grep -v '/$' | tail -n +11 | xargs -I {} rm -- {} 2>/dev/null

    echo "✅ Đã lưu snapshot: awk_snapshot_$TIMESTAMP.zip (Chỉ giữ lại 10 bản gần nhất)"
else
    echo "⚠️ Không tìm thấy thư mục global_workflows hoặc skills để snapshot."
fi
