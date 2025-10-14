#!/bin/bash

# Database backup script
# This script creates daily backups of both MySQL and MongoDB databases

# Configuration - Set these variables according to your environment
BACKUP_DIR="/home/$(whoami)/backups"
DATE=$(date +"%Y-%m-%d")
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$BACKUP_DIR/backup.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/mysql"
mkdir -p "$BACKUP_DIR/mongodb"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting database backup process..."

# === MySQL Backup ===
log "Starting MySQL backup..."

# MySQL connection details (these should match your .env file)
MYSQL_HOST="${DB_HOST:-localhost}"
MYSQL_PORT="${DB_PORT:-3306}"
MYSQL_USER="${DB_USER:-root}"
MYSQL_PASSWORD="${DB_PASSWORD:-}"
MYSQL_DATABASE="${DB_NAME:-ecommerce_db}"

# Create MySQL backup
MYSQL_BACKUP_FILE="$BACKUP_DIR/mysql/mysql_backup_${TIMESTAMP}.sql"

if mysqldump -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > "$MYSQL_BACKUP_FILE" 2>>"$LOG_FILE"; then
    log "MySQL backup successful: $MYSQL_BACKUP_FILE"
    
    # Compress the backup
    gzip "$MYSQL_BACKUP_FILE"
    log "MySQL backup compressed: ${MYSQL_BACKUP_FILE}.gz"
else
    log "ERROR: MySQL backup failed"
fi

# === MongoDB Backup ===
log "Starting MongoDB backup..."

# MongoDB connection details
MONGO_URI="${DB_CONNECTION_STRING:-mongodb://localhost:27017}"
MONGO_BACKUP_DIR="$BACKUP_DIR/mongodb/backup_$TIMESTAMP"

# Create MongoDB backup
if mongodump --uri="$MONGO_URI" --out="$MONGO_BACKUP_DIR" >>"$LOG_FILE" 2>&1; then
    log "MongoDB backup successful: $MONGO_BACKUP_DIR"
    
    # Compress the backup
    tar -czf "${MONGO_BACKUP_DIR}.tar.gz" -C "$BACKUP_DIR/mongodb" "backup_$TIMESTAMP"
    log "MongoDB backup compressed: ${MONGO_BACKUP_DIR}.tar.gz"
    
    # Remove uncompressed directory
    rm -rf "$MONGO_BACKUP_DIR"
else
    log "ERROR: MongoDB backup failed"
fi

# === Cleanup old backups (keep last 7 days) ===
log "Cleaning up old backups..."

# Remove MySQL backups older than 7 days
find "$BACKUP_DIR/mysql" -name "mysql_backup_*.sql.gz" -mtime +7 -delete 2>>"$LOG_FILE"
log "Old MySQL backups cleaned up"

# Remove MongoDB backups older than 7 days
find "$BACKUP_DIR/mongodb" -name "backup_*.tar.gz" -mtime +7 -delete 2>>"$LOG_FILE"
log "Old MongoDB backups cleaned up"

log "Backup process completed."