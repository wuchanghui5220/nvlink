#!/bin/bash

DOMAIN="nvlink.vip"
WEBROOT="/home/admin/ibtc/html"
KEY_DEST="/home/admin/ibtc/html/certs/key.pem"
FULLCHAIN_DEST="/home/admin/ibtc/html/certs/cert.pem"
RENEW_DAYS=7
LOG_FILE="/home/admin/ibtc/renew-cert.log"
ACME="/home/admin/.acme.sh/acme.sh"
RELOAD_CMD="sudo docker exec nginx nginx -s reload"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

if [ ! -f "$FULLCHAIN_DEST" ]; then
    log "证书文件不存在: $FULLCHAIN_DEST，直接执行签发"
    NEED_RENEW=1
else
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$FULLCHAIN_DEST" | cut -d= -f2)
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
    "$ACME" --issue -d "$DOMAIN" --webroot "$WEBROOT" --force 2>&1 | tee -a "$LOG_FILE"

    if [ "${PIPESTATUS[0]}" -ne 0 ]; then
        log "错误: 证书签发失败"
        exit 1
    fi

    log "开始安装证书..."
    "$ACME" --install-cert -d "$DOMAIN" \
        --key-file "$KEY_DEST" \
        --fullchain-file "$FULLCHAIN_DEST" \
        --reloadcmd "$RELOAD_CMD" 2>&1 | tee -a "$LOG_FILE"

    if [ "${PIPESTATUS[0]}" -ne 0 ]; then
        log "错误: 证书安装失败"
        exit 1
    fi

    log "续签完成"
fi
