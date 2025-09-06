import { HermesClient } from "@pythnetwork/hermes-client";
 
async function handleFetchLatestVaa() {
  try {
    console.log('🔗 Initializing Hermes client...');
    const connection = new HermesClient("https://hermes.pyth.network", {});
 
    const priceIds = [
      "0xec7a775f46379b5e943c3526b1c8d54cd49749176b0b98e02dde68d1bd335c17", // STX/USD
    ];
    
    console.log('📡 Fetching price updates for:', priceIds);
    const priceUpdates = await connection.getLatestPriceUpdates(priceIds);
    
    console.log('📦 Raw price updates response:', priceUpdates);
    console.log('📊 Binary data structure:', priceUpdates.binary);
    
    if (!priceUpdates.binary || !priceUpdates.binary.data || priceUpdates.binary.data.length === 0) {
      throw new Error('No binary data found in price updates response');
    }
    
    const vaaData = priceUpdates.binary.data[0];
    console.log('🎯 VAA data (first element):', vaaData);
    
    // Check if vaaData is already hex or needs conversion
    let latestVaaHex;
    if (typeof vaaData === 'string') {
      latestVaaHex = vaaData.startsWith('0x') ? vaaData : `0x${vaaData}`;
    } else {
      // If it's a buffer or array, convert to hex
      latestVaaHex = `0x${Buffer.from(vaaData).toString('hex')}`;
    }
    
    console.log('✅ Final VAA hex:', latestVaaHex);
    return latestVaaHex;
    
  } catch (error) {
    console.error('❌ Error in handleFetchLatestVaa:', error);
    throw error;
  }
}

export { handleFetchLatestVaa };


