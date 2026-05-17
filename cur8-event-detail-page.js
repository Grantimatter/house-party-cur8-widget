/**
 * Cur8 Event Detail Page Widget
 * 
 * A dedicated single event detail page for Squarespace integration.
 * Displays comprehensive event information in an engaging format.
 * 
 * Usage:
 *   <div id="cur8-event-detail"></div>
 *   <script src="cur8-event-detail-page.js"></script>
 * 
 * Query Parameter:
 *   ?event=<event_id>
 * 
 * Features:
 *   - Dynamic event loading via query parameter
 *   - Full event details with beautiful formatting
 *   - Multiple date/time options
 *   - Ticket purchase links
 *   - Venue information with map link
 *   - Event description with rich text support
 *   - Pricing tiers
 *   - Error handling and validation
 *   - Responsive design
 */

class Cur8EventDetailPage {
  constructor(options = {}) {
    this.containerId = options.containerId || 'cur8-event-detail';
    this.apiUrl = options.apiUrl || 'https://cur8.com/api/public/events';
    this.houseCountUrl = options.houseCountUrl || 'https://cur8.com/api/public/scheduled-items';
    this.ticketDomain = options.ticketDomain || 'https://cur8.com';
    
    this.eventId = this.getEventIdFromUrl();
    this.event = null;
    this.houseCount = null;
    this.isLoading = false;
    this.error = null;
  }

  /**
   * Extract event ID from query parameter
   */
  getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    
    if (!eventId) {
      this.setError('No event specified. Use ?event=<event_id> to load an event.');
      return null;
    }
    
    // Validate event ID format (should be numeric or alphanumeric)
    if (!/^[a-zA-Z0-9-]+$/.test(eventId)) {
      this.setError('Invalid event ID format.');
      return null;
    }
    
    return eventId;
  }

  /**
   * Load and render the event
   */
  async load() {
    if (!this.eventId) {
      this.render();
      return;
    }

    this.isLoading = true;
    this.renderLoading();

    try {
      const response = await fetch(`${this.apiUrl}/${this.eventId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found. Please check the event ID.');
        }
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.event = data.event || data;
      
      // Sort dates from soonest
      if (this.event.event_dates && this.event.event_dates.length > 0) {
        this.event.event_dates.sort((a, b) => 
          new Date(a.event_datetime_local) - new Date(b.event_datetime_local)
        );
      }

      // Fetch house count for sold-out status
      await this.loadHouseCount();

      this.render();
    } catch (error) {
      console.error('Cur8EventDetailPage: Failed to load event', error);
      this.setError(error.message);
      this.render();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Fetch house count (seat availability) for the event
   */
  async loadHouseCount() {
    try {
      const response = await fetch(`${this.houseCountUrl}/${this.eventId}/house-count`);
      if (response.ok) {
        this.houseCount = await response.json();
      }
    } catch (error) {
      console.warn('Failed to load house count:', error);
      // Don't fail the entire page if house count fails
    }
  }

  /**
   * Calculate seat availability percentage
   */
  getAvailabilityPercentage() {
    if (!this.houseCount || !this.houseCount.total_count) {
      return null;
    }
    const available = this.houseCount.total_count - (this.houseCount.sold_count + this.houseCount.held_count);
    return Math.max(0, Math.round((available / this.houseCount.total_count) * 100));
  }

  /**
   * Get seat availability status
   */
  getSoldOutStatus() {
    if (!this.houseCount || !this.houseCount.total_count) {
      return null;
    }
    const available = this.houseCount.total_count - (this.houseCount.sold_count + this.houseCount.held_count);
    if (available <= 0) {
      return { status: 'sold-out', message: '🚫 SOLD OUT', color: '#dc3545' };
    } else if (available <= 2) {
      return { status: 'almost-gone', message: '⚠️ ONLY ' + available + ' LEFT', color: '#ff6b6b' };
    } else if (available <= Math.ceil(this.houseCount.total_count * 0.1)) {
      return { status: 'limited', message: '⏰ HURRY - ' + Math.round((available / this.houseCount.total_count) * 100) + '% LEFT', color: '#ff9500' };
    }
    return null;
  }

  /**
   * Set error state
   */
  setError(message) {
    this.error = message;
  }

  /**
   * Render the full page
   */
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error(`Container not found: ${this.containerId}`);
      return;
    }

    if (this.error) {
      container.innerHTML = this.renderError();
      return;
    }

    if (!this.event) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="cur8-event-detail-page">
        ${this.renderHeroSection()}
        ${this.renderDescriptionSection()}
        <div class="cur8-event-detail-container">
          ${this.renderMainContent()}
          ${this.renderSidebar()}
        </div>
        ${this.renderPricingSection()}
      </div>
    `;
  }

  /**
   * Render hero section with image and title
   */
  renderHeroSection() {
    const poster = this.event.poster_graphic_url || this.getDefaultPoster();
    const eventType = this.event.event_type || '';
    const soldOutStatus = this.getSoldOutStatus();
    const notifierHtml = soldOutStatus ? `
      <div class="cur8-event-urgency-banner" style="background-color: ${soldOutStatus.color};">
        ${soldOutStatus.message}
      </div>
    ` : '';

    return `
      <div class="cur8-event-hero" style="background-image: url('${this.escapeHtml(poster)}');">
        ${notifierHtml}
        <div class="cur8-event-hero-overlay">
          <div class="cur8-event-hero-content">
            ${eventType ? `<span class="cur8-event-type-badge">${this.escapeHtml(eventType)}</span>` : ''}
            <h1 class="cur8-event-detail-title">${this.escapeHtml(this.event.event_name || 'Event')}</h1>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render main content area (left column)
   */
  renderMainContent() {
    return `
      <div class="cur8-event-detail-main">
        ${this.renderDatesSection()}
        ${this.renderVenueSection()}
        ${this.renderTicketButtons()}
      </div>
    `;
  }

  /**
   * Render sidebar (right column)
   */
  renderSidebar() {
    return `
      <div class="cur8-event-detail-sidebar">
        ${this.renderEventMeta()}
        ${this.renderShareButtons()}
      </div>
    `;
  }

  /**
   * Render dates section with all available dates
   */
  renderDatesSection() {
    if (!this.event.event_dates || this.event.event_dates.length === 0) {
      return '';
    }

    const dates = this.event.event_dates.filter(d => !this.isDatePastSaleEnd(d));
    
    if (dates.length === 0) {
      return '<div class="cur8-event-no-dates">No upcoming dates available</div>';
    }

    const datesHtml = dates.map((date, idx) => this.renderDateItem(date, idx)).join('');

    return `
      <section class="cur8-event-dates-section">
        <h2>📅 Event Dates & Times</h2>
        <div class="cur8-event-dates-list">
          ${datesHtml}
        </div>
      </section>
    `;
  }

  /**
   * Render individual date item
   */
  renderDateItem(date, index) {
    const dateTime = new Date(date.event_datetime_local);
    const formattedDate = this.formatDate(dateTime);
    const formattedTime = this.formatTime(dateTime);
    const buyUrl = this.getTicketUrl(this.event, date);

    return `
      <div class="cur8-event-date-item">
        <div class="cur8-event-date-header">
          <div class="cur8-event-date-info">
            <div class="cur8-event-date-day">${this.formatDayOfWeek(dateTime)}</div>
            <div class="cur8-event-date-date">${formattedDate}</div>
            <div class="cur8-event-date-time">${formattedTime}</div>
          </div>
          <a href="${buyUrl}" target="_blank" class="cur8-event-date-buy-btn">
            Get Tickets
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Render venue section
   */
  renderVenueSection() {
    if (!this.event.venue) {
      return '';
    }

    const venue = this.event.venue;
    const hasAddress = venue.address && venue.city && venue.state;
    const mapUrl = this.getMapUrl(venue);

    if (!hasAddress && !venue.name) {
      return '';
    }

    return `
      <section class="cur8-event-venue-section">
        <h2>📍 Venue</h2>
        <div class="cur8-event-venue-card">
          ${venue.name ? `<h3 class="cur8-event-venue-name">${this.escapeHtml(venue.name)}</h3>` : ''}
          ${hasAddress ? `
            <div class="cur8-event-venue-address">
              <p>
                ${this.escapeHtml(venue.address)}<br>
                ${this.escapeHtml(venue.city)}, ${this.escapeHtml(venue.state)}
                ${venue.zip ? ` ${this.escapeHtml(venue.zip)}` : ''}
              </p>
            </div>
            <a href="${mapUrl}" target="_blank" class="cur8-event-map-link">
              🗺️ View on Map
            </a>
          ` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Render ticket buttons (call to action)
   */
  renderTicketButtons() {
    if (!this.event.event_dates || this.event.event_dates.length === 0) {
      return '';
    }

    const upcomingDate = this.event.event_dates.find(d => !this.isDatePastSaleEnd(d));
    if (!upcomingDate) {
      return '';
    }

    const buyUrl = this.getTicketUrl(this.event, upcomingDate);

    return `
      <div class="cur8-event-cta-section">
        <a href="${buyUrl}" target="_blank" class="cur8-event-cta-button">
          🎫 Get Your Tickets Now
        </a>
        <p class="cur8-event-cta-text">Don't miss out! Secure your spot today.</p>
      </div>
    `;
  }

  /**
   * Render event metadata sidebar
   */
  renderEventMeta() {
    const items = [];

    if (this.event.event_dates && this.event.event_dates.length > 0) {
      const firstDate = this.event.event_dates[0];
      const dateStr = new Date(firstDate.event_datetime_local).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      items.push({ icon: '📅', label: 'Next Date', value: dateStr });
    }

    if (this.event.venue && this.event.venue.name) {
      items.push({ icon: '📍', label: 'Venue', value: this.event.venue.name });
    }

    // if (this.event.event_type) {
    //   items.push({ icon: '🎭', label: 'Type', value: this.event.event_type });
    // }

    if (items.length === 0) {
      return '';
    }

    const metaHtml = items.map(item => `
      <div class="cur8-event-meta-item">
        <span class="cur8-event-meta-icon">${item.icon}</span>
        <div class="cur8-event-meta-content">
          <span class="cur8-event-meta-label">${item.label}</span>
          <span class="cur8-event-meta-value">${this.escapeHtml(item.value)}</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="cur8-event-meta-card">
        <h3>Event Info</h3>
        ${metaHtml}
      </div>
    `;
  }

  copyLink(text) {
    navigator.clipboard.writeText(text).then(() => {
      
    });
  }

  /**
   * Render share buttons
   */
  renderShareButtons() {
    const eventTitle = encodeURIComponent(this.event.event_name || 'Check out this event');
    const currentUrl = encodeURIComponent(window.location.href);

    return `
      <div class="cur8-event-share-card">
        <h3>Share Event</h3>
        <div class="cur8-event-share-buttons">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" 
             target="_blank" 
             class="cur8-event-share-btn cur8-event-share-facebook"
             title="Share on Facebook">
            f
          </a>
          <a href="https://twitter.com/intent/tweet?text=${eventTitle}&url=${currentUrl}" 
             target="_blank" 
             class="cur8-event-share-btn cur8-event-share-twitter"
             title="Share on Twitter">
            𝕏
          </a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}" 
             target="_blank" 
             class="cur8-event-share-btn cur8-event-share-linkedin"
             title="Share on LinkedIn">
            in
          </a>
          <button class="cur8-event-share-btn cur8-event-share-copy" 
                  onclick="navigator.clipboard.writeText('${window.location.href}')"
                  title="Copy Link">
            🔗
          </button>
        </div>
      </div>
    `;
  }


  /**
   * Render pricing section
   */
  renderPricingSection() {
    if (!this.event.pricing_options || this.event.pricing_options.length === 0) {
      return '';
    }

    const pricingHtml = this.event.pricing_options.map(option => {
      const price = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(option.amount);

      return `
        <div class="cur8-event-pricing-item">
          <span class="cur8-event-pricing-name">${this.escapeHtml(option.name || 'Ticket')}</span>
          <span class="cur8-event-pricing-amount">${price}</span>
        </div>
      `;
    }).join('');

    return `
      <section class="cur8-event-pricing-section">
        <h2>💰 Pricing</h2>
        <div class="cur8-event-pricing-grid">
          ${pricingHtml}
        </div>
      </section>
    `;
  }

  /**
   * Render full description section
   */
  renderDescriptionSection() {
    const description = this.event.desc || this.event.description;
    if (!description) {
      return '';
    }

    return `
      <section class="cur8-event-description-section">
        <h2>ℹ️ About This Event</h2>
        <div class="cur8-event-full-description">
          ${description}
        </div>
      </section>
    `;
  }

  /**
   * Render loading state
   */
  renderLoading() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="cur8-event-loading">
          <div class="cur8-event-loading-spinner"></div>
          <p>Loading event details...</p>
        </div>
      `;
    }
  }

  /**
   * Render error state
   */
  renderError() {
    return `
      <div class="cur8-event-error">
        <div class="cur8-event-error-icon">⚠️</div>
        <h2>Unable to Load Event</h2>
        <p>${this.escapeHtml(this.error)}</p>
        <p class="cur8-event-error-hint">Make sure you're using a valid event ID in the URL like: <code>?event=12345</code></p>
      </div>
    `;
  }

  /**
   * Helper: Format date to readable string
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Helper: Format day of week
   */
  formatDayOfWeek(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  }

  /**
   * Helper: Format time
   */
  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  /**
   * Helper: Check if date sale has ended
   */
  isDatePastSaleEnd(dateObj) {
    if (!dateObj.sales_end_date) return false;
    return new Date(dateObj.sales_end_date) < new Date();
  }

  /**
   * Helper: Get ticket URL for date
   */
  getTicketUrl(event, date) {
    if (date && date.ticket_purchase_url) {
      return date.ticket_purchase_url;
    }
    if (event.ticket_purchase_url) {
      return event.ticket_purchase_url;
    }
    return `${this.ticketDomain}/${event.client_id}/project/${event.id}`;
  }

  /**
   * Helper: Get map URL from venue
   */
  getMapUrl(venue) {
    if (!venue.address || !venue.city || !venue.state) {
      return '#';
    }
    const query = encodeURIComponent(
      `${venue.address} ${venue.city}, ${venue.state} ${venue.zip || ''}`
    );
    return `https://www.google.com/maps/search/${query}`;
  }

  /**
   * Helper: Get default poster image
   */
  getDefaultPoster() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect fill="%23ddd" width="400" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="24" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  /**
   * Helper: Escape HTML
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
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const widget = new Cur8EventDetailPage();
  widget.load();
});
