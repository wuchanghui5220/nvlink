# Ubuntu DHCP服务器搭建与管理完整指南

## 环境概述

- **服务器**: Ubuntu Server (server04)
- **网络配置**: 使用eth1接口，连接交换机untagged VLAN 1
- **网段**: 10.1.10.0/24
- **服务器IP**: 10.1.10.104/24
- **网关**: 10.1.10.1

## 第一步：网络接口配置

### 1.1 配置netplan

编辑网络配置文件：
```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

配置内容：
```yaml
network:
  version: 2
  ethernets:
    eth1:
      dhcp4: false
      addresses:
        - 10.1.10.104/24
      routes:
        - to: default
          via: 10.1.10.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
    eth2:
      dhcp4: false
```

### 1.2 应用网络配置

```bash
# 应用配置
sudo netplan apply

# 验证配置
ip addr show eth1
ping -c 3 10.1.10.1
```

## 第二步：安装和配置DHCP服务

### 2.1 安装DHCP服务

```bash
sudo apt update
sudo apt install isc-dhcp-server
```

### 2.2 配置DHCP主配置文件

备份原始配置：
```bash
sudo cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.bak
```

编辑主配置文件：
```bash
sudo nano /etc/dhcp/dhcpd.conf
```

配置内容：
```bash
# /etc/dhcp/dhcpd.conf
# DHCP服务器主配置文件

# 全局配置
default-lease-time 600;
max-lease-time 7200;
authoritative;

# DNS服务器配置
option domain-name-servers 8.8.8.8, 1.1.1.1;
option domain-name "local";

# VLAN 1 网段配置 (默认VLAN)
subnet 10.1.10.0 netmask 255.255.255.0 {
    range 10.1.10.50 10.1.10.199;          # DHCP地址池范围 (为固定IP留出200-254)
    option routers 10.1.10.1;              # 默认网关
    option subnet-mask 255.255.255.0;      # 子网掩码
    option broadcast-address 10.1.10.255;  # 广播地址
}

# 引入客户端配置文件
include "/etc/dhcp/dhcpd-clients.conf";

# 记录日志
log-facility local7;
```

### 2.3 配置DHCP服务接口

编辑接口配置：
```bash
sudo nano /etc/default/isc-dhcp-server
```

配置内容：
```bash
# /etc/default/isc-dhcp-server
# DHCP服务器接口配置

# 指定DHCP服务监听的接口
INTERFACESv4="eth1"
INTERFACESv6=""
```

### 2.4 创建客户端配置文件

创建独立的客户端配置文件：
```bash
sudo nano /etc/dhcp/dhcpd-clients.conf
```

初始配置内容：
```bash
# /etc/dhcp/dhcpd-clients.conf
# DHCP客户端MAC地址配置文件
# 用于管理固定IP分配

# 客户端: 48:b0:2d:b3:52:ee
host client-48b02db352ee {
    hardware ethernet 48:b0:2d:b3:52:ee;
    fixed-address 10.1.10.200;
    option host-name "client-001";
}

# 添加更多客户端示例：
# host client-laptop {
#     hardware ethernet 00:11:22:33:44:55;
#     fixed-address 10.1.10.101;
#     option host-name "laptop-001";
# }
```

## 第三步：启动和验证DHCP服务

### 3.1 测试配置文件

```bash
sudo dhcpd -t -cf /etc/dhcp/dhcpd.conf
```

### 3.2 启动服务

```bash
sudo systemctl enable isc-dhcp-server
sudo systemctl start isc-dhcp-server
sudo systemctl status isc-dhcp-server
```

### 3.3 监控服务日志

```bash
# 实时查看日志
sudo journalctl -u isc-dhcp-server -f

# 查看租约信息
sudo cat /var/lib/dhcp/dhcpd.leases
```

## 第四步：创建客户端管理脚本

### 4.1 创建管理脚本

```bash
sudo nano /usr/local/bin/dhcp-client-manager.sh
```

脚本内容：
```bash
#!/bin/bash
# /usr/local/bin/dhcp-client-manager.sh
# DHCP客户端管理脚本

CLIENTS_FILE="/etc/dhcp/dhcpd-clients.conf"
DHCP_SERVICE="isc-dhcp-server"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo "DHCP客户端管理脚本"
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  add <mac> <ip> <hostname>   添加新客户端"
    echo "  remove <mac>                删除客户端"
    echo "  list                        列出所有客户端"
    echo "  reload                      重新加载DHCP配置"
    echo "  help                        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 add 00:11:22:33:44:55 10.1.10.101 laptop-001"
    echo "  $0 remove 00:11:22:33:44:55"
    echo "  $0 list"
}

# 添加客户端
add_client() {
    local mac=$1
    local ip=$2
    local hostname=$3
    
    if [[ -z "$mac" || -z "$ip" || -z "$hostname" ]]; then
        echo -e "${RED}错误: 请提供MAC地址、IP地址和主机名${NC}"
        exit 1
    fi
    
    # 验证MAC地址格式
    if [[ ! $mac =~ ^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$ ]]; then
        echo -e "${RED}错误: MAC地址格式不正确${NC}"
        exit 1
    fi
    
    # 验证IP地址格式
    if [[ ! $ip =~ ^10\.1\.10\.[0-9]{1,3}$ ]]; then
        echo -e "${RED}错误: IP地址必须在10.1.10.x网段${NC}"
        exit 1
    fi
    
    # 检查MAC是否已存在
    if grep -q "$mac" "$CLIENTS_FILE"; then
        echo -e "${YELLOW}警告: MAC地址 $mac 已存在${NC}"
        return 1
    fi
    
    # 生成主机标识符
    local host_id="client-$(echo $mac | sed 's/://g')"
    
    # 添加到配置文件
    echo "" >> "$CLIENTS_FILE"
    echo "# 客户端: $mac" >> "$CLIENTS_FILE"
    echo "host $host_id {" >> "$CLIENTS_FILE"
    echo "    hardware ethernet $mac;" >> "$CLIENTS_FILE"
    echo "    fixed-address $ip;" >> "$CLIENTS_FILE"
    echo "    option host-name \"$hostname\";" >> "$CLIENTS_FILE"
    echo "}" >> "$CLIENTS_FILE"
    
    echo -e "${GREEN}成功添加客户端: $mac -> $ip ($hostname)${NC}"
}

# 删除客户端
remove_client() {
    local mac=$1
    
    if [[ -z "$mac" ]]; then
        echo -e "${RED}错误: 请提供MAC地址${NC}"
        exit 1
    fi
    
    # 创建临时文件
    local temp_file=$(mktemp)
    
    # 删除相关配置块
    awk -v mac="$mac" '
    /^# 客户端: / && $0 ~ mac {skip=1; next}
    /^host / && skip {skip=2; next}
    /^}/ && skip==2 {skip=0; next}
    !skip {print}
    ' "$CLIENTS_FILE" > "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$CLIENTS_FILE"
    
    echo -e "${GREEN}成功删除客户端: $mac${NC}"
}

# 列出所有客户端
list_clients() {
    echo -e "${GREEN}当前DHCP客户端列表:${NC}"
    echo "----------------------------------------"
    grep -A 4 "^# 客户端:" "$CLIENTS_FILE" | while read line; do
        if [[ $line =~ ^#\ 客户端:\ (.+) ]]; then
            mac="${BASH_REMATCH[1]}"
            echo -n "MAC: $mac"
        elif [[ $line =~ fixed-address\ ([^;]+) ]]; then
            ip="${BASH_REMATCH[1]}"
            echo -n " -> IP: $ip"
        elif [[ $line =~ option\ host-name\ \"([^\"]+)\" ]]; then
            hostname="${BASH_REMATCH[1]}"
            echo " -> 主机名: $hostname"
        fi
    done
    echo "----------------------------------------"
}

# 重新加载DHCP配置
reload_dhcp() {
    echo "正在重新加载DHCP配置..."
    if systemctl reload $DHCP_SERVICE; then
        echo -e "${GREEN}DHCP配置重新加载成功${NC}"
    else
        echo -e "${RED}DHCP配置重新加载失败${NC}"
        exit 1
    fi
}

# 主程序
case "$1" in
    add)
        add_client "$2" "$3" "$4"
        reload_dhcp
        ;;
    remove)
        remove_client "$2"
        reload_dhcp
        ;;
    list)
        list_clients
        ;;
    reload)
        reload_dhcp
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}错误: 未知选项${NC}"
        show_help
        exit 1
        ;;
esac
```

### 4.2 设置脚本权限

```bash
sudo chmod +x /usr/local/bin/dhcp-client-manager.sh
```

## 第五步：日常管理操作

### 5.1 客户端管理

```bash
# 列出所有客户端
sudo /usr/local/bin/dhcp-client-manager.sh list

# 添加新客户端
sudo /usr/local/bin/dhcp-client-manager.sh add 00:11:22:33:44:55 10.1.10.101 laptop-001

# 删除客户端
sudo /usr/local/bin/dhcp-client-manager.sh remove 00:11:22:33:44:55

# 重新加载配置
sudo /usr/local/bin/dhcp-client-manager.sh reload
```

### 5.2 服务状态监控

```bash
# 查看服务状态
sudo systemctl status isc-dhcp-server

# 重启服务
sudo systemctl restart isc-dhcp-server

# 查看实时日志
sudo journalctl -u isc-dhcp-server -f

# 查看租约信息
sudo cat /var/lib/dhcp/dhcpd.leases
```

### 5.3 配置文件备份

```bash
# 备份重要配置文件
sudo cp /etc/dhcp/dhcpd.conf /etc/dhcp/dhcpd.conf.backup-$(date +%Y%m%d)
sudo cp /etc/dhcp/dhcpd-clients.conf /etc/dhcp/dhcpd-clients.conf.backup-$(date +%Y%m%d)
sudo cp /etc/netplan/01-netcfg.yaml /etc/netplan/01-netcfg.yaml.backup-$(date +%Y%m%d)
```

## 故障排除

### 常见问题及解决方案

1. **DHCP服务无法启动**
   ```bash
   # 检查配置文件语法
   sudo dhcpd -t -cf /etc/dhcp/dhcpd.conf
   
   # 查看错误日志
   sudo journalctl -u isc-dhcp-server --no-pager
   ```

2. **客户端无法获取IP**
   ```bash
   # 检查接口配置
   ip addr show eth1
   
   # 检查防火墙设置
   sudo ufw status
   
   # 监控DHCP请求
   sudo tcpdump -i eth1 port 67 or port 68
   ```

3. **租约冲突**
   ```bash
   # 清理租约文件
   sudo systemctl stop isc-dhcp-server
   sudo rm /var/lib/dhcp/dhcpd.leases
   sudo touch /var/lib/dhcp/dhcpd.leases
   sudo systemctl start isc-dhcp-server
   ```

## 配置参数说明

### 地址分配策略

- **动态地址池**: 10.1.10.50 - 10.1.10.199 (150个IP)
- **固定地址池**: 10.1.10.200 - 10.1.10.254 (55个IP)
- **服务器地址**: 10.1.10.104 (静态配置)
- **网关地址**: 10.1.10.1
- **DNS服务器**: 8.8.8.8, 1.1.1.1

### 租约时间设置

- **默认租约时间**: 600秒 (10分钟)
- **最大租约时间**: 7200秒 (2小时)

这样的设置适合动态环境，可以根据实际需求调整。

## 安全建议

1. **防火墙配置**: 只允许必要的DHCP端口(67/68)
2. **定期备份**: 定期备份配置文件和租约数据
3. **监控日志**: 定期检查DHCP日志，发现异常行为
4. **MAC地址白名单**: 对重要设备使用固定IP分配

通过本文档，你已经完成了一个功能完整的DHCP服务器搭建，包括客户端管理和日常维护工具。
