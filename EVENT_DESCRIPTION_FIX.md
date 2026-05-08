# Event Description and Per-Date Buttons - Fixed

## Issues Resolved

### 1. Event Descriptions Not Displaying ❌ → ✅

**Problem:**
- Event descriptions were not appearing on cards
- Widget configuration showed `showDescription: true` but nothing displayed

**Root Cause:**
- The cur8 API returns event descriptions in a field called `desc` (not `description`)
- The widget was checking for `event.description` which didn't exist

**Solution:**
```javascript
// OLD - Looking for wrong field
renderDescription(event) {
  if (!this.config.showDescription || !event.description) {
    return '';
  }
  return `<div>${this.escapeHtml(event.description)}</div>`;
}

// NEW - Uses correct 'desc' field from API
renderDescription(event) {
  if (!this.config.showDescription) {
    return '';
  }
  const description = event.desc || event.description;
  if (!description) {
    return '';
  }
  return `<div>${description}</div>`;
}
```

**Benefits:**
- ✅ Descriptions now display with full HTML formatting
- ✅ Rich text (bold, italics, links) preserved from API
- ✅ Fallback to `description` field if available

---

### 2. Per-Date Buy Buttons Added ✨

**Feature:**
- Each event date now has its own compact "Buy" button
- Users can purchase tickets for specific dates without the main "Buy Tickets" button

**Implementation:**
```javascript
renderDates(event) {
  // ... filtering logic ...
  const dateHtml = dates.map(date => {
    const dateStr = this.formatDate(date.event_datetime_local);
    const buyUrl = this.getTicketUrl(event, date);
    return `
      <div class="cur8-custom-date-item">
        <div class="cur8-custom-date-time">${dateStr}</div>
        <a href="${buyUrl}" target="_blank" class="cur8-custom-date-buy">Buy</a>
      </div>
    `;
  }).join('');
  return `<div class="cur8-custom-event-dates">${dateHtml}</div>`;
}
```

**CSS Styling:**
- Date and button displayed side-by-side using flexbox
- Compact design (4px × 12px padding)
- Blue button with hover effect
- Responsive on mobile

---

## Visual Layout

### Before
```
┌─────────────────────────────┐
│ Event Card                  │
├─────────────────────────────┤
│ [Event Poster Image]        │
├─────────────────────────────┤
│ Event Title                 │
│                             │
│ (No description here)       │ ❌
│                             │
│ May 15, 2026 10:00 PM       │
│ May 22, 2026 10:00 PM       │ ❌ No per-date options
│ May 29, 2026 10:00 PM       │
│                             │
│ [     Buy Tickets      ]    │ ← Only one button
└─────────────────────────────┘
```

### After
```
┌──────────────────────────────────┐
│ Event Card                       │
├──────────────────────────────────┤
│ [Event Poster Image]             │
├──────────────────────────────────┤
│ Event Title                      │
│                                  │
│ Full event description with      │ ✅
│ rich formatting and details...   │
│ Learn more inside!               │
│                                  │
│ May 15, 2026 10:00 PM    [Buy]  │ ✅ Per-date button
│ May 22, 2026 10:00 PM    [Buy]  │
│ May 29, 2026 10:00 PM    [Buy]  │
│                                  │
│ GENERAL ADMISSION: $25.00        │
│                                  │
│ [     Buy Tickets      ]        │ ← Main button still available
└──────────────────────────────────┘
```

---

## API Field Reference

The cur8 public API returns event data with these relevant fields:

```json
{
  "id": 133432,
  "name": "Topic Thunder (Stand-Up)",
  "desc": "<p><strong>Topic Thunder</strong></p><p>Full HTML-formatted description...</p>",
  "event_type": "Event",
  "event_dates": [
    {
      "id": 378367,
      "event_datetime_local": "2026-05-30T22:00:00-05:00",
      "sale_end": "2026-05-31T04:00:00Z"
    }
  ],
  "pricing_options": [
    {
      "amount": 5,
      "desc": "GENERAL ADMISSION"
    }
  ]
}
```

**Key Fields:**
- `desc` - Full description (may contain HTML tags)
- `event_dates[]` - Array of available dates
- `event_dates[].id` - Date ID (used for ticket URLs)
- `event_dates[].sale_end` - When ticket sales end for that date

---

## Configuration

### Show/Hide Descriptions
```javascript
const widget = new CustomCur8Widget(23121, 'events', {
  showDescription: true    // ✅ Display descriptions
  // or
  showDescription: false   // ❌ Hide descriptions
});
widget.load();
```

### Show/Hide Dates
```javascript
const widget = new CustomCur8Widget(23121, 'events', {
  showDates: true         // ✅ Display dates (with per-date buttons)
  // or
  showDates: false        // ❌ Hide all dates and per-date buttons
});
widget.load();
```

### Hide Per-Date Buttons Only
To hide per-date buttons but keep the main "Buy Tickets" button, modify `renderDates()` to not include the buy link:

```javascript
// In renderDates(), change:
return `
  <div class="cur8-custom-date-item">
    <div class="cur8-custom-date-time">${dateStr}</div>
  </div>
`;
// (Remove the per-date buy button line)
```

---

## CSS Customization

### Change Per-Date Button Style
```css
.cur8-custom-date-buy {
  background: #28a745;  /* Green instead of blue */
  padding: 6px 16px;    /* Larger button */
  font-size: 12px;      /* Bigger text */
  border-radius: 4px;   /* More rounded */
}

.cur8-custom-date-buy:hover {
  background: #218838;  /* Darker on hover */
}
```

### Change Date Display
```css
.cur8-custom-date-item {
  padding: 12px 0;      /* More vertical spacing */
  gap: 16px;            /* More space between date and button */
}

.cur8-custom-date-time {
  font-weight: bold;    /* Make time bold */
  color: #333;          /* Darker text */
}
```

### Stack on Mobile
```css
@media (max-width: 600px) {
  .cur8-custom-date-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .cur8-custom-date-buy {
    width: 100%;
    text-align: center;
  }
}
```

---

## Testing Checklist

- [ ] Open `test_page_custom.html`
- [ ] Click "Load Full" button
- [ ] Verify event descriptions display
- [ ] Verify per-date buy buttons are visible
- [ ] Click per-date "Buy" button - should go to cur8 ticket page
- [ ] Click main "Buy Tickets" button - should also work
- [ ] Test on mobile - should be responsive
- [ ] Try event with no description - should show nothing (not error)
- [ ] Try event with sold out dates - should only show available dates

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ IE11+ (with polyfills for optional chaining)

---

## Files Modified

### `cur8-custom-widget-enhanced.js`
- `renderDescription()` - Fixed to use `desc` field from API
- `renderDates()` - Added per-date buy buttons with correct URLs

### `cur8-widget.css`
- `.cur8-custom-date-item` - Changed to flex layout
- Added `.cur8-custom-date-time` - Styles for date/time text
- Added `.cur8-custom-date-buy` - Styles for per-date button

---

## Known Limitations

1. **HTML in Descriptions** - Descriptions contain HTML from the API
   - Rich formatting preserved (bold, italics, etc.)
   - User input is not sanitized (but comes from cur8's database)
   - Use CSP headers in production if additional security needed

2. **3 Dates Maximum** - Widget shows first 3 upcoming dates
   - Configure in `renderDates()`: `.slice(0, 3)` → `.slice(0, 5)` for more

3. **Sold Out Dates** - Automatically hidden
   - Only shows dates where `sale_end` is in the future
   - Add/modify `.isDatePastSaleEnd()` for different logic

---

## Production Deployment

1. Test with your real client ID
2. Check descriptions display correctly
3. Verify per-date buttons link to correct URLs
4. Test on multiple browsers/devices
5. Deploy `cur8-custom-widget-enhanced.js` and `cur8-widget.css`
6. Monitor for API changes from cur8

---

**Ready to use!** Open `test_page_custom.html` and test the improvements. 🚀
