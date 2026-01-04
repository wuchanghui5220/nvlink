#!/bin/bash
# /usr/local/bin/direct-stage3-config.sh
# 直接执行阶段3配置脚本 - 跳过所有中间阶段

LOG_FILE="/var/log/direct-stage3-config.log"
CONFIG_SERVER="http://172.30.1.100:8080"
TARGET_STAGE=3

# 日志记录
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" | sudo tee -a "$LOG_FILE"
}

# 获取本机永久MAC地址
get_permanent_mac() {
    local mac=""

    # 优先获取eth1的永久MAC地址
    mac=$(ip link show eth1 2>/dev/null | grep -o 'permaddr [a-f0-9:]*' | awk '{print $2}')

    # 如果没有永久MAC，从/sys读取
    if [ -z "$mac" ]; then
        mac=$(cat /sys/class/net/eth1/address 2>/dev/null)
    fi

    # 如果eth1在bond中，尝试获取原始MAC
    if [ -z "$mac" ] || [ "$mac" = "ff:ff:ff:ff:ff:ff" ]; then
        if ip link show uplink >/dev/null 2>&1; then
            for iface in eth1 eth2; do
                if ip link show "$iface" 2>/dev/null | grep -q "master uplink"; then
                    mac=$(ip link show "$iface" | grep -o 'permaddr [a-f0-9:]*' | awk '{print $2}')
                    [ -n "$mac" ] && break
                fi
            done
        fi
    fi

    echo "$mac"
}

# 获取当前IP地址
get_current_ip() {
    local ip=""

    # 优先从VLAN10获取IP
    if ip addr show uplink.10 >/dev/null 2>&1; then
        ip=$(ip addr show uplink.10 | awk '/inet / {print $2}' | cut -d'/' -f1 | head -1)
    fi

    # 如果VLAN10没有IP，从主bond接口获取
    if [ -z "$ip" ] && ip addr show uplink >/dev/null 2>&1; then
        ip=$(ip addr show uplink | awk '/inet / {print $2}' | cut -d'/' -f1 | head -1)
    fi

    # 如果都没有，从eth1获取
    if [ -z "$ip" ]; then
        ip=$(ip addr show eth1 2>/dev/null | awk '/inet / {print $2}' | cut -d'/' -f1 | head -1)
    fi

    echo "$ip"
}

# 强制推进到阶段3
force_advance_to_stage3() {
    local mac="$1"

    log_message "=== 强制推进到阶段3 ==="
    log_message "使用MAC地址: $mac"

    # 多次尝试推进
    for attempt in {1..5}; do
        log_message "推进尝试 $attempt/5"

        # 调用推进API（包含强制参数）
        local advance_url="${CONFIG_SERVER}/scripts/advance-stage.php?mac=${mac}&force_stage=3"
        local response=$(curl -s --connect-timeout 10 --max-time 15 "$advance_url" 2>/dev/null)

        log_message "推进API URL: $advance_url"
        log_message "推进响应: $response"

        if echo "$response" | grep -q '"status":"success"'; then
            log_message "强制推进到阶段3成功！"
            return 0
        else
            log_message "推进失败，等待3秒后重试..."
            sleep 3
        fi
    done

    log_message "=== 强制推进失败，继续尝试直接应用配置 ==="
    return 1
}

# 直接获取并应用阶段3配置
apply_stage3_config() {
    local mac="$1"
    local ip="$2"
    local hostname=$(hostname)

    log_message "=== 直接应用阶段3配置 ==="
    log_message "MAC: $mac, IP: $ip, Hostname: $hostname"

    # 获取阶段3配置
    local api_url="${CONFIG_SERVER}/scripts/generate-config.php?mac=${mac}&ip=${ip}&hostname=${hostname}&stage=3"
    log_message "配置API URL: $api_url"

    local response=$(curl -s --connect-timeout 10 --max-time 20 "$api_url" 2>/dev/null)

    if [ $? -ne 0 ]; then
        log_message "错误: 无法连接配置服务器"
        return 1
    fi

    log_message "配置API响应: $response"

    # 解析配置URL
    local config_url=$(echo "$response" | sed -n 's/.*"config_url":"\([^"]*\)".*/\1/p' | sed 's/\\//g')
    if [ -z "$config_url" ]; then
        log_message "错误: 无法获取阶段3配置URL"
        return 1
    fi

    log_message "阶段3配置URL: $config_url"

    # 下载配置文件
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local temp_config="/tmp/stage3-direct-${timestamp}.yaml"

    if ! wget -q --timeout=15 --tries=3 -O "$temp_config" "$config_url"; then
        log_message "错误: 阶段3配置下载失败"
        return 1
    fi

    log_message "阶段3配置下载成功"

    # 显示配置内容
    log_message "阶段3配置文件内容:"
    cat "$temp_config" | while read line; do
        log_message "  $line"
    done

    # 备份当前配置
    local backup_dir="/etc/netplan/backup-direct-stage3-${timestamp}"
    sudo mkdir -p "$backup_dir"
    sudo cp /etc/netplan/*.yaml "$backup_dir/" 2>/dev/null || true
    log_message "当前配置已备份到: $backup_dir"

    # 应用阶段3配置
    log_message "应用阶段3配置..."
    sudo cp "$temp_config" /etc/netplan/01-netcfg.yaml
    sudo chmod 600 /etc/netplan/01-netcfg.yaml

    # 验证配置语法
    if ! sudo netplan try --timeout=0 2>/dev/null; then
        log_message "警告: netplan配置语法检查失败，但继续应用..."
    fi

    # 应用配置
    if sudo netplan apply; then
        log_message "netplan apply执行成功"
    else
        log_message "错误: netplan apply失败"
        return 1
    fi

    log_message "等待网络配置生效..."
    sleep 10

    # 重启网络服务确保配置正确
    log_message "重启网络服务..."
    sudo systemctl restart systemd-networkd
    sleep 5

    # 清理临时文件
    rm -f "$temp_config"

    log_message "=== 阶段3配置应用完成 ==="
    return 0
}

# 验证阶段3配置
verify_stage3_config() {
    log_message "=== 验证阶段3配置 ==="

    # 检查bond接口
    if ip link show uplink >/dev/null 2>&1; then
        log_message "✓ Bond接口uplink存在"
    else
        log_message "✗ Bond接口uplink不存在"
        return 1
    fi

    # 检查VLAN10接口
    if ip link show uplink.10 >/dev/null 2>&1; then
        log_message "✓ VLAN10接口存在"
    else
        log_message "✗ VLAN10接口不存在"
        return 1
    fi

    # 检查VLAN10的IP地址
    local vlan10_ip=$(ip addr show uplink.10 2>/dev/null | awk '/inet / {print $2}' | cut -d'/' -f1)
    if [ -n "$vlan10_ip" ] && [[ "$vlan10_ip" =~ ^10\.1\.10\. ]]; then
        log_message "✓ VLAN10有正确的IP地址: $vlan10_ip"
    else
        log_message "✗ VLAN10没有正确的IP地址"
        return 1
    fi

    # 检查是否还有172.30.x.x的IP地址
    local vlan1_ip=$(ip addr show uplink 2>/dev/null | awk '/inet / {print $2}' | cut -d'/' -f1 | head -1)
    if [ -n "$vlan1_ip" ] && [[ "$vlan1_ip" =~ ^172\.30\. ]]; then
        log_message "⚠ 警告: 仍然存在VLAN1 IP地址: $vlan1_ip"
        log_message "这表明可能还未完全切换到阶段3"
    else
        log_message "✓ 已成功移除VLAN1 IP地址"
    fi

    # 检查bond状态
    if [ -f /proc/net/bonding/uplink ]; then
        log_message "Bond接口状态:"
        local bond_status=$(cat /proc/net/bonding/uplink | grep -E "(Bond|Slave Interface|MII Status)")
        echo "$bond_status" | while read line; do
            log_message "  $line"
        done
    fi

    # 测试网络连通性
    log_message "测试网络连通性..."

    # 测试VLAN10连通性
    if timeout 5 ping -c 2 10.1.10.104 >/dev/null 2>&1; then
        log_message "✓ VLAN10网络连通性正常"
    else
        log_message "⚠ VLAN10网络连通性测试失败"
    fi

    # 测试是否还能访问VLAN1
    if timeout 3 ping -c 1 172.30.1.100 >/dev/null 2>&1; then
        log_message "⚠ 仍可访问VLAN1网络，可能配置未完全生效"
    else
        log_message "✓ 已断开VLAN1网络连接"
    fi

    log_message "=== 配置验证完成 ==="
    return 0
}

# 显示当前网络状态
show_network_status() {
    log_message "=== 当前网络状态 ==="

    log_message "网络接口状态:"
    ip addr show | while read line; do
        log_message "  $line"
    done

    log_message "路由表:"
    ip route show | while read line; do
        log_message "  $line"
    done

    log_message "=== 网络状态显示完成 ==="
}

# 主程序
main() {
    log_message "=================================================="
    log_message "直接执行阶段3配置脚本启动"
    log_message "=================================================="

    # 获取系统信息
    local mac=$(get_permanent_mac)
    local current_ip=$(get_current_ip)

    if [ -z "$mac" ]; then
        log_message "错误: 无法获取MAC地址"
        exit 1
    fi

    if [ -z "$current_ip" ]; then
        log_message "错误: 无法获取当前IP地址"
        exit 1
    fi

    log_message "系统信息: MAC=$mac, 当前IP=$current_ip"

    # 显示应用前的网络状态
    show_network_status

    # 步骤1: 强制推进到阶段3
    log_message "步骤1: 强制推进到阶段3..."
    force_advance_to_stage3 "$mac"

    # 步骤2: 应用阶段3配置
    log_message "步骤2: 应用阶段3配置..."
    if apply_stage3_config "$mac" "$current_ip"; then
        log_message "阶段3配置应用成功"
    else
        log_message "阶段3配置应用失败"
        exit 1
    fi

    # 步骤3: 验证配置
    log_message "步骤3: 验证阶段3配置..."
    verify_stage3_config

    # 显示应用后的网络状态
    show_network_status

    log_message "=================================================="
    log_message "直接执行阶段3配置完成"
    log_message "=================================================="

    echo ""
    echo "=== 执行结果摘要 ==="
    echo "✓ 脚本执行完成"
    echo "✓ 详细日志: $LOG_FILE"
    echo "✓ 检查网络状态: ip addr show"
    echo "✓ 检查bond状态: cat /proc/net/bonding/uplink"
    echo ""
}

# 处理命令行参数
case "${1:-apply}" in
    apply)
        main
        ;;
    status)
        echo "当前系统信息:"
        echo "MAC地址: $(get_permanent_mac)"
        echo "当前IP: $(get_current_ip)"
        echo ""
        echo "网络接口状态:"
        ip addr show | grep -E "(uplink|eth[12])"
        ;;
    verify)
        verify_stage3_config
        ;;
    show-config)
        if [ -f /etc/netplan/01-netcfg.yaml ]; then
            echo "当前netplan配置:"
            cat /etc/netplan/01-netcfg.yaml
        else
            echo "netplan配置文件不存在"
        fi
        ;;
    force-apply)
        log_message "强制重新应用阶段3配置..."
        mac=$(get_permanent_mac)
        current_ip=$(get_current_ip)
        apply_stage3_config "$mac" "$current_ip"
        ;;
    *)
        echo "直接执行阶段3配置脚本"
        echo "用法: $0 [apply|status|verify|show-config|force-apply]"
        echo ""
        echo "  apply        - 直接应用阶段3配置（默认）"
        echo "  status       - 显示当前系统状态"
        echo "  verify       - 验证阶段3配置"
        echo "  show-config  - 显示当前netplan配置"
        echo "  force-apply  - 强制重新应用阶段3配置"
        echo ""
        echo "示例:"
        echo "  sudo $0 apply         # 直接执行阶段3配置"
        echo "  sudo $0 status        # 查看当前状态"
        echo "  sudo $0 verify        # 验证配置结果"
        ;;
esac
