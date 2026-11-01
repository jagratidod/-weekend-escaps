import {
  StandardCheckoutClient,
  StandardCheckoutPayRequest,
  Env,
  RefundRequest,
} from '@phonepe-pg/pg-sdk-node';

/**
 * PhonePe SDK Configuration & Client Provider
 */
const clientId = process.env.PHONEPE_CLIENT_ID || 'SANDBOX_CLIENT_ID';
const clientSecret = process.env.PHONEPE_CLIENT_SECRET || 'SANDBOX_CLIENT_SECRET';
const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10);
const envMode = (process.env.PHONEPE_ENV || 'SANDBOX').toUpperCase() === 'PRODUCTION'
  ? Env.PRODUCTION
  : Env.SANDBOX;

let phonePeClient = null;
let clientInitialized = false;

try {
  phonePeClient = StandardCheckoutClient.getInstance(
    clientId,
    clientSecret,
    clientVersion,
    envMode,
    false // shouldPublishEvents
  );
  clientInitialized = true;
  console.log(`[PhonePe SDK] Initialized successfully in ${envMode} mode.`);
} catch (error) {
  console.error('[PhonePe SDK] Initialization warning:', error.message);
}

export {
  phonePeClient,
  clientInitialized,
  StandardCheckoutClient,
  StandardCheckoutPayRequest,
  RefundRequest,
  Env,
  envMode,
};
