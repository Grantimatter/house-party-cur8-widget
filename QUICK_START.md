# Quick Start Guide - Extending Cur8's Widget

## TL;DR

You can extend cur8's widget in two ways, **without modifying the original script**:

### Option 1: Custom Widget (Recommended) ⭐
Use this if you want full control, descriptions, and custom layouts.

```html
<!-- 1. Load the custom widget script -->
<script src="cur8-custom-widget-enhanced.js"></script>

<!-- 2. Load the stylesheet -->
<link rel="stylesheet" href="cur8-widget.css">

<!-- 3. Create a container -->
<div id="my-events"></div>

<!-- 4. Initialize -->
<script>
  const widget = new CustomCur8Widget(23121, 'my-events');
  widget.load();
</script>
```

**Features:**
- ✅ Event descriptions
- ✅ Custom layouts (grid, list, masonry, etc.)
- ✅ Full CSS control
- ✅ Responsive design
- ✅ Independent (doesn't need official widget)

**Try it:** Open `test_page_custom.html` in your browser

---

### Option 2: Enhance Official Widget
Use this if you want to keep the official widget and just add descriptions.

```html
<!-- 1. Load official widget -->
<script src='https://d37q8qd8th5h3w.cloudfront.net/static/widget.js'></script>

<!-- 2. Load enhancement script -->
<script src="cur8-widget-enhancement.js"></script>
<link rel="stylesheet" href="cur8-widget-enhancement.css">

<!-- 3. Use as normal -->
<div id='cur8-container'></div>
<script>
  cur8Widget.loadEvents(23121);
</script>
```

**Features:**
- ✅ Event descriptions injected
- ✅ Event type styling
- ✅ Availability indicators
- ✅ Minimal code changes

**Try it:** Open `test_page.html` in your browser

---

## Key Differences

| | Custom Widget | Enhanced Official |
|---|---|---|
| **Setup** | 5 minutes | 2 minutes |
| **Descriptions** | ✅ Full | ✅ Added |
| **Layout control** | ✅ Full | ❌ Limited |
| **File size** | ~10KB | ~6KB |
| **Break risk** | ❌ None | ✅ If cur8 updates |
| **Best for** | Production sites | Quick tweaks |

---

## Configuration Options (Custom Widget)

```javascript
const widget = new CustomCur8Widget(clientId, containerId, {
  showDescription: true,      // Show event descriptions
  showVenue: true,            // Show venue info
  showPricing: true,          // Show ticket prices
  showDates: true,            // Show event dates
  sortByDate: true,           // Sort by earliest date
  dateFormat: 'LLLL',         // moment.js format
  ticketDomain: 'https://cur8.com'
});
widget.load();
```

---

## Styling Your Widget

### Custom Widget CSS
Edit `cur8-widget.css` to change:
- `.cur8-custom-wrapper` - Main grid layout
- `.cur8-custom-event` - Event cards
- `.cur8-custom-button-primary` - Ticket button

### Alternative Layouts
Uncomment in `cur8-widget.css`:
- **Horizontal list** - One event per row
- **Masonry** - Pinterest-style layout

---

## Common Tasks

### Change grid columns
```css
.cur8-custom-wrapper {
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
}
```

### Hide descriptions
```javascript
const widget = new CustomCur8Widget(23121, 'events', {
  showDescription: false
});
widget.load();
```

### Change button color
```css
.cur8-custom-button-primary {
  background: #ff6b6b;
}

.cur8-custom-button-primary:hover {
  background: #cc5555;
}
```

### Show only upcoming dates
Events already sorted by date by default. Modify `cur8-custom-widget-enhanced.js` if you need filters.

---

## Troubleshooting

### Events not loading
1. Check console for errors
2. Verify client ID is correct
3. Check network tab - API should return 200
4. Make sure cur8.com API is accessible from your domain

### Styling not applying
1. Make sure `cur8-widget.css` is loaded
2. Check CSS class names (`.cur8-custom-*`)
3. Use browser dev tools to inspect elements
4. Check for specificity conflicts with other CSS

### Descriptions not showing
1. For custom widget - make sure API response includes `description` field
2. For enhancement - check that descriptions were injected (inspect HTML)

---

## File Structure

```
project/
├── cur8-widget.js                    (official - don't modify)
├── cur8-custom-widget-enhanced.js    (⭐ main widget class)
├── cur8-widget.css                   (⭐ styling)
├── cur8-widget-enhancement.js        (alternative enhancement)
├── cur8-widget-enhancement.css       (enhancement styling)
├── test_page_custom.html             (⭐ working example)
├── test_page.html                    (original example)
├── EXTENDING_CUR8_WIDGET.md          (detailed docs)
├── IMPLEMENTATION_COMPARISON.md      (compare approaches)
└── QUICK_START.md                    (this file)
```

---

## Production Checklist

Before going live:

- [ ] Test with real client ID
- [ ] Test on mobile devices
- [ ] Check that ticket links work
- [ ] Verify descriptions display correctly
- [ ] Test with events that have no description
- [ ] Check loading performance
- [ ] Test error scenarios (API down)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Need Help?

1. **Read:** `EXTENDING_CUR8_WIDGET.md` - Detailed explanation of all approaches
2. **Compare:** `IMPLEMENTATION_COMPARISON.md` - Feature comparison table
3. **Review:** `test_page_custom.html` - Working example with explanations
4. **Check:** `cur8-custom-widget-enhanced.js` - Well-commented source code

---

## Key Points

✅ **You don't modify cur8-widget.js** - It's completely untouched  
✅ **API access** - Public endpoints available without authentication  
✅ **Ticket links** - Preserved and working in both approaches  
✅ **CSS customization** - Full control with custom widget approach  
✅ **Descriptions** - Available in both approaches  

---

## Deploy It

### Step 1: Copy files to your server
```bash
cp cur8-custom-widget-enhanced.js /your/server/
cp cur8-widget.css /your/server/
```

### Step 2: Add to your HTML
```html
<script src="/path/to/cur8-custom-widget-enhanced.js"></script>
<link rel="stylesheet" href="/path/to/cur8-widget.css">

<div id="events"></div>

<script>
  const widget = new CustomCur8Widget(YOUR_CLIENT_ID, 'events');
  widget.load();
</script>
```

### Step 3: Customize CSS
Edit `cur8-widget.css` to match your design.

### Step 4: Test and deploy
Test on all devices, then push to production!

---

**Ready?** Start with `test_page_custom.html` - it has everything you need! 🚀
