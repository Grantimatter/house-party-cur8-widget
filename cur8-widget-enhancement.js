/**
 * Cur8 Widget Enhancement - Monkey Patch Approach
 * 
 * This script extends the official cur8-widget.js WITHOUT modifying it.
 * It intercepts the generateEvents function to inject event descriptions
 * and other enhancements.
 * 
 * Usage:
 *   1. Load the official cur8 widget script first
 *   2. Load this script
 *   3. Call cur8Widget.loadEvents() as normal
 * 
 * The original functionality is preserved while adding:
 * - Event descriptions
 * - Custom styling hooks
 * - Enhanced data attributes
 */

(function() {
  'use strict';

  // Wait for cur8Widget to be available
  function waitForCur8Widget(timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (window.cur8Widget) {
        resolve(window.cur8Widget);
        return;
      }

      const startTime = Date.now();
      const interval = setInterval(() => {
        if (window.cur8Widget) {
          clearInterval(interval);
          resolve(window.cur8Widget);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(new Error('Timeout waiting for cur8Widget to load'));
        }
      }, 100);
    });
  }

  /**
   * Enhance cur8Widget with additional functionality
   */
  function enhanceCur8Widget(widget) {
    // Store original functions
    const originalGenerateEvents = widget.generateEvents;
    const originalLoadEvents = widget.loadEvents;

    // Cache to store full event data
    const eventCache = {};

    /**
     * Enhanced loadEvents - fetches full event data for enrichment
     */
    widget.loadEvents = function(clientId, eventId, ...args) {
      // Fetch full event data from API
      const isArray = Array.isArray(clientId);
      const clientIds = isArray ? clientId : [clientId];

      Promise.all(
        clientIds.map(id =>
          fetch(`${this.envUrl}/api/public/clients/${id}/events`)
            .then(r => r.json())
            .then(data => {
              // Cache events by ID for later enrichment
              if (data.events) {
                data.events.forEach(event => {
                  eventCache[event.id] = event;
                });
              }
            })
            .catch(e => console.error('Failed to fetch event data for enrichment:', e))
        )
      );

      // Call original function
      return originalLoadEvents.call(this, clientId, eventId, ...args);
    };

    /**
     * Enhanced generateEvents - adds descriptions and data attributes
     */
    widget.generateEvents = function(events, container, ...args) {
      // Call original to generate base HTML
      originalGenerateEvents.call(this, events, container, ...args);

      // Enrich the rendered HTML with descriptions and additional data
      const eventCards = container.querySelectorAll('.cur8-widget-wrapper__event');

      eventCards.forEach((card, index) => {
        const event = events[index];
        if (!event) return;

        // Add data attributes for easier styling/selection
        card.setAttribute('data-event-id', event.id);
        card.setAttribute('data-event-type', event.event_type || 'Unknown');
        card.setAttribute('data-venue-name', event.venue?.name || 'Unknown');

        // Inject description if available
        if (event.description) {
          const infoSection = card.querySelector('.cur8-widget-wrapper__event__info');
          if (infoSection) {
            const descDiv = document.createElement('div');
            descDiv.className = 'cur8-widget-enhancement-description';
            descDiv.innerHTML = event.description;

            // Insert after title, before other content
            const insertPoint = infoSection.querySelector(
              '.cur8-widget-wrapper__event__button'
            );
            if (insertPoint) {
              insertPoint.parentNode.insertBefore(descDiv, insertPoint);
            } else {
              infoSection.appendChild(descDiv);
            }
          }
        }

        // Add custom styling hooks
        addStylingHooks(card, event);
      });
    };

    /**
     * Add CSS classes for styling different event types
     */
    function addStylingHooks(card, event) {
      // Add event type class
      if (event.event_type) {
        const typeClass = `cur8-event-type-${event.event_type
          .toLowerCase()
          .replace(/\s+/g, '-')}`;
        card.classList.add(typeClass);
      }

      // Add availability class
      if (hasAvailableDates(event)) {
        card.classList.add('cur8-event-available');
      } else {
        card.classList.add('cur8-event-sold-out');
      }

      // Add pricing tier class
      if (event.pricing_options) {
        const minPrice = Math.min(...event.pricing_options.map(p => p.amount));
        const priceClass = `cur8-price-${Math.round(minPrice / 10) * 10}`;
        card.classList.add(priceClass);
      }
    }

    /**
     * Check if event has available dates for purchase
     */
    function hasAvailableDates(event) {
      if (!event.event_dates) return false;

      return event.event_dates.some(date => {
        const saleEnd = date.public_sale_end_datetime_utc;
        return !saleEnd || new Date(saleEnd) > new Date();
      });
    }

    return widget;
  }

  /**
   * Initialize enhancement when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForCur8Widget()
        .then(enhanceCur8Widget)
        .catch(error => console.warn('Cur8Widget enhancement failed:', error));
    });
  } else {
    waitForCur8Widget()
      .then(enhanceCur8Widget)
      .catch(error => console.warn('Cur8Widget enhancement failed:', error));
  }

})();
