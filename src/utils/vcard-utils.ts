
interface VCardData {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export const generateVCard = (data: VCardData): string => {
  const { name, title, company, email, phone } = data;
  
  const vCardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${name.split(' ').slice(-1)[0]};${name.split(' ').slice(0, -1).join(' ')};;;`,
  ];

  if (title) {
    vCardLines.push(`TITLE:${title}`);
  }

  if (company) {
    vCardLines.push(`ORG:${company}`);
  }

  if (email) {
    vCardLines.push(`EMAIL;type=INTERNET;type=pref:${email}`);
  }

  if (phone) {
    vCardLines.push(`TEL;type=CELL;type=VOICE;type=pref:${phone}`);
  }

  vCardLines.push('END:VCARD');

  return vCardLines.join('\n');
};

export const generateVCardQRCodeURL = (data: VCardData): string => {
  const vCardContent = generateVCard(data);
  const encodedContent = encodeURIComponent(vCardContent);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedContent}`;
};

export const downloadVCard = (data: VCardData): void => {
  const vCardContent = generateVCard(data);
  const blob = new Blob([vCardContent], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.name.replace(/\s/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
