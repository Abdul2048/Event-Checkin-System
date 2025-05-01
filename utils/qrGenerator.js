const QRCode = require('qrcode');

/**
 * Generate QR code image from data
 * @param {string} data 
 * @returns {Promise<string>} 
 */
const generateQR = async (data) => {
  try {
    const qrCodeImage = await QRCode.toDataURL(data);
    return qrCodeImage;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = { generateQR };