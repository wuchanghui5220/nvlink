#!/bin/bash

# 简化版网站自动部署脚本
# 适用于小型静态网站（<100MB）

set -e

# 配置
WEBSITE_DIR="/home/admin/ibtc/html"
REPO_URL="https://github.com/wuchanghui5220/nvlink.git"  # 替换为你的仓库地址

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 开始部署网站...${NC}"

# 检查提交信息
if [ -z "$1" ]; then
    COMMIT_MSG="Auto update $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# 进入网站目录
cd "$WEBSITE_DIR"

# 首次初始化（如果需要）
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 初始化Git仓库...${NC}"
    git init
    git remote add origin "$REPO_URL"
    git branch -M main
    
    # 创建.gitignore文件
    cat > .gitignore << EOF
# 系统文件
.DS_Store
Thumbs.db
*.tmp
*.temp
.htaccess

# 日志文件
*.log
logs/

# 临时文件
tmp/
temp/
EOF
    
    echo -e "${GREEN}✅ Git仓库初始化完成${NC}"
fi

# 显示文件变化
echo -e "${YELLOW}📊 检查文件变化...${NC}"
git add .

# 显示状态
if git diff --staged --quiet; then
    echo -e "${GREEN}✅ 没有文件变化，无需部署${NC}"
    exit 0
fi

# 显示将要提交的文件
echo -e "${YELLOW}📋 将要提交的文件：${NC}"
git diff --staged --name-only

# 显示仓库大小
REPO_SIZE=$(du -sh .git 2>/dev/null | cut -f1 || echo "未知")
WEBSITE_SIZE=$(du -sh . --exclude=.git | cut -f1)
echo -e "${YELLOW}📦 网站大小: $WEBSITE_SIZE | 仓库大小: $REPO_SIZE${NC}"

# 提交变化
echo -e "${YELLOW}💾 提交变化...${NC}"
git commit -m "$COMMIT_MSG"

# 推送到GitHub
echo -e "${YELLOW}🌐 推送到GitHub...${NC}"
git push origin main

echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}🎉 网站已自动备份到GitHub${NC}"

# 如果使用GitHub Pages，显示网站地址
if [ -n "$GITHUB_PAGES_URL" ]; then
    echo -e "${GREEN}🌍 网站地址: $GITHUB_PAGES_URL${NC}"
fi

# 显示最新提交
echo -e "${YELLOW}📝 最新提交：${NC}"
git log --oneline -1
