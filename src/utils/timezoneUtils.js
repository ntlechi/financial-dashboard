// 🌍 TIMEZONE UTILITIES - Global timezone support for worldwide users
// This file handles all timezone-related operations for the Freedom Compass app

// 🎯 Get user's timezone
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Could not detect timezone, falling back to UTC:', error);
    return 'UTC';
  }
};

// 🎯 Get user's timezone offset in minutes
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

// 🎯 Format date for user's timezone
export const formatDateForUser = (dateString, options = {}) => {
  try {
    const userTimezone = getUserTimezone();
    const date = new Date(dateString + 'T00:00:00');
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(date);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return new Date(dateString).toLocaleDateString();
  }
};

// 🎯 Get today's date in user's timezone
export const getTodayInUserTimezone = () => {
  const now = new Date();
  const userTimezone = getUserTimezone();
  
  try {
    // Get current date in user's timezone
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone
    }).format(now);
    
    return today; // Returns YYYY-MM-DD format
  } catch (error) {
    console.warn('Could not get today in user timezone:', error);
    return now.toISOString().split('T')[0];
  }
};

// 🎯 Convert UTC date to user's timezone
export const convertUTCToUserTimezone = (utcDateString) => {
  try {
    const userTimezone = getUserTimezone();
    const utcDate = new Date(utcDateString + 'T00:00:00Z');
    
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone
    }).format(utcDate);
  } catch (error) {
    console.warn('UTC to user timezone conversion error:', error);
    return utcDateString;
  }
};

// 🎯 Get relative time (e.g., "2 days ago", "Today", "Tomorrow")
export const getRelativeTime = (dateString) => {
  try {
    const userTimezone = getUserTimezone();
    const inputDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    
    // Set both dates to start of day in user's timezone
    const inputDateInTz = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone
    }).format(inputDate);
    
    const todayInTz = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone
    }).format(today);
    
    if (inputDateInTz === todayInTz) {
      return 'Today';
    }
    
    const diffTime = new Date(inputDateInTz) - new Date(todayInTz);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays > 1) {
      return `In ${diffDays} days`;
    } else if (diffDays < -1) {
      return `${Math.abs(diffDays)} days ago`;
    }
    
    return formatDateForUser(dateString);
  } catch (error) {
    console.warn('Relative time calculation error:', error);
    return formatDateForUser(dateString);
  }
};

// 🎯 Get timezone info for display
export const getTimezoneInfo = () => {
  const timezone = getUserTimezone();
  const offset = getTimezoneOffset();
  const offsetHours = Math.abs(offset) / 60;
  const offsetSign = offset <= 0 ? '+' : '-';
  
  return {
    timezone,
    offset,
    offsetString: `UTC${offsetSign}${offsetHours}`,
    displayName: timezone.replace(/_/g, ' ')
  };
};

// 🎯 Format time for user's timezone
export const formatTimeForUser = (dateString, timeString = '00:00:00') => {
  try {
    const userTimezone = getUserTimezone();
    const date = new Date(`${dateString}T${timeString}`);
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.warn('Time formatting error:', error);
    return timeString;
  }
};

// 🎯 Get start and end of day in user's timezone
export const getDayBounds = (dateString) => {
  try {
    const userTimezone = getUserTimezone();
    const date = new Date(dateString + 'T00:00:00');
    
    const startOfDay = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone
    }).format(date);
    
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const endOfDayString = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone
    }).format(endOfDay);
    
    return {
      start: startOfDay,
      end: endOfDayString
    };
  } catch (error) {
    console.warn('Day bounds calculation error:', error);
    return {
      start: dateString,
      end: dateString
    };
  }
};

// 🎯 Validate date string format
export const isValidDateString = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString + 'T00:00:00');
  return date.toISOString().split('T')[0] === dateString;
};

// 🎯 Get month name in user's language
export const getMonthName = (dateString, format = 'long') => {
  try {
    const userTimezone = getUserTimezone();
    const date = new Date(dateString + 'T00:00:00');
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      month: format
    }).format(date);
  } catch (error) {
    console.warn('Month name formatting error:', error);
    return new Date(dateString).toLocaleDateString('en-US', { month: format });
  }
};

// 🎯 Get day of week in user's language
export const getDayOfWeek = (dateString, format = 'long') => {
  try {
    const userTimezone = getUserTimezone();
    const date = new Date(dateString + 'T00:00:00');
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      weekday: format
    }).format(date);
  } catch (error) {
    console.warn('Day of week formatting error:', error);
    return new Date(dateString).toLocaleDateString('en-US', { weekday: format });
  }
};

// 🎯 Export all utilities
const timezoneUtilsModule = {
  getUserTimezone,
  getTimezoneOffset,
  formatDateForUser,
  getTodayInUserTimezone,
  convertUTCToUserTimezone,
  getRelativeTime,
  getTimezoneInfo,
  formatTimeForUser,
  getDayBounds,
  isValidDateString,
  getMonthName,
  getDayOfWeek
};

export default timezoneUtilsModule;

