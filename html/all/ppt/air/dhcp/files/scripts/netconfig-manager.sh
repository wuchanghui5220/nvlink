#!/bin/bash
# /usr/local/bin/netconfig-manager.sh
# 可扩展的网络配置管理器 - 最新版本

CLIENTS_FILE="/var/lib/netconfig/clients.conf"
STATES_DIR="/var/lib/netconfig/states"
DHCP_CLIENTS_FILE="/etc/dhcp/dhcpd-clients.conf"
TEMPLATES_DIR="/var/www/netconfig/templates"
LOG_FILE="/var/lib/netconfig/logs/manager.log"

# 确保目录存在
mkdir -p "$STATES_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# 日志函数
log_message() {
    echo "$(date): $1" | tee -a "$LOG_FILE"
}

# 从配置文件加载客户端数据
load_clients() {
    declare -gA CLIENTS
    if [ -f "$CLIENTS_FILE" ]; then
        while IFS='=' read -r mac info; do
            # 跳过注释和空行
            [[ $mac =~ ^#.*$ ]] && continue
            [[ -z $mac ]] && continue
            [[ $mac =~ ^[[:space:]]*$ ]] && continue

            # 清理前后空格
            mac=$(echo "$mac" | xargs)
            info=$(echo "$info" | xargs)

            CLIENTS["$mac"]="$info"
        done < "$CLIENTS_FILE"
    else
        log_message "警告: 客户端配置文件不存在: $CLIENTS_FILE"
        return 1
    fi
}

# 获取客户端信息
get_client_info() {
    local mac="$1"
    local field="$2"  # hostname, vlan1_ip, vlan10_ip

    load_clients
    local info="${CLIENTS[$mac]}"
    if [ -z "$info" ]; then
        log_message "错误: 未找到MAC地址 $mac"
        return 1
    fi

    IFS=':' read -r hostname vlan1_ip vlan10_ip <<< "$info"

    case "$field" in
        hostname) echo "$hostname" ;;
        vlan1_ip) echo "$vlan1_ip" ;;
        vlan10_ip) echo "$vlan10_ip" ;;
        all) echo "$hostname:$vlan1_ip:$vlan10_ip" ;;
        *) echo "$info" ;;
    esac
}

# 获取客户端当前阶段
get_stage() {
    local mac="$1"
    local state_file="$STATES_DIR/${mac//:}.stage"
    if [ -f "$state_file" ]; then
        cat "$state_file"
    else
        echo "1"
    fi
}

# 设置客户端阶段
set_stage() {
    local mac="$1"
    local stage="$2"
    local state_file="$STATES_DIR/${mac//:}.stage"

    if [ -z "$mac" ] || [ -z "$stage" ]; then
        log_message "错误: MAC地址和阶段不能为空"
        return 1
    fi

    echo "$stage" > "$state_file"
    log_message "设置 $mac 为阶段 $stage"
}

# 推进阶段
advance_stage() {
    local mac="$1"

    if [ -z "$mac" ]; then
        log_message "错误: 必须提供MAC地址"
        return 1
    fi

    # 检查MAC是否存在于客户端列表中
    load_clients
    if [ -z "${CLIENTS[$mac]}" ]; then
        log_message "错误: MAC地址 $mac 不在客户端列表中"
        return 1
    fi

    local current=$(get_stage "$mac")
    local next=$((current + 1))

    if [ $next -le 3 ]; then
        set_stage "$mac" "$next"
        generate_dhcp_config
        log_message "已将 $mac 从阶段 $current 推进到阶段 $next"
        return 0
    else
        log_message "$mac 已达到最终阶段 $current"
        return 1
    fi
}

# 生成DHCP配置
generate_dhcp_config() {
    load_clients

    if [ ${#CLIENTS[@]} -eq 0 ]; then
        log_message "警告: 没有找到任何客户端配置"
        return 1
    fi

    log_message "开始生成DHCP配置..."

    cat > "$DHCP_CLIENTS_FILE" << 'EOF'
# 自动生成的DHCP客户端配置
# 由netconfig-manager.sh脚本生成
# 生成时间: $(date)

EOF

    local count=0
    for mac in "${!CLIENTS[@]}"; do
        local info="${CLIENTS[$mac]}"
        IFS=':' read -r hostname vlan1_ip vlan10_ip <<< "$info"
        local stage=$(get_stage "$mac")

        cat >> "$DHCP_CLIENTS_FILE" << EOF

# $hostname - 当前阶段: $stage
host ${hostname}-stage${stage} {
    hardware ethernet $mac;
    fixed-address $vlan1_ip;
    option host-name "$hostname";
    option-252 "http://172.30.1.100:8080/scripts/generate-config.php?stage=$stage";
}
EOF
        ((count++))
        log_message "添加客户端配置: $hostname ($mac) - 阶段 $stage"
    done

    log_message "DHCP配置已生成，包含 $count 个客户端"

    # 测试DHCP配置语法
    if dhcpd -t -cf "$DHCP_CLIENTS_FILE" 2>/dev/null; then
        log_message "DHCP配置语法检查通过"
        systemctl reload isc-dhcp-server
        log_message "DHCP服务已重新加载"
    else
        log_message "错误: DHCP配置语法检查失败"
        return 1
    fi
}

# 添加客户端
add_client() {
    local mac="$1"
    local hostname="$2"
    local vlan1_ip="$3"
    local vlan10_ip="$4"

    if [ -z "$mac" ] || [ -z "$hostname" ] || [ -z "$vlan1_ip" ] || [ -z "$vlan10_ip" ]; then
        echo "用法: add-client <MAC> <hostname> <vlan1_ip> <vlan10_ip>"
        echo "示例: add-client 48:b0:2d:69:02:d8 server02 172.30.1.202 10.1.10.202"
        return 1
    fi

    # 验证MAC地址格式
    if [[ ! $mac =~ ^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$ ]]; then
        log_message "错误: MAC地址格式不正确: $mac"
        return 1
    fi

    # 检查是否已存在
    if grep -q "^$mac=" "$CLIENTS_FILE" 2>/dev/null; then
        log_message "警告: MAC地址 $mac 已存在，将覆盖"
        # 删除现有条目
        sed -i "/^$mac=/d" "$CLIENTS_FILE"
    fi

    # 确保客户端配置文件存在
    touch "$CLIENTS_FILE"

    echo "$mac=$hostname:$vlan1_ip:$vlan10_ip" >> "$CLIENTS_FILE"
    set_stage "$mac" "1"
    log_message "已添加客户端: $hostname ($mac)"
}

# 批量操作
batch_operation() {
    local operation="$1"
    local stage="$2"

    load_clients
    if [ ${#CLIENTS[@]} -eq 0 ]; then
        log_message "没有找到任何客户端"
        return 1
    fi

    local count=0
    local success=0

    for mac in "${!CLIENTS[@]}"; do
        local hostname=$(get_client_info "$mac" "hostname")
        case "$operation" in
            advance)
                if advance_stage "$mac"; then
                    log_message "✓ $hostname ($mac) 推进成功"
                    ((success++))
                else
                    log_message "✗ $hostname ($mac) 推进失败"
                fi
                ;;
            set-stage)
                set_stage "$mac" "$stage"
                log_message "✓ $hostname ($mac) 设置为阶段 $stage"
                ((success++))
                ;;
        esac
        ((count++))
    done

    if [ $success -gt 0 ]; then
        generate_dhcp_config
        log_message "批量操作完成，成功处理 $success/$count 个客户端"
    else
        log_message "批量操作失败，没有成功处理任何客户端"
    fi
}

# 显示状态
show_status() {
    load_clients

    if [ ${#CLIENTS[@]} -eq 0 ]; then
        echo "没有找到任何客户端配置"
        echo "请先添加客户端或检查配置文件: $CLIENTS_FILE"
        return 1
    fi

    printf "%-18s %-12s %-8s %-15s %-15s\n" "MAC地址" "主机名" "阶段" "VLAN1 IP" "VLAN10 IP"
    printf "%-18s %-12s %-8s %-15s %-15s\n" "----------------" "----------" "----" "-------------" "-------------"

    for mac in "${!CLIENTS[@]}"; do
        local info="${CLIENTS[$mac]}"
        IFS=':' read -r hostname vlan1_ip vlan10_ip <<< "$info"
        local stage=$(get_stage "$mac")

        printf "%-18s %-12s %-8s %-15s %-15s\n" "$mac" "$hostname" "$stage" "$vlan1_ip" "$vlan10_ip"
    done

    echo ""
    echo "总计: ${#CLIENTS[@]} 个客户端"
}

# 删除客户端
remove_client() {
    local mac="$1"

    if [ -z "$mac" ]; then
        echo "用法: $0 remove-client <MAC>"
        return 1
    fi

    # 从配置文件中删除
    if grep -q "^$mac=" "$CLIENTS_FILE" 2>/dev/null; then
        sed -i "/^$mac=/d" "$CLIENTS_FILE"
        log_message "已从配置文件中删除客户端: $mac"
    fi

    # 删除状态文件
    local state_file="$STATES_DIR/${mac//:}.stage"
    if [ -f "$state_file" ]; then
        rm -f "$state_file"
        log_message "已删除状态文件: $state_file"
    fi

    # 重新生成DHCP配置
    generate_dhcp_config

    log_message "客户端 $mac 已完全删除"
}

# 初始化系统
init_system() {
    log_message "正在初始化网络配置管理系统..."

    # 创建必要的目录
    mkdir -p "$STATES_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$CLIENTS_FILE")"

    # 创建示例客户端配置文件
    if [ ! -f "$CLIENTS_FILE" ]; then
        cat > "$CLIENTS_FILE" << 'EOF'
# 客户端配置文件
# 格式: MAC=hostname:vlan1_ip:vlan10_ip
# 示例:
# 48:b0:2d:b3:52:ee=server01:172.30.1.201:10.1.10.201
# 48:b0:2d:69:02:d8=server02:172.30.1.202:10.1.10.202

EOF
        log_message "已创建示例客户端配置文件: $CLIENTS_FILE"
    fi

    log_message "系统初始化完成"
}

# 显示帮助
show_help() {
    echo "网络配置管理器 - 使用说明"
    echo ""
    echo "用法: $0 <命令> [参数]"
    echo ""
    echo "客户端管理:"
    echo "  add-client <MAC> <hostname> <vlan1_ip> <vlan10_ip>  - 添加新客户端"
    echo "  remove-client <MAC>                                 - 删除客户端"
    echo "  status                                              - 显示所有客户端状态"
    echo ""
    echo "阶段管理:"
    echo "  get-stage <MAC>                                     - 获取客户端当前阶段"
    echo "  set-stage <MAC> <stage>                             - 设置客户端阶段"
    echo "  advance <MAC>                                       - 推进客户端到下一阶段"
    echo ""
    echo "批量操作:"
    echo "  batch-advance                                       - 推进所有客户端到下一阶段"
    echo "  batch-set-stage <stage>                             - 设置所有客户端到指定阶段"
    echo ""
    echo "系统管理:"
    echo "  generate                                            - 重新生成DHCP配置"
    echo "  init                                                - 初始化系统"
    echo "  help                                                - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 add-client 48:b0:2d:69:02:d8 server02 172.30.1.202 10.1.10.202"
    echo "  $0 advance 48:b0:2d:b3:52:ee"
    echo "  $0 status"
    echo "  $0 batch-advance"
    echo ""
    echo "配置文件:"
    echo "  客户端配置: $CLIENTS_FILE"
    echo "  状态目录:   $STATES_DIR"
    echo "  DHCP配置:   $DHCP_CLIENTS_FILE"
    echo "  日志文件:   $LOG_FILE"
}

# 主程序
case "$1" in
    get-stage)
        mac="$2"
        if [ -z "$mac" ]; then
            echo "用法: $0 get-stage <MAC>"
            exit 1
        fi
        get_stage "$mac"
        ;;
    set-stage)
        mac="$2"
        stage="$3"
        if [ -z "$mac" ] || [ -z "$stage" ]; then
            echo "用法: $0 set-stage <MAC> <stage>"
            exit 1
        fi
        set_stage "$mac" "$stage"
        generate_dhcp_config
        ;;
    advance)
        mac="$2"
        if [ -z "$mac" ]; then
            echo "用法: $0 advance <MAC>"
            exit 1
        fi
        advance_stage "$mac"
        ;;
    add-client)
        add_client "$2" "$3" "$4" "$5"
        if [ $? -eq 0 ]; then
            generate_dhcp_config
        fi
        ;;
    remove-client)
        remove_client "$2"
        ;;
    batch-advance)
        batch_operation "advance"
        ;;
    batch-set-stage)
        stage="$2"
        if [ -z "$stage" ]; then
            echo "用法: $0 batch-set-stage <stage>"
            exit 1
        fi
        batch_operation "set-stage" "$stage"
        ;;
    generate)
        generate_dhcp_config
        ;;
    status)
        show_status
        ;;
    init)
        init_system
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "错误: 未知命令 '$1'"
        echo ""
        show_help
        exit 1
        ;;
esac
