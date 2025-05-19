/**
 * Debug logger for the feedback form application
 * This helps with troubleshooting issues in the browser console
 */

// Set to true to enable detailed logging
const DEBUG_MODE = true;

export function logInfo(message, ...data) {
  if (DEBUG_MODE) {
    console.log(`%c[INFO] ${message}`, 'color: #4299e1', ...data);
  }
}

export function logWarning(message, ...data) {
  if (DEBUG_MODE) {
    console.warn(`%c[WARNING] ${message}`, 'color: #ed8936', ...data);
  }
}

export function logError(message, ...data) {
  if (DEBUG_MODE) {
    console.error(`%c[ERROR] ${message}`, 'color: #f56565', ...data);
  }
}

export function logSuccess(message, ...data) {
  if (DEBUG_MODE) {
    console.log(`%c[SUCCESS] ${message}`, 'color: #48bb78', ...data);
  }
}
