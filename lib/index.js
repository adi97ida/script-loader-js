"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Loader = (function () {
    function Loader() {
    }
    Loader.canSupportRel = function (rel) {
        var link = document.createElement('link');
        return !!(link.relList &&
            link.relList.supports &&
            link.relList.supports(rel));
    };
    Loader.loadStylesheet = function (src, options) {
        var _this = this;
        if (!this._stylesheets[src]) {
            this._stylesheets[src] = new Promise(function (resolve, reject) {
                var stylesheet = document.createElement('link');
                var _a = options || {}, _b = _a.prepend, prepend = _b === void 0 ? false : _b, _c = _a.attributes, attributes = _c === void 0 ? {} : _c;
                Object.keys(attributes)
                    .forEach(function (key) {
                    stylesheet.setAttribute(key, attributes[key]);
                });
                stylesheet.onload = function () { return resolve(); };
                stylesheet.onerror = function (event) {
                    delete _this._stylesheets[src];
                    reject(event);
                };
                stylesheet.rel = 'stylesheet';
                stylesheet.href = src;
                if (prepend && document.head.children[0]) {
                    document.head.insertBefore(stylesheet, document.head.children[0]);
                }
                else {
                    document.head.appendChild(stylesheet);
                }
            });
        }
        return this._stylesheets[src];
    };
    Loader.loadStylesheets = function (urls, options) {
        var _this = this;
        return Promise.all(urls.map(function (url) { return _this.loadStylesheet(url, options); }))
            .then(function () { return undefined; });
    };
    Loader.preloadStylesheet = function (url, options) {
        var _this = this;
        if (!this._preloadedStylesheets[url]) {
            this._preloadedStylesheets[url] = new Promise(function (resolve, reject) {
                var _a = (options || {}).prefetch, prefetch = _a === void 0 ? false : _a;
                var rel = prefetch ? 'prefetch' : 'preload';
                if (_this.canSupportRel(rel)) {
                    var preloadedStylesheet = document.createElement('link');
                    preloadedStylesheet.as = 'style';
                    preloadedStylesheet.rel = prefetch ? 'prefetch' : 'preload';
                    preloadedStylesheet.href = url;
                    preloadedStylesheet.onload = function () {
                        resolve();
                    };
                    preloadedStylesheet.onerror = function (event) {
                        delete _this._preloadedStylesheets[url];
                        reject(event);
                    };
                    document.head.appendChild(preloadedStylesheet);
                }
                else {
                    fetch(url, {
                        credentials: 'omit',
                        headers: { Accept: 'text/css' },
                    })
                        .then(function () { return resolve(); })
                        .catch(reject);
                }
            });
        }
        return this._preloadedStylesheets[url];
    };
    Loader.preloadStylesheets = function (urls, options) {
        var _this = this;
        return Promise.all(urls.map(function (url) { return _this.preloadStylesheet(url, options); }))
            .then(function () { return undefined; });
    };
    Loader.loadScript = function (src, options) {
        var _this = this;
        if (!this._scripts[src]) {
            this._scripts[src] = new Promise(function (resolve, reject) {
                var script = document.createElement('script');
                var _a = options || {}, _b = _a.async, async = _b === void 0 ? false : _b, _c = _a.attributes, attributes = _c === void 0 ? {} : _c;
                Object.keys(attributes)
                    .forEach(function (key) {
                    script.setAttribute(key, attributes[key]);
                });
                script.onload = function () { return resolve(); };
                script.onreadystatechange = function () { return resolve(); };
                script.onerror = function (event) {
                    delete _this._scripts[src];
                    reject(event);
                };
                script.async = async;
                script.src = src;
                document.body.appendChild(script);
            });
        }
        return this._scripts[src];
    };
    Loader.loadScripts = function (urls, options) {
        var _this = this;
        return Promise.all(urls.map(function (url) { return _this.loadScript(url, options); }))
            .then(function () { return undefined; });
    };
    Loader.preloadScript = function (url, options) {
        var _this = this;
        if (!this._preloadedScripts[url]) {
            this._preloadedScripts[url] = new Promise(function (resolve, reject) {
                var _a = (options || {}).prefetch, prefetch = _a === void 0 ? false : _a;
                var rel = prefetch ? 'prefetch' : 'preload';
                if (_this.canSupportRel(rel)) {
                    var preloadedScript = document.createElement('link');
                    preloadedScript.as = 'script';
                    preloadedScript.rel = rel;
                    preloadedScript.href = url;
                    preloadedScript.onload = function () {
                        resolve();
                    };
                    preloadedScript.onerror = function () {
                        delete _this._preloadedScripts[url];
                        reject();
                    };
                    document.head.appendChild(preloadedScript);
                }
                else {
                    fetch(url, {
                        credentials: 'omit',
                        headers: { Accept: 'application/javascript' },
                    })
                        .then(function () { return resolve(); })
                        .catch(reject);
                }
            });
        }
        return this._preloadedScripts[url];
    };
    Loader.preloadScripts = function (urls, options) {
        var _this = this;
        return Promise.all(urls.map(function (url) { return _this.preloadScript(url, options); }))
            .then(function () { return undefined; });
    };
    Loader._stylesheets = {};
    Loader._preloadedStylesheets = {};
    Loader._scripts = {};
    Loader._preloadedScripts = {};
    return Loader;
}());
window.fvStudioScriptLoader = Loader;
//# sourceMappingURL=index.js.map