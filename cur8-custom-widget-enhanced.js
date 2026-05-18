/**
 * CustomCur8Widget - Enhanced event display with descriptions and full customization
 * 
 * Usage:
 *   const widget = new CustomCur8Widget(clientId, containerId);
 *   widget.load();
 * 
 * This widget:
 * - Fetches events from cur8's public API
 * - Displays full event descriptions
 * - Maintains links to cur8's ticket purchase system
 * - Allows complete CSS customization
 * - Works independently without modifying cur8-widget.js
 */

class CustomCur8Widget {
  constructor(clientId, containerId, options = {}) {
    this.clientId = clientId;
    this.containerId = containerId;
    this.events = [];
    this.apiUrl = 'https://cur8.com/api/public/clients';
    this.houseCountUrl = 'https://cur8-housecount-proxy.grantwiswell.workers.dev';
    
    // Configuration options
    this.config = {
      showDescription: options.showDescription !== false,
      showVenue: options.showVenue !== false,
      showPricing: options.showPricing !== false,
      showDates: options.showDates !== false,
      dateFormat: options.dateFormat || 'LLLL', // requires moment.js
      ticketDomain: options.ticketDomain || 'https://cur8.com',
      sortByDate: options.sortByDate !== false,
      ...options
    };

    document.head.innerHTML += '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300,1,0&icon_names=bolt" />';
  }

  /**
   * Fetch events from cur8 API
   */
  async load() {
    try {
      const params = new URLSearchParams(document.location.search);
      const event_param = params.get("event");
      const response = await fetch(`${this.apiUrl}/${this.clientId}/events`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.events = event_param ? data.events.filter(event => event.id == event_param) : data.events || [];

      // Fetch house count for sold-out status
      await Promise.all(this.events.map(async (event) => {
        await this.loadHouseCount(event);
      }));

      // Sort by earliest date if requested
      if (this.config.sortByDate) {
        this.sortEventsByDate();
      }

      this.render();
    } catch (error) {
      console.error('CustomCur8Widget: Failed to load events', error);
      this.renderError(error.message);
    }
  }

  /**
   * Fetch house count (seat availability) for the event
   */
  async loadHouseCount(event) {

    /**
    * Fetch on cache miss
    */
    await Promise.all(event.event_dates.map(async (date) => {
      try {
        const CACHE_DIRATION = 10 * 60 * 1000; // 10 minutes in ms
        const cacheKey = `cur8_scheduled_item_${date.id}`;
        const cachedAtKey = `${cacheKey}_time`;

        // Encode seating details so it's not easily visible to non-technical visitors
        const cached = atob(sessionStorage.getItem(btoa(cacheKey)));
        const cachedAt = atob(sessionStorage.getItem(btoa(cachedAtKey)));

        if (cached && cachedAt && Date.now() - cachedAt < CACHE_DIRATION) {
          const data = JSON.parse(cached);
          date.houseCount = data;
        } else {
          await fetch(`${this.houseCountUrl}/${date.id}`)
            .then(res => res.json())
            .then(data => {
              date.houseCount = data;
              sessionStorage.setItem(btoa(cacheKey), btoa(JSON.stringify(data)));
              sessionStorage.setItem(btoa(cachedAtKey), btoa(Date.now()));
            });
        }
      } catch (error) {
        console.warn('Failed to load house count:', error);
        // Don't fail the entire page if house count fails
      }
    }));
  }

  /**
   * Calculate seat availability percentage
   */
  getAvailabilityPercentage(houseCount) {
    if (!houseCount || !houseCount.total_count) {
      return null;
    }
    const available = houseCount.total_count - houseCount.count;
    return Math.max(0, Math.round((available / houseCount.total_count) * 100));
  }

  /**
   * Check if a date is sold out
   */
  isDateSoldOut(date) {
    if (!date.houseCount || !date.houseCount.total_count) {
      return false;
    }
    const available = date.houseCount.total_count - date.houseCount.count;
    return available <= 0;
  }

  /**
   * Check if all dates for an event are sold out
   */
  areAllDatesSoldOut(event) {
    if (!event.event_dates || event.event_dates.length === 0) {
      return false;
    }
    const availableDates = event.event_dates.filter(d => !this.isDatePastSaleEnd(d));
    if (availableDates.length === 0) {
      return false;
    }
    return availableDates.every(d => this.isDateSoldOut(d));
  }

  /**
   * Check if a date is almost sold out (under threshold)
   */
  isDateAlmostSoldOut(date, threshold = 5) {
    if (!date.houseCount || !date.houseCount.total_count) {
      return false;
    }
    const available = date.houseCount.total_count - date.houseCount.count;
    return available > 0 && available < threshold;
  }

  /**
   * Check if all dates are either sold out or almost sold out
   */
  areAllDatesLimitedOrSoldOut(event, threshold = 5) {
    if (!event.event_dates || event.event_dates.length === 0) {
      return false;
    }
    const availableDates = event.event_dates.filter(d => !this.isDatePastSaleEnd(d));
    if (availableDates.length === 0) {
      return false;
    }
    if (availableDates.every(d => this.isDateSoldOut(d))) {
      return false;
    }
    return availableDates.every(d => this.isDateSoldOut(d) || this.isDateAlmostSoldOut(d, threshold));
  }

  /**
   * Sort events by earliest date
   */
  sortEventsByDate() {
    this.events.forEach(event => {
      if (event.event_dates && event.event_dates.length) {
        event.event_dates.sort((a, b) => 
          new Date(a.event_datetime_local) - new Date(b.event_datetime_local)
        );
      }

    });

    this.events.sort((a, b) => {
      const dateA = a.event_dates?.[0]?.event_datetime_local;
      const dateB = b.event_dates?.[0]?.event_datetime_local;
      if (!dateA || !dateB) return 0;
      return new Date(dateA) - new Date(dateB);
    });
  }

  /**
   * Render the widget
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`CustomCur8Widget: Container not found: ${this.containerId}`);
      return;
    }

    if (this.events.length === 0) {
      container.innerHTML = '<div class="cur8-custom-no-events">No events to display</div>';
      return;
    }

    const html = this.events.map((event, idx) => 
      this.renderEventCard(event, idx)
    ).join('');

    container.innerHTML = `<div class="cur8-custom-wrapper">${html}</div>`;
  }

  /**
   * Render a single event card
   */
  renderEventCard(event, index) {
    const eventName = event.event_name || event.name || 'Event';
    const poster = event.poster_graphic_url || this.getDefaultPoster();
    const allDatesSoldOut = this.areAllDatesSoldOut(event);
    const allDatesLimitedOrSoldOut = this.areAllDatesLimitedOrSoldOut(event, 5);
    let seatStatusClass = '';
    if (allDatesSoldOut) {
      seatStatusClass = 'cur8-custom-event-sold-out';
    } else if (allDatesLimitedOrSoldOut) {
      seatStatusClass = 'cur8-custom-event-almost-sold-out';
    }

    return `
      <div class="cur8-custom-event ${seatStatusClass}" data-event-id="${index}">
        ${this.renderImage(event, eventName, poster, allDatesSoldOut)}
        <div class="cur8-custom-event-content">
          ${this.renderTitle(event, eventName)}
          ${allDatesLimitedOrSoldOut ? `<div class="cur8-custom-almost-sold-out-warning">⚠️ Hurry, almost sold out!</div>` : ''} 
          ${this.renderDescription(event)}
          ${this.renderDates(event)}
          ${this.renderVenue(event)}
          ${this.renderPricing(event)}
          <div class="cur8-custom-event-actions">
            ${this.renderTicketButton(event)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render event image section
   */
  renderImage(event, eventName, poster, soldOut) {
    const url = `https://cur8.com/${event.client_id}/project/${event.id}`;
    return `
      <a target="_blank" href="${url}">
        <div class="cur8-custom-event-image">
          <img src="${poster}" alt="${eventName}" />
          ${soldOut ? '<div class="cur8-custom-sold-out-ribbon">SOLD OUT!</div>' : ''}
          ${event.event_type ? `<span class="cur8-custom-event-type">${event.event_type}</span>` : ''}
        </div>
      </a>
    `;
  }

  /**
   * Render event title
   */
  renderTitle(event, eventName) {
    return `<h3 class="cur8-custom-event-title">${eventName}</h3>`;
  }

  /**
   * Render event description with show more/less functionality
   */
  renderDescription(event) {
    if (!this.config.showDescription) {
      return '';
    }

    // API returns description in 'desc' field, may contain HTML
    const description = event.desc || event.description;
    if (!description) {
      return '';
    }

    // Generate unique ID for this description's toggle button
    const descId = `desc-${event.id || Math.random()}`;

    return `
      <div class="cur8-custom-event-description" id="${descId}">
        <div class="cur8-custom-description-content">
          ${description}
        </div>
        <button class="cur8-custom-show-more" onclick="this.parentElement.classList.toggle('expanded'); this.textContent = this.parentElement.classList.contains('expanded') ? 'Show less' : 'Show more'; return false;">
          Show more
        </button>
      </div>
    `;
  }

  /**
   * Render event dates with per-date buy buttons
   */
  renderDates(event) {
    if (!this.config.showDates || !event.event_dates || event.event_dates.length === 0) {
      return '';
    }

    const dates = event.event_dates
      .filter(d => !this.isDatePastSaleEnd(d))
      .slice(0, 3); // Show first 3 upcoming dates

    if (dates.length === 0) {
      return '<div class="cur8-custom-no-dates">No upcoming dates</div>';
    }

    const dateHtml = dates.map(date => {
      const dateStr = this.formatDate(date.event_datetime_local);
      const buyUrl = this.getTicketUrl(event, date);
      const buyText = this.getTicketPurchaseText(event, date);
      const isSoldOut = this.isDateSoldOut(date);
      const isAlmostSoldOut = this.isDateAlmostSoldOut(date, 5);
      
      if (isSoldOut) {
        return `
          <div class="cur8-custom-date-item cur8-custom-date-item-sold-out">
            <div class="cur8-custom-date-time">${dateStr}</div>
            <span class="cur8-custom-date-sold-out-label">SOLD OUT</span>
          </div>
        `;
      }
      
      const warningHtml = isAlmostSoldOut ? '<span class="cur8-custom-date-warning">⚠️ Almost sold out!</span>' : '';
      
      return `
        <div class="cur8-custom-date-item">
          <div class="cur8-custom-date-time">${dateStr}</div>
          <div class="cur8-custom-date-actions">
            ${warningHtml}
            <a href="${buyUrl}" target="_blank" class="cur8-custom-date-buy">${buyText}</a>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="cur8-custom-event-dates">${dateHtml}</div>`;
  }

  /**
   * Render venue information
   */
  renderVenue(event) {
    if (!this.config.showVenue || !event.venue) {
      return '';
    }

    const venue = event.venue;
    const hasAddress = venue.address && venue.city && venue.state;

    if (!hasAddress && !venue.name) {
      return '';
    }

    return `
      <div class="cur8-custom-event-venue">
        ${venue.name ? `<strong>${this.escapeHtml(venue.name)}</strong>` : ''}
        ${hasAddress ? `
          <div class="cur8-custom-venue-address">
            ${this.escapeHtml(venue.address)}<br />
            ${this.escapeHtml(venue.city)}, ${this.escapeHtml(venue.state)}
            ${venue.zip ? ` ${this.escapeHtml(venue.zip)}` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render pricing options
   */
  renderPricing(event) {
    if (!this.config.showPricing || !event.pricing_options || event.pricing_options.length === 0) {
      return '';
    }

    const priceHtml = event.pricing_options.map(option => {
      const price = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(option.amount);

      return `
        <div class="cur8-custom-pricing-option">
          <span class="cur8-custom-price-label">${this.escapeHtml(option.desc)}</span>
          <span class="cur8-custom-price-amount">${price}</span>
        </div>
      `;
    }).join('');

    return `<div class="cur8-custom-event-pricing">${priceHtml}</div>`;
  }

  /**
   * Change purchase wording depending on if paid or free
   * If all purchase options of all dates are free, text should use "Reserve" instead of "Buy"
   */
  getTicketButtonText(event) {
    if (event.event_dates.flatMap(d => d.pricing_options).every(p => p.amount == 0)) {
      return "Reserve Seat";
    }

    return "Buy Tickets";
  }

  /**
   * Render ticket purchase button
   */
  renderTicketButton(event) {
    const allDatesSoldOut = this.areAllDatesSoldOut(event);
    
    // Hide button if all dates are sold out
    if (allDatesSoldOut) {
      return '';
    }

    // For regular events, link to first available date
    if (event.event_type !== 'Video On Demand' && event.event_type !== 'V' && 
        event.event_type !== 'Fee' && event.event_type !== 'Merchandise' && 
        event.event_type !== 'Trip') {
      
      // Find first available date that is not sold out
      const availableDate = event.event_dates?.find(d => !this.isDatePastSaleEnd(d) && !this.isDateSoldOut(d));
      const ticketButtonText = this.getTicketButtonText(event);
      if (availableDate) {
        const url = this.getTicketUrl(event, availableDate);
        return `
          <a href="${url}" target="_blank" class="cur8-custom-button cur8-custom-button-primary">
            ${ticketButtonText}
          </a>
        `;
      }
    }

    // For special event types or no available dates
    const url = this.getTicketUrl(event);
    const ticketButtonText = this.getTicketButtonText(event);
    return `
      <a href="${url}" target="_blank" class="cur8-custom-button cur8-custom-button-primary">
        ${ticketButtonText}
      </a>
    `;
  }

  /**
   * Get ticket URL for the event
   * @param {Object} event - Event object
   * @param {Object} date - (Optional) Specific date object for scheduling events
   */
  getTicketUrl(event, date = null) {
    const domain = this.config.ticketDomain;
    
    // Special event types (VOD, Fee, Merchandise, Trip)
    if (event.event_type === 'Video On Demand' || event.event_type === 'V' || 
        event.event_type === 'Fee' || event.event_type === 'Merchandise' || 
        event.event_type === 'Trip') {
      return `${domain}/${event.client_id}/project/${event.id}`;
    }

    // Regular events with specific date
    if (date) {
      return `${domain}/schedule/item/${event.client_id}/${date.id}?event=${event.id}&date=${date.id}`;
    }

    // Fallback: link to client schedule page
    return `${domain}/schedule/client/${event.client_id}`;
  }

  /** 
   * Check if event is free (option to check only specific dates)
   */
  isEventFree(event, date = null) {
    if (date != null) {
      return event.event_dates?.find(d => d.id == date.id).pricing_options.every(po => po.amount == 0);
    }

    return event.event_dates?.flatMap(d => d.pricing_options).every(p => p.amount == 0);
  }

  /**
   * Returns "Buy" if event has a charge, and "Reserve" if the event is free.
   */
  getTicketPurchaseText(event, date = null) {
    const all_free = this.isEventFree(event, date);
    return all_free ? "Reserve" : "Buy"
  }

  /**
   * Check if date sale period has ended
   */
  isDatePastSaleEnd(date) {
    if (!date.public_sale_end_datetime_utc) return false;
    return new Date(date.public_sale_end_datetime_utc) < new Date();
  }

  /**
   * Format date using moment.js if available, otherwise fallback
   */
  formatDate(dateString) {
    if (typeof moment !== 'undefined') {
      try {
        return moment(dateString.substring(0, 19)).format(this.config.dateFormat);
      } catch (e) {
        // Fallback if moment fails
      }
    }

    // Fallback: use native Date formatting
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  /**
   * Get default poster if event doesn't have one
   */
  getDefaultPoster() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect fill="%23ddd" width="400" height="600"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="24" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  /**
   * Render error message
   */
  renderError(message) {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="cur8-custom-error">
          <p>Unable to load events</p>
          <small>${this.escapeHtml(message)}</small>
        </div>
      `;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CustomCur8Widget;
}
