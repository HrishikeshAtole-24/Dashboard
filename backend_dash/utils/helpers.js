const UAParser = require('ua-parser-js');

const parseUserAgent = (userAgentString) => {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    device: getDeviceType(result.device.type),
    deviceModel: result.device.model || '',
    deviceVendor: result.device.vendor || ''
  };
};

const getDeviceType = (deviceType) => {
  if (!deviceType) return 'desktop';
  
  switch (deviceType.toLowerCase()) {
    case 'mobile':
      return 'mobile';
    case 'tablet':
      return 'tablet';
    case 'smarttv':
      return 'tv';
    case 'wearable':
      return 'wearable';
    case 'console':
      return 'console';
    default:
      return 'desktop';
  }
};

const generateSessionId = () => {
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateWebsiteId = () => {
  return 'web_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isValidDomain = (input) => {
  let domain = input;
  
  // If it's a full URL, extract the domain
  if (input.includes('://')) {
    try {
      const url = new URL(input);
      domain = url.hostname;
    } catch (error) {
      return false;
    }
  }
  
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};

const extractDomain = (input) => {
  // If it's a full URL, extract the domain
  if (input.includes('://')) {
    try {
      const url = new URL(input);
      return url.hostname;
    } catch (error) {
      return input;
    }
  }
  
  return input;
};

const sanitizeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    // Remove sensitive query parameters
    const sensitiveParams = ['token', 'key', 'password', 'secret', 'auth'];
    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch (error) {
    return url;
  }
};

const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

const calculateBounceRate = (totalSessions, bouncedSessions) => {
  if (totalSessions === 0) return 0;
  return Math.round((bouncedSessions / totalSessions) * 100);
};

module.exports = {
  parseUserAgent,
  getDeviceType,
  generateSessionId,
  generateWebsiteId,
  isValidUrl,
  isValidDomain,
  extractDomain,
  sanitizeUrl,
  getDateRange,
  formatDuration,
  calculateBounceRate
};