# Tracking Script Usage Guide

## Basic Integration

Add this script to your website's HTML, just before the closing `</body>` tag:

```html
<script src="https://your-domain.com/track.js" data-website-id="your-website-id"></script>
```

Replace:
- `https://your-domain.com/track.js` with the actual URL where you host the tracking script
- `your-website-id` with the unique website ID from your dashboard

## Advanced Usage

### Custom Event Tracking

Track custom events in your application:

```javascript
// Track a custom event
analytics.trackEvent('button_click', {
  buttonName: 'signup',
  location: 'header'
});

// Track a goal conversion
analytics.trackGoal('newsletter_signup', {
  source: 'homepage'
});

// Identify a user
analytics.identify('user123', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});
```

### Configuration Options

You can customize the tracking script by modifying the CONFIG object:

```javascript
const CONFIG = {
  apiUrl: 'https://your-api.com/api/collect',
  debug: false,           // Set to true for debug logs
  batchSize: 10,          // Number of events to batch before sending
  batchTimeout: 5000,     // Time to wait before sending batch (ms)
  sessionTimeout: 1800000 // Session timeout (30 minutes)
};
```

## What Gets Tracked Automatically

- **Page Views**: Every time a page loads
- **Clicks**: On links, buttons, and form elements
- **Scroll Depth**: How far users scroll on pages
- **Form Submissions**: When forms are submitted
- **File Downloads**: When users download files
- **Time on Page**: How long users spend on each page
- **Device Information**: Browser, OS, screen size
- **Session Information**: Unique sessions and user flows

## Privacy Considerations

- No personal data is collected by default
- All data is anonymized using session IDs
- IP addresses are collected but can be anonymized in processing
- Users can opt-out by blocking the script
- GDPR compliant when configured properly

## Testing

To test the integration:

1. Add the script to a test page
2. Open browser developer tools
3. Set `CONFIG.debug = true` in the script
4. Reload the page and check console for tracking logs
5. Verify events appear in your analytics dashboard

## Performance

- Script size: ~8KB minified
- Asynchronous loading: Won't block page rendering
- Batched requests: Reduces server load
- Local storage: Minimizes data transmission

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Internet Explorer 11+
- Mobile browsers (iOS Safari, Android Chrome)
- Works with or without JavaScript frameworks