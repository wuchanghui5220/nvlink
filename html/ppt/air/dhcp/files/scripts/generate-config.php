<?php
header('Content-Type: text/plain');

// 获取参数
$stage = $_GET['stage'] ?? '1';
$mac = $_GET['mac'] ?? '';
$hostname = $_GET['hostname'] ?? '';
$ip = $_GET['ip'] ?? '';

// 验证参数
if (empty($stage)) {
    http_response_code(400);
    echo "Error: Missing stage parameter\n";
    exit;
}

// 验证阶段数值
if (!in_array($stage, ['1', '2', '3'])) {
    http_response_code(400);
    echo "Error: Invalid stage. Must be 1, 2, or 3\n";
    exit;
}

// 从客户端数据库获取信息
function getClientInfo($mac) {
    $clients_file = '/var/lib/netconfig/clients.conf';
    if (!file_exists($clients_file)) {
        return null;
    }
    
    $lines = file($clients_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue; // 跳过注释
        
        if (strpos($line, '=') !== false) {
            list($file_mac, $info) = explode('=', $line, 2);
            if (trim($file_mac) === $mac) {
                $parts = explode(':', $info);
                return [
                    'hostname' => $parts[0] ?? '',
                    'vlan1_ip' => $parts[1] ?? '',
                    'vlan10_ip' => $parts[2] ?? ''
                ];
            }
        }
    }
    return null;
}

// 如果有MAC地址，尝试从数据库获取信息
if (!empty($mac)) {
    $client_info = getClientInfo($mac);
    if ($client_info) {
        $hostname = $client_info['hostname'];
        $vlan1_ip = $client_info['vlan1_ip'];
        $vlan10_ip = $client_info['vlan10_ip'];
    }
}

// 模板文件路径
$template_file = "/var/www/netconfig/templates/stage{$stage}.yaml";

if (!file_exists($template_file)) {
    http_response_code(404);
    echo "Error: Template file not found for stage {$stage}\n";
    exit;
}

// 读取模板内容
$content = file_get_contents($template_file);

// 根据阶段进行变量替换
if ($stage === '3') {
    // 阶段3需要替换IP地址
    if (!empty($vlan1_ip)) {
        // 提取IP地址的最后一部分
        $ip_parts = explode('.', $vlan1_ip);
        $last_octet = end($ip_parts);
        $content = str_replace('{IP}', $last_octet, $content);
    }
    
    if (!empty($vlan10_ip)) {
        $ip_parts = explode('.', $vlan10_ip);
        $last_octet = end($ip_parts);
        $content = str_replace('{VLAN10_IP}', $last_octet, $content);
    }
}

// 替换主机名（如果需要）
if (!empty($hostname)) {
    $content = str_replace('{HOSTNAME}', $hostname, $content);
}

// 输出配置内容
echo $content;

// 记录访问日志
$log_entry = date('Y-m-d H:i:s') . " - Stage: {$stage}, MAC: {$mac}, Hostname: {$hostname}\n";
file_put_contents('/var/lib/netconfig/logs/access.log', $log_entry, FILE_APPEND | LOCK_EX);
?>
