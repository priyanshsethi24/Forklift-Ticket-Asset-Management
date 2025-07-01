/**
 * Formats a number as currency with 2 decimal places
 * @param {number} value - The number to format
 * @param {string} locale - The locale to use (defaults to 'en-US')
 * @param {string} currency - The currency code (defaults to 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, locale = 'en-US', currency = 'USD') => {
  // Handle null, undefined or empty string
  if (value == null || value === '') return '-';

  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numValue)) return '-';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return numValue.toFixed(2);
  }
};

/**
 * Formats a number with thousand separators
 * @param {number} value - The number to format
 * @param {string} locale - The locale to use (defaults to 'en-US')
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, locale = 'en-US') => {
  if (value == null || value === '') return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '-';

  try {
    return new Intl.NumberFormat(locale).format(numValue);
  } catch (error) {
    console.error('Error formatting number:', error);
    return value.toString();
  }
};