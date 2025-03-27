import cron from 'node-cron';
import { updateClipsMetadata } from '../utils/clipValidation.js';

// Run every 2 hours (at minute 0)
export function scheduleMetadataUpdates() {
  // '0 */2 * * *' means: 
  // - 0: at minute 0
  // - */2: every 2 hours
  // - * * *: any day of month, any month, any day of week
  cron.schedule('0 */2 * * *', async () => {
    console.log(`Starting scheduled metadata update at ${new Date().toISOString()}`);
    try {
      const results = await updateClipsMetadata();
      console.log('Scheduled metadata update completed:', {
        timestamp: new Date().toISOString(),
        ...results
      });
    } catch (error) {
      console.error('Scheduled metadata update failed:', {
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
  
  console.log('Metadata update scheduler initialized - running every 2 hours');
}

// For manual running
export async function runMetadataUpdate() {
  console.log(`Starting manual metadata update at ${new Date().toISOString()}`);
  try {
    const results = await updateClipsMetadata();
    console.log('Manual metadata update completed:', {
      timestamp: new Date().toISOString(),
      ...results
    });
    return results;
  } catch (error) {
    console.error('Manual metadata update failed:', {
      timestamp: new Date().toISOString(),
      error: error.message
    });
    throw error;
  }
} 