# Extending Cur8's Widget Without Modification

## Overview

The cur8 widget uses a global `cur8Widget` object that can be extended after it loads. The key is intercepting or enhancing functionality **after** the original script runs, without modifying `cur8-widget.js`.

## Architecture Patterns

### Pattern 1: Monkey-Patching (Intercept & Enhance)

Replace the original `generateEvents` function with your own version that calls the original, then adds enhancements:

```javascript
// Wait for cur8Widget to load
if (window.cur8Widget) {
  const originalGenerateEvents = cur8Widget.generateEvents;
  
  // Replace with enhanced version
  cur8Widget.generateEvents = function(events, container, ...args) {
    // Call original to render base widget
    originalGenerateEvents.call(this, events, container, ...args);
    
    // Now enhance each event with descriptions
    events.forEach((event, index) => {
      const eventCard = container.querySelector(`[data-event-id="${index}"]`);
      if (eventCard) {
        const description = document.createElement('div');
        description.className = 'cur8-custom-description';
        description.textContent = event.description;
        eventCard.appendChild(description);
      }
    });
  };
}
```

**Pros:** Minimal, uses existing structure  
**Cons:** Depends on cur8's implementation details

### Pattern 2: Parallel Data Fetching

Fetch event data separately and merge with cur8's rendered output:

```javascript
async function enhanceWithDescriptions(clientId) {
  // Let cur8 render first
  cur8Widget.loadEvents(clientId);
  
  // Fetch full data in parallel
  const response = await fetch(
    `https://cur8.com/api/public/clients/${clientId}/events`
  );
  const { events } = await response.json();
  
  // Wait for cur8 to finish rendering
  setTimeout(() => {
    events.forEach((event, index) => {
      const eventCard = document.querySelector(
        '.cur8-widget-wrapper__event:nth-child(' + (index + 1) + ')'
      );
      if (eventCard && event.description) {
        const descDiv = document.createElement('div');
        descDiv.className = 'cur8-custom-description';
        descDiv.innerHTML = event.description;
        eventCard.appendChild(descDiv);
      }
    });
  }, 500); // Wait for cur8 to render
}

enhanceWithDescriptions(23121);
```

**Pros:** Clean separation, flexible  
**Cons:** Requires timing/mutation observer for robustness

### Pattern 3: Custom Widget Wrapper (Recommended)

Create a completely custom widget that maintains ticket link compatibility:

```javascript
class CustomCur8Widget {
  constructor(clientId, containerId) {
    this.clientId = clientId;
    this.containerId = containerId;
    this.events = [];
  }

  async load() {
    const response = await fetch(
      `https://cur8.com/api/public/clients/${this.clientId}/events`
    );
    const { events } = await response.json();
    this.events = events;
    this.render();
  }

  render() {
    const container = document.getElementById(this.containerId);
    const html = this.events.map((event, idx) => `
      <div class="custom-event-card" data-event-id="${idx}">
        <div class="event-image">
          <img src="${event.poster_graphic_url}" alt="${event.event_name}" />
        </div>
        <div class="event-content">
          <h3>${event.event_name}</h3>
          <p class="description">${event.description || 'No description'}</p>
          <div class="venue">${event.venue.name}</div>
          <div class="address">
            ${event.venue.city}, ${event.venue.state}
          </div>
          ${this.renderPricing(event)}
          ${this.renderButton(event)}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
  }

  renderPricing(event) {
    return `
      <div class="pricing">
        ${event.pricing_options.map(opt => `
          <span class="price">${opt.desc}: $${opt.amount}</span>
        `).join('')}
      </div>
    `;
  }

  renderButton(event) {
    const domain = 'https://cur8.com';
    const url = `${domain}/${event.client_id}/project/${event.id}`;
    return `<a href="${url}" target="_blank" class="btn-tickets">Buy Tickets</a>`;
  }
}

// Usage
const widget = new CustomCur8Widget(23121, 'custom-events-container');
widget.load();
```

**Pros:** Full control, clean code, maintainable  
**Cons:** Doesn't reuse cur8's HTML (but that's usually good)

### Pattern 4: Hybrid - Extend Cur8 + Custom CSS

Use cur8's widget but intercept and inject additional data:

```javascript
// Store original functions
const originalLoadEvents = cur8Widget.loadEvents;
const originalGenerateEvents = cur8Widget.generateEvents;

// Map to store full event data
const eventDataCache = {};

cur8Widget.loadEvents = function(clientId, eventId) {
  // Fetch full data first
  fetch(`https://cur8.com/api/public/clients/${clientId}/events`)
    .then(r => r.json())
    .then(({ events }) => {
      // Cache for later use
      events.forEach(e => {
        eventDataCache[e.id] = e;
      });
    });

  // Call original to render normally
  return originalLoadEvents.call(this, clientId, eventId);
};

cur8Widget.generateEvents = function(events, container, ...args) {
  // Call original
  originalGenerateEvents.call(this, events, container, ...args);

  // Enhance with descriptions
  const eventCards = container.querySelectorAll('.cur8-widget-wrapper__event');
  eventCards.forEach((card, i) => {
    const event = events[i];
    if (event && event.description) {
      const descDiv = document.createElement('div');
      descDiv.className = 'cur8-custom-description';
      descDiv.innerHTML = event.description;
      card.appendChild(descDiv);
    }
  });
};
```

**Pros:** Minimal changes, reuses cur8's structure, adds descriptions  
**Cons:** Still depends on cur8's implementation

## Implementation Strategy

### Step 1: Load Scripts in Order
```html
<!-- Load cur8 widget first -->
<script src='https://d37q8qd8th5h3w.cloudfront.net/static/widget.js'></script>

<!-- Then load your extension -->
<script src='cur8-custom-extension.js'></script>

<!-- Initialize -->
<script>
  initializeCur8Extension(23121);
</script>
```

### Step 2: Handle Async Loading
Since cur8Widget might not be ready immediately:

```javascript
function waitForCur8() {
  return new Promise(resolve => {
    if (window.cur8Widget) {
      resolve(window.cur8Widget);
    } else {
      const interval = setInterval(() => {
        if (window.cur8Widget) {
          clearInterval(interval);
          resolve(window.cur8Widget);
        }
      }, 100);
    }
  });
}

waitForCur8().then(widget => {
  // Now safe to extend
  extendCur8Widget(widget);
});
```

### Step 3: Use Mutation Observer for Robustness
Monitor when cur8 renders and inject content dynamically:

```javascript
function enhanceWithMutationObserver(clientId) {
  const observer = new MutationObserver(async (mutations) => {
    const eventCards = document.querySelectorAll('.cur8-widget-wrapper__event');
    if (eventCards.length > 0 && !eventCards[0].hasAttribute('data-enhanced')) {
      // Fetch events
      const response = await fetch(
        `https://cur8.com/api/public/clients/${clientId}/events`
      );
      const { events } = await response.json();

      // Enhance each card
      eventCards.forEach((card, i) => {
        if (!card.hasAttribute('data-enhanced')) {
          const desc = document.createElement('div');
          desc.className = 'event-description';
          desc.innerHTML = events[i]?.description || '';
          card.appendChild(desc);
          card.setAttribute('data-enhanced', 'true');
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

enhanceWithMutationObserver(23121);
cur8Widget.loadEvents(23121);
```

**Pros:** Robust, works regardless of timing  
**Cons:** Slightly more complex

## Recommended Approach for Your Project

Given your constraints:
1. **Don't modify** `cur8-widget.js`
2. **Want to display** descriptions
3. **Want to customize** layout

I recommend **Pattern 3 (Custom Widget Wrapper)** because:
- ✅ Complete control over display
- ✅ Full access to API data
- ✅ Can include descriptions, custom fields
- ✅ Independent of cur8's implementation
- ✅ Easier to test and maintain
- ✅ Can still link to cur8's ticket system

See `cur8-custom-widget-enhanced.js` for a working implementation.

## File Organization

```
project/
├── cur8-widget.js              (official - don't touch)
├── cur8-custom-widget.js       (your extensions)
├── cur8-custom-widget-enhanced.js  (Pattern 3 implementation)
├── cur8-widget.css             (custom styling)
└── test_page.html              (usage example)
```

## Testing Your Extension

```html
<html>
<head>
  <!-- Official widget for reference -->
  <script src='https://d37q8qd8th5h3w.cloudfront.net/static/widget.js'></script>
  
  <!-- Your custom extension -->
  <script src='cur8-custom-widget-enhanced.js'></script>
  
  <!-- Custom styles -->
  <link rel='stylesheet' href='cur8-widget.css'>
</head>
<body>
  <!-- Container for custom widget -->
  <div id='custom-events-container'></div>

  <script>
    const widget = new CustomCur8Widget(23121, 'custom-events-container');
    widget.load();
  </script>
</body>
</html>
```

## Key Principles

1. **Load Original First** - Ensure cur8's script loads before your extension
2. **Don't Modify Original** - Never edit cur8-widget.js
3. **Preserve Functionality** - Keep ticket links intact
4. **Use Data from API** - Access the same endpoints cur8 uses
5. **Style Independently** - Use separate CSS files
6. **Version Your Extension** - Keep cur8-custom-widget.js separate from enhanced versions

## API Reference

The public cur8 API provides all event data needed:

```
GET /api/public/clients/{clientId}/events
GET /api/public/events/{eventId}
```

Full event object includes:
- `id`, `event_name`, `description` (✨ what cur8 widget doesn't render)
- `poster_graphic_url`
- `event_dates[]` with `event_datetime_local`
- `venue` with full address info
- `pricing_options[]`
- And more...

All accessible without authentication from client-side JavaScript!
