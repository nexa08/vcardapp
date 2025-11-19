export default  generateVcardContent = (cardData) => {
  let vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${cardData.name}\n`;
  if (cardData.title) vcf += `TITLE:${cardData.title}\n`;
  cardData.phones.forEach((p) => p.trim() && (vcf += `TEL;TYPE=CELL:${p}\n`));
  cardData.emails.forEach((e) => e.trim() && (vcf += `EMAIL;TYPE=INTERNET:${e}\n`));
  if (cardData.socials.whatsapp.trim()) vcf += `URL;TYPE=WhatsApp:https://wa.me/${cardData.socials.whatsapp}\n`;
  if (cardData.socials.instagram.trim()) vcf += `URL;TYPE=Instagram:${cardData.socials.instagram}\n`;
  if (cardData.socials.youtube.trim()) vcf += `URL;TYPE=YouTube:${cardData.socials.youtube}\n`;
  if (cardData.socials.telegram.trim()) vcf += `URL;TYPE=Telegram:https://t.me/${cardData.socials.telegram}\n`;
  cardData.otherLinks.forEach((l) => l.trim() && (vcf += `URL:${l}\n`));
  vcf += 'END:VCARD';
  return vcf;
};
