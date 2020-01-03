/**
 * File changes
 * 
 * 1. check for variant-active --- lines 16 - 19
 * 2. Remove all form handlers --- no specific lines
 * 3. Add instagram client ID & access token references --- search "instagram"
 * 4. Add google maps pointer image full URL --- search ".png", 2 instances
 * 5. Remove datepicker section
 * 6. Smoothscroll, add admin-bar checks var offset = ( $('body').hasClass('admin-bar') ) ? 32 : 0;
 * 7. Typed headline effect speed parseInt(stack_data.typed_speed)
 * 8. Changes to flickity call to include linkable thumbnails
 */

var mr = (function ($, window, document){
    "use strict";

    var mr         = {},
        components = {documentReady: [],documentReadyDeferred: [], windowLoad: [], windowLoadDeferred: []};

    mr.status = {documentReadyRan: false, windowLoadPending: false};

    if( !jQuery('body').hasClass('variant-active') ){
    	$(document).ready(documentReady);
    	$(window).on("load", windowLoad);
    }

    function documentReady(context){
        
        context = typeof context === typeof undefined ? $ : context;
        components.documentReady.concat(components.documentReadyDeferred).forEach(function(component){
            component(context);
        });
        mr.status.documentReadyRan = true;
        if(mr.status.windowLoadPending){
            windowLoad(mr.setContext());
        }
    }

    function windowLoad(context){
        if(mr.status.documentReadyRan){
            mr.status.windowLoadPending = false;
            context = typeof context === "object" ? $ : context;
            components.windowLoad.concat(components.windowLoadDeferred).forEach(function(component){
               component(context);
            });
        }else{
            mr.status.windowLoadPending = true;
        }
    }

    mr.setContext = function (contextSelector){
        var context = $;
        if(typeof contextSelector !== typeof undefined){
            return function(selector){
                return $(contextSelector).find(selector);
            };
        }
        return context;
    };

    mr.components    = components;
    mr.documentReady = documentReady;
    mr.windowLoad    = windowLoad;

    return mr;
}(jQuery, window, document));


//////////////// Utility Functions
mr = (function (mr, $, window, document){
    "use strict";
    mr.util = {};

    mr.util.requestAnimationFrame    = window.requestAnimationFrame || 
                                       window.mozRequestAnimationFrame || 
                                       window.webkitRequestAnimationFrame ||
                                       window.msRequestAnimationFrame;

    mr.util.documentReady = function($){
        var today = new Date();
        var year = today.getFullYear();
        $('.update-year').text(year);
    };

    mr.util.windowLoad = function($){
        $('[data-delay-src]').each(function(){
            var $el = $(this);
            $el.attr('src', $el.attr('data-delay-src'));
            $el.removeAttr('data-delay-src');
        });
    };

    mr.util.getURLParameter = function(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [undefined, ""])[1].replace(/\+/g, '%20')) || null;
    };


    mr.util.capitaliseFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    mr.util.slugify = function(text, spacesOnly){
        if(typeof spacesOnly !== typeof undefined){
            return text.replace(/ +/g, '');
        }else{
            return text
                .toLowerCase()
                .replace(/[\~\!\@\#\$\%\^\&\*\(\)\-\_\=\+\]\[\}\{\'\"\;\\\:\?\/\>\<\.\,]+/g, '')
                .replace(/ +/g, '-');
        }
    };

    mr.util.sortChildrenByText = function(parentElement, reverse){
        var $parentElement = $(parentElement);
		var $showAll       = jQuery('[data-masonry-filter="*"]', $parentElement).eq(0);
        var items          = $parentElement.children().not('[data-masonry-filter="*"]').get();
        var order          = -1;
        var order2         = 1;
        if(typeof reverse !== typeof undefined){order = 1; order2 = -1;}

        items.sort(function(a,b){
          var keyA = $(a).text();
          var keyB = $(b).text();

          if (keyA < keyB) return order;
          if (keyA > keyB) return order2;
          return 0;
        });
        
        // Append back into place
        $parentElement.empty().append($showAll);
        $(items).each(function(i, itm){
          $parentElement.append(itm);
        });
    };
    
    // Set data-src attribute of element from src to be restored later
    mr.util.idleSrc = function(context, selector){
        
            selector  = (typeof selector !== typeof undefined) ? selector : '';
            var elems = context.is(selector+'[src]') ? context : context.find(selector+'[src]');

        elems.each(function(index, elem){
            elem           = $(elem);
            var currentSrc = elem.attr('src'),
                dataSrc    = elem.attr('data-src');

            // If there is no data-src, save current source to it
            if(typeof dataSrc === typeof undefined){
                elem.attr('data-src', currentSrc);
            }

            // Clear the src attribute
            elem.attr('src', '');    
            
        });
    };

    // Set src attribute of element from its data-src where it was temporarily stored earlier
    mr.util.activateIdleSrc = function(context, selector){
        
        selector     = (typeof selector !== typeof undefined) ? selector : '';
        var elems    = context.is(selector+'[data-src]') ? context : context.find(selector+'[data-src]');

        elems.each(function(index, elem){
            elem = $(elem);
            var dataSrc    = elem.attr('data-src');

            // Write the 'src' attribute using the 'data-src' value
            elem.attr('src', dataSrc);
        });
    };

    mr.util.pauseVideo = function(context){
        var elems = context.is('video') ? context : context.find('video');

        elems.each(function(index, video){
            var playingVideo = $(video).get(0);
            playingVideo.pause();
        });
    };

    // Take a text value in either px (eg. 150px) or vh (eg. 65vh) and return a number in pixels.
    mr.util.parsePixels = function(text){
        var windowHeight = $(window).height(), value;
        
        // Text text against regular expression for px value.
        if(/^[1-9]{1}[0-9]*[p][x]$/.test(text)){
            return parseInt(text.replace('px', ''),10);
        }
        // Otherwise it is vh value.
        else if(/^[1-9]{1}[0-9]*[v][h]$/.test(text)){
            value = parseInt(text.replace('vh', ''),10);
            // Return conversion to percentage of window height.
            return windowHeight * (value/100);
        }else{
            // If it is not proper text, return -1 to indicate bad value.
            return -1;
        }
    };

    mr.components.documentReady.push(mr.util.documentReady);
    mr.components.windowLoad.push(mr.util.windowLoad);
    return mr;

}(mr, jQuery, window, document));

//////////////// Window Functions
mr = (function (mr, $, window, document){
    "use strict";

    mr.window = {};
    mr.window.height = $(window).height();
    mr.window.width = $(window).width();

    $(window).on('resize',function(){
        mr.window.height = $(window).height();
        mr.window.width = $(window).width();
    });

    return mr;
}(mr, jQuery, window, document));


//////////////// Scroll Functions
mr = (function (mr, $, window, document){
    "use strict";

    
    mr.scroll           = {};
    var raf             = window.requestAnimationFrame || 
                          window.mozRequestAnimationFrame || 
                          window.webkitRequestAnimationFrame ||
                          window.msRequestAnimationFrame;
    mr.scroll.listeners = [];
    mr.scroll.busy      = false;
    mr.scroll.y         = 0;
    mr.scroll.x         = 0;
    
    var documentReady = function($){

        //////////////// Capture Scroll Event and fire scroll function
        jQuery(window).off('scroll.mr');    
        jQuery(window).on('scroll.mr', function(evt) {
                if(mr.scroll.busy === false){
                    
                    mr.scroll.busy = true;
                    raf(function(evt){  
                        mr.scroll.update(evt);
                    });
                    
                }
                if(evt.stopPropagation){
                    evt.stopPropagation();
                }
        });
        
    };

    mr.scroll.update = function(event){
        
        // Loop through all mr scroll listeners
        var parallax = typeof window.mr_parallax !== typeof undefined ? true : false;
        mr.scroll.y = (parallax ? mr_parallax.mr_getScrollPosition() : window.pageYOffset);
        mr.scroll.busy = false;
        if(parallax){
            mr_parallax.mr_parallaxBackground();
        }


        if(mr.scroll.listeners.length > 0){
            for (var i = 0, l = mr.scroll.listeners.length; i < l; i++) {
               mr.scroll.listeners[i](event);
            }
        }
        
    };

    mr.scroll.documentReady = documentReady;

    mr.components.documentReady.push(documentReady);

    return mr;

}(mr, jQuery, window, document));


//////////////// Scroll Class Modifier
mr = (function (mr, $, window, document){
    "use strict";

    mr.scroll.classModifiers = {};
    // Globally accessible list of elements/rules
    mr.scroll.classModifiers.rules = [];

    mr.scroll.classModifiers.parseScrollRules = function(element){
        var text  = element.attr('data-scroll-class'),
            rules = text.split(";");

        rules.forEach(function(rule){
            var ruleComponents, scrollPoint, ruleObject = {};
            ruleComponents = rule.replace(/\s/g, "").split(':');
            if(ruleComponents.length === 2){
                scrollPoint = mr.util.parsePixels(ruleComponents[0]);
                if(scrollPoint > -1){
                    ruleObject.scrollPoint = scrollPoint;
                    if(ruleComponents[1].length){
                        var toggleClass = ruleComponents[1];
                        ruleObject.toggleClass = toggleClass;
                        // Set variable in object to indicate that element already has class applied
                        ruleObject.hasClass = element.hasClass(toggleClass);
                        ruleObject.element = element.get(0);
                        mr.scroll.classModifiers.rules.push(ruleObject);
                    }else{
                        // Error: toggleClass component does not exist.
                        //console.log('Error - toggle class not found.');
                        return false;
                    }
                }else{
                    // Error: scrollpoint component was malformed
                    //console.log('Error - Scrollpoint not found.');
                    return false;
                }
            }   
        });
        
        if(mr.scroll.classModifiers.rules.length){
            return true;
        }else{
            return false;
        }
    };

    mr.scroll.classModifiers.update = function(event){
        var currentScroll = mr.scroll.y,
            scrollRules   = mr.scroll.classModifiers.rules,
            l             = scrollRules.length,
            currentRule;
        
        // Given the current scrollPoint, check for necessary changes 
        while(l--) {
            
            currentRule = scrollRules[l];
            
            if(currentScroll > currentRule.scrollPoint && !currentRule.hasClass){
                // Set local copy and glogal copy at the same time;
                currentRule.element.classList.add(currentRule.toggleClass);
                currentRule.hasClass = mr.scroll.classModifiers.rules[l].hasClass = true;
            }
            if(currentScroll < currentRule.scrollPoint && currentRule.hasClass){
                // Set local copy and glogal copy at the same time;
                currentRule.element.classList.remove(currentRule.toggleClass);
                currentRule.hasClass = mr.scroll.classModifiers.rules[l].hasClass = false;
            }
        }
    };

    var fixedElementSizes = function(){
        $('.main-container [data-scroll-class*="pos-fixed"]').each(function(){
            var element = $(this);
            element.css('max-width',element.parent().outerWidth());
            element.parent().css('min-height',element.outerHeight());
        });
    };

    var documentReady = function($){
        // Collect info on all elements that require class modification at load time
        // Each element has data-scroll-class with a formatted value to represent class to add/remove at a particular scroll point.
        $('[data-scroll-class]').each(function(){
            var element  = $(this);
                
            // Test the rules to be added to an array of rules.
            if(!mr.scroll.classModifiers.parseScrollRules(element)){
                console.log('Error parsing scroll rules on: '+element);
            }
        });

        // For 'position fixed' elements, give them a max-width for correct fixing behaviour
        fixedElementSizes();
        $(window).on('resize', fixedElementSizes);
        
        // If there are valid scroll rules add classModifiers update function to the scroll event processing queue.
        if(mr.scroll.classModifiers.rules.length){
            mr.scroll.listeners.push(mr.scroll.classModifiers.update);
        }
    };

    mr.components.documentReady.push(documentReady);
    mr.scroll.classModifiers.documentReady = documentReady;    

    

    return mr;

}(mr, jQuery, window, document));


//////////////// Accordions
mr = (function (mr, $, window, document){
    "use strict";

    mr.accordions = {};

    
    mr.accordions.documentReady = function($){
        $('.accordion__title').on('click', function(){
            mr.accordions.activatePanel($(this));
        });

        $('.accordion').each(function(){
            var accordion = $(this);
            var minHeight = accordion.outerHeight(true);
            accordion.css('min-height',minHeight);
        });

        if(window.location.hash !== '' && window.location.hash !== '#' && window.location.hash.match(/#\/.*/) === null){
			 if($('.accordion > li > .accordion__title'+window.location.hash).length){
			 	mr.accordions.activatePanelById(window.location.hash, true);
			 }
        }

        $('a[href^="#"]').on('click', function(){
             mr.accordions.activatePanelById($(this).attr('href'), true);
        });
    };

    

    mr.accordions.activatePanel = function(panel, forceOpen){
        var $panel    = $(panel),
            accordion = $panel.closest('.accordion'),
            li        = $panel.closest('li'),
            openEvent = document.createEvent('Event'),
            closeEvent = document.createEvent('Event');
            
            openEvent.initEvent('panelOpened.accordions.mr', true, true);
            closeEvent.initEvent('panelClosed.accordions.mr', true, true);
        
        if(li.hasClass('active')){
            if(forceOpen !== true){
                li.removeClass('active');
                $panel.trigger('panelClosed.accordions.mr').get(0).dispatchEvent(closeEvent);
            }
        }else{
            if(accordion.hasClass('accordion--oneopen')){
                var wasActive = accordion.find('li.active');
                if(wasActive.length){
                    wasActive.removeClass('active');
                    wasActive.trigger('panelClosed.accordions.mr').get(0).dispatchEvent(closeEvent);
                }
                li.addClass('active');
                li.trigger('panelOpened.accordions.mr').get(0).dispatchEvent(openEvent);
                
            }else{
                if(!li.is('.active')){
                    li.trigger('panelOpened.accordions.mr').get(0).dispatchEvent(openEvent);
                }
                li.addClass('active');
            }
        }
    }

    mr.accordions.activatePanelById = function(id, forceOpen){
        var panel;

        if(id !== '' && id !== '#'){
            panel = $('.accordion > li > .accordion__title#'+id.replace('#', ''));
            if(panel.length){
                $('html, body').stop(true).animate({
                    scrollTop: (panel.offset().top - 50)
                }, 1200);
                mr.accordions.activatePanel(panel, forceOpen);
            }
        }
    };

    mr.components.documentReady.push(mr.accordions.documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Alerts
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        $('.alert__close').on('click touchstart', function(){
            jQuery(this).closest('.alert').addClass('alert--dismissed');
        });
    };

    mr.alerts = {
        documentReady : documentReady        
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Backgrounds
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        
        //////////////// Append .background-image-holder <img>'s as CSS backgrounds
	    $('.background-image-holder').each(function() {
	        var imgSrc = $(this).children('img').attr('src');
	        $(this).css('background', 'url("' + imgSrc + '")').css('background-position', 'initial').css('opacity','1');
	    });
    };

    mr.backgrounds = {
        documentReady : documentReady        
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Bars
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        $('.nav-container .bar[data-scroll-class*="fixed"]:not(.bar--absolute)').each(function(){
            var bar = $(this),
                barHeight = bar.outerHeight(true);
            bar.closest('.nav-container').css('min-height',barHeight);
        });
    };

    mr.bars = {
        documentReady : documentReady        
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Cookies
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.cookies = {

        getItem: function (sKey) {
            if (!sKey) { return null; }
            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
        },
        setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
            if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
                var sExpires = "";
                if (vEnd) {
                  switch (vEnd.constructor) {
                    case Number:
                      sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                      break;
                    case String:
                      sExpires = "; expires=" + vEnd;
                      break;
                    case Date:
                      sExpires = "; expires=" + vEnd.toUTCString();
                      break;
                }
            }
            document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            return true;
        },
        removeItem: function (sKey, sPath, sDomain) {
            if (!this.hasItem(sKey)) { return false; }
            document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
            return true;
        },
        hasItem: function (sKey) {
            if (!sKey) { return false; }
            return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        },
        keys: function () {
            var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
            for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
            return aKeys;
        }
    };

    return mr;

}(mr, jQuery, window, document));

//////////////// Countdown
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){

        $('.countdown[data-date]').each(function(){
            var element      = $(this),
                date         = element.attr('data-date'),
                daysText     = "days",
                fallback;

            if(typeof element.attr('data-date-fallback') !== typeof undefined){
                fallback = element.attr('data-date-fallback');
            }

            if(typeof element.attr('data-days-text') !== typeof undefined){
                daysText = element.attr('data-days-text');
            }

            element.countdown(date, function(event) {
                if(event.elapsed){
                    element.text(fallback);
                }else{
                    element.text(
                      event.strftime('%D '+daysText+' %H:%M:%S')
                    );
                }
            });
        });
        
    };

    mr.countdown = {
      documentReady : documentReady        
    };

    mr.components.documentReadyDeferred.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Dropdowns
mr = (function (mr, $, window, document){
    "use strict";
    mr.dropdowns = {};
    mr.dropdowns.done = false;
    
    var documentReady = function($){

        var rtl = false;

        if($('html[dir="rtl"]').length){
            rtl = true;
        }

        if(!mr.dropdowns.done){
            jQuery(document).on('click','body:not(.dropdowns--hover) .dropdown:not(.dropdown--hover), body.dropdowns--hover .dropdown.dropdown--click',function(event){
                var dropdown = jQuery(this);
                if(jQuery(event.target).is('.dropdown--active > .dropdown__trigger')){
                    dropdown.siblings().removeClass('dropdown--active').find('.dropdown').removeClass('dropdown--active');
                    dropdown.toggleClass('dropdown--active');
                }else{
                    $('.dropdown--active').removeClass('dropdown--active');
                    dropdown.addClass('dropdown--active');
                }
            });
            jQuery(document).on('click touchstart', 'body:not(.dropdowns--hover)', function(event){
                if(!jQuery(event.target).is('[class*="dropdown"], [class*="dropdown"] *')){
                    $('.dropdown--active').removeClass('dropdown--active');
                }
            });
            jQuery('body.dropdowns--hover .dropdown').on('click', function(event){
                event.stopPropagation();
                var hoverDropdown = jQuery(this);
                hoverDropdown.toggleClass('dropdown--active');
            });

            // Append a container to the body for measuring purposes
            jQuery('body').append('<div class="container containerMeasure" style="opacity:0;pointer-events:none;"></div>');

            
        

            // Menu dropdown positioning
            if(rtl === false){
                repositionDropdowns($);
                jQuery(window).on('resize', function(){repositionDropdowns($);});
            }else{
                repositionDropdownsRtl($);
                jQuery(window).on('resize', function(){repositionDropdownsRtl($);});
            }

            mr.dropdowns.done = true;
        }
    };

    function repositionDropdowns($){
        $('.dropdown__container').each(function(){
            var container, containerOffset, masterOffset, menuItem, content;

                jQuery(this).css('left', '');

                container       = jQuery(this);  
                containerOffset = container.offset().left;
                masterOffset    = jQuery('.containerMeasure').offset().left;
                menuItem        = container.closest('.dropdown').offset().left;
                content         = null;
                
                container.css('left',((-containerOffset)+(masterOffset)));

                if(container.find('.dropdown__content:not([class*="md-12"])').length){
                    content = container.find('.dropdown__content');
                    content.css('left', ((menuItem)-(masterOffset)));
                }
                
        });
        $('.dropdown__content').each(function(){
            var dropdown, offset, width, offsetRight, winWidth, leftCorrect;

                dropdown    = jQuery(this);
                offset      = dropdown.offset().left;
                width       = dropdown.outerWidth(true);
                offsetRight = offset + width;
                winWidth    = jQuery(window).outerWidth(true);
                leftCorrect = jQuery('.containerMeasure').outerWidth() - width;

            if(offsetRight > winWidth){
                dropdown.css('left', leftCorrect);
            }

        });
    }

    function repositionDropdownsRtl($){

        var windowWidth = jQuery(window).width();

        $('.dropdown__container').each(function(){
            var container, containerOffset, masterOffset, menuItem, content;
 
                jQuery(this).css('left', '');

                container   = jQuery(this);
                containerOffset = windowWidth - (container.offset().left + container.outerWidth(true));
                masterOffset    = jQuery('.containerMeasure').offset().left;
                menuItem        = windowWidth - (container.closest('.dropdown').offset().left + container.closest('.dropdown').outerWidth(true));
                content         = null;
                
                container.css('right',((-containerOffset)+(masterOffset)));

                if(container.find('.dropdown__content:not([class*="md-12"])').length){
                    content = container.find('.dropdown__content');
                    content.css('right', ((menuItem)-(masterOffset)));
                }
        });
        $('.dropdown__content').each(function(){
            var dropdown, offset, width, offsetRight, winWidth, rightCorrect;

                dropdown    = jQuery(this);
                offset      = windowWidth - (dropdown.offset().left + dropdown.outerWidth(true));
                width       = dropdown.outerWidth(true);
                offsetRight = offset + width;
                winWidth    = jQuery(window).outerWidth(true);
                rightCorrect = jQuery('.containerMeasure').outerWidth() - width;

            if(offsetRight > winWidth){
               dropdown.css('right', rightCorrect);
            }

        });
    }

    mr.dropdowns.documentReady = documentReady;
    

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Granim
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
    	$('[data-gradient-bg]').each(function(index,element){
    		var granimParent = $(this),
    			granimID 	 = 'granim-'+index+'',
				colours 	 = granimParent.attr('data-gradient-bg'),
				pairs        = [],
				tempPair     = [],
				count,
				passes,
				i;

			// Canvas element forms the gradient background
			granimParent.prepend('<canvas id="'+granimID+'"></canvas>');

            // Regular expression to match comma separated list of hex colour values
            passes = /^(#[0-9|a-f|A-F]{6}){1}([ ]*,[ ]*#[0-9|a-f|A-F]{6})*$/.test(colours);

            if(passes === true){
            	colours = colours.replace(' ','');
            	colours = colours.split(',');
            	count = colours.length;
            	// If number of colours is odd - duplicate last colour to make even array
            	if(count%2 !== 0){
            		colours.push(colours[count-1]);
            	}
            	for(i = 0; i < (count/2); i++){
                    tempPair = [];
                    tempPair.push(colours.shift());
                    tempPair.push(colours.shift());
                    pairs.push(tempPair);
            	}
            }

    		var granimElement = $(this);
    		var granimInstance = new Granim({
			    element: '#'+granimID,
			    name: 'basic-gradient',
			    direction: 'left-right',
			    opacity: [1, 1],
			    isPausedWhenNotInView: true,
			    states : {
			        "default-state": {
			            gradients: pairs
			        }
			    }
			});
    	});        
    };

    mr.granim = {
      documentReady : documentReady        
    };

    mr.components.documentReadyDeferred.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Instagram
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        
        if($('.instafeed').length){

            // Replace with your own Access Token and Client ID
            var token  = stack_data.access_token,
                client = stack_data.client_id,
                elementToken, elementClient;

            if($('.instafeed[data-access-token][data-client-id]').length){
                elementToken = $('.instafeed[data-access-token][data-client-id]').first().attr('data-access-token');
                elementClient = $('.instafeed[data-access-token][data-client-id]').first().attr('data-client-id');

                if(elementToken !== ""){token = elementToken;}
                if(elementClient !== ""){client = elementClient;}
            }

            jQuery.fn.spectragram.accessData = {
                accessToken: token,
                clientID: client
            };  
        }

        $('.instafeed').each(function(){
            var feed   = $(this),
                feedID = feed.attr('data-user-name'),
                fetchNumber = 12;
            if(typeof feed.attr('data-amount') !== typeof undefined){
                fetchNumber = parseInt(feed.attr('data-amount'), 10);
            }
            feed.append('<ul></ul>');
            feed.children('ul').spectragram('getUserFeed', {
                query: feedID,
                max: fetchNumber
            });
        });
    };

    mr.instagram = {
        documentReady : documentReady        
    };

    mr.components.documentReadyDeferred.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Maps
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.maps = {};

    var documentReady = function($){
        // Interact with Map once the user has clicked (to prevent scrolling the page = zooming the map

        $('.map-holder').on('click', function() {
            $(this).addClass('interact');
        }).removeClass('interact');
        
        var mapsOnPage = $('.map-container[data-maps-api-key]');
        if(mapsOnPage.length){
            mapsOnPage.addClass('gmaps-active');
            mr.maps.initAPI($);
            mr.maps.init();
        }
        
    };
    mr.maps.documentReady = documentReady;

    mr.maps.initAPI = function($){
        // Load Google MAP API JS with callback to initialise when fully loaded
        if(document.querySelector('[data-maps-api-key]') && !document.querySelector('.gMapsAPI')){
            if($('[data-maps-api-key]').length){
                var script = document.createElement('script');
                var apiKey = $('[data-maps-api-key]:first').attr('data-maps-api-key');
                apiKey = typeof apiKey !== typeof undefined ? apiKey : ''; 
                if(apiKey !== ''){
                    script.type = 'text/javascript';
                    script.src = 'https://maps.googleapis.com/maps/api/js?key='+apiKey+'&callback=mr.maps.init';
                    script.className = 'gMapsAPI';
                    document.body.appendChild(script);  
                }
            } 
        }
    };

    mr.maps.init = function(){
        if(typeof window.google !== "undefined"){
            if(typeof window.google.maps !== "undefined"){
                
                jQuery('.gmaps-active').each(function(){
                    var mapElement      = this,
                        mapInstance     = jQuery(this),
                        mapJSON         = typeof mapInstance.attr('data-map-style') !== typeof undefined ? mapInstance.attr('data-map-style'): false,
                        mapStyle        = JSON.parse(mapJSON) || [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}],
                        zoomLevel       = (typeof mapInstance.attr('data-map-zoom') !== typeof undefined && mapInstance.attr('data-map-zoom') !== "") ? mapInstance.attr('data-map-zoom') * 1: 17,
                        showZoomControl = typeof mapInstance.attr('data-zoom-controls') !== typeof undefined ? true : false,
                        zoomControlPos  = typeof mapInstance.attr('data-zoom-controls') !== typeof undefined ? mapInstance.attr('data-zoom-controls'): false,
                        latlong         = typeof mapInstance.attr('data-latlong') !== typeof undefined ? mapInstance.attr('data-latlong') : false,
                        latitude        = latlong ? 1 *latlong.substr(0, latlong.indexOf(',')) : false,
                        longitude       = latlong ? 1 * latlong.substr(latlong.indexOf(",") + 1) : false,
                        geocoder        = new google.maps.Geocoder(),
                        address         = typeof mapInstance.attr('data-address') !== typeof undefined ? mapInstance.attr('data-address').split(';'): [""],
                        markerImage     = typeof mapInstance.attr('data-marker-image') !== typeof undefined ? mapInstance.attr('data-marker-image'): stack_data.map_marker,
                        markerTitle     = "We Are Here",
                        isDraggable     = jQuery(document).width() > 766 ? true : false,
                        map, marker,
                        mapOptions = {
                            draggable: isDraggable,
                            scrollwheel: false,
                            zoom: zoomLevel,
                            disableDefaultUI: true,
                            zoomControl: showZoomControl,
                            zoomControlOptions: zoomControlPos !== false ? {position: google.maps.ControlPosition[zoomControlPos]} : null,
                            styles: mapStyle
                        };
                        console.log(mapOptions);

                    if(typeof mapInstance.attr('data-marker-title') !== typeof undefined && mapInstance.attr('data-marker-title') !== "" )
                    {
                        markerTitle = stack_data.map_marker_title;
                    }

                    if(address !== undefined && address[0] !== ""){
                            geocoder.geocode( { 'address': address[0].replace('[nomarker]','')}, function(results, status) {
                                if (status === google.maps.GeocoderStatus.OK) {
                                var map = new google.maps.Map(mapElement, mapOptions); 
                                map.setCenter(results[0].geometry.location);
                                
                                address.forEach(function(address){
                                    var markerGeoCoder;
                                    
                                    markerImage = {url: typeof window.mr_variant === typeof undefined ? typeof markerImage !== "object" ? markerImage: markerImage.url : stack_data.map_marker, scaledSize: new google.maps.Size(50,50)};

                                    if(/(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)/.test(address) ){
                                        var latlong = address.split(','),
                                        marker = new google.maps.Marker({
                                                        position: { lat: 1*latlong[0], lng: 1*latlong[1] },
                                                        map: map,
                                                        icon: markerImage,
                                                        title: markerTitle,
                                                        optimised: false
                                                    });
                                    }
                                    else if(address.indexOf('[nomarker]') < 0){
                                        markerGeoCoder = new google.maps.Geocoder();
                                        markerGeoCoder.geocode( { 'address': address.replace('[nomarker]','')}, function(results, status) {
                                            if (status === google.maps.GeocoderStatus.OK) {
                                                marker = new google.maps.Marker({
                                                    map: map,
                                                    icon: markerImage,
                                                    title: markerTitle,
                                                    position: results[0].geometry.location,
                                                    optimised: false
                                                });
                                            }
                                            else{
                                                console.log('Map marker error: '+status);
                                            }
                                        });
                                    }

                                });
                            } else {
                                console.log('There was a problem geocoding the address.');
                            }
                        });
                    }
                    else if(typeof latitude !== typeof undefined && latitude !== "" && latitude !== false && typeof longitude !== typeof undefined && longitude !== "" && longitude !== false ){
                        mapOptions.center   = { lat: latitude, lng: longitude};
                        map                 = new google.maps.Map(mapInstance, mapOptions); 
                        marker              = new google.maps.Marker({
                                                    position: { lat: latitude, lng: longitude },
                                                    map: map,
                                                    icon: markerImage,
                                                    title: markerTitle
                                                });

                    }

                }); 
            }
        }
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));


//////////////// Masonry
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.masonry = mr.masonry || {};

    mr.masonry.documentReady = function($){

        mr.masonry.updateFilters();

        $(document).on('click touchstart', '.masonry__filters li:not(.js-no-action)', function(){
            var masonryFilter = $(this);
            var masonryContainer = masonryFilter.closest('.masonry').find('.masonry__container');
            var filterValue = '*';
            if(masonryFilter.attr('data-masonry-filter') !== '*'){
                filterValue = '.filter-'+masonryFilter.attr('data-masonry-filter');
            }
            masonryFilter.siblings('li').removeClass('active');
            masonryFilter.addClass('active');
            masonryContainer.removeClass('masonry--animate');
            masonryContainer.on('layoutComplete',function(){
                $(this).addClass('masonry--active');
                if(typeof mr_parallax !== typeof undefined){
                    setTimeout(function(){ mr_parallax.profileParallaxElements(); },100);
                }
            });
            masonryContainer.isotope({ filter: filterValue });
            
        });
        
    };

    mr.masonry.windowLoad = function(){

        $('.masonry').each(function(){
            var masonry       = $(this).find('.masonry__container'),
                masonryParent = $(this),
                defaultFilter = '*',
                themeDefaults, ao = {};

            themeDefaults = {
                itemSelector: '.masonry__item',
                filter: '*',
                masonry: {
                  columnWidth: '.masonry__item'
                }
            };

            // Check for a default filter attribute
            if(masonryParent.is('[data-default-filter]')){
                defaultFilter = masonryParent.attr('data-default-filter').toLowerCase();
                defaultFilter = '.filter-'+defaultFilter;
                masonryParent.find('li[data-masonry-filter]').removeClass('active');
                masonryParent.find('li[data-masonry-filter="'+masonryParent.attr("data-default-filter").toLowerCase()+'"]').addClass('active');
            }

            // Use data attributes to override the default settings and provide a per-masonry customisation where necessary.
            ao.filter = defaultFilter !== '*' ? defaultFilter : undefined;

            masonry.on('layoutComplete',function(){
                masonry.addClass('masonry--active');
                if(typeof mr_parallax !== typeof undefined){
                    setTimeout(function(){ mr_parallax.profileParallaxElements(); },100);
                }
            });

            
            masonry.isotope(jQuery.extend({}, themeDefaults, mr.masonry.options, ao));

        });
    };

    mr.masonry.updateFilters = function(masonry){

        // If no argument is supplied, just apply the update to all masonry sets on the page.
        masonry = typeof masonry !== typeof undefined ? masonry : '.masonry';
        
        var $masonry = $(masonry);
        
        $masonry.each(function(){
            var $masonry         = $(this),
                masonryContainer = $masonry.find('.masonry__container'),
                filters          = $masonry.find('.masonry__filters'),
                // data-filter-all-text can be used to set the word for "all"
                filterAllText    = typeof filters.attr('data-filter-all-text') !== typeof undefined ? filters.attr('data-filter-all-text') : "All",
                filtersList;
            
            // Ensure we are working with a .masonry element
            if($masonry.is('.masonry')){
                // If a filterable masonry item exists
                if(masonryContainer.find('.masonry__item[data-masonry-filter]').length){
                    
                    // Create empty ul for filters
                    filtersList = filters.find('> ul');

                    if(!filtersList.length){
                        filtersList = filters.append('<ul></ul>').find('> ul');
                    }

                    // To avoid cases where user leave filter attribute blank
                    // only take items that have filter attribute
                    masonryContainer.find('.masonry__item[data-masonry-filter]').each(function(){
                        var masonryItem  = $(this),
                            filterString = masonryItem.attr('data-masonry-filter'),
                            filtersArray = [];

                        // If not undefined or empty
                        if(typeof filterString !== typeof undefined && filterString !== ""){
                            // Split tags from string into array 
                            filtersArray = filterString.split(',');
                        }
						
						// Remove all filter classes from item before re-adding them dynamically
						masonryItem.removeClass( function(index, className){
						    return (className.match (/(^|\s)filter-\S+/g) || []).join(' ');
						});
						
                        $(filtersArray).each(function(index, tag){

                            // Slugify the tag
                            var slug = mr.util.slugify(tag);

                            // Add the filter class to the masonry item
                            masonryItem.addClass('filter-'+slug);

                            // If this tag does not appear in the list already, add it
                            if(!filtersList.find('[data-masonry-filter="'+slug+'"]').length){
                                filtersList.append('<li data-masonry-filter="'+slug+'">'+tag+'</li>');
                            }
							
                        }); 
                    });
                    
                    // Remove any unnused filter options in list
                    filtersList.find('[data-masonry-filter]').each(function(){
                        var $this  = $(this),
                            filter = $this.text();
                        
                        if($(this).attr('data-masonry-filter') !== "*"){
                            if(!$masonry.find('.masonry__item[data-masonry-filter*="'+filter+'"]').length){
                                $this.remove();
                            }
                        }
                    });

                    mr.util.sortChildrenByText($(this).find('.masonry__filters ul'));
                    // Add a filter "all" option
                    if(!filtersList.find('[data-masonry-filter="*"]').length){
                        filtersList.prepend('<li class="active" data-masonry-filter="*">'+filterAllText+'</li>');
                    } else {
						jQuery('[data-masonry-filter="*"]', filtersList).text(filterAllText);
                    }

                }
                //End of "if filterable masonry item exists"
            }
            //End of "if $masonry is .masonry"
        });

    };

    mr.masonry.updateLayout = function(masonry){
        
        // If no argument is supplied, just apply the update to all masonry sets on the page.
        masonry = typeof masonry !== typeof undefined ? masonry : '.masonry';

        var $masonry = $(masonry);
        

        $masonry.each(function(){
            var collection       = $(this),
                newItems         = collection.find('.masonry__item:not([style])'),
                masonryContainer = collection.find('.masonry__container');

            if(collection.is('.masonry')){
                if(newItems.length){
                    masonryContainer.isotope('appended', newItems).isotope( 'layout');
                }
                
                masonryContainer.isotope('layout');
            }
        });
    };

    mr.components.documentReady.push(mr.masonry.documentReady);
    mr.components.windowLoad.push(mr.masonry.windowLoad);
    return mr;

}(mr, jQuery, window, document));


//////////////// Modals
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.modals = {};

    var documentReady = function($){
        var allPageModals = "<div class=\"all-page-modals\"></div>",
            mainContainer = $('div.main-container');

        if(mainContainer.length){
            jQuery(allPageModals).insertAfter(mainContainer);
            mr.modals.allModalsContainer = $('div.all-page-modals');
        }
        else{
            jQuery('body').append(allPageModals);
            mr.modals.allModalsContainer = jQuery('body div.all-page-modals');
        }

        $('.modal-container').each(function(){

            // Add modal close if none exists

            var modal        = $(this),
                $window      = $(window),
                modalContent = modal.find('.modal-content');
                
            
            if(!modal.find('.modal-close').length){
                modal.find('.modal-content').append('<div class="modal-close modal-close-cross"></div>');
            }

            // Set modal height
            
            if(modalContent.attr('data-width') !== undefined){
                var modalWidth = modalContent.attr('data-width').substr(0,modalContent.attr('data-width').indexOf('%')) * 1;
                modalContent.css('width',modalWidth + '%');
            }
            if(modalContent.attr('data-height') !== undefined){
                var modalHeight = modalContent.attr('data-height').substr(0,modalContent.attr('data-height').indexOf('%')) * 1;
                modalContent.css('height',modalHeight + '%');
            }

            // Set iframe's src to data-src to stop autoplaying iframes
            mr.util.idleSrc(modal, 'iframe');

        });


        $('.modal-instance').each(function(index){
            var modalInstance = $(this);
            var modal = modalInstance.find('.modal-container');
            var modalContent = modalInstance.find('.modal-content');
            var trigger = modalInstance.find('.modal-trigger');
            
            // Link modal with modal-id attribute
            
            trigger.attr('data-modal-index',index);
            modal.attr('data-modal-index',index);
            
            // Set unique id for multiple triggers
            
            if(typeof modal.attr('data-modal-id') !== typeof undefined){
                trigger.attr('data-modal-id', modal.attr('data-modal-id'));
            }
            

            // Attach the modal to the body            
            modal = modal.detach();
            mr.modals.allModalsContainer.append(modal);
        });
        

        $('.modal-trigger').on('click', function(){

            var modalTrigger = $(this);
            var uniqueID, targetModal;
            // Determine if the modal id is set by user or is set programatically
   
            if(typeof modalTrigger.attr('data-modal-id') !== typeof undefined){
                uniqueID = modalTrigger.attr('data-modal-id');
                targetModal = mr.modals.allModalsContainer.find('.modal-container[data-modal-id="'+uniqueID+'"]');    
            }else{
                uniqueID = $(this).attr('data-modal-index');
                targetModal = mr.modals.allModalsContainer.find('.modal-container[data-modal-index="'+uniqueID+'"]');
            }
            
            mr.util.activateIdleSrc(targetModal, 'iframe');
            mr.modals.autoplayVideo(targetModal);

            mr.modals.showModal(targetModal);

            return false;
        });

        jQuery(document).on('click', '.modal-close', mr.modals.closeActiveModal);

        jQuery(document).keyup(function(e) {
            if (e.keyCode === 27) { // escape key maps to keycode `27`
                mr.modals.closeActiveModal();
            }
        });

        $('.modal-container').on('click', function(e) { 
            if( e.target !== this ) return;
            mr.modals.closeActiveModal();
        });

        // Trigger autoshow modals
        $('.modal-container[data-autoshow]').each(function(){
            var modal = $(this);
            var millisecondsDelay = modal.attr('data-autoshow')*1;

            mr.util.activateIdleSrc(modal);
            mr.modals.autoplayVideo(modal);

            // If this modal has a cookie attribute, check to see if a cookie is set, and if so, don't show it.
            if(typeof modal.attr('data-cookie') !== typeof undefined){
                if(!mr.cookies.hasItem(modal.attr('data-cookie'))){
                    mr.modals.showModal(modal, millisecondsDelay);
                }
            }else{
                mr.modals.showModal(modal, millisecondsDelay);
            }
        });

        // Exit modals
        $('.modal-container[data-show-on-exit]').each(function(){
            var modal        = jQuery(this),
                exitSelector = modal.attr('data-show-on-exit'),
                delay = 0;

            if(modal.attr('data-delay')){
                delay = parseInt(modal.attr('data-delay'), 10) || 0;  
            } 

            // If a valid selector is found, attach leave event to show modal.
            if($(exitSelector).length){
                modal.prepend($('<i class="ti-close close-modal">'));
                jQuery(document).on('mouseleave', exitSelector, function(){
                    if(!$('.modal-active').length){
                        if(typeof modal.attr('data-cookie') !== typeof undefined){
                            if(!mr.cookies.hasItem(modal.attr('data-cookie'))){
                                mr.modals.showModal(modal, delay);
                            }
                        }else{
                            mr.modals.showModal(modal, delay);
                        }
                    }
                });
            }
        });


        // Autoshow modal by ID from location href
        if(window.location.href.split('#').length === 2){
            var modalID = window.location.href.split('#').pop();
            if($('[data-modal-id="'+modalID+'"]').length){
                mr.modals.closeActiveModal();
                mr.modals.showModal($('[data-modal-id="'+modalID+'"]'));
            }  
        }

        jQuery(document).on('click','a[href^="#"]', function(){
            var modalID = $(this).attr('href').replace('#', '');
            mr.modals.closeActiveModal();
            setTimeout(mr.modals.showModal, 500,'[data-modal-id="'+modalID+'"]', 0);
        });

        // Make modal scrollable
        jQuery(document).on('wheel mousewheel scroll','.modal-content, .modal-content .scrollable', function(evt){
            if(evt.preventDefault){evt.preventDefault();}
            if(evt.stopPropagation){evt.stopPropagation();}
            this.scrollTop += (evt.originalEvent.deltaY); 
        });
    };
    ////////////////
    //////////////// End documentReady
    ////////////////

    mr.modals.documentReady = documentReady;

    mr.modals.showModal = function(modal, millisecondsDelay){
        
        var delay = (typeof millisecondsDelay !== typeof undefined) ? (1*millisecondsDelay) : 0;
        
        setTimeout(function(){
            $(modal).addClass('modal-active');
        },delay);
    };

    mr.modals.closeActiveModal = function(){
        var modal = jQuery('body div.modal-active');
        mr.util.idleSrc(modal, 'iframe');
        mr.util.pauseVideo(modal);

        // If this modal requires to be closed permanently using a cookie, set the cookie now.
        if(typeof modal.attr('data-cookie') !== typeof undefined){
            mr.cookies.setItem(modal.attr('data-cookie'), "true", Infinity, '/');
        }

        modal.removeClass('modal-active');
    };

    mr.modals.autoplayVideo = function(modal){
        // If modal contains HTML5 video with autoplay, play the video
        if(modal.find('video[autoplay]').length){
            var video = modal.find('video').get(0);
            video.play();
        }
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Notifications
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.notifications = {};

    var documentReady = function($){
        
        $('.notification').each(function(){
            var notification = $(this);
            if(!notification.find('.notification-close').length){
                notification.append('<div class="notification-close-cross notification-close"></div>');
            }
        });
    

        $('.notification[data-autoshow]').each(function(){
            var notification = $(this);
            var millisecondsDelay = parseInt(notification.attr('data-autoshow'),10);

            // If this notification has a cookie attribute, check to see if a cookie is set, and if so, don't show it.
            if(typeof notification.attr('data-cookie') !== typeof undefined){
                if(!mr.cookies.hasItem(notification.attr('data-cookie'))){
                    mr.notifications.showNotification(notification, millisecondsDelay);
                }
            }else{
                mr.notifications.showNotification(notification, millisecondsDelay);
            }
        });

        $('[data-notification-link]:not(.notification)').on('click', function(){
            var notificationID = jQuery(this).attr('data-notification-link');
            var notification = $('.notification[data-notification-link="'+notificationID+'"]');
            jQuery('.notification--reveal').addClass('notification--dismissed');
            notification.removeClass('notification--dismissed');
            mr.notifications.showNotification(notification, 0);
            return false;
        });

        $('.notification-close').on('click', function(){
            var closeButton = jQuery(this);
            // Pass the closeNotification function a reference to the close button
            mr.notifications.closeNotification(closeButton);

            if(closeButton.attr('href') === '#'){
                return false;
            }
        });

        $('.notification .inner-link').on('click', function(){
            var notificationLink = jQuery(this).closest('.notification').attr('data-notification-link');
            mr.notifications.closeNotification(notificationLink);
        });
    
    };
    
    mr.notifications.documentReady = documentReady;

    mr.notifications.showNotification = function(notification, millisecondsDelay){
        var delay = (typeof millisecondsDelay !== typeof undefined) ? (1*millisecondsDelay) : 0;
        setTimeout(function(){
            notification.addClass('notification--reveal');
            notification.closest('nav').addClass('notification--reveal');
            if(notification.find('input').length){
                notification.find('input').first().focus();
            }
        },delay);
        // If notification has autohide attribute, set a timeout 
        // for the autohide time plus the original delay time in case notification was called
        // on page load
        if(notification.is('[data-autohide]')){
            var hideDelay = parseInt(notification.attr('data-autohide'),10);
            setTimeout(function(){
                mr.notifications.closeNotification(notification);
            },hideDelay+delay);
        }
    };

    mr.notifications.closeNotification = function(notification){
        var $notification = jQuery(notification);

        notification = $notification.is('.notification') ? 
                       $notification :
                       $notification.is('.notification-close') ? 
                       $notification.closest('.notification') : 
                       $('.notification[data-notification-link="'+notification+'"]');
        
        notification.addClass('notification--dismissed');
        notification.closest('nav').removeClass('notification--reveal');

        // If this notification requires to be closed permanently using a cookie, set the cookie now.
        if(typeof notification.attr('data-cookie') !== typeof undefined){
            mr.cookies.setItem(notification.attr('data-cookie'), "true", Infinity, '/');
        }
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Parallax
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.parallax = {};

    var documentReady = function($){
        
        var $window      = $(window); 
        var windowWidth  = $window.width();
        var windowHeight = $window.height();
        var navHeight    = $('nav').outerHeight(true);

        if (windowWidth > 768) {
            var parallaxHero = $('.parallax:nth-of-type(1)'),
                parallaxHeroImage = $('.parallax:nth-of-type(1) .background-image-holder');

            parallaxHeroImage.css('top', -(navHeight));
            if(parallaxHero.outerHeight(true) === windowHeight){
                parallaxHeroImage.css('height', windowHeight + navHeight);
            }
        }
    };

    
    mr.parallax.documentReady = documentReady;        
    
    mr.parallax.update = function(){
        if(typeof mr_parallax !== typeof undefined){
            mr_parallax.profileParallaxElements();
            mr_parallax.mr_parallaxBackground();
        }
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Progress Horizontal (bars)
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){

        var progressBars = [];

        $('.progress-horizontal').each(function(){
            var bar       = jQuery(this).find('.progress-horizontal__bar'),
                barObject = {},
                progress  = jQuery('<div class="progress-horizontal__progress"></div>');

                bar.prepend(progress);

                barObject.element = bar;
                barObject.progress = progress;
                barObject.value = parseInt(bar.attr('data-value'),10)+"%";
                barObject.offsetTop = bar.offset().top;
                barObject.animate = false;

                if(jQuery(this).hasClass('progress-horizontal--animate')){
                    barObject.animate = true;
                }else{
                    progress.css('width',barObject.value);
                }
        });
    };

    mr.progressHorizontal = {
        documentReady : documentReady        
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// EasyPiecharts
mr = (function (mr, $, window, document){
	  "use strict";

		mr.easypiecharts = {};
		mr.easypiecharts.pies = [];

		var documentReady = function($){

			mr.easypiecharts.init = function(){

				mr.easypiecharts.pies = [];
            
				$('.radial').each(function(){
				  var pieObject  = {},
					  currentPie = jQuery(this);

					  pieObject.element = currentPie;
					  pieObject.value = parseInt(currentPie.attr('data-value'),10);
					  pieObject.top = currentPie.offset().top;
					  pieObject.height = currentPie.height()/2;
					  pieObject.active = false;
					  mr.easypiecharts.pies.push(pieObject);
				});
			};

            if ($(window).width() < 767) {
                mr.easypiecharts.activate = function(){
                    mr.easypiecharts.pies.forEach(function(pie){
                        pie.element.data('easyPieChart').enableAnimation();
                        pie.element.data('easyPieChart').update(pie.value);
                        pie.element.addClass('radial--active');
                        pie.active = true;
                    });
                };
            } else {
                mr.easypiecharts.activate = function(){
                    mr.easypiecharts.pies.forEach(function(pie){
                        if(Math.round((mr.scroll.y + mr.window.height)) >= Math.round(pie.top+pie.height)){
                            if(pie.active === false){

                                pie.element.data('easyPieChart').enableAnimation();
                                pie.element.data('easyPieChart').update(pie.value);
                                pie.element.addClass('radial--active');
                                pie.active = true;
                            }
                        }
                    });
                };
            }

		  	$('.radial').each(function(){
		  		var chart    = jQuery(this),
		  			value    = 0,
		  			color    = '#000000',
		  			time     = 2000,
		  			pieSize  = 110,
		  			barWidth = 3;

		  		if(typeof chart.attr('data-timing') !== typeof undefined){
		  			time = chart.attr('data-timing')*1;
		  		}
		  		if(typeof chart.attr('data-color') !== typeof undefined){
		  			color = chart.attr('data-color');
		  		}
		  		if(typeof chart.attr('data-size') !== typeof undefined){
		  			pieSize = chart.attr('data-size');
		  		}
		  		if(typeof chart.attr('data-bar-width') !== typeof undefined){
		  			barWidth = chart.attr('data-bar-width');
		  		}
		  		chart.css('height',pieSize).css('width',pieSize);

		  		chart.easyPieChart({
		  			animate: ({duration: time, enabled: true}),
		  			barColor: color,
		  			scaleColor: false,
		  			size: pieSize,
		  			lineWidth: barWidth
		  		});
		  		chart.data('easyPieChart').update(0);
		  	});

		  	if($('.radial').length){
		  		mr.easypiecharts.init();
		  		mr.easypiecharts.activate();
		  		mr.scroll.listeners.push(mr.easypiecharts.activate);
		  	}

	  };

	  mr.easypiecharts.documentReady = documentReady;

	  mr.components.documentReadyDeferred.push(documentReady);
	  return mr;

}(mr, jQuery, window, document));

//////////////// Flickity
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.sliders = {};
    mr.sliders.draggable = true;

    var documentReady = function($){

        $('.slider').each(function(index){
            
            var slider = $(this);
            var sliderInitializer = slider.find('ul.slides');
            sliderInitializer.find('>li').addClass('slide');
            var childnum = sliderInitializer.find('li').length;
            var arrows = false;
            var paging = false;
            var timing = 7000;
            var autoplay = true;
            var draggable = mr.sliders.draggable;
            if(slider.attr('data-arrows') === 'true'){
                arrows = true;
            }else{
                arrows = false;
            }
            if(slider.attr('data-autoplay') === 'false'){
                autoplay = false;
            }else{
                autoplay = true;
            }
            if(slider.attr('data-paging') === 'true' && sliderInitializer.find('li').length > 1){
                paging = true;
            }else{
                paging = false;
            }
            if(slider.attr('data-timing')){
                timing = slider.attr('data-timing')*1;
            }
            // Set data attribute to inidicate the number of children in the slider
            slider.attr('data-children',childnum);

            if(childnum < 2){
                draggable = false;
            }
            
            var $carousel = $(sliderInitializer);

            $carousel.flickity({
                cellSelector: '.slide',
                cellAlign: 'left',
                wrapAround: true,
                pageDots: paging,
                prevNextButtons: arrows,
                autoPlay: timing,
                draggable: draggable,
                imagesLoaded: true
            });
            
            jQuery('.thumbnail-trigger').click(function(){
            	var index = $(this).index();
            	$carousel.flickity( 'select', index );
            	jQuery('.thumbnail-trigger').removeClass('active');
            	$(this).addClass('active');
            });
            
            $carousel.on( 'settle.flickity', function() {
            	var flkty = $carousel.data('flickity');
            	jQuery('.thumbnail-trigger').removeClass('active');
            	jQuery('.thumbnail-trigger').eq(flkty.selectedIndex).addClass('active');
            });

            $carousel.on( 'scroll.flickity', function( event, progress ) {
              if(slider.find('.is-selected').hasClass('controls--dark')){
                slider.addClass('controls--dark');
              }else{
                slider.removeClass('controls--dark'); 
              }
            });
        });

        mr.parallax.update();
        
    };

    mr.sliders.documentReady = documentReady;

    mr.components.documentReadyDeferred.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Smoothscroll
mr = (function (mr, $, window, document){
    "use strict";
    
    mr.smoothscroll = {};
    mr.smoothscroll.sections = [];
    
    mr.smoothscroll.init = function(){
        mr.smoothscroll.sections = [];

        var offset = ( $('body').hasClass('admin-bar') ) ? 32 : 0;

        $('a.inner-link').each(function(){
            var sectionObject = {},
                link          = $(this),
                href          = link.attr('href'),
                validLink     = new RegExp('^#[^\r\n\t\f\v\#\.]+$','gm');
                            
            if(validLink.test(href)){
                
                if($('section'+href).length){

                    sectionObject.id     = href;
                    sectionObject.top = Math.round($(href).offset().top);
                    sectionObject.height = Math.round($(href).outerHeight());
                    sectionObject.link   = link.get(0);
                    sectionObject.active = false;

                    mr.smoothscroll.sections.push(sectionObject);
                }
            }
        });

        mr.smoothscroll.highlight();
    };

    mr.smoothscroll.highlight = function(){
        var offset = 0;
        if($('body[data-smooth-scroll-offset]').length){
            offset = $('body').attr('data-smooth-scroll-offset');
            offset = offset*1;
        }
        mr.smoothscroll.sections.forEach(function(section){
            if(mr.scroll.y >= section.top + offset && mr.scroll.y < (section.top + section.height + offset)){
                if(section.active === false){
                    section.link.classList.add("inner-link--active");
                    section.active = true;
                }
            }else{
                section.link.classList.remove("inner-link--active");
                section.active = false;
            }
        });
    };

    mr.scroll.listeners.push(mr.smoothscroll.highlight);

    var documentReady = function($){
        // Smooth scroll to inner links
        var innerLinks = $('a.inner-link');

        if(innerLinks.length){
            innerLinks.each(function(index){
                var link          = $(this),
                    href          = link.attr('href');
                if(href.charAt(0) !== "#"){
                    link.removeClass('inner-link');
                }
            });

            mr.smoothscroll.init();
            $(window).on('resize', mr.smoothscroll.init);

            var offset = 0;
            var offsetMobile = 0;
            if($('body[data-smooth-scroll-offset-mobile]').length){
                offsetMobile = $('body').attr('data-smooth-scroll-offset-mobile');
                offsetMobile = offsetMobile*1;
            }
            if($('body[data-smooth-scroll-offset]').length){
                offset = $('body').attr('data-smooth-scroll-offset');
                offset = offset*1;
            }

            if ($(window).width() < 767) {
                smoothScroll.init({
                    selector: '.inner-link',
                    selectorHeader: null,
                    speed: 750,
                    easing: 'easeInOutCubic',
                    offset: offsetMobile
                });
            } else {
                smoothScroll.init({
                    selector: '.inner-link',
                    selectorHeader: null,
                    speed: 750,
                    easing: 'easeInOutCubic',
                    offset: offset
                });
            }            
            
        }
    };

    mr.smoothscroll.documentReady = documentReady;

    mr.components.documentReady.push(documentReady);
    mr.components.windowLoad.push(mr.smoothscroll.init);
    return mr;

}(mr, jQuery, window, document));

//////////////// Tabs
mr = (function (mr, $, window, document){
    "use strict";

    mr.tabs = {};
    
    var documentReady = function($){
        $('.tabs').each(function(){
            var tabs = $(this);
            tabs.after('<ul class="tabs-content">');
            tabs.find('li').each(function(){
                var currentTab      = $(this),
                    tabContent      = currentTab.find('.tab__content').wrap('<li></li>').parent(),
                    tabContentClone = tabContent.clone(true,true),
                    cf7Form         = tabContentClone.find('div.wpcf7 > form');
                tabContent.remove();
                currentTab.closest('.tabs-container').find('.tabs-content').append(tabContentClone);
                if (typeof wpcf7 !== typeof undefined){
                    wpcf7.initForm(cf7Form);
                }
            });
        });
        
        $('.tabs > li').on('click', function(){
            var clickedTab = $(this), hash;
            mr.tabs.activateTab(clickedTab);

            // Update the URL bar if the currently clicked tab has an ID
            if(clickedTab.is('[id]')){
                // Create the hash from the tab's ID
                hash = '#'+ clickedTab.attr('id');
                // Check we are in a newish browser with the history API
                if(history.pushState) {
                    history.pushState(null, null, hash);
                }
                else {
                    location.hash = hash;
                }
                window.dispatchEvent(new Event('resize'));
            }
        });

        $('.tabs li.active').each(function(){
            mr.tabs.activateTab(this);
        });

        if(window.location.hash !== ''){
            mr.tabs.activateTabById(window.location.hash);
        }

        $('a[href^="#"]').on('click', function(){
            mr.tabs.activateTabById($(this).attr('href'));
        });

    };

    mr.tabs.activateTab = function(tab){
        var clickedTab    = $(tab),
            tabContainer  = clickedTab.closest('.tabs-container'),
            activeIndex   = (clickedTab.index()*1)+(1),
            activeContent = tabContainer.find('> .tabs-content > li:nth-of-type('+activeIndex+')'),
            openEvent     = document.createEvent('Event'),
            iframe, radial;

            openEvent.initEvent('tabOpened.tabs.mr', true, true);


        tabContainer.find('> .tabs > li').removeClass('active');
        tabContainer.find('> .tabs-content > li').removeClass('active');
        
        clickedTab.addClass('active').trigger('tabOpened.tabs.mr').get(0).dispatchEvent(openEvent);
        activeContent.addClass('active');

        

        // If there is an <iframe> element in the tab, reload its content when the tab is made active.
        iframe = activeContent.find('iframe');
        if(iframe.length){
            iframe.attr('src', iframe.attr('src'));
        }
    };



    mr.tabs.activateTabById = function(id){
        if(id !== '' && id !== '#'){
            $('.tabs > li#'+id.replace('#', '')).click();
        }
    };

    mr.tabs.documentReady = documentReady;
    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Toggle Class
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        $('[data-toggle-class]').each(function(){
        	var element = $(this),
                data    = element.attr('data-toggle-class').split("|");
        		

            $(data).each(function(){
                var candidate     = element,
                    dataArray     = [],
            	    toggleClass   = '',
            	    toggleElement = '',
                    dataArray = this.split(";");

            	if(dataArray.length === 2){
            		toggleElement = dataArray[0];
            		toggleClass   = dataArray[1];
            		$(candidate).on('click',function(){
                        if(!candidate.hasClass('toggled-class')){
                            candidate.toggleClass('toggled-class');
                        }else{
                            candidate.removeClass('toggled-class');
                        }
            			$(toggleElement).toggleClass(toggleClass);
            			return false;
            		});
            	}else{
            		console.log('Error in [data-toggle-class] attribute. This attribute accepts an element, or comma separated elements terminated witha ";" followed by a class name to toggle');
            	}
            });
        });
    };

    mr.toggleClass = {
        documentReady : documentReady        
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Typed Headline Effect
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        $('.typed-text').each(function(){
            var text = $(this);
            var strings = text.attr("data-typed-strings") ? text.attr("data-typed-strings").split(",") : [];
            $(text).typed({
                strings: strings,
                typeSpeed: parseInt(stack_data.typed_speed),
                loop: true,
                showCursor: false
            });
        });
    };

    mr.typed = {
        documentReady : documentReady        
    };

    mr.components.documentReady.push(documentReady);
    return mr;

}(mr, jQuery, window, document));

//////////////// Twitter Feeds
mr = (function (mr, $, window, document){
    "use strict";
    
    var documentReady = function($){
        $('.tweets-feed').each(function(index) {
            $(this).attr('id', 'tweets-' + index);
        }).each(function(index) {
            var element = $('#tweets-' + index);
            var TweetConfig = {
               "domId": '',
               "maxTweets": element.attr('data-amount'),
               "enableLinks": true,
               "showUser": true,
               "showTime": true,
               "dateFunction": '',
               "showRetweet": false,
               "customCallback": handleTweets
            };

            if(typeof element.attr('data-widget-id') !== typeof undefined){
                TweetConfig.id = element.attr('data-widget-id');
            }else if(typeof element.attr('data-feed-name') !== typeof undefined && element.attr('data-feed-name') !== ""){
                TweetConfig.profile = {"screenName": element.attr('data-feed-name').replace('@', '')};
            }else{
                TweetConfig.profile = {"screenName": 'twitter'};
            }

            if(element.closest('.twitter-feed--slider').length){
                element.addClass('slider');
            }

            function handleTweets(tweets) {
                var x = tweets.length;
                var n = 0;
                var html = '<ul class="slides">';
                while (n < x) {
                    html += '<li>' + tweets[n] + '</li>';
                    n++;
                }
                html += '</ul>';
                element.html(html);
                
                // Initialize twitter feed slider
                if(element.closest('.slider').length){
                    mr.sliders.documentReady(mr.setContext());
                     
                    return html;
                }
            }
            twitterFetcher.fetch(TweetConfig);
        });
    };

    mr.twitter = {
        documentReady : documentReady
    };

    mr.components.documentReady.push(documentReady);

    return mr;

}(mr, jQuery, window, document));

//////////////// Video
mr = (function (mr, $, window, document){
    "use strict";
    
	  var documentReady = function($){
	      
			//////////////// Youtube Background

			if($('.youtube-background').length){
				$('.youtube-background').each(function(){
					var player = $(this);
					var vidURL = $(this).attr('data-video-url');
					var startAt = $(this).attr('data-start-at');
					player.attr('data-property','{videoURL:"'+vidURL+'",containment:"self",autoPlay:true, mute:true, startAt:'+startAt+', opacity:1, playerVars: {rel: 0}}');
					player.closest('.videobg').append('<div class="loading-indicator"></div>');
					player.YTPlayer();
					player.on("YTPStart",function(){
				  		player.closest('.videobg').addClass('video-active');
					});	
				});
			}

			if($('.videobg').find('video').length){
				$('.videobg').find('video').closest('.videobg').addClass('video-active');
			} 

			//////////////// Video Cover Play Icons

			$('.video-cover').each(function(){
			    var videoCover = $(this);
			    if(videoCover.find('iframe[src]').length){
			        videoCover.find('iframe').attr('data-src', videoCover.find('iframe').attr('src'));
			        videoCover.find('iframe').attr('src','');
			    }
			});

			$('.video-cover .video-play-icon').on("click", function(){
			    var playIcon = $(this);
			    var videoCover = playIcon.closest('.video-cover');
			    if(videoCover.find('video').length){
			        var video = videoCover.find('video').get(0);
			        videoCover.addClass('reveal-video');
			        video.play();
			        return false;
			    }else if(videoCover.find('iframe').length){
			        var iframe = videoCover.find('iframe');
			        iframe.attr('src',iframe.attr('data-src'));
			        videoCover.addClass('reveal-video');
			        return false;
			    }
			});
	  };

	  mr.video = {
	      documentReady : documentReady        
	  };

	  mr.components.documentReady.push(documentReady);
	  return mr;

}(mr, jQuery, window, document));

//////////////// Wizard
mr = (function (mr, $, window, document){
    "use strict";
    
	  var documentReady = function($){

			$('.wizard').each(function(){
				var wizard = jQuery(this);

				if(!wizard.is('[role="application"][id^="steps-uid"]')){  	
						wizard.steps({
							headerTag: "h5",
							bodyTag: "section",
							transitionEffect: "slideLeft",
							autoFocus: true
						});
		
		   	    wizard.addClass('active');
		    }
				
		  });
		};

	  mr.wizard = {
	      documentReady : documentReady        
	  };

	  mr.components.documentReady.push(documentReady);
	  return mr;

}(mr, jQuery, window, document));