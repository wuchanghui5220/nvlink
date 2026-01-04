<?php
header('Content-Type: application/json');

$mac = $_GET['mac'] ?? '';
if (empty($mac)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing MAC parameter']);
    exit;
}

// 调用管理脚本推进阶段
$escaped_mac = escapeshellarg($mac);
$command = "/usr/local/bin/netconfig-manager.sh advance {$escaped_mac}";
$output = [];
$return_code = 0;

exec($command . ' 2>&1', $output, $return_code);

if ($return_code === 0) {
    // 获取当前阶段状态
    $status_command = "/usr/local/bin/netconfig-manager.sh get-stage {$escaped_mac}";
    $current_stage = trim(shell_exec($status_command));
    
    echo json_encode([
        'status' => 'success',
        'mac' => $mac,
        'current_stage' => $current_stage,
        'message' => 'Stage advanced successfully',
        'output' => implode("\n", $output)
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'mac' => $mac,
        'message' => 'Failed to advance stage',
        'output' => implode("\n", $output),
        'return_code' => $return_code
    ]);
}

// 记录操作日志
$log_entry = date('Y-m-d H:i:s') . " - Advance stage request for MAC: {$mac}, Result: " . 
             ($return_code === 0 ? 'SUCCESS' : 'FAILED') . "\n";
file_put_contents('/var/lib/netconfig/logs/advance.log', $log_entry, FILE_APPEND | LOCK_EX);
?>
