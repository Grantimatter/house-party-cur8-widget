# Sold-Out Notifier Feature

## Overview

The Event Detail Page Widget now includes an intelligent sold-out notifier that displays urgency banners when events are running low on tickets.

## How It Works

The widget automatically fetches seat availability data from the Cur8 house count API and displays color-coded urgency notifications at the top of the event hero section.

### API Endpoint

```
https://cur8.com/api/public/scheduled-items/<eventId>/house-count
```

### Response Structure

```json
{
  "count": 15,
  "sold_count": 15,
  "held_count": 15,
  "total_count": 17
}
```

### Available Seats Calculation

```
available_seats = total_count - (sold_count + held_count)
```

## Notification Thresholds

The widget displays different notifications based on availability:

| Status | Condition | Display | Color |
|--------|-----------|---------|-------|
| **Sold Out** | 0 available seats | 🚫 SOLD OUT | Red (#dc3545) |
| **Almost Gone** | 1-2 seats left | ⚠️ ONLY X LEFT | Red (#ff6b6b) |
| **Limited** | ≤10% capacity | ⏰ HURRY - X% LEFT | Orange (#ff9500) |
| **Available** | >10% capacity | (no banner) | - |

## Visual Design

### Banner Appearance

- **Position**: Top of hero image section
- **Height**: Auto-sizing based on content
- **Animation**: Subtle pulse effect (1.5s loop)
- **Z-index**: Above other elements for visibility
- **Text**: Bold, white, centered
- **Responsive**: Adapts font size for mobile

### Animation Details

The banner uses a pulse animation that continuously draws attention:

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
```

This creates a gentle fading effect that catches the eye without being distracting.

## Implementation Details

### JavaScript Changes

**New Constructor Property:**
```javascript
this.houseCountUrl = options.houseCountUrl || 'https://cur8.com/api/public/scheduled-items';
```

**New Methods:**

1. **loadHouseCount()** - Fetches seat availability
2. **getAvailabilityPercentage()** - Calculates available percentage
3. **getSoldOutStatus()** - Determines notification status

### CSS Changes

**New Styles:**

```css
.cur8-event-urgency-banner {
  /* Banner styling */
  /* Animation */
}

@keyframes pulse {
  /* Pulse animation */
}
```

**Responsive Updates:**
- Tablet (768px): Reduced font size to 16px, padding to 12px
- Mobile (480px): Further reduced to 14px font, 10px padding

## Testing

### Local Testing

1. Open `test_event_detail.html?event=<event_id>`
2. Widget will:
   - Fetch event details
   - Fetch house count data
   - Display banner if applicable

### Test Scenarios

**Sold Out Event:**
```
total_count: 100
sold_count: 100
held_count: 0
Result: Shows "🚫 SOLD OUT" in red
```

**Almost Gone:**
```
total_count: 100
sold_count: 98
held_count: 1
Result: Shows "⚠️ ONLY 1 LEFT" in red
```

**Limited Availability:**
```
total_count: 100
sold_count: 85
held_count: 5
Result: Shows "⏰ HURRY - 10% LEFT" in orange
```

**Plenty Available:**
```
total_count: 100
sold_count: 50
held_count: 20
Result: No banner displayed
```

## Customization

### Change Thresholds

Edit `cur8-event-detail-page.js` in the `getSoldOutStatus()` method:

```javascript
getSoldOutStatus() {
  // Change these thresholds:
  if (available <= 0) { ... }           // Sold out
  else if (available <= 5) { ... }      // Change from 2 to 5
  else if (available <= Math.ceil(...)) // Change percentage
}
```

### Change Colors

Edit `cur8-event-detail-page.css`:

```css
.cur8-event-urgency-banner {
  /* Modify these colors */
  background-color: #your-color;
}
```

Or in JavaScript `getSoldOutStatus()`:

```javascript
return { 
  status: 'sold-out', 
  message: '🚫 SOLD OUT', 
  color: '#your-hex-color'  /* Change here */
};
```

### Change Icons/Messages

Edit the message strings in `getSoldOutStatus()`:

```javascript
message: '🚫 SOLD OUT'           // Sold out icon/text
message: '⚠️ ONLY ' + available + ' LEFT'   // Almost gone
message: '⏰ HURRY - ' + percentage + '% LEFT'  // Limited
```

### Change Animation

Edit `cur8-event-detail-page.css`:

```css
.cur8-event-urgency-banner {
  animation: pulse 1.5s ease-in-out infinite;  /* Adjust timing/easing */
}

@keyframes pulse {
  /* Modify animation keyframes */
}
```

## Performance Impact

- **Single additional API call** per page load
- **Graceful degradation** if API fails (page still displays)
- **Minimal processing** for calculations
- **No blocking** - house count loaded in parallel with event data

## Error Handling

If the house count API fails:
- Widget continues to load and display the event
- No error message shown (silent fail)
- Event displays without urgency banner
- Console shows warning for debugging

## Browser Compatibility

All modern browsers support:
- CSS animations (pulse effect)
- Fetch API for requests
- Z-index stacking
- Absolute positioning

## Mobile Experience

### Responsive Breakpoints

| Screen Size | Font Size | Padding | Notes |
|-------------|-----------|---------|-------|
| Desktop | 18px | 16px 30px | Full sized |
| Tablet (768px) | 16px | 12px 20px | Compact |
| Mobile (480px) | 14px | 10px 15px | Very compact |

### Touch Interaction

- Large enough to read on small screens
- Doesn't interfere with hero image viewing
- Animation remains subtle for mobile devices

## SEO Impact

- No negative impact
- Additional banner is semantic HTML
- Doesn't hide content
- Improves user engagement signals

## Analytics Considerations

The banner helps track:
- Which events are near sell-out
- User behavior on low-availability events
- Conversion rates on urgent events
- Peak demand times

## Future Enhancements

Possible improvements:
- Time-based urgency (X hours until event)
- Inventory tracking dashboard
- Automatic email alerts for interested users
- Waitlist integration
- Dynamic threshold adjustment based on demand

## Troubleshooting

### Banner not showing even for sold-out events

**Cause**: House count API not returning data
**Solution**: 
1. Check event ID is correct
2. Verify Cur8 API is accessible
3. Check network tab in DevTools

### Banner shows but with wrong count

**Cause**: House count data includes held tickets
**Solution**: This is correct - held seats are unavailable

### Animation too fast/slow

**Cause**: Animation speed preference
**Solution**: Adjust animation timing in CSS

## Files Modified

1. **cur8-event-detail-page.js**
   - Added houseCountUrl property
   - Added loadHouseCount() method
   - Added getAvailabilityPercentage() method
   - Added getSoldOutStatus() method
   - Updated renderHeroSection() to include banner

2. **cur8-event-detail-page.css**
   - Added .cur8-event-urgency-banner styles
   - Added @keyframes pulse animation
   - Added responsive styles for tablet/mobile

## Deployment Notes

- No breaking changes
- Fully backward compatible
- Old installations will not show banner until updated
- Safe to deploy immediately
- No additional dependencies

---

## Summary

The sold-out notifier provides real-time visibility into event availability, helping users make purchase decisions faster and improve conversion rates for events with limited inventory.
