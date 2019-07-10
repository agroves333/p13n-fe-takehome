/**
 * Creates events that logs a message to the console when a column has entered the viewport,
 * is half-way in th viewport, or is fully in the viewport
 */
class ColumnScrollLogger {

  // All column elements
  columns = null;
  scrollDirection = null;
  lastScrollStart = null;
  // Events to be fired on each column viewport position
  events = {
    start: new Event('columnStartVisible'),
    center: new Event('columnCenterVisible'),
    end: new Event('columnEndVisible'),
  };

  constructor() {
    this.columns = this.getColumns();
    this.checkColumnPosition = this.checkColumnPosition.bind(this);
    window.addEventListener('scroll', this.checkColumnPosition);
    window.addEventListener('resize', this.checkColumnPosition);
  }
  
  /**
   * Get all column elements and attach event listeners. Only fire events once.
   * @returns {NodeListOf<Element>}
   */
  getColumns () {
    const columns = document.querySelectorAll('.column');
    columns.forEach(el =>  {
      const id = el.id;
  
      el.addEventListener(this.events.start.type, () =>  this.logStatus('start', id), { once: true });
      el.addEventListener(this.events.center.type, () =>  this.logStatus('center', id), { once: true });
      el.addEventListener(this.events.end.type, () =>  this.logStatus('end', id), { once: true });
    });
    return columns;
  }
  
  /**
   * Check column position in viewport and fire events when visible.
   * If scroll direction is down, then the start of the column is the top.
   * If scroll direction is up, then the start of the column is the bottom.
   */
  checkColumnPosition() {
    this.getScrollDirection();

    this.columns.forEach(el =>  {
      const viewportHeight = window.innerHeight;
      
      const rect = el.getBoundingClientRect();
      const colStart = rect.top;
      const colCenter = colStart + rect.height / 2;
      const colEnd = rect.bottom;
      const isVisible = !this.isHidden(el);
      
      const predictates = {
        down: {
          isStartVisible: (0 < colStart) && (colStart < viewportHeight),
          isCenterVisible: (0 < colCenter) && (colCenter < viewportHeight),
          isEndVisible: (0 < colEnd) && (colEnd < viewportHeight)
        },
        up: {
          isStartVisible: (0 < colEnd) && (colEnd < viewportHeight),
          isCenterVisible: (0 < colCenter) && (colCenter < viewportHeight),
          isEndVisible: (0 < colStart) && (colStart < viewportHeight)
        }
      };
      
      if (isVisible) {
        // If start of column is in the viewport
        if(predictates[this.scrollDirection].isStartVisible) {
          el.dispatchEvent(this.events.start);
        }
        // If center of column is in the viewport
        if(predictates[this.scrollDirection].isCenterVisible) {
          el.dispatchEvent(this.events.center);
        }
        // If end of column is in the viewport
        if(predictates[this.scrollDirection].isEndVisible) {
          el.dispatchEvent(this.events.end);
        }
      }
    });
  }
  
  /**
   * Get scroll direction. This is necessary for determining polarity of start/end of columns for logging.
   */
  getScrollDirection() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > this.lastScrollStart){
      this.scrollDirection = 'down';
    } else {
      this.scrollDirection = 'up';
    }
    this.lastScrollStart = st <= 0 ? 0 : st;
  }
  
  /**
   * Check if column element (or any of it's parents) has style "display: none"
   * @param el
   * @returns {boolean|boolean|*}
   */
  isHidden(el) {
    const _isHidden = window.getComputedStyle(el).display === 'none';
    const parent = el.parentElement;
    if (_isHidden) {
      return true;
    } else if(parent) {
      return this.isHidden(parent);
    }
  }
  
  /**
   * Log the column visibility status
   * @param position
   * @param id
   */
  logStatus(position, id) {
    const messages = {
      start: `Column with id:${id} started to become visible on the page.`,
      center: `Column with id:${id} is now more than 50% visible on the page.`,
      end: `Column with id:${id} is now fully visible on the page.`
    };
    console.log(messages[position])
  }
}

new ColumnScrollLogger();
