jQuery(document).ready(function() {
    var owl = jQuery('.owl-carousel');
    owl.owlCarousel({ items: 7, loop: !0, dots: !0, pagination: !1, nav: !1, margin: 20, autoplay: !0, slideTransition: 'linear', autoplayTimeout: 0, autoplaySpeed: 12000, autoplayHoverPause: !0, responsiveClass: !0, responsive: { 0: { items: 1, nav: !0 }, 600: { items: 1 }, 1000: { loop: !0, items: 7 } } })
});;
(function(jQuery, window, document, undefined) {
    var drag, state, e;
    drag = { start: 0, startX: 0, startY: 0, current: 0, currentX: 0, currentY: 0, offsetX: 0, offsetY: 0, distance: null, startTime: 0, endTime: 0, updatedX: 0, targetEl: null };
    state = { isTouch: false, isScrolling: false, isSwiping: false, direction: false, inMotion: false };
    e = { _onDragStart: null, _onDragMove: null, _onDragEnd: null, _transitionEnd: null, _resizer: null, _responsiveCall: null, _goToLoop: null, _checkVisibile: null };

    function Owl(element, options) {
        this.settings = null;
        this.options = jQuery.extend({}, Owl.Defaults, options);
        this.jQueryelement = jQuery(element);
        this.drag = jQuery.extend({}, drag);
        this.state = jQuery.extend({}, state);
        this.e = jQuery.extend({}, e);
        this._plugins = {};
        this._supress = {};
        this._current = null;
        this._speed = null;
        this._coordinates = [];
        this._breakpoint = null;
        this._width = null;
        this._items = [];
        this._clones = [];
        this._mergers = [];
        this._invalidated = {};
        this._pipe = [];
        jQuery.each(Owl.Plugins, jQuery.proxy(function(key, plugin) { this._plugins[key[0].toLowerCase() + key.slice(1)] = new plugin(this); }, this));
        jQuery.each(Owl.Pipe, jQuery.proxy(function(priority, worker) { this._pipe.push({ 'filter': worker.filter, 'run': jQuery.proxy(worker.run, this) }); }, this));
        this.setup();
        this.initialize();
    }
    Owl.Defaults = { items: 3, loop: true, center: false, slideTransition: '', mouseDrag: true, touchDrag: true, pullDrag: true, freeDrag: false, margin: 0, stagePadding: 0, merge: false, mergeFit: true, autoWidth: false, startPosition: 0, rtl: false, smartSpeed: 250, fluidSpeed: false, dragEndSpeed: false, responsive: {}, responsiveRefreshRate: 200, responsiveBaseElement: window, responsiveClass: false, fallbackEasing: 'swing', info: false, nestedItemSelector: false, itemElement: 'div', stageElement: 'div', themeClass: 'owl-theme', baseClass: 'owl-carousel', itemClass: 'owl-item', centerClass: 'center', activeClass: 'active' };
    Owl.Width = { Default: 'default', Inner: 'inner', Outer: 'outer' };
    Owl.Plugins = {};
    Owl.Pipe = [{ filter: ['width', 'items', 'settings'], run: function(cache) { cache.current = this._items && this._items[this.relative(this._current)]; } }, {
        filter: ['items', 'settings'],
        run: function() {
            var cached = this._clones,
                clones = this.jQuerystage.children('.cloned');
            if (clones.length !== cached.length || (!this.settings.loop && cached.length > 0)) {
                this.jQuerystage.children('.cloned').remove();
                this._clones = [];
            }
        }
    }, {
        filter: ['items', 'settings'],
        run: function() {
            var i, n, clones = this._clones,
                items = this._items,
                delta = this.settings.loop ? clones.length - Math.max(this.settings.items * 2, 4) : 0;
            for (i = 0, n = Math.abs(delta / 2); i < n; i++) {
                if (delta > 0) {
                    this.jQuerystage.children().eq(items.length + clones.length - 1).remove();
                    clones.pop();
                    this.jQuerystage.children().eq(0).remove();
                    clones.pop();
                } else {
                    clones.push(clones.length / 2);
                    this.jQuerystage.append(items[clones[clones.length - 1]].clone().addClass('cloned'));
                    clones.push(items.length - 1 - (clones.length - 1) / 2);
                    this.jQuerystage.prepend(items[clones[clones.length - 1]].clone().addClass('cloned'));
                }
            }
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function() {
            var rtl = (this.settings.rtl ? 1 : -1),
                width = (this.width() / this.settings.items).toFixed(3),
                coordinate = 0,
                merge, i, n;
            this._coordinates = [];
            for (i = 0, n = this._clones.length + this._items.length; i < n; i++) {
                merge = this._mergers[this.relative(i)];
                merge = (this.settings.mergeFit && Math.min(merge, this.settings.items)) || merge;
                coordinate += (this.settings.autoWidth ? this._items[this.relative(i)].width() + this.settings.margin : width * merge) * rtl;
                this._coordinates.push(coordinate);
            }
        }
    }, {
        filter: ['width', 'items', 'settings'],
        run: function() {
            var i, n, width = (this.width() / this.settings.items).toFixed(3),
                css = { 'width': Math.abs(this._coordinates[this._coordinates.length - 1]) + this.settings.stagePadding * 2, 'padding-left': this.settings.stagePadding || '', 'padding-right': this.settings.stagePadding || '' };
            this.jQuerystage.css(css);
            css = { 'width': this.settings.autoWidth ? 'auto' : width - this.settings.margin };
            css[this.settings.rtl ? 'margin-left' : 'margin-right'] = this.settings.margin;
            if (!this.settings.autoWidth && jQuery.grep(this._mergers, function(v) { return v > 1 }).length > 0) {
                for (i = 0, n = this._coordinates.length; i < n; i++) {
                    css.width = Math.abs(this._coordinates[i]) - Math.abs(this._coordinates[i - 1] || 0) - this.settings.margin;
                    this.jQuerystage.children().eq(i).css(css);
                }
            } else { this.jQuerystage.children().css(css); }
        }
    }, { filter: ['width', 'items', 'settings'], run: function(cache) { cache.current && this.reset(this.jQuerystage.children().index(cache.current)); } }, { filter: ['position'], run: function() { this.animate(this.coordinates(this._current)); } }, {
        filter: ['width', 'position', 'items', 'settings'],
        run: function() {
            var rtl = this.settings.rtl ? 1 : -1,
                padding = this.settings.stagePadding * 2,
                begin = this.coordinates(this.current()) + padding,
                end = begin + this.width() * rtl,
                inner, outer, matches = [],
                i, n;
            for (i = 0, n = this._coordinates.length; i < n; i++) {
                inner = this._coordinates[i - 1] || 0;
                outer = Math.abs(this._coordinates[i]) + padding * rtl;
                if ((this.op(inner, '<=', begin) && (this.op(inner, '>', end))) || (this.op(outer, '<', begin) && this.op(outer, '>', end))) { matches.push(i); }
            }
            this.jQuerystage.children('.' + this.settings.activeClass).removeClass(this.settings.activeClass);
            this.jQuerystage.children(':eq(' + matches.join('), :eq(') + ')').addClass(this.settings.activeClass);
            if (this.settings.center) {
                this.jQuerystage.children('.' + this.settings.centerClass).removeClass(this.settings.centerClass);
                this.jQuerystage.children().eq(this.current()).addClass(this.settings.centerClass);
            }
        }
    }];
    Owl.prototype.initialize = function() {
        this.trigger('initialize');
        this.jQueryelement.addClass(this.settings.baseClass).addClass(this.settings.themeClass).toggleClass('owl-rtl', this.settings.rtl);
        this.browserSupport();
        if (this.settings.autoWidth && this.state.imagesLoaded !== true) {
            var imgs, nestedSelector, width;
            imgs = this.jQueryelement.find('img');
            nestedSelector = this.settings.nestedItemSelector ? '.' + this.settings.nestedItemSelector : undefined;
            width = this.jQueryelement.children(nestedSelector).width();
            if (imgs.length && width <= 0) { this.preloadAutoWidthImages(imgs); return false; }
        }
        this.jQueryelement.addClass('owl-loading');
        this.jQuerystage = jQuery('<' + this.settings.stageElement + ' class="owl-stage"/>').wrap('<div class="owl-stage-outer">');
        this.jQueryelement.append(this.jQuerystage.parent());
        this.replace(this.jQueryelement.children().not(this.jQuerystage.parent()));
        this._width = this.jQueryelement.width();
        this.refresh();
        this.jQueryelement.removeClass('owl-loading').addClass('owl-loaded');
        this.eventsCall();
        this.internalEvents();
        this.addTriggerableEvents();
        this.trigger('initialized');
    };
    Owl.prototype.setup = function() {
        var viewport = this.viewport(),
            overwrites = this.options.responsive,
            match = -1,
            settings = null;
        if (!overwrites) { settings = jQuery.extend({}, this.options); } else {
            jQuery.each(overwrites, function(breakpoint) { if (breakpoint <= viewport && breakpoint > match) { match = Number(breakpoint); } });
            settings = jQuery.extend({}, this.options, overwrites[match]);
            delete settings.responsive;
            if (settings.responsiveClass) { this.jQueryelement.attr('class', function(i, c) { return c.replace(/\b owl-responsive-\S+/g, ''); }).addClass('owl-responsive-' + match); }
        }
        if (this.settings === null || this._breakpoint !== match) {
            this.trigger('change', { property: { name: 'settings', value: settings } });
            this._breakpoint = match;
            this.settings = settings;
            this.invalidate('settings');
            this.trigger('changed', { property: { name: 'settings', value: this.settings } });
        }
    };
    Owl.prototype.optionsLogic = function() {
        this.jQueryelement.toggleClass('owl-center', this.settings.center);
        if (this.settings.loop && this._items.length < this.settings.items) { this.settings.loop = false; }
        if (this.settings.autoWidth) {
            this.settings.stagePadding = false;
            this.settings.merge = false;
        }
    };
    Owl.prototype.prepare = function(item) {
        var event = this.trigger('prepare', { content: item });
        if (!event.data) { event.data = jQuery('<' + this.settings.itemElement + '/>').addClass(this.settings.itemClass).append(item) }
        this.trigger('prepared', { content: event.data });
        return event.data;
    };
    Owl.prototype.update = function() {
        var i = 0,
            n = this._pipe.length,
            filter = jQuery.proxy(function(p) { return this[p] }, this._invalidated),
            cache = {};
        while (i < n) {
            if (this._invalidated.all || jQuery.grep(this._pipe[i].filter, filter).length > 0) { this._pipe[i].run(cache); }
            i++;
        }
        this._invalidated = {};
    };
    Owl.prototype.width = function(dimension) {
        dimension = dimension || Owl.Width.Default;
        switch (dimension) {
            case Owl.Width.Inner:
            case Owl.Width.Outer:
                return this._width;
            default:
                return this._width - this.settings.stagePadding * 2 + this.settings.margin;
        }
    };
    Owl.prototype.refresh = function() {
        if (this._items.length === 0) { return false; }
        var start = new Date().getTime();
        this.trigger('refresh');
        this.setup();
        this.optionsLogic();
        this.jQuerystage.addClass('owl-refresh');
        this.update();
        this.jQuerystage.removeClass('owl-refresh');
        this.state.orientation = window.orientation;
        this.watchVisibility();
        this.trigger('refreshed');
    };
    Owl.prototype.eventsCall = function() {
        this.e._onDragStart = jQuery.proxy(function(e) { this.onDragStart(e); }, this);
        this.e._onDragMove = jQuery.proxy(function(e) { this.onDragMove(e); }, this);
        this.e._onDragEnd = jQuery.proxy(function(e) { this.onDragEnd(e); }, this);
        this.e._onResize = jQuery.proxy(function(e) { this.onResize(e); }, this);
        this.e._transitionEnd = jQuery.proxy(function(e) { this.transitionEnd(e); }, this);
        this.e._preventClick = jQuery.proxy(function(e) { this.preventClick(e); }, this);
    };
    Owl.prototype.onThrottledResize = function() {
        window.clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(this.e._onResize, this.settings.responsiveRefreshRate);
    };
    Owl.prototype.onResize = function() {
        if (!this._items.length) { return false; }
        if (this._width === this.jQueryelement.width()) { return false; }
        if (this.trigger('resize').isDefaultPrevented()) { return false; }
        this._width = this.jQueryelement.width();
        this.invalidate('width');
        this.refresh();
        this.trigger('resized');
    };
    Owl.prototype.eventsRouter = function(event) { var type = event.type; if (type === "mousedown" || type === "touchstart") { this.onDragStart(event); } else if (type === "mousemove" || type === "touchmove") { this.onDragMove(event); } else if (type === "mouseup" || type === "touchend") { this.onDragEnd(event); } else if (type === "touchcancel") { this.onDragEnd(event); } };
    Owl.prototype.internalEvents = function() {
        var isTouch = isTouchSupport(),
            isTouchIE = isTouchSupportIE();
        if (this.settings.mouseDrag) {
            this.jQuerystage.on('mousedown', jQuery.proxy(function(event) { this.eventsRouter(event) }, this));
            this.jQuerystage.on('dragstart', function() { return false });
            this.jQuerystage.get(0).onselectstart = function() { return false };
        } else { this.jQueryelement.addClass('owl-text-select-on'); }
        if (this.settings.touchDrag && !isTouchIE) { this.jQuerystage.on('touchstart touchcancel', jQuery.proxy(function(event) { this.eventsRouter(event) }, this)); }
        if (this.transitionEndVendor) { this.on(this.jQuerystage.get(0), this.transitionEndVendor, this.e._transitionEnd, false); }
        if (this.settings.responsive !== false) { this.on(window, 'resize', jQuery.proxy(this.onThrottledResize, this)); }
    };
    Owl.prototype.onDragStart = function(event) {
        var ev, isTouchEvent, pageX, pageY, animatedPos;
        ev = event.originalEvent || event || window.event;
        if (ev.which === 3 || this.state.isTouch) { return false; }
        if (ev.type === 'mousedown') { this.jQuerystage.addClass('owl-grab'); }
        this.trigger('drag');
        this.drag.startTime = new Date().getTime();
        this.speed(0);
        this.state.isTouch = true;
        this.state.isScrolling = false;
        this.state.isSwiping = false;
        this.drag.distance = 0;
        pageX = getTouches(ev).x;
        pageY = getTouches(ev).y;
        this.drag.offsetX = this.jQuerystage.position().left;
        this.drag.offsetY = this.jQuerystage.position().top;
        if (this.settings.rtl) {
            this.drag.offsetX = this.jQuerystage.position().left + this.jQuerystage.width() - this.width() +
                this.settings.margin;
        }
        if (this.state.inMotion && this.support3d) {
            animatedPos = this.getTransformProperty();
            this.drag.offsetX = animatedPos;
            this.animate(animatedPos);
            this.state.inMotion = true;
        } else if (this.state.inMotion && !this.support3d) { this.state.inMotion = false; return false; }
        this.drag.startX = pageX - this.drag.offsetX;
        this.drag.startY = pageY - this.drag.offsetY;
        this.drag.start = pageX - this.drag.startX;
        this.drag.targetEl = ev.target || ev.srcElement;
        this.drag.updatedX = this.drag.start;
        if (this.drag.targetEl.tagName === "IMG" || this.drag.targetEl.tagName === "A") { this.drag.targetEl.draggable = false; }
        jQuery(document).on('mousemove.owl.dragEvents mouseup.owl.dragEvents touchmove.owl.dragEvents touchend.owl.dragEvents', jQuery.proxy(function(event) { this.eventsRouter(event) }, this));
    };
    Owl.prototype.onDragMove = function(event) {
        var ev, isTouchEvent, pageX, pageY, minValue, maxValue, pull;
        if (!this.state.isTouch) { return; }
        if (this.state.isScrolling) { return; }
        ev = event.originalEvent || event || window.event;
        pageX = getTouches(ev).x;
        pageY = getTouches(ev).y;
        this.drag.currentX = pageX - this.drag.startX;
        this.drag.currentY = pageY - this.drag.startY;
        this.drag.distance = this.drag.currentX - this.drag.offsetX;
        if (this.drag.distance < 0) { this.state.direction = this.settings.rtl ? 'right' : 'left'; } else if (this.drag.distance > 0) { this.state.direction = this.settings.rtl ? 'left' : 'right'; }
        if (this.settings.loop) { if (this.op(this.drag.currentX, '>', this.coordinates(this.minimum())) && this.state.direction === 'right') { this.drag.currentX -= (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length); } else if (this.op(this.drag.currentX, '<', this.coordinates(this.maximum())) && this.state.direction === 'left') { this.drag.currentX += (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length); } } else {
            minValue = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum());
            maxValue = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum());
            pull = this.settings.pullDrag ? this.drag.distance / 5 : 0;
            this.drag.currentX = Math.max(Math.min(this.drag.currentX, minValue + pull), maxValue + pull);
        }
        if ((this.drag.distance > 8 || this.drag.distance < -8)) {
            if (ev.preventDefault !== undefined) { ev.preventDefault(); } else { ev.returnValue = false; }
            this.state.isSwiping = true;
        }
        this.drag.updatedX = this.drag.currentX;
        if ((this.drag.currentY > 16 || this.drag.currentY < -16) && this.state.isSwiping === false) {
            this.state.isScrolling = true;
            this.drag.updatedX = this.drag.start;
        }
        this.animate(this.drag.updatedX);
    };
    Owl.prototype.onDragEnd = function(event) {
        var compareTimes, distanceAbs, closest;
        if (!this.state.isTouch) { return; }
        if (event.type === 'mouseup') { this.jQuerystage.removeClass('owl-grab'); }
        this.trigger('dragged');
        this.drag.targetEl.removeAttribute("draggable");
        this.state.isTouch = false;
        this.state.isScrolling = false;
        this.state.isSwiping = false;
        if (this.drag.distance === 0 && this.state.inMotion !== true) { this.state.inMotion = false; return false; }
        this.drag.endTime = new Date().getTime();
        compareTimes = this.drag.endTime - this.drag.startTime;
        distanceAbs = Math.abs(this.drag.distance);
        if (distanceAbs > 3 || compareTimes > 300) { this.removeClick(this.drag.targetEl); }
        closest = this.closest(this.drag.updatedX);
        this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
        this.current(closest);
        this.invalidate('position');
        this.update();
        if (!this.settings.pullDrag && this.drag.updatedX === this.coordinates(closest)) { this.transitionEnd(); }
        this.drag.distance = 0;
        jQuery(document).off('.owl.dragEvents');
    };
    Owl.prototype.removeClick = function(target) {
        this.drag.targetEl = target;
        jQuery(target).on('click.preventClick', this.e._preventClick);
        window.setTimeout(function() { jQuery(target).off('click.preventClick'); }, 300);
    };
    Owl.prototype.preventClick = function(ev) {
        if (ev.preventDefault) { ev.preventDefault(); } else { ev.returnValue = false; }
        if (ev.stopPropagation) { ev.stopPropagation(); }
        jQuery(ev.target).off('click.preventClick');
    };
    Owl.prototype.getTransformProperty = function() {
        var transform, matrix3d;
        transform = window.getComputedStyle(this.jQuerystage.get(0), null).getPropertyValue(this.vendorName + 'transform');
        transform = transform.replace(/matrix(3d)?\(|\)/g, '').split(',');
        matrix3d = transform.length === 16;
        return matrix3d !== true ? transform[4] : transform[12];
    };
    Owl.prototype.closest = function(coordinate) {
        var position = -1,
            pull = 30,
            width = this.width(),
            coordinates = this.coordinates();
        if (!this.settings.freeDrag) {
            jQuery.each(coordinates, jQuery.proxy(function(index, value) {
                if (coordinate > value - pull && coordinate < value + pull) { position = index; } else if (this.op(coordinate, '<', value) && this.op(coordinate, '>', coordinates[index + 1] || value - width)) { position = this.state.direction === 'left' ? index + 1 : index; }
                return position === -1;
            }, this));
        }
        if (!this.settings.loop) { if (this.op(coordinate, '>', coordinates[this.minimum()])) { position = coordinate = this.minimum(); } else if (this.op(coordinate, '<', coordinates[this.maximum()])) { position = coordinate = this.maximum(); } }
        return position;
    };
    Owl.prototype.animate = function(coordinate) {
        this.trigger('translate');
        this.state.inMotion = this.speed() > 0;
        if (this.support3d) { this.jQuerystage.css({ transform: 'translate3d(' + coordinate + 'px' + ',0px, 0px)', transition: (this.speed() / 1000) + 's ' + this.settings.slideTransition }); } else if (this.state.isTouch) { this.jQuerystage.css({ left: coordinate + 'px' }); } else { this.jQuerystage.animate({ left: coordinate }, this.speed() / 1000, this.settings.fallbackEasing, jQuery.proxy(function() { if (this.state.inMotion) { this.transitionEnd(); } }, this)); }
    };
    Owl.prototype.current = function(position) {
        if (position === undefined) { return this._current; }
        if (this._items.length === 0) { return undefined; }
        position = this.normalize(position);
        if (this._current !== position) {
            var event = this.trigger('change', { property: { name: 'position', value: position } });
            if (event.data !== undefined) { position = this.normalize(event.data); }
            this._current = position;
            this.invalidate('position');
            this.trigger('changed', { property: { name: 'position', value: this._current } });
        }
        return this._current;
    };
    Owl.prototype.invalidate = function(part) { this._invalidated[part] = true; }
    Owl.prototype.reset = function(position) {
        position = this.normalize(position);
        if (position === undefined) { return; }
        this._speed = 0;
        this._current = position;
        this.suppress(['translate', 'translated']);
        this.animate(this.coordinates(position));
        this.release(['translate', 'translated']);
    };
    Owl.prototype.normalize = function(position, relative) {
        var n = (relative ? this._items.length : this._items.length + this._clones.length);
        if (!jQuery.isNumeric(position) || n < 1) { return undefined; }
        if (this._clones.length) { position = ((position % n) + n) % n; } else { position = Math.max(this.minimum(relative), Math.min(this.maximum(relative), position)); }
        return position;
    };
    Owl.prototype.relative = function(position) {
        position = this.normalize(position);
        position = position - this._clones.length / 2;
        return this.normalize(position, true);
    };
    Owl.prototype.maximum = function(relative) {
        var maximum, width, i = 0,
            coordinate, settings = this.settings;
        if (relative) { return this._items.length - 1; }
        if (!settings.loop && settings.center) { maximum = this._items.length - 1; } else if (!settings.loop && !settings.center) { maximum = this._items.length - settings.items; } else if (settings.loop || settings.center) { maximum = this._items.length + settings.items; } else if (settings.autoWidth || settings.merge) {
            revert = settings.rtl ? 1 : -1;
            width = this.jQuerystage.width() - this.jQueryelement.width();
            while (coordinate = this.coordinates(i)) {
                if (coordinate * revert >= width) { break; }
                maximum = ++i;
            }
        } else { throw 'Can not detect maximum absolute position.' }
        return maximum;
    };
    Owl.prototype.minimum = function(relative) {
        if (relative) { return 0; }
        return this._clones.length / 2;
    };
    Owl.prototype.items = function(position) {
        if (position === undefined) { return this._items.slice(); }
        position = this.normalize(position, true);
        return this._items[position];
    };
    Owl.prototype.mergers = function(position) {
        if (position === undefined) { return this._mergers.slice(); }
        position = this.normalize(position, true);
        return this._mergers[position];
    };
    Owl.prototype.clones = function(position) {
        var odd = this._clones.length / 2,
            even = odd + this._items.length,
            map = function(index) { return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2 };
        if (position === undefined) { return jQuery.map(this._clones, function(v, i) { return map(i) }); }
        return jQuery.map(this._clones, function(v, i) { return v === position ? map(i) : null });
    };
    Owl.prototype.speed = function(speed) {
        if (speed !== undefined) { this._speed = speed; }
        return this._speed;
    };
    Owl.prototype.coordinates = function(position) {
        var coordinate = null;
        if (position === undefined) { return jQuery.map(this._coordinates, jQuery.proxy(function(coordinate, index) { return this.coordinates(index); }, this)); }
        if (this.settings.center) {
            coordinate = this._coordinates[position];
            coordinate += (this.width() - coordinate + (this._coordinates[position - 1] || 0)) / 2 * (this.settings.rtl ? -1 : 1);
        } else { coordinate = this._coordinates[position - 1] || 0; }
        return coordinate;
    };
    Owl.prototype.duration = function(from, to, factor) { return Math.min(Math.max(Math.abs(to - from), 1), 6) * Math.abs((factor || this.settings.smartSpeed)); };
    Owl.prototype.to = function(position, speed) {
        if (this.settings.loop) {
            var distance = position - this.relative(this.current()),
                revert = this.current(),
                before = this.current(),
                after = this.current() + distance,
                direction = before - after < 0 ? true : false,
                items = this._clones.length + this._items.length;
            if (after < this.settings.items && direction === false) {
                revert = before + this._items.length;
                this.reset(revert);
            } else if (after >= items - this.settings.items && direction === true) {
                revert = before - this._items.length;
                this.reset(revert);
            }
            window.clearTimeout(this.e._goToLoop);
            this.e._goToLoop = window.setTimeout(jQuery.proxy(function() {
                this.speed(this.duration(this.current(), revert + distance, speed));
                this.current(revert + distance);
                this.update();
            }, this), 30);
        } else {
            this.speed(this.duration(this.current(), position, speed));
            this.current(position);
            this.update();
        }
    };
    Owl.prototype.next = function(speed) {
        speed = speed || false;
        this.to(this.relative(this.current()) + 1, speed);
    };
    Owl.prototype.prev = function(speed) {
        speed = speed || false;
        this.to(this.relative(this.current()) - 1, speed);
    };
    Owl.prototype.transitionEnd = function(event) {
        if (event !== undefined) { event.stopPropagation(); if ((event.target || event.srcElement || event.originalTarget) !== this.jQuerystage.get(0)) { return false; } }
        this.state.inMotion = false;
        this.trigger('translated');
    };
    Owl.prototype.viewport = function() {
        var width;
        if (this.options.responsiveBaseElement !== window) { width = jQuery(this.options.responsiveBaseElement).width(); } else if (window.innerWidth) { width = window.innerWidth; } else if (document.documentElement && document.documentElement.clientWidth) { width = document.documentElement.clientWidth; } else { throw 'Can not detect viewport width.'; }
        return width;
    };
    Owl.prototype.replace = function(content) {
        this.jQuerystage.empty();
        this._items = [];
        if (content) { content = (content instanceof jQuery) ? content : jQuery(content); }
        if (this.settings.nestedItemSelector) { content = content.find('.' + this.settings.nestedItemSelector); }
        content.filter(function() { return this.nodeType === 1; }).each(jQuery.proxy(function(index, item) {
            item = this.prepare(item);
            this.jQuerystage.append(item);
            this._items.push(item);
            this._mergers.push(item.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
        }, this));
        this.reset(jQuery.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0);
        this.invalidate('items');
    };
    Owl.prototype.add = function(content, position) {
        position = position === undefined ? this._items.length : this.normalize(position, true);
        this.trigger('add', { content: content, position: position });
        if (this._items.length === 0 || position === this._items.length) {
            this.jQuerystage.append(content);
            this._items.push(content);
            this._mergers.push(content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
        } else {
            this._items[position].before(content);
            this._items.splice(position, 0, content);
            this._mergers.splice(position, 0, content.find('[data-merge]').andSelf('[data-merge]').attr('data-merge') * 1 || 1);
        }
        this.invalidate('items');
        this.trigger('added', { content: content, position: position });
    };
    Owl.prototype.remove = function(position) {
        position = this.normalize(position, true);
        if (position === undefined) { return; }
        this.trigger('remove', { content: this._items[position], position: position });
        this._items[position].remove();
        this._items.splice(position, 1);
        this._mergers.splice(position, 1);
        this.invalidate('items');
        this.trigger('removed', { content: null, position: position });
    };
    Owl.prototype.addTriggerableEvents = function() {
        var handler = jQuery.proxy(function(callback, event) {
            return jQuery.proxy(function(e) {
                if (e.relatedTarget !== this) {
                    this.suppress([event]);
                    callback.apply(this, [].slice.call(arguments, 1));
                    this.release([event]);
                }
            }, this);
        }, this);
        jQuery.each({ 'next': this.next, 'prev': this.prev, 'to': this.to, 'destroy': this.destroy, 'refresh': this.refresh, 'replace': this.replace, 'add': this.add, 'remove': this.remove }, jQuery.proxy(function(event, callback) { this.jQueryelement.on(event + '.owl.carousel', handler(callback, event + '.owl.carousel')); }, this));
    };
    Owl.prototype.watchVisibility = function() {
        if (!isElVisible(this.jQueryelement.get(0))) {
            this.jQueryelement.addClass('owl-hidden');
            window.clearInterval(this.e._checkVisibile);
            this.e._checkVisibile = window.setInterval(jQuery.proxy(checkVisible, this), 500);
        }

        function isElVisible(el) { return el.offsetWidth > 0 && el.offsetHeight > 0; }

        function checkVisible() {
            if (isElVisible(this.jQueryelement.get(0))) {
                this.jQueryelement.removeClass('owl-hidden');
                this.refresh();
                window.clearInterval(this.e._checkVisibile);
            }
        }
    };
    Owl.prototype.preloadAutoWidthImages = function(imgs) {
        var loaded, that, jQueryel, img;
        loaded = 0;
        that = this;
        imgs.each(function(i, el) {
            jQueryel = jQuery(el);
            img = new Image();
            img.onload = function() {
                loaded++;
                jQueryel.attr('src', img.src);
                jQueryel.css('opacity', 1);
                if (loaded >= imgs.length) {
                    that.state.imagesLoaded = true;
                    that.initialize();
                }
            };
            img.src = jQueryel.attr('src') || jQueryel.attr('data-src') || jQueryel.attr('data-src-retina');
        });
    };
    Owl.prototype.destroy = function() {
        if (this.jQueryelement.hasClass(this.settings.themeClass)) { this.jQueryelement.removeClass(this.settings.themeClass); }
        if (this.settings.responsive !== false) { jQuery(window).off('resize.owl.carousel'); }
        if (this.transitionEndVendor) { this.off(this.jQuerystage.get(0), this.transitionEndVendor, this.e._transitionEnd); }
        for (var i in this._plugins) { this._plugins[i].destroy(); }
        if (this.settings.mouseDrag || this.settings.touchDrag) {
            this.jQuerystage.off('mousedown touchstart touchcancel');
            jQuery(document).off('.owl.dragEvents');
            this.jQuerystage.get(0).onselectstart = function() {};
            this.jQuerystage.off('dragstart', function() { return false });
        }
        this.jQueryelement.off('.owl');
        this.jQuerystage.children('.cloned').remove();
        this.e = null;
        this.jQueryelement.removeData('owlCarousel');
        this.jQuerystage.children().contents().unwrap();
        this.jQuerystage.children().unwrap();
        this.jQuerystage.unwrap();
    };
    Owl.prototype.op = function(a, o, b) {
        var rtl = this.settings.rtl;
        switch (o) {
            case '<':
                return rtl ? a > b : a < b;
            case '>':
                return rtl ? a < b : a > b;
            case '>=':
                return rtl ? a <= b : a >= b;
            case '<=':
                return rtl ? a >= b : a <= b;
            default:
                break;
        }
    };
    Owl.prototype.on = function(element, event, listener, capture) { if (element.addEventListener) { element.addEventListener(event, listener, capture); } else if (element.attachEvent) { element.attachEvent('on' + event, listener); } };
    Owl.prototype.off = function(element, event, listener, capture) { if (element.removeEventListener) { element.removeEventListener(event, listener, capture); } else if (element.detachEvent) { element.detachEvent('on' + event, listener); } };
    Owl.prototype.trigger = function(name, data, namespace) {
        var status = { item: { count: this._items.length, index: this.current() } },
            handler = jQuery.camelCase(jQuery.grep(['on', name, namespace], function(v) { return v }).join('-').toLowerCase()),
            event = jQuery.Event([name, 'owl', namespace || 'carousel'].join('.').toLowerCase(), jQuery.extend({ relatedTarget: this }, status, data));
        if (!this._supress[name]) {
            jQuery.each(this._plugins, function(name, plugin) { if (plugin.onTrigger) { plugin.onTrigger(event); } });
            this.jQueryelement.trigger(event);
            if (this.settings && typeof this.settings[handler] === 'function') { this.settings[handler].apply(this, event); }
        }
        return event;
    };
    Owl.prototype.suppress = function(events) { jQuery.each(events, jQuery.proxy(function(index, event) { this._supress[event] = true; }, this)); }
    Owl.prototype.release = function(events) { jQuery.each(events, jQuery.proxy(function(index, event) { delete this._supress[event]; }, this)); }
    Owl.prototype.browserSupport = function() {
        this.support3d = isPerspective();
        if (this.support3d) {
            this.transformVendor = isTransform();
            var endVendors = ['transitionend', 'webkitTransitionEnd', 'transitionend', 'oTransitionEnd'];
            this.transitionEndVendor = endVendors[isTransition()];
            this.vendorName = this.transformVendor.replace(/Transform/i, '');
            this.vendorName = this.vendorName !== '' ? '-' + this.vendorName.toLowerCase() + '-' : '';
        }
        this.state.orientation = window.orientation;
    };

    function getTouches(event) {
        if (event.touches !== undefined) { return { x: event.touches[0].pageX, y: event.touches[0].pageY }; }
        if (event.touches === undefined) {
            if (event.pageX !== undefined) { return { x: event.pageX, y: event.pageY }; }
            if (event.pageX === undefined) { return { x: event.clientX, y: event.clientY }; }
        }
    }

    function isStyleSupported(array) {
        var p, s, fake = document.createElement('div'),
            list = array;
        for (p in list) { s = list[p]; if (typeof fake.style[s] !== 'undefined') { fake = null; return [s, p]; } }
        return [false];
    }

    function isTransition() { return isStyleSupported(['transition', 'WebkitTransition', 'MozTransition', 'OTransition'])[1]; }

    function isTransform() { return isStyleSupported(['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'])[0]; }

    function isPerspective() { return isStyleSupported(['perspective', 'webkitPerspective', 'MozPerspective', 'OPerspective', 'MsPerspective'])[0]; }

    function isTouchSupport() { return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints); }

    function isTouchSupportIE() { return window.navigator.msPointerEnabled; }
    jQuery.fn.owlCarousel = function(options) { return this.each(function() { if (!jQuery(this).data('owlCarousel')) { jQuery(this).data('owlCarousel', new Owl(this, options)); } }); };
    jQuery.fn.owlCarousel.Constructor = Owl;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    var Lazy = function(carousel) {
        this._core = carousel;
        this._loaded = [];
        this._handlers = {
            'initialized.owl.carousel change.owl.carousel': jQuery.proxy(function(e) {
                if (!e.namespace) { return; }
                if (!this._core.settings || !this._core.settings.lazyLoad) { return; }
                if ((e.property && e.property.name == 'position') || e.type == 'initialized') {
                    var settings = this._core.settings,
                        n = (settings.center && Math.ceil(settings.items / 2) || settings.items),
                        i = ((settings.center && n * -1) || 0),
                        position = ((e.property && e.property.value) || this._core.current()) + i,
                        clones = this._core.clones().length,
                        load = jQuery.proxy(function(i, v) { this.load(v) }, this);
                    while (i++ < n) {
                        this.load(clones / 2 + this._core.relative(position));
                        clones && jQuery.each(this._core.clones(this._core.relative(position++)), load);
                    }
                }
            }, this)
        };
        this._core.options = jQuery.extend({}, Lazy.Defaults, this._core.options);
        this._core.jQueryelement.on(this._handlers);
    }
    Lazy.Defaults = { lazyLoad: false }
    Lazy.prototype.load = function(position) {
        var jQueryitem = this._core.jQuerystage.children().eq(position),
            jQueryelements = jQueryitem && jQueryitem.find('.owl-lazy');
        if (!jQueryelements || jQuery.inArray(jQueryitem.get(0), this._loaded) > -1) { return; }
        jQueryelements.each(jQuery.proxy(function(index, element) {
            var jQueryelement = jQuery(element),
                image, url = (window.devicePixelRatio > 1 && jQueryelement.attr('data-src-retina')) || jQueryelement.attr('data-src');
            this._core.trigger('load', { element: jQueryelement, url: url }, 'lazy');
            if (jQueryelement.is('img')) {
                jQueryelement.one('load.owl.lazy', jQuery.proxy(function() {
                    jQueryelement.css('opacity', 1);
                    this._core.trigger('loaded', { element: jQueryelement, url: url }, 'lazy');
                }, this)).attr('src', url);
            } else {
                image = new Image();
                image.onload = jQuery.proxy(function() {
                    jQueryelement.css({ 'background-image': 'url(' + url + ')', 'opacity': '1' });
                    this._core.trigger('loaded', { element: jQueryelement, url: url }, 'lazy');
                }, this);
                image.src = url;
            }
        }, this));
        this._loaded.push(jQueryitem.get(0));
    }
    Lazy.prototype.destroy = function() {
        var handler, property;
        for (handler in this.handlers) { this._core.jQueryelement.off(handler, this.handlers[handler]); }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null); }
    }
    jQuery.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    var AutoHeight = function(carousel) {
        this._core = carousel;
        this._handlers = { 'initialized.owl.carousel': jQuery.proxy(function() { if (this._core.settings.autoHeight) { this.update(); } }, this), 'changed.owl.carousel': jQuery.proxy(function(e) { if (this._core.settings.autoHeight && e.property.name == 'position') { this.update(); } }, this), 'loaded.owl.lazy': jQuery.proxy(function(e) { if (this._core.settings.autoHeight && e.element.closest('.' + this._core.settings.itemClass) === this._core.jQuerystage.children().eq(this._core.current())) { this.update(); } }, this) };
        this._core.options = jQuery.extend({}, AutoHeight.Defaults, this._core.options);
        this._core.jQueryelement.on(this._handlers);
    };
    AutoHeight.Defaults = { autoHeight: false, autoHeightClass: 'owl-height' };
    AutoHeight.prototype.update = function() { this._core.jQuerystage.parent().height(this._core.jQuerystage.children().eq(this._core.current()).height()).addClass(this._core.settings.autoHeightClass); };
    AutoHeight.prototype.destroy = function() {
        var handler, property;
        for (handler in this._handlers) { this._core.jQueryelement.off(handler, this._handlers[handler]); }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null); }
    };
    jQuery.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    var Video = function(carousel) {
        this._core = carousel;
        this._videos = {};
        this._playing = null;
        this._fullscreen = false;
        this._handlers = { 'resize.owl.carousel': jQuery.proxy(function(e) { if (this._core.settings.video && !this.isInFullScreen()) { e.preventDefault(); } }, this), 'refresh.owl.carousel changed.owl.carousel': jQuery.proxy(function(e) { if (this._playing) { this.stop(); } }, this), 'prepared.owl.carousel': jQuery.proxy(function(e) { var jQueryelement = jQuery(e.content).find('.owl-video'); if (jQueryelement.length) { this.fetch(jQueryelement, jQuery(e.content)); } }, this) };
        this._core.options = jQuery.extend({}, Video.Defaults, this._core.options);
        this._core.jQueryelement.on(this._handlers);
        this._core.jQueryelement.on('click.owl.video', '.owl-video-play-icon', jQuery.proxy(function(e) {
            console.log('clicked');
            this.play(e);
        }, this));
    };
    Video.Defaults = { video: false, videoHeight: false, videoWidth: false };
    Video.prototype.fetch = function(target, item) {
        var type = target.attr('data-vimeo-id') ? 'vimeo' : 'youtube',
            id = target.attr('data-vimeo-id') || target.attr('data-youtube-id'),
            width = target.attr('data-width') || this._core.settings.videoWidth,
            height = target.attr('data-height') || this._core.settings.videoHeight,
            url = target.attr('href');
        if (url) {
            id = url.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/);
            if (id[3].indexOf('youtu') > -1) { type = 'youtube'; } else if (id[3].indexOf('vimeo') > -1) { type = 'vimeo'; } else { throw new Error('Video URL not supported.'); }
            id = id[6];
        } else { throw new Error('Missing video URL.'); }
        this._videos[url] = { type: type, id: id, width: width, height: height };
        item.attr('data-video', url);
        this.thumbnail(target, this._videos[url]);
    };
    Video.prototype.thumbnail = function(target, video) {
        var tnLink, icon, path, dimensions = video.width && video.height ? 'style="width:' + video.width + 'px;height:' + video.height + 'px;"' : '',
            customTn = target.find('img'),
            srcType = 'src',
            lazyClass = '',
            settings = this._core.settings,
            create = function(path) {
                icon = '<div class="owl-video-play-icon"></div>';
                if (settings.lazyLoad) { tnLink = '<div class="owl-video-tn ' + lazyClass + '" ' + srcType + '="' + path + '"></div>'; } else { tnLink = '<div class="owl-video-tn" style="opacity:1;background-image:url(' + path + ')"></div>'; }
                target.after(tnLink);
                target.after(icon);
            };
        target.wrap('<div class="owl-video-wrapper"' + dimensions + '></div>');
        if (this._core.settings.lazyLoad) {
            srcType = 'data-src';
            lazyClass = 'owl-lazy';
        }
        if (customTn.length) { create(customTn.attr(srcType)); return false; }
        if (video.type === 'youtube') {
            path = "http://img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
            create(path);
        } else if (video.type === 'vimeo') {
            jQuery.ajax({
                type: 'GET',
                url: 'http://vimeo.com/api/v2/video/' + video.id + '.json',
                jsonp: 'callback',
                dataType: 'jsonp',
                success: function(data) {
                    path = data[0].thumbnail_large;
                    create(path);
                }
            });
        }
    };
    Video.prototype.stop = function() {
        this._core.trigger('stop', null, 'video');
        this._playing.find('.owl-video-frame').remove();
        this._playing.find('img').css('display', 'block');
        this._playing.removeClass('owl-video-playing');
        this._playing = null;
    };
    Video.prototype.play = function(ev) {
        var target = jQuery(ev.target || ev.srcElement),
            item = target.closest('.' + this._core.settings.itemClass),
            video = this._videos[item.attr('data-video')],
            width = video.width || '100%',
            height = video.height || this._core.jQuerystage.height(),
            html, wrap;
        target.prev().find('img').css('display', 'none');
        this._core.trigger('play', null, 'video');
        if (this._playing) { this.stop(); }
        if (video.type === 'youtube') {
            html = '<iframe width="' + width + '" height="' + height + '" src="http://www.youtube.com/embed/' +
                video.id + '?autoplay=1&v=' + video.id + '" frameborder="0" allowfullscreen></iframe>';
        } else if (video.type === 'vimeo') {
            html = '<iframe src="http://player.vimeo.com/video/' + video.id + '?autoplay=1" width="' + width +
                '" height="' + height +
                '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
        }
        item.addClass('owl-video-playing');
        this._playing = item;
        wrap = jQuery('<div style="height:' + height + 'px; width:' + width + 'px" class="owl-video-frame">' +
            html + '</div>');
        target.after(wrap);
    };
    Video.prototype.isInFullScreen = function() {
        var element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        if (element && jQuery(element).parent().hasClass('owl-video-frame')) {
            this._core.speed(0);
            this._fullscreen = true;
        }
        if (element && this._fullscreen && this._playing) { return false; }
        if (this._fullscreen) { this._fullscreen = false; return false; }
        if (this._playing) { if (this._core.state.orientation !== window.orientation) { this._core.state.orientation = window.orientation; return false; } }
        return true;
    };
    Video.prototype.destroy = function() {
        var handler, property;
        this._core.jQueryelement.off('click.owl.video');
        for (handler in this._handlers) { this._core.jQueryelement.off(handler, this._handlers[handler]); }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null); }
    };
    jQuery.fn.owlCarousel.Constructor.Plugins.Video = Video;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    var Animate = function(scope) {
        this.core = scope;
        this.core.options = jQuery.extend({}, Animate.Defaults, this.core.options);
        this.swapping = true;
        this.previous = undefined;
        this.next = undefined;
        this.handlers = {
            'change.owl.carousel': jQuery.proxy(function(e) {
                if (e.property.name == 'position') {
                    this.previous = this.core.current();
                    this.next = e.property.value;
                }
            }, this),
            'drag.owl.carousel dragged.owl.carousel translated.owl.carousel': jQuery.proxy(function(e) { this.swapping = e.type == 'translated'; }, this),
            'translate.owl.carousel': jQuery.proxy(function(e) { if (this.swapping && (this.core.options.animateOut || this.core.options.animateIn)) { this.swap(); } }, this)
        };
        this.core.jQueryelement.on(this.handlers);
    };
    Animate.Defaults = { animateOut: false, animateIn: false };
    Animate.prototype.swap = function() {
        if (this.core.settings.items !== 1 || !this.core.support3d) { return; }
        this.core.speed(0);
        var left, clear = jQuery.proxy(this.clear, this),
            previous = this.core.jQuerystage.children().eq(this.previous),
            next = this.core.jQuerystage.children().eq(this.next),
            incoming = this.core.settings.animateIn,
            outgoing = this.core.settings.animateOut;
        if (this.core.current() === this.previous) { return; }
        if (outgoing) {
            left = this.core.coordinates(this.previous) - this.core.coordinates(this.next);
            previous.css({ 'left': left + 'px' }).addClass('animated owl-animated-out').addClass(outgoing).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', clear);
        }
        if (incoming) { next.addClass('animated owl-animated-in').addClass(incoming).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', clear); }
    };
    Animate.prototype.clear = function(e) {
        jQuery(e.target).css({ 'left': '' }).removeClass('animated owl-animated-out owl-animated-in').removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut);
        this.core.transitionEnd();
    }
    Animate.prototype.destroy = function() {
        var handler, property;
        for (handler in this.handlers) { this.core.jQueryelement.off(handler, this.handlers[handler]); }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null); }
    };
    jQuery.fn.owlCarousel.Constructor.Plugins.Animate = Animate;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    var Autoplay = function(scope) {
        this.core = scope;
        this.core.options = jQuery.extend({}, Autoplay.Defaults, this.core.options);
        this.handlers = { 'translated.owl.carousel refreshed.owl.carousel': jQuery.proxy(function() { this.autoplay(); }, this), 'play.owl.autoplay': jQuery.proxy(function(e, t, s) { this.play(t, s); }, this), 'stop.owl.autoplay': jQuery.proxy(function() { this.stop(); }, this), 'mouseover.owl.autoplay': jQuery.proxy(function() { if (this.core.settings.autoplayHoverPause) { this.pause(); } }, this), 'mouseleave.owl.autoplay': jQuery.proxy(function() { if (this.core.settings.autoplayHoverPause && this.core.jQueryelement.find('.owl-video-playing').length == 0) { this.autoplay(); } }, this) };
        this.core.jQueryelement.on(this.handlers);
    };
    Autoplay.Defaults = { autoplay: false, autoplayTimeout: 5000, autoplayHoverPause: false, autoplaySpeed: false };
    Autoplay.prototype.autoplay = function() {
        if (this.core.settings.autoplay && !this.core.state.videoPlay) {
            window.clearTimeout(this.interval);
            this.interval = window.setTimeout(jQuery.proxy(function() { this.play(); }, this), this.core.settings.autoplayTimeout);
        } else { window.clearTimeout(this.interval); }
    };
    Autoplay.prototype.play = function(timeout, speed) {
        if (document.hidden === true) { return; }
        if (this.core.state.isTouch || this.core.state.isScrolling || this.core.state.isSwiping || this.core.state.inMotion) { return; }
        if (this.core.settings.autoplay === false) { window.clearInterval(this.interval); return; }
        this.core.next(this.core.settings.autoplaySpeed);
    };
    Autoplay.prototype.stop = function() { window.clearInterval(this.interval); };
    Autoplay.prototype.pause = function() { window.clearInterval(this.interval); };
    Autoplay.prototype.destroy = function() {
        var handler, property;
        window.clearInterval(this.interval);
        for (handler in this.handlers) { this.core.jQueryelement.off(handler, this.handlers[handler]); }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null); }
    };
    jQuery.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    'use strict';
    var Navigation = function(carousel) {
        this._core = carousel;
        this._initialized = false;
        this._pages = [];
        this._controls = {};
        this._templates = [];
        this.jQueryelement = this._core.jQueryelement;
        this._overrides = { next: this._core.next, prev: this._core.prev, to: this._core.to };
        this._handlers = {
            'prepared.owl.carousel': jQuery.proxy(function(e) { if (this._core.settings.dotsData) { this._templates.push(jQuery(e.content).find('[data-dot]').andSelf('[data-dot]').attr('data-dot')); } }, this),
            'add.owl.carousel': jQuery.proxy(function(e) { if (this._core.settings.dotsData) { this._templates.splice(e.position, 0, jQuery(e.content).find('[data-dot]').andSelf('[data-dot]').attr('data-dot')); } }, this),
            'remove.owl.carousel prepared.owl.carousel': jQuery.proxy(function(e) { if (this._core.settings.dotsData) { this._templates.splice(e.position, 1); } }, this),
            'change.owl.carousel': jQuery.proxy(function(e) {
                if (e.property.name == 'position') {
                    if (!this._core.state.revert && !this._core.settings.loop && this._core.settings.navRewind) {
                        var current = this._core.current(),
                            maximum = this._core.maximum(),
                            minimum = this._core.minimum();
                        e.data = e.property.value > maximum ? current >= maximum ? minimum : maximum : e.property.value < minimum ? maximum : e.property.value;
                    }
                }
            }, this),
            'changed.owl.carousel': jQuery.proxy(function(e) { if (e.property.name == 'position') { this.draw(); } }, this),
            'refreshed.owl.carousel': jQuery.proxy(function() {
                if (!this._initialized) {
                    this.initialize();
                    this._initialized = true;
                }
                this._core.trigger('refresh', null, 'navigation');
                this.update();
                this.draw();
                this._core.trigger('refreshed', null, 'navigation');
            }, this)
        };
        this._core.options = jQuery.extend({}, Navigation.Defaults, this._core.options);
        this.jQueryelement.on(this._handlers);
    }
    Navigation.Defaults = { nav: false, navRewind: true, navText: ['prev', 'next'], navSpeed: false, navElement: 'div', navContainer: false, navContainerClass: 'owl-nav', navClass: ['owl-prev', 'owl-next'], slideBy: 1, dotClass: 'owl-dot', dotsClass: 'owl-dots', dots: true, dotsEach: false, dotData: false, dotsSpeed: false, dotsContainer: false, controlsClass: 'owl-controls' }
    Navigation.prototype.initialize = function() {
        var jQuerycontainer, override, options = this._core.settings;
        if (!options.dotsData) { this._templates = [jQuery('<div>').addClass(options.dotClass).append(jQuery('<span>')).prop('outerHTML')]; }
        if (!options.navContainer || !options.dotsContainer) { this._controls.jQuerycontainer = jQuery('<div>').addClass(options.controlsClass).appendTo(this.jQueryelement); }
        this._controls.jQueryindicators = options.dotsContainer ? jQuery(options.dotsContainer) : jQuery('<div>').hide().addClass(options.dotsClass).appendTo(this.jQueryelement);
        this._controls.jQueryindicators.on('click', 'div', jQuery.proxy(function(e) {
            var index = jQuery(e.target).parent().is(this._controls.jQueryindicators) ? jQuery(e.target).index() : jQuery(e.target).parent().index();
            e.preventDefault();
            this.to(index, options.dotsSpeed);
        }, this));
        jQuerycontainer = options.navContainer ? jQuery(options.navContainer) : jQuery('<div>').addClass(options.navContainerClass).prependTo(this._controls.jQuerycontainer);
        this._controls.jQuerynext = jQuery('<' + options.navElement + '>');
        this._controls.jQueryprevious = this._controls.jQuerynext.clone();
        this._controls.jQueryprevious.addClass(options.navClass[0]).html(options.navText[0]).hide().prependTo(jQuerycontainer).on('click', jQuery.proxy(function(e) { this.prev(options.navSpeed); }, this));
        this._controls.jQuerynext.addClass(options.navClass[1]).html(options.navText[1]).hide().appendTo(jQuerycontainer).on('click', jQuery.proxy(function(e) { this.next(options.navSpeed); }, this));
        for (override in this._overrides) { this._core[override] = jQuery.proxy(this[override], this); }
    }
    Navigation.prototype.destroy = function() {
        var handler, control, property, override;
        for (handler in this._handlers) { this.jQueryelement.off(handler, this._handlers[handler]); }
        for (control in this._controls) { this._controls[control].remove(); }
        for (override in this.overides) { this._core[override] = this._overrides[override]; }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null); }
    }
    Navigation.prototype.update = function() {
        var i, j, k, options = this._core.settings,
            lower = this._core.clones().length / 2,
            upper = lower + this._core.items().length,
            size = options.center || options.autoWidth || options.dotData ? 1 : options.dotsEach || options.items;
        if (options.slideBy !== 'page') { options.slideBy = Math.min(options.slideBy, options.items); }
        if (options.dots || options.slideBy == 'page') {
            this._pages = [];
            for (i = lower, j = 0, k = 0; i < upper; i++) {
                if (j >= size || j === 0) {
                    this._pages.push({ start: i - lower, end: i - lower + size - 1 });
                    j = 0, ++k;
                }
                j += this._core.mergers(this._core.relative(i));
            }
        }
    }
    Navigation.prototype.draw = function() {
        var difference, i, html = '',
            options = this._core.settings,
            jQueryitems = this._core.jQuerystage.children(),
            index = this._core.relative(this._core.current());
        if (options.nav && !options.loop && !options.navRewind) {
            this._controls.jQueryprevious.toggleClass('disabled', index <= 0);
            this._controls.jQuerynext.toggleClass('disabled', index >= this._core.maximum());
        }
        this._controls.jQueryprevious.toggle(options.nav);
        this._controls.jQuerynext.toggle(options.nav);
        if (options.dots) {
            difference = this._pages.length - this._controls.jQueryindicators.children().length;
            if (options.dotData && difference !== 0) {
                for (i = 0; i < this._controls.jQueryindicators.children().length; i++) { html += this._templates[this._core.relative(i)]; }
                this._controls.jQueryindicators.html(html);
            } else if (difference > 0) {
                html = new Array(difference + 1).join(this._templates[0]);
                this._controls.jQueryindicators.append(html);
            } else if (difference < 0) { this._controls.jQueryindicators.children().slice(difference).remove(); }
            this._controls.jQueryindicators.find('.active').removeClass('active');
            this._controls.jQueryindicators.children().eq(jQuery.inArray(this.current(), this._pages)).addClass('active');
        }
        this._controls.jQueryindicators.toggle(options.dots);
    }
    Navigation.prototype.onTrigger = function(event) {
        var settings = this._core.settings;
        event.page = { index: jQuery.inArray(this.current(), this._pages), count: this._pages.length, size: settings && (settings.center || settings.autoWidth || settings.dotData ? 1 : settings.dotsEach || settings.items) };
    }
    Navigation.prototype.current = function() { var index = this._core.relative(this._core.current()); return jQuery.grep(this._pages, function(o) { return o.start <= index && o.end >= index; }).pop(); }
    Navigation.prototype.getPosition = function(successor) {
        var position, length, options = this._core.settings;
        if (options.slideBy == 'page') {
            position = jQuery.inArray(this.current(), this._pages);
            length = this._pages.length;
            successor ? ++position : --position;
            position = this._pages[((position % length) + length) % length].start;
        } else {
            position = this._core.relative(this._core.current());
            length = this._core.items().length;
            successor ? position += options.slideBy : position -= options.slideBy;
        }
        return position;
    }
    Navigation.prototype.next = function(speed) { jQuery.proxy(this._overrides.to, this._core)(this.getPosition(true), speed); }
    Navigation.prototype.prev = function(speed) { jQuery.proxy(this._overrides.to, this._core)(this.getPosition(false), speed); }
    Navigation.prototype.to = function(position, speed, standard) {
        var length;
        if (!standard) {
            length = this._pages.length;
            jQuery.proxy(this._overrides.to, this._core)(this._pages[((position % length) + length) % length].start, speed);
        } else { jQuery.proxy(this._overrides.to, this._core)(position, speed); }
    }
    jQuery.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;
})(window.Zepto || window.jQuery, window, document);;
(function(jQuery, window, document, undefined) {
    'use strict';
    var Hash = function(carousel) {
        this._core = carousel;
        this._hashes = {};
        this.jQueryelement = this._core.jQueryelement;
        this._handlers = {
            'initialized.owl.carousel': jQuery.proxy(function() { if (this._core.settings.startPosition == 'URLHash') { jQuery(window).trigger('hashchange.owl.navigation') } }, this),
            'prepared.owl.carousel': jQuery.proxy(function(e) {
                var hash = jQuery(e.content).find('[data-hash]').andSelf('[data-hash]').attr('data-hash');
                this._hashes[hash] = e.content
            }, this)
        };
        this._core.options = jQuery.extend({}, Hash.Defaults, this._core.options);
        this.jQueryelement.on(this._handlers);
        jQuery(window).on('hashchange.owl.navigation', jQuery.proxy(function() {
            var hash = window.location.hash.substring(1),
                items = this._core.jQuerystage.children(),
                position = this._hashes[hash] && items.index(this._hashes[hash]) || 0;
            if (!hash) { return !1 }
            this._core.to(position, !1, !0)
        }, this))
    }
    Hash.Defaults = { URLhashListener: !1 }
    Hash.prototype.destroy = function() {
        var handler, property;
        jQuery(window).off('hashchange.owl.navigation');
        for (handler in this._handlers) { this._core.jQueryelement.off(handler, this._handlers[handler]) }
        for (property in Object.getOwnPropertyNames(this)) { typeof this[property] != 'function' && (this[property] = null) }
    }
    jQuery.fn.owlCarousel.Constructor.Plugins.Hash = Hash
})(window.Zepto || window.jQuery, window, document)