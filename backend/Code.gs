/**
 * DICE BACKEND - V12 (Added Checkpoint Configuration)
 * 1. Run 'setup' function manually first to authorize scopes.
 * 2. Deploy as Web App -> Execute as: "Me", Access: "Anyone".
 */

function setup() {
  const doc = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(doc, 'Users', [
      'id', 'name', 'email', 'phone', 'address', 'birthDate', 'currentStamps', 'maxStamps', 'createdAt'
  ]);
  getOrCreateSheet(doc, 'Transactions', [
      'id', 'userId', 'type', 'amount', 'timestamp', 'dateString'
  ]);
  // NEW: Initialize CheckpointConfig sheet
  getOrCreateSheet(doc, 'CheckpointConfig', [
      'maxStamps', 'checkpoints'
  ]);
  Logger.log("Setup Complete. You can now Deploy.");
}

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return jsonResponse({ success: false, error: "Server busy, please try again." });
  }
  
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let requestData = e.parameter || {};
    if (e.postData && e.postData.contents) {
      try {
        const jsonBody = JSON.parse(e.postData.contents);
        requestData = { ...requestData, ...jsonBody };
      } catch (err) {}
    }

    const action = requestData.action;
    const usersSheet = getOrCreateSheet(doc, 'Users', [
      'id', 'name', 'email', 'phone', 'address', 'birthDate', 'currentStamps', 'maxStamps', 'createdAt'
    ]);
    
    const txSheet = getOrCreateSheet(doc, 'Transactions', [
      'id', 'userId', 'type', 'amount', 'timestamp', 'dateString'
    ]);

    let result = { success: false };

    if (action === 'register') {
      const allUsers = usersSheet.getDataRange().getValues();
      const inputPhone = String(requestData.phone || '').trim().replace(/\s/g, '');
      
      const exists = allUsers.slice(1).some(row => String(row[3]).trim().replace(/\s/g, '') === inputPhone);
      
      if (exists) {
        result = { success: false, error: "Phone number already registered." };
      } else {
        const newUser = [
          requestData.id || 'user-' + new Date().getTime(),
          requestData.name,
          requestData.email,
          String(requestData.phone || '').trim(),
          requestData.address || '',
          String(requestData.birthDate || '').trim(),
          0,
          10,
          new Date().toISOString()
        ];
        usersSheet.appendRow(newUser);
        SpreadsheetApp.flush();
        result = { success: true, user: mapRowToUser(newUser, []) };
      }
    }

    else if (action === 'login') {
      const allUsers = usersSheet.getDataRange().getValues();
      const inputPhone = String(requestData.username || '').trim().replace(/\s/g, '');
      const inputBirth = String(requestData.password || '').trim();

      if (allUsers.length <= 1) {
         result = { success: false, error: "Database is empty." };
      } else {
         const row = allUsers.slice(1).find(r => {
           const sheetPhone = String(r[3]).trim().replace(/\s/g, '');
           const sheetDate = formatDate(r[5]); 
           return sheetPhone === inputPhone && sheetDate === inputBirth;
         });

         if (row) {
           result = { success: true, user: mapRowToUser(row, []) };
         } else {
           result = { success: false, error: "Invalid phone number or birth date." };
         }
      }
    }

    else if (action === 'getUser') {
      const userId = String(requestData.id).trim();
      const allUsers = usersSheet.getDataRange().getValues();
      const row = allUsers.slice(1).find(r => String(r[0]) === userId);
      
      if (row) {
        result = { success: true, user: mapRowToUser(row, []) };
      } else {
        result = { success: false, error: "User not found." };
      }
    }

    else if (action === 'getHistory') {
      const userId = String(requestData.userId).trim();
      const history = getTransactionsForUser(txSheet, userId);
      result = { success: true, history: history };
    }

    else if (action === 'addStamp') {
      const userId = requestData.userId;
      const allUsers = usersSheet.getDataRange().getValues();
      const userIndex = allUsers.slice(1).findIndex(r => String(r[0]) === String(userId));

      if (userIndex === -1) {
        result = { success: false, error: "User not found." };
      } else {
        const realRow = userIndex + 2;
        const currentStamps = parseInt(allUsers[userIndex + 1][6] || 0); 
        const maxStamps = parseInt(allUsers[userIndex + 1][7] || 10);
        
        if (currentStamps < maxStamps) {
          usersSheet.getRange(realRow, 7).setValue(currentStamps + 1);
          const now = new Date();
          txSheet.appendRow(['tx-' + now.getTime(), userId, 'add', 1, now.getTime(), now.toISOString()]);
          SpreadsheetApp.flush();
          
          const history = getTransactionsForUser(txSheet, userId);
          const updatedRow = [...allUsers[userIndex + 1]];
          updatedRow[6] = currentStamps + 1;
          result = { success: true, user: mapRowToUser(updatedRow, history) };
        } else {
          result = { success: false, error: "Max stamps reached." };
        }
      }
    }
    
    else if (action === 'getAll') {
       const allUsers = usersSheet.getDataRange().getValues().slice(1);
       result = { users: allUsers.map(r => mapRowToUser(r, [])) };
    }

    // NEW: Get checkpoint configuration
    else if (action === 'getCheckpointConfig') {
      const configSheet = getOrCreateSheet(doc, 'CheckpointConfig', ['maxStamps', 'checkpoints']);
      const data = configSheet.getDataRange().getValues();
      
      if (data.length < 2) {
        // Return default configuration
        result = {
          success: true,
          config: {
            maxStamps: 10,
            checkpoints: [
              { stampCount: 3, reward: 'Free Lychee Tea' },
              { stampCount: 5, reward: 'diskon 15% off game' },
              { stampCount: 7, reward: 'Free french fries' },
              { stampCount: 10, reward: 'Free all day pass' }
            ]
          }
        };
      } else {
        const maxStamps = parseInt(data[1][0]) || 10;
        let checkpoints = [];
        try {
          checkpoints = JSON.parse(data[1][1] || '[]');
        } catch (e) {
          checkpoints = [];
        }
        
        result = {
          success: true,
          config: {
            maxStamps: maxStamps,
            checkpoints: checkpoints
          }
        };
      }
    }

    // NEW: Save checkpoint configuration
    else if (action === 'saveCheckpointConfig') {
      const configSheet = getOrCreateSheet(doc, 'CheckpointConfig', ['maxStamps', 'checkpoints']);
      const maxStamps = parseInt(requestData.maxStamps) || 10;
      const checkpoints = requestData.checkpoints || [];
      
      // Clear existing data (except header)
      if (configSheet.getLastRow() > 1) {
        configSheet.deleteRows(2, configSheet.getLastRow() - 1);
      }
      
      // Add new configuration
      configSheet.appendRow([
        maxStamps,
        JSON.stringify(checkpoints)
      ]);
      SpreadsheetApp.flush();
      
      result = {
        success: true,
        config: {
          maxStamps: maxStamps,
          checkpoints: checkpoints
        }
      };
    }

    else {
      result = { success: false, error: "Unknown action" };
    }

    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
      var y = val.getFullYear();
      var m = ('0' + (val.getMonth() + 1)).slice(-2);
      var d = ('0' + val.getDate()).slice(-2);
      return y + '-' + m + '-' + d;
  }
  return String(val).trim();
}

function getOrCreateSheet(doc, name, headers) {
  let sheet = doc.getSheetByName(name);
  if (!sheet) {
    sheet = doc.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    
    // NEW: Initialize CheckpointConfig with default data
    if (name === 'CheckpointConfig') {
      sheet.appendRow([
        10,
        JSON.stringify([
          { stampCount: 3, reward: 'Free iced tea' },
          { stampCount: 5, reward: 'Free drink upgrade' },
          { stampCount: 10, reward: 'Free beverage' }
        ])
      ]);
    }
  }
  return sheet;
}

function getTransactionsForUser(sheet, userId) {
  const allTx = sheet.getDataRange().getValues().slice(1);
  const userTx = allTx.filter(r => String(r[1]) === String(userId));
  userTx.sort((a, b) => b[4] - a[4]);
  return userTx.map(r => ({
    id: r[0],
    timestamp: Number(r[4]),
    type: r[2],
    amount: Number(r[3])
  }));
}

function mapRowToUser(row, history) {
  return {
    id: row[0],
    name: row[1],
    email: row[2],
    phone: row[3],
    address: row[4],
    birthDate: formatDate(row[5]),
    stamps: parseInt(row[6] || 0),
    maxStamps: parseInt(row[7] || 10),
    createdAt: row[8] || new Date().toISOString(),
    history: history
  };
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
