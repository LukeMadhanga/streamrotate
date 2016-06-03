/**
 * The scope for the streamrotate plugin
 * @author Luke Madhanga
 * @param {Window} window
 * @param {int} count
 */
(function (window, count) {
    
    "use strict";
    
    var app = {c: {}, v: {}, m: {}};
    var methods = {
        init: function (opts) {
            var T = $(this);
            if (T.data('streamrotate') || ! T.length) {
                // Already initialized
                return T;
            } else if (T.length > 1) {
                T.each(function () {
                    return $(this).streamRotate(opts);
                });
                return T;
            }
            opts = opts || {};
            var data = {
                instanceid: ++count,
                position: 0,
                rotateInterval: null,
                s: $.extend({
                    autoRotateSpeed: 0,
                    height: 0,
                    selector: null
                }, opts)
            };
            if (!data.s.selector) {
                $.error('streamRotate: no selector specified');
                return;
            }
            T.data('streamrotate', data);
            app.v.initView.call(T, data);
        }
    };
    
    /**
     * Display the 
     * @param {int} pos The zero-keyed index of what to display
     */
    app.v.display = function(pos) {
        var T = this;
        $('.streamrotate-item.active,.streamrotate-dot.active', T).removeClass('active');
        $('.streamrotate-item', T).eq(pos).addClass('active');
        $('.streamrotate-dot', T).eq(pos).addClass('active');
        app.c.initAutoRotate.call(T);
    };
    
    /**
     * Start the autorotate if the user wants it
     */
    app.c.initAutoRotate = function () {
        var T = this;
        var data = T.data('streamrotate');
        if (data.s.autoRotateSpeed) {
            if (data.rotateInterval !== null) {
                // Destroy the old interval
                window.clearInterval(data.rotateInterval);
            }
            data.rotateInterval = window.setInterval(function () {
                app.c.navigate.call(T);
            }, data.s.autoRotateSpeed);
        }
    };
    
    /**
     * Navigate forwards or backwards through the carousel
     * @param {boolean} backwards [optional] True to go backwards
     */
    app.c.navigate = function(backwards) {
        var T = this;
        var direction = backwards ? -1 : 1;
        var data = T.data('streamrotate');
        var pos = data.position + direction > data.length - 1 ? 0 : data.position + direction;
        data.position = pos;
        // Now set visibility
        app.v.display.call(T, pos);
    };
    
    /**
     * Bind events onto all interactive items
     */
    app.c.bindEvents = function () {
        var T = this;
        
        // Navigate right arrow
        $('.streamrotate-nav-right', T).unbind('click.navright').on('click.navright', function () {
            app.c.navigate.call(T);
        });
        
        // Navigate left arrow
        $('.streamrotate-nav-left', T).unbind('click.navright').on('click.navright', function () {
            app.c.navigate.call(T, true);
        });
        
        $('.streamrotate-dot', T).unbind('click.goto').on('click.goto', function () {
            var index = $('.streamrotate-dot', T).index(this);
            app.v.display.call(T, index);
        });
    };
    
    /**
     * Initialise the view
     * @param {object} data The object describing the current instance
     */
    app.v.initView = function (data) {
        var T = this;
        var i;
        var settings = data.s;
        var length = data.length = $(settings.selector, T).addClass('streamrotate-item').length;
        $('.streamrotate-item', T).eq(0).addClass('active');
        T.addClass('streamrotate-container').append(getHtml('div', null, null, 'streamrotate-main-items'));
        $('.streamrotate-main-items', T).append($(settings.selector, T)).height(settings.height);
        // Render the dots
        $(getHtml('div', null, null, 'streamrotate-dots-nav')).insertAfter($('.streamrotate-main-items', T));
        for (i = 0; i < length; i++) {
            $('.streamrotate-dots-nav').append(getHtml('span', null, null, 'streamrotate-dot' + (i === 0 ? ' active' : '')));
        }
        // Render the LR navigations
        T.append(getHtml('span', null, null, 'streamrotate-nav streamrotate-nav-left'));
        T.append(getHtml('span', null, null, 'streamrotate-nav streamrotate-nav-right'));
        app.c.initAutoRotate.call(T);
        app.c.bindEvents.call(T);
    };
    
    /**
     * Test to see if an object is of a particular type
     * @param {mixed} variable The object to test
     * @param {string} expected The type expected
     * @returns {String|Boolean} False if the object is undefined, or a boolean depending on whether the object matches
     */
    function is_a(variable, expected) {
        if (variable === undefined) {
            // Undefined is an object in IE8
            return false;
        }
        var otype = expected.substr(0, 1).toUpperCase() + expected.substr(1).toLowerCase();
        return Object.prototype.toString.call(variable) === '[object ' + otype + ']';
    }
    
    /**
     * Generate a xhtml element, e.g. a div element
     * @syntax cHE.getHtml(tagname, body, htmlid, cssclass, {attribute: value});
     * @param {string} tagname The type of element to generate
     * @param {string} body The body to go with 
     * @param {string} id The id of this element
     * @param {string} cssclass The css class of this element
     * @param {object} moreattrs An object in the form {html_attribute: value, ...}
     * @returns {html} The relevant html as interpreted by the browser
     */
    function getHtml(tagname, body, id, cssclass, moreattrs) {
        var html = document.createElement(tagname);
        if (body) {
            html.innerHTML = body;
        }
        if (id) {
            html.id = id;
        }
        if (cssclass) {
            html.className = cssclass;
        }
        setAttributes(html, moreattrs);
        return html.outerHTML;
    };

    /**
     * Set the custom attributes
     * @param {object(DOMElement)} obj
     * @param {object(plain)} attrs
     * @returns {object(DOMElement)}
     */
    function setAttributes(obj, attrs) {
        if (is_a(attrs, 'object')) {
            for (var x in attrs) {
                if (attrs.hasOwnProperty(x)) {
                    var val = attrs[x];
                    if (typeof val === 'boolean') {
                        // Convert booleans to their integer representations
                        val = val ? 1 : 0;
                    }
                    obj.setAttribute(x, val);
                }
            }
        }
    }
    
    /**
     * Instantiate the streamRotate plugin
     * @param {mixed} methodOrOpts If left empty or an object is passed, the initialise function will be called, otherwise this will be
     *  the name of the function to call
     * @returns {unresolved} Usually a jQuery object, but may be different depending on the function called
     */
    $.fn.streamRotate = function(methodOrOpts) {
        if (methods[methodOrOpts]) {
            // The first option passed is a method, therefore call this method
            return methods[methodOrOpts].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (Object.prototype.toString.call(methodOrOpts) === '[object Object]' || !methodOrOpts) {
            // The default action is to call the init function
            return methods.init.apply(this, arguments);
        } else {
            // The user has passed us something dodgy, throw an error
            $.error(['The method ', methodOrOpts, ' does not exist'].join(''));
        }
    };
    
}(this, 0));
