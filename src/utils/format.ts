export const formatCurrency = (amount: number, currency = 'ARS'): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('es-AR').format(number);
};

export const formatDate = (date: string | Date, format = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'dd/MM/yyyy') {
    return dateObj.toLocaleDateString('es-AR');
  }

  if (format === 'dd/MM/yyyy HH:mm') {
    return dateObj.toLocaleString('es-AR');
  }

  return dateObj.toLocaleDateString('es-AR');
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
  if (diffInHours < 24) return `Hace ${diffInHours} h`;
  if (diffInDays < 7) return `Hace ${diffInDays} días`;

  return formatDate(dateObj);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
