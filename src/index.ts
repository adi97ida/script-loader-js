export interface LoaderAugmentedWindow extends Window {
    fvStudioScriptLoader: any;
}

declare let window: LoaderAugmentedWindow;
interface LoadStylesheetOptions {
    prepend: boolean;
    attributes?: Record<string, string>;
}

interface PreloadOptions {
    prefetch: boolean;
}

interface LoadScriptOptions {
    async: boolean;
    attributes: Record<string, string>;
}

interface LegacyHTMLScriptElement extends HTMLScriptElement {
    // `onreadystatechange` is needed to support legacy IE
    onreadystatechange(this: HTMLElement, event: Event): any;
}

class Loader {
    static canSupportRel(rel: string): boolean {
        const link = document.createElement('link');

        return !!(
            link.relList &&
            link.relList.supports &&
            link.relList.supports(rel)
        );
    }

    static loadStylesheet(src: string, options?: LoadStylesheetOptions): Promise<void> {
        if (!this._stylesheets[src]) {
            this._stylesheets[src] = new Promise((resolve, reject) => {
                const stylesheet = document.createElement('link');
                const { prepend = false, attributes = {} } = options || {};

                Object.keys(attributes)
                    .forEach(key => {
                        stylesheet.setAttribute(key, attributes[key]);
                    });

                stylesheet.onload = () => resolve();
                stylesheet.onerror = event => {
                    delete this._stylesheets[src];
                    reject(event);
                };
                stylesheet.rel = 'stylesheet';
                stylesheet.href = src;

                if (prepend && document.head.children[0]) {
                    document.head.insertBefore(stylesheet, document.head.children[0]);
                } else {
                    document.head.appendChild(stylesheet);
                }
            });
        }

        return this._stylesheets[src];
    }

    static loadStylesheets(urls: string[], options?: LoadStylesheetOptions): Promise<void> {
        return Promise.all(urls.map(url => this.loadStylesheet(url, options)))
            .then(() => undefined);
    }

    static preloadStylesheet(url: string, options?: PreloadOptions): Promise<void> {
        if (!this._preloadedStylesheets[url]) {
            this._preloadedStylesheets[url] = new Promise((resolve, reject) => {
                const { prefetch = false } = options || {};
                const rel = prefetch ? 'prefetch' : 'preload';

                if (this.canSupportRel(rel)) {
                    const preloadedStylesheet = document.createElement('link');

                    preloadedStylesheet.as = 'style';
                    preloadedStylesheet.rel = prefetch ? 'prefetch' : 'preload';
                    preloadedStylesheet.href = url;

                    preloadedStylesheet.onload = () => {
                        resolve();
                    };

                    preloadedStylesheet.onerror = event => {
                        delete this._preloadedStylesheets[url];
                        reject(event);
                    };

                    document.head.appendChild(preloadedStylesheet);
                } else {
                    fetch(url, {
                        credentials: 'omit',
                        headers: { Accept: 'text/css' },
                    })
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        }

        return this._preloadedStylesheets[url];
    }

    static preloadStylesheets(urls: string[], options?: PreloadOptions): Promise<void> {
        return Promise.all(urls.map(url => this.preloadStylesheet(url, options)))
            .then(() => undefined);
    }

    static loadScript(src: string, options?: LoadScriptOptions): Promise<void> {
        if (!this._scripts[src]) {
            this._scripts[src] = new Promise((resolve, reject) => {
                const script = document.createElement('script') as LegacyHTMLScriptElement;
                const { async = false, attributes = {} } = options || {};

                Object.keys(attributes)
                    .forEach(key => {
                        script.setAttribute(key, attributes[key]);
                    });

                script.onload = () => resolve();
                script.onreadystatechange = () => resolve();
                script.onerror = event => {
                    delete this._scripts[src];
                    reject(event);
                };
                script.async = async;
                script.src = src;

                document.body.appendChild(script);
            });
        }

        return this._scripts[src];
    }

    static loadScripts(urls: string[], options?: LoadScriptOptions): Promise<void> {
        return Promise.all(urls.map(url => this.loadScript(url, options)))
            .then(() => undefined);
    }

    static preloadScript(url: string, options?: PreloadOptions): Promise<void> {
        if (!this._preloadedScripts[url]) {
            this._preloadedScripts[url] = new Promise((resolve, reject) => {
                const { prefetch = false } = options || {};
                const rel = prefetch ? 'prefetch' : 'preload';

                if (this.canSupportRel(rel)) {
                    const preloadedScript = document.createElement('link');

                    preloadedScript.as = 'script';
                    preloadedScript.rel = rel;
                    preloadedScript.href = url;

                    preloadedScript.onload = () => {
                        resolve();
                    };

                    preloadedScript.onerror = () => {
                        delete this._preloadedScripts[url];
                        reject();
                    };

                    document.head.appendChild(preloadedScript);
                } else {
                    fetch(url, {
                        credentials: 'omit',
                        headers: { Accept: 'application/javascript' },
                    })
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        }

        return this._preloadedScripts[url];
    }

    static preloadScripts(urls: string[], options?: PreloadOptions): Promise<void> {
        return Promise.all(urls.map(url => this.preloadScript(url, options)))
            .then(() => undefined);
    }
    private static _stylesheets: Record<string, Promise<void>> = {};
    private static _preloadedStylesheets: Record<string, Promise<void>> = {};
    private static _scripts: Record<string, Promise<void>> = {};
    private static _preloadedScripts: Record<string, Promise<void>> = {};
}

window.fvStudioScriptLoader = Loader;
