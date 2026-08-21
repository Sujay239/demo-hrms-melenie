import { generateSecret, generateURI, verifySync } from 'otplib';
import QRCode from 'qrcode';

export const generateTotpSecret = (): string => {
  return generateSecret();
};

export const generateTotpUri = (email: string, issuer: string, secret: string): string => {
  return generateURI({
    label: email,
    issuer: issuer || 'Peopleworkplaces',
    secret,
  });
};

export const generateQRCodeDataUrl = async (otpauthUri: string): Promise<string> => {
  return await QRCode.toDataURL(otpauthUri, {
    width: 280,
    margin: 2,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
};

export const verifyTotpCode = (token: string, secret: string): boolean => {
  try {
    const result = verifySync({
      token: token.trim(),
      secret: secret.trim(),
    });
    return Boolean(result && result.valid);
  } catch (err) {
    console.error('TOTP verification error:', err);
    return false;
  }
};
