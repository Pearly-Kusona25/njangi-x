// Utility helper functions

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0';
  return Number(amount).toLocaleString('fr-CM');
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

export const getDaysUntil = (dateString) => {
  if (!dateString) return 0;
  const target = new Date(dateString);
  const today = new Date();
  const diffMs = target - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const getNextPayoutDate = (startDate, frequency, position) => {
  const start = new Date(startDate);
  const freqDays = frequency === 'weekly' ? 7 : frequency === 'bi-weekly' ? 14 : 30;
  const msOffset = (position - 1) * freqDays * 24 * 60 * 60 * 1000;
  return new Date(start.getTime() + msOffset);
};

export const truncate = (text, maxLen = 30) => {
  if (!text) return '';
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('237')) return `+${cleaned}`;
  return `+237 ${cleaned}`;
};

export const validateCameroonPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  // Cameroon mobile numbers: 6XX XXX XXX (9 digits starting with 6)
  return /^6[0-9]{8}$/.test(cleaned) || /^237[0-9]{9}$/.test(cleaned);
};
