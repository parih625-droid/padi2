#!/bin/bash

# Backup Verification Script
# This script verifies the integrity of the latest backups

BACKUP_DIR="/home/$(whoami)/backups"
LOG_FILE="$BACKUP_DIR/verify.log"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting backup verification process..."

# Find the latest MySQL backup
LATEST_MYSQL_BACKUP=$(ls -t $BACKUP_DIR/mysql/mysql_backup_*.sql.gz 2>/dev/null | head -n1)

if [ -n "$LATEST_MYSQL_BACKUP" ]; then
    log "Latest MySQL backup: $LATEST_MYSQL_BACKUP"
    
    # Try to decompress and check if it's a valid gzip file
    if gunzip -t "$LATEST_MYSQL_BACKUP" 2>>"$LOG_FILE"; then
        log "MySQL backup integrity check: PASSED"
    else
        log "ERROR: MySQL backup integrity check: FAILED"
    fi
else
    log "No MySQL backup found"
fi

# Find the latest MongoDB backup
LATEST_MONGO_BACKUP=$(ls -t $BACKUP_DIR/mongodb/backup_*.tar.gz 2>/dev/null | head -n1)

if [ -n "$LATEST_MONGO_BACKUP" ]; then
    log "Latest MongoDB backup: $LATEST_MONGO_BACKUP"
    
    # Try to list contents of the tar.gz file to check integrity
    if tar -tzf "$LATEST_MONGO_BACKUP" >/dev/null 2>>"$LOG_FILE"; then
        log "MongoDB backup integrity check: PASSED"
    else
        log "ERROR: MongoDB backup integrity check: FAILED"
    fi
else
    log "No MongoDB backup found"
fi

log "Backup verification process completed."