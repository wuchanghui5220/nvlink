#!/bin/bash

# 统一同步脚本 - unified_sync.sh
# 结合快速同步和安全同步的优势

set -e

# 配置信息
WEBSITE_DIR="/home/admin/ibtc/html"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 显示帮助信息
show_help() {
    echo -e "${BLUE}统一同步脚本使用说明${NC}"
    echo -e "${YELLOW}快速操作（适合日常使用）：${NC}"
    echo "  $0 pull                    # 快速拉取"
    echo "  $0 push [提交信息]          # 快速推送"
    echo "  $0 status                  # 查看状态"
    echo "  $0 sync [提交信息]          # 快速双向同步"
    echo ""
    echo -e "${YELLOW}安全操作（重要更改时使用）：${NC}"
    echo "  $0 safe-pull               # 安全拉取（保护本地更改）"
    echo "  $0 safe-push [提交信息]     # 安全推送（检查冲突）"
    echo "  $0 check                   # 检查远程更新"
    echo "  $0 backup                  # 创建备份"
    echo ""
    echo -e "${YELLOW}智能操作（自动选择模式）：${NC}"
    echo "  $0 smart-push [提交信息]    # 智能推送（自动判断是否需要安全模式）"
    echo "  $0 smart-sync [提交信息]    # 智能同步"
    echo ""
    echo -e "${BLUE}推荐使用：${NC}"
    echo -e "${GREEN}  日常小更改: $0 push \"小修复\"${NC}"
    echo -e "${YELLOW}  重要更改:   $0 safe-push \"重要功能\"${NC}"
    echo -e "${BLUE}  不确定时:   $0 smart-push \"更新\"${NC}"
}

# 创建备份
create_backup() {
    local backup_dir="/home/admin/ibtc/backups"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_name="website_backup_${timestamp}"
    
    echo -e "${BLUE}📦 创建备份...${NC}"
    mkdir -p "$backup_dir"
    rsync -av --exclude='.git' "$WEBSITE_DIR/" "$backup_dir/$backup_name/" > /dev/null
    echo -e "${GREEN}✅ 备份已创建: $backup_name${NC}"
    
    # 保留最近5个备份
    cd "$backup_dir"
    ls -t | tail -n +6 | xargs -I {} rm -rf {} 2>/dev/null || true
}

# 检查远程更新
check_remote_updates() {
    cd "$WEBSITE_DIR"
    git fetch origin main > /dev/null 2>&1
    
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        return 0  # 同步
    elif git merge-base --is-ancestor "$LOCAL" "$REMOTE"; then
        return 1  # 远程有更新
    elif git merge-base --is-ancestor "$REMOTE" "$LOCAL"; then
        return 2  # 本地有更新
    else
        return 3  # 分歧
    fi
}

# 快速拉取
quick_pull() {
    cd "$WEBSITE_DIR"
    echo -e "${BLUE}📥 快速拉取...${NC}"
    
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  有未提交更改，自动暂存...${NC}"
        git stash push -m "快速拉取前暂存 $(date '+%Y-%m-%d %H:%M:%S')" > /dev/null
        STASHED=true
    else
        STASHED=false
    fi
    
    git pull origin main
    
    if [ "$STASHED" = true ]; then
        git stash pop > /dev/null
    fi
    
    echo -e "${GREEN}✅ 拉取完成${NC}"
}

# 安全拉取
safe_pull() {
    cd "$WEBSITE_DIR"
    echo -e "${BLUE}🛡️  安全拉取...${NC}"
    
    if ! git diff --quiet || ! git diff --cached --quiet; then
        create_backup
        echo -e "${YELLOW}📦 暂存本地更改...${NC}"
        git stash push -m "安全拉取前暂存 $(date '+%Y-%m-%d %H:%M:%S')"
        STASHED=true
    else
        STASHED=false
    fi
    
    git pull origin main
    
    if [ "$STASHED" = true ]; then
        echo -e "${YELLOW}🔄 恢复本地更改...${NC}"
        if ! git stash pop; then
            echo -e "${RED}⚠️  恢复时发现冲突，请手动处理${NC}"
            return 1
        fi
    fi
    
    echo -e "${GREEN}✅ 安全拉取完成${NC}"
}

# 快速推送
quick_push() {
    local commit_msg="$1"
    cd "$WEBSITE_DIR"
    
    if [ -z "$commit_msg" ]; then
        commit_msg="Auto update $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    echo -e "${BLUE}📤 快速推送...${NC}"
    git add .
    
    if git diff --staged --quiet; then
        echo -e "${GREEN}✅ 没有更改，无需推送${NC}"
        return 0
    fi
    
    git commit -m "$commit_msg"
    git push origin main
    echo -e "${GREEN}✅ 推送完成${NC}"
}

# 安全推送
safe_push() {
    local commit_msg="$1"
    cd "$WEBSITE_DIR"
    
    if [ -z "$commit_msg" ]; then
        commit_msg="Auto update $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    
    echo -e "${BLUE}🛡️  安全推送...${NC}"
    
    # 检查远程更新
    echo -e "${YELLOW}🔍 检查远程更新...${NC}"
    check_remote_updates
    case $? in
        1)
            echo -e "${RED}❌ 发现远程更新，请先拉取${NC}"
            return 1
            ;;
        3)
            echo -e "${RED}❌ 分支有分歧，请先处理冲突${NC}"
            return 1
            ;;
    esac
    
    create_backup
    
    git add .
    if git diff --staged --quiet; then
        echo -e "${GREEN}✅ 没有更改，无需推送${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}📋 将要推送：${NC}"
    git diff --staged --name-status
    
    git commit -m "$commit_msg"
    git push origin main
    echo -e "${GREEN}✅ 安全推送完成${NC}"
}

# 智能推送（自动判断使用快速还是安全模式）
smart_push() {
    local commit_msg="$1"
    cd "$WEBSITE_DIR"
    
    echo -e "${BLUE}🧠 智能推送分析...${NC}"
    
    # 检查远程状态
    check_remote_updates
    local status=$?
    
    # 检查本地更改数量
    git add .
    local changed_files=$(git diff --staged --name-only | wc -l)
    
    # 决策逻辑
    if [ $status -eq 0 ] && [ $changed_files -le 3 ]; then
        echo -e "${GREEN}📤 使用快速模式（无远程更新，更改较少）${NC}"
        quick_push "$commit_msg"
    else
        echo -e "${YELLOW}🛡️  使用安全模式（有远程更新或更改较多）${NC}"
        safe_push "$commit_msg"
    fi
}

# 查看状态
check_status() {
    cd "$WEBSITE_DIR"
    echo -e "${BLUE}📊 当前状态：${NC}"
    
    git fetch origin main > /dev/null 2>&1
    
    # 检查本地更改
    if ! git diff --quiet; then
        echo -e "${YELLOW}⚠️  工作区有未提交更改${NC}"
    fi
    
    if ! git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  有已暂存更改${NC}"
    fi
    
    # 检查与远程的关系
    check_remote_updates
    case $? in
        0)
            echo -e "${GREEN}✅ 本地和远程已同步${NC}"
            ;;
        1)
            echo -e "${YELLOW}📥 远程有新更改需要拉取${NC}"
            ;;
        2)
            echo -e "${YELLOW}📤 本地有更改需要推送${NC}"
            ;;
        3)
            echo -e "${RED}⚠️  本地和远程有分歧${NC}"
            ;;
    esac
}

# 智能同步
smart_sync() {
    local commit_msg="$1"
    echo -e "${BLUE}🧠 智能同步...${NC}"
    
    check_remote_updates
    case $? in
        0)
            echo -e "${GREEN}已同步，仅推送本地更改${NC}"
            smart_push "$commit_msg"
            ;;
        1)
            echo -e "${YELLOW}先拉取远程更改${NC}"
            safe_pull
            smart_push "$commit_msg"
            ;;
        2)
            echo -e "${YELLOW}仅推送本地更改${NC}"
            smart_push "$commit_msg"
            ;;
        3)
            echo -e "${RED}分支有分歧，使用安全模式${NC}"
            safe_pull
            safe_push "$commit_msg"
            ;;
    esac
}

# 主函数
main() {
    if [ ! -d "$WEBSITE_DIR" ]; then
        echo -e "${RED}❌ 网站目录不存在${NC}"
        exit 1
    fi
    
    case "$1" in
        # 快速操作
        "pull") quick_pull ;;
        "push") quick_push "$2" ;;
        "sync") quick_pull && quick_push "$2" ;;
        "status") check_status ;;
        
        # 安全操作
        "safe-pull") safe_pull ;;
        "safe-push") safe_push "$2" ;;
        "check") check_remote_updates && echo "同步" || echo "需要处理" ;;
        "backup") create_backup ;;
        
        # 智能操作
        "smart-push") smart_push "$2" ;;
        "smart-sync") smart_sync "$2" ;;
        
        # 帮助
        "help"|"-h"|"--help"|"") show_help ;;
        
        *) 
            echo -e "${RED}❌ 未知命令: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
