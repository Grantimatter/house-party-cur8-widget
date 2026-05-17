# Cur8 Event Detail Page Widget - Quick Reference

## What You Get

A complete single-event detail page widget for Squarespace with professional styling and comprehensive event information.

## Files

| File | Size | Purpose |
|------|------|---------|
| `cur8-event-detail-page.js` | 15 KB | Main widget logic |
| `cur8-event-detail-page.css` | 16 KB | Styling and responsive design |
| `test_event_detail.html` | 435 B | Local testing template |
| `EVENT_DETAIL_PAGE_GUIDE.md` | 9.5 KB | Full documentation |

## Quick Setup (2 Minutes)

### Option 1: Squarespace Code Injection (Easiest)

1. **Create "event" page** in Squarespace

2. **Upload files** to your web server or CDN (get the URLs)

3. **Add code injection** (Squarespace → Settings → Advanced → Code Injection → Header):
   ```html
   <link rel="stylesheet" href="https://yourcdn.com/cur8-event-detail-page.css">
   <script src="https://yourcdn.com/cur8-event-detail-page.js"></script>
   ```

4. **Add Code Block** to the page:
   ```html
   <div id="cur8-event-detail"></div>
   ```

5. **Done!** Link to events with: `https://yoursite.com/event?event=23121`

### Option 2: Local Testing

1. Download both CSS and JS files
2. Open `test_event_detail.html?event=23121` in browser
3. Widget loads and displays event details

## Usage

```
https://yourdomain.com/event?event=23121     ✅ Works
https://yourdomain.com/event?event=abc-456   ✅ Works
https://yourdomain.com/event                 ❌ Error (no ID)
https://yourdomain.com/event?event=invalid!  ❌ Error (bad chars)
```

## What Displays

The widget shows:

- **Hero Section** - Large event image with title overlay
- **Event Dates** - All upcoming dates with individual "Get Tickets" buttons
- **Venue Info** - Name, address, Google Maps link
- **Pricing** - All ticket price tiers
- **Description** - Full event details
- **Metadata** - Quick info sidebar (date, venue, type)
- **Share Buttons** - Facebook, Twitter, LinkedIn, Copy Link
- **Main CTA** - Large "Get Your Tickets Now" button

## Customization

### Change Colors

Edit `cur8-event-detail-page.css`, find `:root` section:

```css
:root {
  --cur8-primary: #007bff;        /* Blue buttons */
  --cur8-primary-dark: #0056b3;   /* Darker blue on hover */
  --cur8-text-primary: #333;      /* Main text */
}
```

### Change Layout

All responsive breakpoints are in the CSS:
- Desktop (1200px+): 2-column layout
- Tablet (900px-1200px): 2-column adjusted
- Mobile (<900px): 1-column stacked
- Small Mobile (<480px): Optimized for phones

### Disable Features

To hide sections, add to Squarespace's CSS:

```css
.cur8-event-share-card { display: none; }
.cur8-event-sidebar { display: none; }
.cur8-event-pricing-section { display: none; }
```

## How It Works

1. **User visits** `yoursite.com/event?event=23121`
2. **Widget extracts** event ID from URL (`23121`)
3. **Widget validates** the ID format
4. **Widget fetches** event data from Cur8 API
5. **Widget renders** all event details beautifully
6. **Error handling** if anything goes wrong

## Security

✅ HTML escaping on all user content
✅ Event ID format validation
✅ Safe external links
✅ No inline JavaScript from API

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Widget not showing | Check container `<div id="cur8-event-detail"></div>` exists |
| Files not loading | Verify CSS/JS URLs are correct |
| Event not displaying | Check event ID format: `?event=23121` |
| Styling broken | Clear browser cache |
| API error | Verify Cur8 API is accessible |

## Advanced Options

### Custom Container ID

In Squarespace, change the div and update the JS:

```html
<div id="my-custom-container"></div>

<script>
  const widget = new Cur8EventDetailPage({
    containerId: 'my-custom-container'
  });
  widget.load();
</script>
```

### Custom API Endpoint

```javascript
const widget = new Cur8EventDetailPage({
  apiUrl: 'https://your-api.com/events',
  ticketDomain: 'https://your-domain.com'
});
widget.load();
```

## Mobile-Friendly

✅ Fully responsive design
✅ Touch-friendly buttons
✅ Mobile-optimized font sizes
✅ Single column layout on phones
✅ Tested on iOS and Android

## Performance

- Minimal file sizes (15KB each)
- Single API call per load
- No external dependencies
- Fast rendering
- SEO-friendly HTML

## Examples

### Link from Events List
```html
<a href="/event?event=23121">View Event Details</a>
```

### Link from Social Media
```
https://yourdomain.com/event?event=23121
```

### Generate Link in JavaScript
```javascript
function getEventUrl(eventId) {
  return `/event?event=${eventId}`;
}

// Usage
window.location.href = getEventUrl(23121);
```

## Support

Refer to `EVENT_DETAIL_PAGE_GUIDE.md` for:
- Complete API reference
- Detailed customization guide
- SEO best practices
- Print styles
- Accessibility features

## Tips

1. **Use descriptive page names** - Squarespace SEO benefits from clear page names
2. **Add meta descriptions** - For better search results
3. **Test with real events** - Before going live
4. **Monitor console** - For any error messages
5. **Use HTTPS URLs** - For file hosting

## What's Included

✅ Professional styling
✅ Full responsive design
✅ Mobile optimization
✅ Error handling
✅ Social sharing
✅ Print-friendly
✅ Accessibility features
✅ No dependencies
✅ Auto-initialization
✅ Easy customization

---

**Ready to deploy!** 🚀

All files are production-ready and can be used immediately with Squarespace.
