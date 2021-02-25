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

QToasty.prototype.dataSound = "data:audio/mpeg;base64,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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+pLACz1Yg8AAAaQcAAAAAAA0gAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
