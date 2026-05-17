# Cur8 Event Detail Page Widget

A complete, production-ready single-event detail page widget for Squarespace. Display comprehensive event information dynamically using query parameters.

## ✨ Features

- **Dynamic Event Loading** - Load events via `?event=<event_id>` URL parameter
- **Single Event Display** - One event per page (enforced by URL structure)
- **Beautiful Design** - Professional, engaging layout with hero section
- **Mobile Responsive** - Works perfectly on desktop, tablet, and mobile
- **Complete Event Details** - Dates, times, venue, pricing, description
- **Social Sharing** - Built-in share buttons for Facebook, Twitter, LinkedIn
- **Error Handling** - Graceful error messages with helpful guidance
- **Zero Dependencies** - Standalone solution, no frameworks needed
- **Easy Setup** - 2-minute integration with Squarespace
- **Customizable** - Colors, fonts, spacing all easily configurable

## 📦 What's Included

```
✓ cur8-event-detail-page.js      - Main widget logic (15 KB)
✓ cur8-event-detail-page.css     - Professional styling (16 KB)
✓ test_event_detail.html         - Local testing template
✓ EVENT_DETAIL_PAGE_GUIDE.md     - Complete documentation
✓ EVENT_DETAIL_QUICK_START.md    - Quick reference guide
✓ WIDGET_FILES_SUMMARY.txt       - Project overview
```

## 🚀 Quick Start

### 1. Create Squarespace Page
- Go to Pages → Add Page
- Name: "event" (URL will be `/event`)

### 2. Upload Files
Upload to your server/CDN:
- `cur8-event-detail-page.css`
- `cur8-event-detail-page.js`

### 3. Add Code Injection
Squarespace → Settings → Advanced → Code Injection → Header:
```html
<link rel="stylesheet" href="https://your-cdn.com/cur8-event-detail-page.css">
<script src="https://your-cdn.com/cur8-event-detail-page.js"></script>
```

### 4. Add Code Block
Add this to your page:
```html
<div id="cur8-event-detail"></div>
```

### 5. Done! 🎉
Link to events:
```
https://yoursite.com/event?event=23121
```

## 📱 Display Layout

The widget displays:
- Hero image with event title
- All upcoming event dates with times
- Individual ticket buttons per date
- Venue information with Google Maps link
- Pricing tiers
- Full event description
- Event metadata sidebar
- Social sharing buttons
- Large call-to-action button

## 🛠️ Customization

Edit CSS variables in `cur8-event-detail-page.css`:
```css
:root {
  --cur8-primary: #007bff;        /* Main color */
  --cur8-text-primary: #333;      /* Text color */
  /* ... more variables */
}
```

## 🌐 URL Usage

Valid URLs:
```
https://yoursite.com/event?event=23121
https://yoursite.com/event?event=abc-123
https://yoursite.com/event?event=concert-2026-05-15
```

Invalid URLs (will show error):
```
https://yoursite.com/event                    ← no event ID
https://yoursite.com/event?eventId=23121      ← wrong parameter
https://yoursite.com/event?event=123@456      ← invalid chars
```

## 📚 Documentation

- **Quick Start** - See `EVENT_DETAIL_QUICK_START.md` (5 min read)
- **Full Guide** - See `EVENT_DETAIL_PAGE_GUIDE.md` (complete reference)
- **Project Info** - See `WIDGET_FILES_SUMMARY.txt` (overview)

## 🧪 Testing

### Local Testing
1. Download `test_event_detail.html`
2. Open in browser: `test_event_detail.html?event=23121`
3. Widget loads and displays the event

### Live Testing
1. Upload files to Squarespace
2. Visit: `https://yoursite.com/event?event=23121`
3. Verify all sections display correctly

## 💻 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Android Chrome

## 📊 Performance

- Minimal file sizes (15 KB JavaScript + 16 KB CSS)
- Single API call per page load
- No external dependencies
- Fast rendering
- SEO-friendly

## ⚙️ Technical Details

- **Language**: Pure JavaScript & CSS (no frameworks)
- **API**: Cur8 public API integration
- **Responsive**: Mobile-first design
- **Security**: HTML escaping, input validation
- **Accessibility**: WCAG compliance

## 🎨 Styling Features

- Responsive grid layouts
- Mobile optimization
- Print-friendly styles
- Customizable color scheme
- Smooth animations
- Professional typography
- Accessibility standards

## 🔒 Security

- HTML escaping on all user content
- Event ID format validation
- Safe external link handling
- No inline script execution

## ❓ Troubleshooting

**Widget not showing?**
- Check container `<div id="cur8-event-detail"></div>` exists
- Verify CSS/JS files are loading (DevTools)
- Check browser console for errors

**Event not displaying?**
- Verify event ID format: `?event=23121`
- Check Cur8 API is accessible
- Check network tab for API response

**Styling broken?**
- Clear browser cache
- Verify CSS file is loaded
- Check for Squarespace style conflicts

See `EVENT_DETAIL_PAGE_GUIDE.md` for more troubleshooting.

## 📝 Features Checklist

- ✅ Dynamic event loading via query parameter
- ✅ Single event per page enforcement
- ✅ Hero image with title overlay
- ✅ All event dates display
- ✅ Individual ticket links per date
- ✅ Venue information with map link
- ✅ Pricing tiers display
- ✅ Full description support
- ✅ Event metadata sidebar
- ✅ Social sharing buttons
- ✅ Large CTA button
- ✅ Mobile responsive
- ✅ Error handling
- ✅ Loading states
- ✅ Print friendly

## 🚀 Ready to Deploy

This widget is production-ready and can be deployed immediately:
- ✅ All features implemented
- ✅ Fully tested
- ✅ Comprehensive documentation
- ✅ No configuration needed
- ✅ Zero dependencies

## 📞 Support

For implementation help:
1. Check `EVENT_DETAIL_QUICK_START.md`
2. Refer to `EVENT_DETAIL_PAGE_GUIDE.md`
3. Review code comments in JS/CSS files

---

**Created**: May 10, 2026  
**Version**: 1.0.0  
**Status**: Production Ready  
**License**: Proprietary

For Squarespace integration assistance, see the quick start guide.
