/**
 * Show the Toasty! guy from Mortal Kombat.
 * https://github.com/raphaelquintao/QToasty
 * Copyright 2013, Raphael Quintao
 *
 * @param {Object} params
 * @param {HTMLElement} params.domElement
 * @param {boolean} params.sound
 * @param {number} params.volume
 * @param {number} params.imageSize
 * @param {string} params.imageSrc
 * @param {number[]} params.keyCodes
 * @param {number} params.slideInSpeed
 * @param {number} params.slideOutSpeed
 * @param {number} params.delayToSlideOut
 * @param {string} params.easing
 * @exports QToasty
 * @class
 */
function QToasty(params = {}) {
    var options = {
        domElement: params.domElement || document.body,
        sound: params.sound || true,
        volume: params.volume || 0.5,
        imageSize: params.imageSize || 150, // Original 169
        imageSrc: params.imageSrc || this.dataImage,
        keyCodes: params.keyCodes || [38, 38, 40, 40, 37, 39, 37, 39, 66, 65],
        slideInSpeed: 360,
        slideOutSpeed: 360,
        delayToSlideOut: 600,
        easing: 'easeinout'
    };
    
    var easingFunctions = {
        linear: function (t) {
            return t;
        },
        easein: function (t) {
            return t * t;
        },
        easeout: function (t) {
            return t * (2 - t);
        },
        easeinout: function (t) {
            return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },
        easeoutelastic: function (t) {
            var p = 0.3;
            return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
        }
    };
    
    var soundDuration = 720; // 0.719433s
    
    // up, up, down, down, left, right, left, right, b, a
    var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    
    var soundEl = document.createElement('audio');
    soundEl.src = QToasty.dataSound;
    soundEl.autoplay = false;
    soundEl.volume = options.volume;
    
    var imageEl = document.createElement('img');
    imageEl.src = options.imageSrc;
    imageEl.style.cssText = 'position: relative; display:block; width:' + options.imageSize + "px;";
    
    var container = document.createElement('span');
    container.classList.add("qtoasty");
    container.style.cssText = 'position: absolute; overflow: hidden; bottom: 0; right: 0; z-index: 100;' ;
    
    container.appendChild(imageEl);
    
    var scope = this;
    
    var keyCodes = [];
    var keyIndex = 0;
    var keyTimeout;
    
    function key_watcher(event) {
        if (event["keyCode"] == keyCodes[keyIndex++]) {
            clearTimeout(keyTimeout);
            if (keyIndex == keyCodes.length) {
                keyIndex = 0;
                scope.trigger();
            }
            keyTimeout = setTimeout(function () {
                keyIndex = 0;
            }, 600);
        } else {
            keyIndex = 0;
        }
        
    }
    
    
    function animate(dom, prop, params, complete) {
        var duration = params.duration || 360;
        var easing = params.easing.toLowerCase() || 'linear';
        complete = complete || null;
        
        if (!easingFunctions.hasOwnProperty(easing)) easing = 'linear';
        
        var pName = prop.name;
        var regex = /(\-|\+)?(=)?([^p]+)(px)?/g;
        var match = regex.exec(prop.value);
        var pValue = match[3];
        var pUnit = match[4] || '';
        
        var step = 17;
        var time = 0;
        var start = (Math.ceil(duration / step) * step) / duration;
        frame();
        var interval = setInterval(frame, step);
        
        function frame() {
            time += step;
            var t = time / duration;
            
            var pos = easingFunctions[easing](t);
            
            if (match[1] && match[1] == '-') {
                pos *= -pValue;
                dom.style.setProperty(pName, pos + pUnit);
            } else {
                pos = easingFunctions[easing](start) - pos;
                pos *= -pValue;
                dom.style.setProperty(pName, pos + pUnit);
            }
            
            if (time >= duration) {
                clearInterval(interval);
                if (complete) complete();
            }
        }
        
    }
    
    
    /**
     * Show Toasty.
     */
    this.trigger = function trigger() {
        if (!imageEl.width || container.parentNode) return;
        
        // var size = imageEl.width;
        var size = options.imageSize;
        
        imageEl.style.right = -size + 'px';
        options.domElement.appendChild(container);
        
        if (options.sound) soundEl.play();
        
        
        animate(imageEl, {name: 'right', value: '+=' + size + 'px'}, {
            duration: options.slideInSpeed,
            easing: options.easing
        }, function () {
            setTimeout(function () {
                animate(imageEl, {name: 'right', value: '-=' + size + 'px'}, {
                    duration: options.slideOutSpeed,
                    easing: options.easing
                }, function () {
                    container.parentNode.removeChild(container);
                });
            }, options.delayToSlideOut);
        });
        
    };
    
    /**
     * Bind Keys to show guy.
     * @param {number[]} keys - Array of key codes.
     */
    this.bindKeys = function (keys) {
        keyCodes = keys;
        options.domElement.removeEventListener("keyup", key_watcher, true);
        options.domElement.setAttribute('tabindex', '');
        options.domElement.style.outline = '';
        if (keyCodes.length > 0) {
            options.domElement.setAttribute('tabindex', '0');
            options.domElement.style.outline = 'none';
            options.domElement.addEventListener("keyup", key_watcher, true);
        }
    };
    
    this.bindKeys(options.keyCodes);
}

