#!/bin/bash

# ==========================================
# 自动化 Git 部署脚本 (SSH 版)
# ==========================================

# --- 配置区域 ---
# 你的 Git 仓库根目录 (根据刚才的调试，是这个目录，而不是 html)
PROJECT_ROOT="/home/admin/ibtc"

# 默认提交信息
DEFAULT_MSG="Auto update: $(date '+%Y-%m-%d %H:%M:%S')"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 错误处理：遇到错误立即停止
set -e

echo -e "${YELLOW}🚀 启动部署脚本...${NC}"

# 1. 进入项目目录
if [ -d "$PROJECT_ROOT" ]; then
    cd "$PROJECT_ROOT"
    echo -e "📂 已进入目录: ${GREEN}$(pwd)${NC}"
else
    echo -e "${RED}❌ 错误: 找不到目录 $PROJECT_ROOT ${NC}"
    exit 1
fi

# 2. 检查是否为 Git 仓库
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误: 当前目录不是 Git 仓库！${NC}"
    echo -e "   请确认 PROJECT_ROOT 配置是否正确，或者手动执行 git init"
    exit 1
fi

# 3. 检查远程 URL 协议 (防止 HTTPS 导致的密码问题)
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$REMOTE_URL" == https* ]]; then
    echo -e "${RED}⚠️  警告: 检测到使用 HTTPS 协议 ($REMOTE_URL)${NC}"
    echo -e "${YELLOW}   建议修改为 SSH 协议以免密推送。${NC}"
    echo -e "   执行: git remote set-url origin git@github.com:wuchanghui5220/nvlink.git"
    # 这里不强制退出，但可能会提示输入密码
elif [[ -z "$REMOTE_URL" ]]; then
    echo -e "${RED}❌ 错误: 没有配置远程仓库 (remote origin)${NC}"
    exit 1
else
    echo -e "🔗 远程仓库: ${GREEN}$REMOTE_URL (SSH)${NC}"
fi

# 4. 处理参数 (检查是否有强制推送标记)
FORCE_PUSH=false
COMMIT_MSG="$DEFAULT_MSG"

for arg in "$@"; do
    case $arg in
        -f|--force)
            FORCE_PUSH=true
            shift # 移除参数
            ;;
        *)
            COMMIT_MSG="$1"
            ;;
    esac
done

# 5. 拉取远程更新 (Sync)
# 只有在非强制推送模式下才拉取，避免冲突
if [ "$FORCE_PUSH" = false ]; then
    echo -e "${YELLOW}⬇️  正在尝试拉取远程代码 (git pull)...${NC}"
    if git pull origin main; then
        echo -e "${GREEN}✅ 同步成功${NC}"
    else
        echo -e "${RED}❌ 拉取失败，可能存在冲突。${NC}"
        echo -e "   尝试解决冲突或使用 ./deploy.sh --force 强制覆盖远程(慎用)"
        exit 1
    fi
fi

# 6. 添加文件并检查状态
echo -e "${YELLOW}🔍 检查文件变化...${NC}"
git add .

# 检查是否有暂存的更改
if git diff --cached --quiet; then
    echo -e "${GREEN}✅ 本地没有文件变化，无需提交。${NC}"
    # 如果只是为了推送之前没推上去的 commit，可以继续，否则退出
    # 这里选择退出
    # exit 0 
else
    # 7. 提交更改
    echo -e "${YELLOW}💾 提交更改: $COMMIT_MSG${NC}"
    git commit -m "$COMMIT_MSG"
fi

# 8. 推送代码
echo -e "${YELLOW}⬆️  开始推送...${NC}"

if [ "$FORCE_PUSH" = true ]; then
    echo -e "${RED}⚠️  正在执行强制推送 (覆盖远程仓库)...${NC}"
    git push --force origin main
else
    git push origin main
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo -e "🌍 GitHub Actions 应该已触发自动构建。"
else
    echo -e "${RED}❌ 推送失败${NC}"
    exit 1
fi
