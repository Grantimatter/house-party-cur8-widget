# Cur8 Event Detail Page Widget

A dedicated single-event detail page widget for Squarespace integration. Displays comprehensive event information in an engaging, professional format with support for query parameter-based event loading.

## Features

✅ **Dynamic Event Loading** - Load events via query parameter (?event=<event_id>)
✅ **Full Event Details** - Hero image, dates, venue, pricing, description
✅ **Multiple Dates** - Display all upcoming dates with individual ticket links
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
✅ **Beautiful Formatting** - Professional styling with engaging layout
✅ **Share Buttons** - Built-in social sharing (Facebook, Twitter, LinkedIn, copy link)
✅ **Error Handling** - Graceful error messages for invalid/missing events
✅ **Single Event Only** - Enforced by URL parameter structure
✅ **Map Integration** - Google Maps links for venues
✅ **Accessibility** - Semantic HTML, proper contrast ratios

## Installation for Squarespace

### Step 1: Upload Files

Upload these files to your Squarespace site:
- `cur8-event-detail-page.js` - Main widget JavaScript
- `cur8-event-detail-page.css` - Stylesheet

(You can host these on any CDN or directly in Squarespace's code injection)

### Step 2: Create "Event" Page in Squarespace

1. Go to Pages in Squarespace
2. Create a new page titled "event"
3. Set the URL slug to `/event` or `/events` (this will be the base URL)

### Step 3: Add Code Block to Page

Add a Code Block to your "event" page with this HTML:

```html
<div id="cur8-event-detail"></div>

<link rel="stylesheet" href="https://your-cdn.com/cur8-event-detail-page.css">
<script src="https://your-cdn.com/cur8-event-detail-page.js"></script>
```

Or if using code injection in Squarespace head:

```html
<link rel="stylesheet" href="https://your-cdn.com/cur8-event-detail-page.css">
<script src="https://your-cdn.com/cur8-event-detail-page.js"></script>
```

And in the page code block:

```html
<div id="cur8-event-detail"></div>
```

## Usage

### Basic Usage

Link to the event page with an event ID query parameter:

```
https://yourdomain.com/event?event=23121
```

The widget will automatically:
1. Extract the event ID from the URL
2. Fetch event details from Cur8 API
3. Display the full event information

### Valid Examples

```
https://example.com/event?event=23121          ✅
https://example.com/event?event=abc-123        ✅
https://example.com/event                      ❌ (no event specified)
https://example.com/event?event=invalid!@#     ❌ (invalid characters)
```

## Page Layout

### Hero Section
- Full-width background image
- Event title overlay
- Event type badge

### Main Content (Left Column)
- **Dates & Times Section**
  - All upcoming dates
  - Start times
  - Individual "Get Tickets" buttons for each date

- **Venue Information**
  - Venue name
  - Full address
  - Google Maps link

- **Main CTA Section**
  - Large "Get Your Tickets Now" button
  - Encouraging tagline

### Sidebar (Right Column)
- **Event Info Card**
  - First event date
  - Venue name
  - Event type

- **Share Buttons**
  - Facebook
  - Twitter (X)
  - LinkedIn
  - Copy Link

### Additional Sections
- **Pricing Section** - Display ticket pricing tiers
- **Description Section** - Full event details and description

## Customization

### Change Color Scheme

Edit `cur8-event-detail-page.css` and modify these CSS variables:

```css
:root {
  --cur8-primary: #007bff;           /* Main color */
  --cur8-primary-dark: #0056b3;      /* Hover/dark state */
  --cur8-secondary: #6c757d;         /* Secondary elements */
  --cur8-text-primary: #333;         /* Main text */
  --cur8-text-secondary: #666;       /* Secondary text */
}
```

### Change API Endpoint

Pass custom options when initializing (if not using auto-init):

```javascript
const widget = new Cur8EventDetailPage({
  apiUrl: 'https://your-api.com/events',
  ticketDomain: 'https://your-domain.com',
  containerId: 'my-custom-container'
});
widget.load();
```

### Disable Auto-Initialization

Remove or comment out this line in `cur8-event-detail-page.js`:

```javascript
// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const widget = new Cur8EventDetailPage();
  widget.load();
});
```

Then manually initialize:

```javascript
const widget = new Cur8EventDetailPage();
widget.load();
```

## API Reference

### Constructor Options

```javascript
new Cur8EventDetailPage({
  containerId: 'cur8-event-detail',  // Container element ID
  apiUrl: 'https://cur8.com/api/public/events',  // API endpoint
  ticketDomain: 'https://cur8.com'   // Base URL for ticket links
})
```

### Methods

```javascript
const widget = new Cur8EventDetailPage();

// Load and render event based on URL query parameter
widget.load();

// Get current event object
widget.event;

// Get error message if any
widget.error;
```

### Event Object Properties

The widget expects the API to return an event object with:

```javascript
{
  id: '23121',
  event_name: 'Event Title',
  event_type: 'Concert',
  poster_graphic_url: 'https://...',
  desc: '<p>Event description HTML</p>',
  event_dates: [
    {
      event_datetime_local: '2026-06-15T19:00:00',
      ticket_purchase_url: 'https://...',
      sales_end_date: '2026-06-15T18:00:00'
    }
  ],
  venue: {
    name: 'Venue Name',
    address: '123 Main St',
    city: 'City',
    state: 'ST',
    zip: '12345'
  },
  pricing_options: [
    { name: 'General Admission', amount: 25 },
    { name: 'VIP', amount: 50 }
  ]
}
```

## Error Handling

The widget handles various error scenarios:

| Scenario | Message |
|----------|---------|
| No event ID in URL | "No event specified. Use ?event=<event_id>..." |
| Invalid event ID format | "Invalid event ID format." |
| Event not found (404) | "Event not found. Please check the event ID." |
| API error | "API error: [error message]" |
| Network error | "Failed to load event" |

All errors display a user-friendly message with guidance.

## Mobile Responsiveness

The widget is fully responsive:

- **Desktop (1200px+)** - Two column layout (main content + sidebar)
- **Tablet (900px-1200px)** - Two column layout with adjusted spacing
- **Mobile (<900px)** - Single column layout, stacked sections
- **Small Mobile (<480px)** - Optimized font sizes, touch-friendly buttons

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome

## Performance

- Minimal CSS (~15KB)
- Minimal JavaScript (~15KB)
- Single API call per page load
- Optimized images (lazy loading ready)
- No external dependencies

## SEO Considerations

The widget maintains semantic HTML structure:
- Proper heading hierarchy (h1 for title, h2 for sections)
- Structured metadata in sidebar
- Open Graph compatible (via page meta tags)
- Mobile-friendly and responsive

### Recommended Meta Tags for Squarespace Page

Add these to the page's SEO settings:

```html
<meta property="og:type" content="event" />
<meta property="og:title" content="[Event Title]" />
<meta property="og:description" content="[Event Description]" />
<meta property="og:image" content="[Event Poster URL]" />
```

## Security

- HTML escaping on all user-provided content
- Event ID validation (alphanumeric and hyphens only)
- No inline JavaScript execution from API data
- Safe external link handling (target="_blank" with proper attributes)

## Troubleshooting

### Widget Not Loading

**Problem**: Widget doesn't appear on page
- Check that container `<div id="cur8-event-detail"></div>` exists
- Verify script and CSS files are loading (check browser DevTools)
- Check browser console for errors

### Event Not Displaying

**Problem**: Loading spinner appears but never completes
- Verify event ID is valid: `?event=23121`
- Check browser network tab for API response
- Verify Cur8 API is accessible from your domain

### Styling Issues

**Problem**: Styles not applied correctly
- Check CSS file is loading
- Clear browser cache
- Verify CSS file path is correct
- Check for conflicting Squarespace styles

### Query Parameter Not Working

**Problem**: Event ID not being read from URL
- Verify format: `?event=23121` (not `?eventId=` or `?id=`)
- Check for URL encoding issues
- Verify event ID contains only alphanumeric characters and hyphens

## Advanced Usage

### Custom Event Loading

```javascript
const widget = new Cur8EventDetailPage();

// Load specific event programmatically
widget.eventId = '23121';
widget.load();
```

### Event Change Detection

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const widget = new Cur8EventDetailPage();
  
  // Monitor URL changes
  window.addEventListener('popstate', () => {
    widget.eventId = widget.getEventIdFromUrl();
    widget.load();
  });
  
  widget.load();
});
```

### Custom Styling

Override CSS variables and styles by adding custom CSS after the widget CSS:

```css
:root {
  --cur8-primary: #your-color;
}

.cur8-event-detail-page {
  font-family: 'Your Font Family';
}
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify all files are correctly uploaded
3. Test with a known valid event ID
4. Check Cur8 API documentation
5. Review browser compatibility

## License

Cur8 Event Detail Page Widget - Copyright 2026

## Changelog

### Version 1.0.0 (2026-05-10)
- Initial release
- Full event details display
- Query parameter loading
- Responsive design
- Social sharing
- Error handling
