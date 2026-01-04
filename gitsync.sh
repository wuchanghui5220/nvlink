#!/bin/bash

# ==========================================
# 终极 Git 同步脚本 (SSH 优化版)
# ==========================================

# --- 1. 核心配置 ---
# 注意：根据之前的调试，你的 git 根目录是 ibtc，不是 html
PROJECT_ROOT="/home/admin/ibtc"
BACKUP_DIR="/home/admin/backups/nvlink"  # 备份存放在仓库外面，防止递归备份

# 默认分支 (通常是 main 或 master)
BRANCH="main"

# --- 2. 颜色定义 ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# --- 3. 基础检查函数 ---
init_check() {
    # 检查目录是否存在
    if [ ! -d "$PROJECT_ROOT" ]; then
        echo -e "${RED}❌ 错误：找不到目录 $PROJECT_ROOT${NC}"
        exit 1
    fi
    cd "$PROJECT_ROOT"

    # 检查是否为 Git 仓库
    if [ ! -d ".git" ]; then
        echo -e "${RED}❌ 错误：当前目录不是 Git 仓库！${NC}"
        exit 1
    fi

    # 检查远程 URL 协议 (强制建议 SSH)
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$REMOTE_URL" == https* ]]; then
        echo -e "${RED}⚠️  警告：检测到 HTTPS 协议，可能导致脚本卡在输入密码界面。${NC}"
        echo -e "${YELLOW}建议执行：git remote set-url origin git@github.com:wuchanghui5220/nvlink.git${NC}"
        sleep 2
    fi
}

# --- 4. 功能函数 ---

# 显示帮助
show_help() {
    echo -e "${BLUE}============ Git Sync 工具 ============${NC}"
    echo -e "${CYAN}用法: $0 [命令] [提交信息]${NC}"
    echo ""
    echo -e "${GREEN}常用命令:${NC}"
    echo -e "  sync [msg]       ${YELLOW}⚡ 智能同步 (推荐)${NC} - 拉取并推送"
    echo -e "  push [msg]       ${YELLOW}📤 快速推送${NC} - 仅推送本地修改"
    echo -e "  pull             ${YELLOW}📥 快速拉取${NC} - 仅拉取远程代码"
    echo -e "  status           ${YELLOW}📊 查看状态${NC} - 检查同步情况"
    echo ""
    echo -e "${RED}高级/危险命令:${NC}"
    echo -e "  force-push [msg] ${RED}🚀 强制推送${NC} - 本地覆盖远程 (慎用!)"
    echo -e "  force-pull       ${RED}☠️  强制拉取${NC} - 远程覆盖本地 (丢弃本地修改)"
    echo -e "  backup           ${BLUE}📦 创建备份${NC} - 备份当前文件"
    echo ""
    echo -e "示例: $0 sync \"修复了首页bug\""
}

# 创建备份
create_backup() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local target="$BACKUP_DIR/backup_$timestamp.tar.gz"
    
    echo -e "${BLUE}📦 正在创建备份...${NC}"
    mkdir -p "$BACKUP_DIR"
    
    # 打包除了 .git 以外的所有文件
    tar --exclude='./.git' --exclude='./certs' -czf "$target" .
    
    echo -e "${GREEN}✅ 备份已保存至: $target${NC}"
    
    # 清理旧备份 (保留最近 5 个)
    ls -tp "$BACKUP_DIR"/backup_*.tar.gz | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {} 2>/dev/null
}

# 检查远程状态
check_remote() {
    git fetch origin "$BRANCH" > /dev/null 2>&1
    local LOCAL=$(git rev-parse HEAD)
    local REMOTE=$(git rev-parse origin/"$BRANCH")
    local BASE=$(git merge-base HEAD origin/"$BRANCH")

    if [ "$LOCAL" = "$REMOTE" ]; then
        return 0 # 同步
    elif [ "$LOCAL" = "$BASE" ]; then
        return 1 # 需要拉取 (Remote is ahead)
    elif [ "$REMOTE" = "$BASE" ]; then
        return 2 # 需要推送 (Local is ahead)
    else
        return 3 # 分歧 (Diverged)
    fi
}

# 智能同步 (核心逻辑)
smart_sync() {
    local msg="$1"
    [ -z "$msg" ] && msg="Auto sync $(date '+%Y-%m-%d %H:%M:%S')"

    echo -e "${CYAN}🧠 正在分析同步状态...${NC}"
    check_remote
    local state=$?

    case $state in
        0)
            # 即使通过 check_remote，也可能有未提交的本地文件
            if [ -n "$(git status --porcelain)" ]; then
                echo -e "${YELLOW}📝 发现本地有未提交的更改，正在提交...${NC}"
                git add .
                git commit -m "$msg"
                git push origin "$BRANCH"
                echo -e "${GREEN}✅ 推送完成！${NC}"
            else
                echo -e "${GREEN}✨ 代码已是最新，无需操作。${NC}"
            fi
            ;;
        1)
            echo -e "${YELLOW}📥 远程有更新，正在拉取...${NC}"
            git pull origin "$BRANCH"
            echo -e "${GREEN}✅ 拉取完成！${NC}"
            ;;
        2)
            echo -e "${YELLOW}📤 本地有更新，正在推送...${NC}"
            git add .
            git commit -m "$msg" 2>/dev/null || true
            git push origin "$BRANCH"
            echo -e "${GREEN}✅ 推送完成！${NC}"
            ;;
        3)
            echo -e "${RED}⚠️  检测到版本冲突 (分歧)。${NC}"
            echo -e "${YELLOW}正在尝试自动合并 (git pull --rebase)...${NC}"
            if git pull --rebase origin "$BRANCH"; then
                 echo -e "${GREEN}✅ 合并成功，正在推送...${NC}"
                 git push origin "$BRANCH"
                 echo -e "${GREEN}✅ 同步完成！${NC}"
            else
                 echo -e "${RED}❌ 自动合并失败。请手动解决冲突后再次运行。${NC}"
                 exit 1
            fi
            ;;
    esac
}

# 强制推送
force_push() {
    local msg="$1"
    [ -z "$msg" ] && msg="Force push $(date '+%Y-%m-%d %H:%M:%S')"
    
    echo -e "${RED}🚨 警告：你正在执行强制推送！${NC}"
    echo -e "${RED}这将会用本地代码【完全覆盖】GitHub 上的代码，不可撤销。${NC}"
    read -p "确认继续吗? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        echo "已取消。"
        exit 0
    fi

    create_backup # 强制推送前强制备份
    
    git add .
    git commit -m "$msg" 2>/dev/null || true
    git push --force origin "$BRANCH"
    echo -e "${GREEN}✅ 强制推送完成。GitHub 内容已被覆盖。${NC}"
}

# 强制拉取 (重置本地)
force_pull() {
    echo -e "${RED}🚨 警告：你正在执行强制拉取！${NC}"
    echo -e "${RED}这将会【丢弃】你本地所有未提交的修改，使本地与 GitHub 完全一致。${NC}"
    read -p "确认继续吗? (y/N): " confirm
    if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
        echo "已取消。"
        exit 0
    fi
    
    create_backup # 强制拉取前强制备份
    
    git fetch origin "$BRANCH"
    git reset --hard origin/"$BRANCH"
    echo -e "${GREEN}✅ 本地已重置为远程最新状态。${NC}"
}

# --- 5. 主程序 ---
init_check

case "$1" in
    "sync")
        smart_sync "$2"
        ;;
    "push")
        git add .
        git commit -m "${2:-Quick push}" 2>/dev/null || true
        git push origin "$BRANCH"
        ;;
    "pull")
        git pull origin "$BRANCH"
        ;;
    "status")
        git status
        echo ""
        check_remote
        state=$?
        if [ $state -eq 0 ]; then echo -e "${GREEN}状态: 已同步${NC}"; fi
        if [ $state -eq 1 ]; then echo -e "${YELLOW}状态: 远程领先 (需要 pull)${NC}"; fi
        if [ $state -eq 2 ]; then echo -e "${YELLOW}状态: 本地领先 (需要 push)${NC}"; fi
        if [ $state -eq 3 ]; then echo -e "${RED}状态: 存在冲突${NC}"; fi
        ;;
    "force-push")
        force_push "$2"
        ;;
    "force-pull")
        force_pull
        ;;
    "backup")
        create_backup
        ;;
    "help"|""|"-h")
        show_help
        ;;
    *)
        echo -e "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
