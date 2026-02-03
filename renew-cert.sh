#!/bin/bash

DOMAIN="nvlink.vip"
CERT_FILE="/home/admin/ibtc/html/certs/cert.pem"
WEBROOT="/home/admin/ibtc/html"
KEY_DEST="/home/admin/ibtc/html/certs/key.pem"
FULLCHAIN_DEST="/home/admin/ibtc/html/certs/cert.pem"
RENEW_DAYS=7
LOG_FILE="/home/admin/ibtc/renew-cert.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ ! -f "$CERT_FILE" ]; then
    log "证书文件不存在: $CERT_FILE，直接执行签发"
    NEED_RENEW=1
else
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_FILE" | cut -d= -f2)
    EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s 2>/dev/null)
    NOW_EPOCH=$(date +%s)
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

    log "证书到期时间: $EXPIRY_DATE (剩余 ${DAYS_LEFT} 天)"

    if [ "$DAYS_LEFT" -le "$RENEW_DAYS" ]; then
        log "证书将在 ${DAYS_LEFT} 天内到期，开始续签"
        NEED_RENEW=1
    else
        log "证书仍有效，无需续签"
        NEED_RENEW=0
    fi
fi

if [ "$NEED_RENEW" -eq 1 ]; then
    log "开始签发证书..."
    ~/.acme.sh/acme.sh --issue -d "$DOMAIN" --webroot "$WEBROOT" --force 2>&1 | tee -a "$LOG_FILE"

    if [ "${PIPESTATUS[0]}" -ne 0 ]; then
        log "错误: 证书签发失败"
        exit 1
    fi

    log "开始安装证书..."
    ~/.acme.sh/acme.sh --install-cert -d "$DOMAIN" \
        --key-file "$KEY_DEST" \
        --fullchain-file "$FULLCHAIN_DEST" 2>&1 | tee -a "$LOG_FILE"

    if [ "${PIPESTATUS[0]}" -ne 0 ]; then
        log "错误: 证书安装失败"
        exit 1
    fi

    log "重新加载 Nginx..."
    docker exec nginx nginx -s reload 2>&1 | tee -a "$LOG_FILE"

    if [ $? -eq 0 ]; then
        log "续签完成，Nginx 已重新加载"
    else
        log "警告: Nginx 重新加载失败，尝试重启容器..."
        docker restart nginx 2>&1 | tee -a "$LOG_FILE"
    fi
fi
