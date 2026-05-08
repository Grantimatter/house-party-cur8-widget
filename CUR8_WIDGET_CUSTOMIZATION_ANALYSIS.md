# Cur8 Widget Customization Analysis

## Current Architecture

### API Endpoints Available
The cur8 widget exposes the following public API endpoints (via `cur8Widget.envUrl`):

1. **Events by Client ID**
   - URL: `https://cur8.com/api/public/clients/{clientId}/events`
   - Returns: `{ events: [...] }`
   - Contains: Full event data including dates, pricing, venue info, descriptions

2. **Single Event by Event ID**
   - URL: `https://cur8.com/api/public/events/{eventId}`
   - Returns: `{ event: {...} }`
   - Contains: All event details for a single event

### Current HTML Structure
The widget generates the following class-based structure that you can style:

```
cur8-widget-wrapper
├── cur8-widget-wrapper__event (repeats for each event)
│   ├── cur8-widget-wrapper__event__image
│   │   ├── cur8-widget-wrapper__event__image__name (optional - only if no poster)
│   │   └── <img>
│   ├── cur8-widget-wrapper__event__info
│   │   ├── (event dates rendered here)
│   │   ├── cur8-widget-wrapper__event__button
│   │   │   └── <button> or <a>
│   │   └── cur8-widget-wrapper__event__info__address
│   └── cur8-widget-wrapper__event__info__price
│       └── cur8-widget-wrapper__event__info__price__option (repeats per pricing tier)
└── (modals for date selection)
```

### Data Available in Event Objects
Each event from the API contains:

```json
{
  "id": "event_id",
  "client_id": "client_id",
  "event_name": "string",
  "name": "string (alternative field)",
  "description": "string (description field EXISTS)",
  "event_type": "Concert|Video On Demand|Fee|Merchandise|Trip|...",
  "timezone": "America/Chicago",
  "poster_graphic_url": "url",
  "venue": {
    "name": "Venue Name",
    "address": "123 Main St",
    "city": "City",
    "state": "ST",
    "zip": "12345"
  },
  "pricing_options": [
    {
      "desc": "General Admission",
      "amount": 25.00
    }
  ],
  "event_dates": [
    {
      "id": "date_id",
      "event_datetime_local": "2026-05-08T20:00:00",
      "event_name_subtitle": "optional subtitle"
    }
  ]
}
```

## Assessment: CSS-Only Customization

### ✅ What's Achievable with CSS Alone
1. **Layout & Styling**
   - Change from grid to different layouts (flexbox, different grid arrangements)
   - Modify colors, fonts, spacing
   - Hide/show event sections via `display: none`
   - Reorder visual elements via CSS order/flexbox
   - Create custom event card designs

2. **Limited Display of Additional Info**
   - The widget already renders venue address in `.cur8-widget-wrapper__event__info__address`
   - Pricing options display in `.cur8-widget-wrapper__event__info__price`
   - Event dates are rendered

3. **Example CSS Enhancements**
   ```css
   /* Change to horizontal layout */
   .cur8-widget-wrapper__event {
     display: flex;
     flex-direction: row;
   }

   /* Hide pricing section */
   .cur8-widget-wrapper__event__info__price {
     display: none;
   }

   /* Add custom styling */
   .cur8-widget-wrapper__event__info__address {
     font-size: 12px;
     color: #666;
     margin-top: 10px;
   }
   ```

### ❌ What Requires More Than CSS
The **description field** is the key limitation. While it exists in the API response, it's **not rendered** in the generated HTML by `cur8-widget.js`. This means:

1. **CSS Cannot Display Hidden Data** - You cannot make CSS display data that isn't in the DOM
2. **Need for JavaScript Enhancement** - To display the description, you must:
   - Query the API directly (you have the endpoint and client ID)
   - Inject the description into the DOM
   - Then style it with CSS

## Recommended Approach: Hybrid Solution

### Option 1: CSS-Only (Limited)
**Effort:** Low | **Result Quality:** Medium

Use CSS to customize the existing layout and styling. Works best if descriptions aren't critical.

```html
<style>
  /* Customize the grid layout */
  .cur8-widget-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 20px;
  }

  /* Make cards more custom */
  .cur8-widget-wrapper__event {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* Hide elements you don't need */
  .cur8-widget-wrapper__event__info__price {
    display: none;
  }

  /* Enhance address styling */
  .cur8-widget-wrapper__event__info__address {
    font-size: 13px;
    color: #555;
    margin: 10px 0;
    padding: 0 10px;
  }
</style>
```

### Option 2: Custom JavaScript Widget (Recommended)
**Effort:** Medium-High | **Result Quality:** High

Create a custom wrapper that:
1. Fetches events via the public API
2. Builds complete HTML including descriptions
3. Provides full styling control
4. Maintains cur8 ticket purchasing functionality via links

**Benefits:**
- Display full event descriptions
- Complete control over layout and styling
- Show any API fields (tags, age restrictions, etc.)
- No dependency on cur8's HTML structure changes

**Example structure:**
```javascript
// 1. Fetch events from the API
fetch(`https://cur8.com/api/public/clients/{clientId}/events`)
  .then(res => res.json())
  .then(data => {
    // 2. Build custom HTML with descriptions
    const html = data.events.map(event => `
      <div class="custom-event-card">
        <img src="${event.poster_graphic_url}" />
        <h3>${event.event_name}</h3>
        <p>${event.description}</p>  <!-- ← Descriptions now included -->
        <div>${event.venue.name}</div>
        <button onclick="window.open('...')">Buy Tickets</button>
      </div>
    `).join('');
    
    // 3. Insert into DOM
    document.getElementById('events').innerHTML = html;
  });
```

## Summary Table

| Feature | CSS-Only | Custom JS | Notes |
|---------|----------|-----------|-------|
| Change layout | ✅ | ✅ | CSS can use flexbox/grid |
| Customize styling | ✅ | ✅ | Full control with custom JS |
| Display descriptions | ❌ | ✅ | Descriptions exist in API but not in rendered HTML |
| Display pricing | ✅ | ✅ | Already rendered; CSS can enhance |
| Display venue info | ✅ | ✅ | Already rendered; CSS can enhance |
| Custom event cards | ~ | ✅ | Limited by cur8's structure vs full control |
| Maintain ticket links | ✅ | ✅ | Both preserve functionality |

## Next Steps

1. **If descriptions aren't critical:** Start with CSS customization using the examples above
2. **If descriptions are needed:** I recommend building a custom JavaScript widget that:
   - Uses the same public API
   - Generates your own HTML structure
   - Includes all event details you want
   - Links back to cur8's ticket purchase system

Would you like me to:
- Create custom CSS examples for specific layouts?
- Build a custom JavaScript widget template that includes descriptions?
- Provide a hybrid approach that extends cur8's widget with descriptions via JavaScript injection?
