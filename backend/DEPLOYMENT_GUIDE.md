# Google Apps Script Deployment Guide

## Overview
The stamp checkpoint configuration is now stored in Google Sheets database instead of localStorage. This ensures all admins and members see the same configuration.

## Setup Instructions

### 1. Open Your Google Spreadsheet
Go to your existing Google Spreadsheet that contains the "Members" and "Transactions" sheets.

### 2. Create CheckpointConfig Sheet
1. Click the **+** button at the bottom to add a new sheet
2. Rename it to **`CheckpointConfig`** (exact name, case-sensitive)
3. The script will automatically initialize this sheet with headers and default values

### 3. Update Apps Script
1. In your Google Spreadsheet, go to **Extensions > Apps Script**
2. You should see a file called `Code.gs`
3. **Replace the entire content** of `Code.gs` with the content from:
   ```
   backend/Code.gs
   ```
4. Click **Save** (💾 icon)

### 4. Deploy the Updated Script
Since you already have a deployment, you need to create a new version:

1. Click **Deploy > Manage deployments**
2. Click the **pencil icon** (✏️) next to your existing deployment
3. Under "Version", click **New version**
4. Add description: "Added checkpoint configuration support"
5. Click **Deploy**
6. **Important**: The deployment URL should remain the same

### 5. Verify the Setup
1. Refresh your CRM application
2. As admin, click the **Award icon** (⭐) in the header
3. Configure your stamps and checkpoints
4. Click "Save Configuration"
5. You should see "Stamp configuration saved successfully to database!"

### 6. Check the Database
1. Go back to your Google Spreadsheet
2. Open the **CheckpointConfig** sheet
3. You should see:
   - Row 1: Headers (`maxStamps`, `checkpoints`)
   - Row 2: Your configuration data

## Sheet Structure

### CheckpointConfig Sheet
| Column A | Column B |
|----------|----------|
| maxStamps | checkpoints |
| 10 | [{"stampCount":3,"reward":"Free iced tea"},{"stampCount":5,"reward":"Free drink upgrade"},{"stampCount":10,"reward":"Free beverage"}] |

- **maxStamps**: Number (total stamps needed)
- **checkpoints**: JSON string array of checkpoint objects

## New API Endpoints

The updated script includes two new endpoints:

### Get Checkpoint Configuration
```
GET ?action=getCheckpointConfig
```
Returns:
```json
{
  "success": true,
  "config": {
    "maxStamps": 10,
    "checkpoints": [
      { "stampCount": 3, "reward": "Free iced tea" },
      { "stampCount": 5, "reward": "Free drink upgrade" },
      { "stampCount": 10, "reward": "Free beverage" }
    ]
  }
}
```

### Save Checkpoint Configuration
```
POST ?action=saveCheckpointConfig
Body: { "maxStamps": 10, "checkpoints": [...] }
```
Returns:
```json
{
  "success": true,
  "config": { ... }
}
```

## Features

### ✅ Centralized Configuration
- All stamp configuration stored in Google Sheets
- Consistent across all users and devices
- No more localStorage inconsistencies

### ✅ Smart Caching
- Configuration cached for 5 minutes
- Reduces API calls
- Instant load times

### ✅ Automatic Initialization
- CheckpointConfig sheet auto-created if missing
- Default configuration automatically set
- No manual setup required

### ✅ Real-time Updates
- Changes apply immediately after save
- Cache automatically refreshed
- All users see updated configuration

## Troubleshooting

### Configuration not saving?
1. Check browser console for errors
2. Verify the Apps Script deployment is updated
3. Make sure CheckpointConfig sheet exists
4. Check Apps Script execution logs

### Stars not showing on member page?
1. Clear browser cache: `localStorage.clear()`
2. Refresh the page
3. Check console logs for configuration data
4. Verify checkpoints are configured correctly

### Old localStorage data?
The system automatically clears old localStorage keys when saving new configuration.

## Migration from localStorage

If you previously configured checkpoints in localStorage:
1. Open admin panel
2. Click Award icon (⭐)
3. Your current configuration should load
4. Click "Save Configuration" to migrate to database
5. Old localStorage data will be automatically cleared

## Default Configuration

If no configuration exists in the database, the system uses:
- **Max Stamps**: 10
- **Checkpoints**:
  - 3 stamps: Free iced tea
  - 5 stamps: Free drink upgrade
  - 10 stamps: Free beverage
