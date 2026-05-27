#!/bin/bash
# Setup script to link global skills for Gemini Antigravity

TARGET_DIR="/Users/kelsopalheta/.gemini/config/plugins/custom-skills/skills"
mkdir -p "$TARGET_DIR"

echo "🔗 Symlinking custom skills from Developer/SKILLS..."
for d in /Users/kelsopalheta/Developer/SKILLS/*; do
  if [ -d "$d" ]; then
    name=$(basename "$d")
    if [ "$name" != "caveman-main" ] && [ "$name" != ".claude" ]; then
      ln -sfh "$d" "$TARGET_DIR/$name"
      echo "  - Linked: $name"
    fi
  fi
done

echo "🔗 Symlinking caveman skills from .agents/skills..."
for d in /Users/kelsopalheta/.agents/skills/*; do
  if [ -d "$d" ]; then
    name=$(basename "$d")
    ln -sfh "$d" "$TARGET_DIR/$name"
    echo "  - Linked: $name"
  fi
done

echo "✅ All skills symlinked successfully to $TARGET_DIR"
ls -la "$TARGET_DIR"
