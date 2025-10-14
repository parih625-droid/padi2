# Database Connection and Data Persistence Diagnosis

This document explains how to diagnose and troubleshoot database connection timeouts and data persistence issues.

## Common Issues

1. **Connection Timeouts**: The server may be timing out when trying to connect to the database
2. **Data Disappearing**: Data may appear to be disappearing from the database
3. **Intermittent Connection Issues**: Connection works sometimes but fails at other times

## Diagnostic Tools

### 1. Connection Diagnosis Script

Run this script to check if the database connection is working properly:

```bash
npm run diagnose-connection
```

This script will:
- Verify environment variables are set correctly
- Test database connectivity with minimal configuration
- Report specific error messages if connection fails
- Provide troubleshooting tips based on error types

### 2. Data Persistence Check

Run this script to verify that data is being properly saved and retrieved:

```bash
npm run check-data
```

This script will:
- Count documents in each collection
- Warn if any collections are unexpectedly empty
- Test document insertion and retrieval
- Clean up any test data created during the check

## Troubleshooting Steps

### If You're Getting Timeout Errors

1. **Check Environment Variables**:
   - Ensure `DB_CONNECTION_STRING` is set correctly
   - Verify the connection string format and credentials

2. **Network Connectivity**:
   - If using a remote database, ensure network connectivity
   - Check firewall settings
   - Verify the database server is running

3. **Timeout Settings**:
   - The updated configuration has increased timeout values:
     - Connection timeout: 30 seconds (increased from 10)
     - Socket timeout: 45 seconds (increased from 20)
     - Server selection timeout: 30 seconds (increased from 10)

### If Data Is Disappearing

1. **Check for Connection Drops**:
   - Look at server logs for "disconnected" or "reconnected" messages
   - The updated configuration includes better reconnection handling

2. **Verify Data Persistence**:
   - Run the data persistence check script
   - Check if documents are actually being saved to the database

3. **Check for Accidental Deletions**:
   - Review application code for unintended delete operations
   - Check if there are any scheduled jobs that might be clearing data

## Monitoring Connection Status

You can check the current database connection status using the health endpoint:

```
GET /api/health
```

This endpoint provides detailed information about:
- Database connection state
- Connection readiness
- Host and database name
- Uptime information

## Configuration Changes Made

The following improvements were made to address timeout issues:

1. **Increased Timeout Values**:
   - `serverSelectionTimeoutMS`: 30000 (30 seconds)
   - `socketTimeoutMS`: 45000 (45 seconds)
   - `connectTimeoutMS`: 30000 (30 seconds)

2. **Improved Reconnection Logic**:
   - Added better error handling for connection failures
   - Implemented automatic reconnection attempts
   - Added connection monitoring events

3. **Request Timeout Handling**:
   - Added middleware to handle request timeouts gracefully
   - Set request timeout to 30 seconds
   - Added specific error handling for timeout errors

## Best Practices

1. **Regular Health Checks**:
   - Monitor the `/api/health` endpoint regularly
   - Set up alerts for connection issues

2. **Environment Variable Management**:
   - Keep database credentials secure
   - Use different connection strings for development and production

3. **Error Handling**:
   - Always check for database connection errors in your application code
   - Implement retry logic for critical operations

4. **Logging**:
   - Enable detailed logging in development
   - Monitor logs for connection-related errors