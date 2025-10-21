(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    apiUrl: 'https://dashboard-backend-twj7.onrender.com/api/collect', // Production backend URL
    debug: true, // Set to true for testing
    batchSize: 10,
    batchTimeout: 5000, // 5 seconds
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  };

  // Get website ID from script tag
  const script = document.currentScript || document.querySelector('script[data-website-id]');
  const websiteId = script ? script.getAttribute('data-website-id') : null;

  if (!websiteId) {
    console.error('Analytics: website-id not found in script tag');
    return;
  }

  // Utility functions
  const log = (...args) => {
    if (CONFIG.debug) {
      console.log('[Analytics]', ...args);
    }
  };

  const generateId = () => {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const getOrCreateSessionId = () => {
    const key = `analytics_session_${websiteId}`;
    const stored = localStorage.getItem(key);
    
    if (stored) {
      const { sessionId, timestamp } = JSON.parse(stored);
      // Check if session is still valid (30 minutes)
      if (Date.now() - timestamp < CONFIG.sessionTimeout) {
        return sessionId;
      }
    }
    
    // Create new session
    const sessionId = generateId();
    localStorage.setItem(key, JSON.stringify({
      sessionId,
      timestamp: Date.now()
    }));
    
    return sessionId;
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/iPad/i.test(ua)) {
      deviceType = 'tablet';
    }
    
    return {
      type: deviceType,
      userAgent: ua,
      viewport: {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
      }
    };
  };

  const getPageData = () => {
    return {
      url: window.location.href,
      referrer: document.referrer || '',
      title: document.title || '',
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    };
  };

  // Event queue for batching
  let eventQueue = [];
  let batchTimer = null;

  // Core tracking class
  class AnalyticsTracker {
    constructor() {
      this.sessionId = getOrCreateSessionId();
      this.startTime = Date.now();
      this.isActive = true;
      this.lastActivity = Date.now();
      
      log('Initialized with session:', this.sessionId);
      
      // Track initial page view
      this.track('page_view');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Track page visibility changes
      this.setupVisibilityTracking();
      
      // Send queued events before page unload
      this.setupUnloadTracking();
    }

    setupEventListeners() {
      // Track clicks
      document.addEventListener('click', (e) => {
        this.updateActivity();
        
        // Track specific elements
        if (e.target.tagName === 'A') {
          this.track('click', {
            elementType: 'link',
            href: e.target.href,
            text: e.target.textContent?.substring(0, 100)
          });
        } else if (e.target.type === 'submit' || e.target.closest('form')) {
          this.track('click', {
            elementType: 'form_element',
            formId: e.target.closest('form')?.id,
            elementName: e.target.name
          });
        }
      });

      // Track scrolling
      let scrollTimer;
      document.addEventListener('scroll', () => {
        this.updateActivity();
        
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
          );
          
          this.track('scroll', {
            scrollPercent: Math.min(scrollPercent, 100),
            scrollDepth: window.scrollY
          });
        }, 1000);
      });

      // Track form submissions
      document.addEventListener('submit', (e) => {
        this.track('form_submit', {
          formId: e.target.id,
          formAction: e.target.action,
          formMethod: e.target.method
        });
      });

      // Track downloads
      document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href) {
          const url = new URL(e.target.href, window.location.origin);
          const fileExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|dmg|pkg|deb)$/i;
          
          if (fileExtensions.test(url.pathname)) {
            this.track('download', {
              fileUrl: e.target.href,
              fileName: url.pathname.split('/').pop(),
              fileType: url.pathname.split('.').pop()
            });
          }
        }
      });
    }

    setupVisibilityTracking() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isActive = false;
          this.sendDuration();
        } else {
          this.isActive = true;
          this.startTime = Date.now();
          this.updateActivity();
        }
      });

      // Track when user becomes inactive
      let inactivityTimer;
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          this.isActive = false;
        }, 60000); // 1 minute of inactivity
      };

      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
      });

      resetInactivityTimer();
    }

    setupUnloadTracking() {
      // Send final duration and flush queue
      const handleUnload = () => {
        this.sendDuration();
        this.flushEvents(true);
      };

      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('pagehide', handleUnload);
      
      // For modern browsers, use visibilitychange as fallback
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          handleUnload();
        }
      });
    }

    updateActivity() {
      this.lastActivity = Date.now();
      if (!this.isActive) {
        this.isActive = true;
        this.startTime = Date.now();
      }
    }

    sendDuration() {
      if (this.isActive && this.startTime) {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        if (duration > 0) {
          this.track('duration', { duration });
        }
      }
    }

    track(eventType = 'page_view', customData = {}) {
      try {
        const eventData = {
          websiteId,
          sessionId: this.sessionId,
          eventType,
          timestamp: new Date().toISOString(),
          ...getPageData(),
          ...getDeviceInfo(),
          customData
        };

        log('Tracking event:', eventType, eventData);
        
        // Add to queue
        eventQueue.push(eventData);
        
        // Send immediately for important events, batch others
        if (eventType === 'page_view' || eventQueue.length >= CONFIG.batchSize) {
          this.flushEvents();
        } else {
          this.scheduleBatch();
        }
        
      } catch (error) {
        log('Error tracking event:', error);
      }
    }

    scheduleBatch() {
      if (batchTimer) return;
      
      batchTimer = setTimeout(() => {
        this.flushEvents();
      }, CONFIG.batchTimeout);
    }

    flushEvents(useBeacon = false) {
      if (eventQueue.length === 0) return;
      
      const events = [...eventQueue];
      eventQueue = [];
      
      if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
      }

      try {
        const payload = JSON.stringify({ events });
        
        if (useBeacon && navigator.sendBeacon) {
          // Use sendBeacon for page unload
          navigator.sendBeacon(CONFIG.apiUrl + '/batch', payload);
          log('Sent', events.length, 'events via beacon');
        } else {
          // Use fetch for regular requests
          fetch(CONFIG.apiUrl + '/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: payload,
            keepalive: true
          }).then(response => {
            if (response.ok) {
              log('Sent', events.length, 'events successfully');
            } else {
              log('Error sending events:', response.status);
            }
          }).catch(error => {
            log('Error sending events:', error);
          });
        }
      } catch (error) {
        log('Error sending events:', error);
      }
    }

    // Public API
    identify(userId, traits = {}) {
      this.track('identify', {
        userId,
        traits
      });
    }

    trackCustomEvent(eventName, properties = {}) {
      this.track('custom', {
        eventName,
        properties
      });
    }

    trackGoal(goalName, value = null) {
      this.track('goal', {
        goalName,
        value
      });
    }
  }

  // Initialize tracker
  let tracker;
  
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        tracker = new AnalyticsTracker();
      });
    } else {
      tracker = new AnalyticsTracker();
    }
  };

  // Global API
  window.analytics = {
    track: (eventType, customData) => tracker?.track(eventType, customData),
    identify: (userId, traits) => tracker?.identify(userId, traits),
    trackEvent: (eventName, properties) => tracker?.trackCustomEvent(eventName, properties),
    trackGoal: (goalName, value) => tracker?.trackGoal(goalName, value)
  };

  // Start tracking
  init();

})();