# Ticket URL Fix

## Problem
The "Buy Tickets" button was generating incorrect URLs:
- **Generated:** `https://cur8.com/schedule/client/23121` ❌ (404 error)
- **Correct:** `https://cur8.com/schedule/item/23121/380305?event=139536&date=380305` ✅

## Solution
Updated `cur8-custom-widget-enhanced.js` to use date-specific URLs like the official cur8 widget does.

### What Changed

**Before:**
```javascript
getTicketUrl(event) {
  return `${domain}/schedule/client/${event.client_id}`;
}
```

**After:**
```javascript
getTicketUrl(event, date = null) {
  // For regular events, use date-specific URL
  if (date) {
    return `${domain}/schedule/item/${event.client_id}/${date.id}?event=${event.id}&date=${date.id}`;
  }
  
  // For special event types (VOD, Fee, Merchandise, Trip)
  if (event.event_type === 'Video On Demand' || ...) {
    return `${domain}/${event.client_id}/project/${event.id}`;
  }
  
  // Fallback
  return `${domain}/schedule/client/${event.client_id}`;
}
```

### Button Logic
The "Buy Tickets" button now:
1. Finds the **first available date** (not yet sold out)
2. Generates a **date-specific purchase URL** with that date
3. Links directly to the ticket purchase page

### URL Format by Event Type

| Event Type | URL Format | Example |
|---|---|---|
| Regular (Concerts, etc.) | `/schedule/item/{clientId}/{dateId}?event={eventId}&date={dateId}` | `/schedule/item/23121/380305?event=139536&date=380305` |
| VOD/Fee/Merchandise/Trip | `/{clientId}/project/{eventId}` | `/23121/project/139536` |
| No available dates | `/schedule/client/{clientId}` | `/schedule/client/23121` |

## Testing

Open `test_page_custom.html` and try clicking "Buy Tickets" - it should now navigate to the correct cur8 purchase page.

## Files Updated
- `cur8-custom-widget-enhanced.js` - Ticket URL generation logic

## No Changes Needed
- `cur8-widget-enhancement.js` - Uses official widget's URLs (already correct)
- All CSS files - No CSS changes needed
- All HTML/test files - Already work with updated logic
