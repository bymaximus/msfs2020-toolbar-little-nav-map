class IngamePanelLNMPanel extends TemplateElement {
    constructor() {
        super(...arguments);

        this.started = false;
        this.busy = false;
        this.front = true;
        this.url = "http://localhost:8965";
        this.debugEnabled = false;
    }
    isDebugEnabled() {
        var self = this;
        if (typeof g_modDebugMgr != "undefined") {
            g_modDebugMgr.AddConsole(null);
            g_modDebugMgr.AddDebugButton("Clear", function() {
                g_modDebugMgr.ClearConsole();
                console.log('Clear');
            });
            g_modDebugMgr.AddDebugButton("Reload", function() {
                console.log('Reload');
                window.document.location.reload(true);
            });
            g_modDebugMgr.AddDebugButton("Source", function() {
                console.log('Source');
                console.log(window.document.documentElement.outerHTML);
            });
            g_modDebugMgr.AddDebugButton("close", function() {
                console.log('close');
                if (self.ingameUi) {
                    console.log('ingameUi');
                    self.ingameUi.closePanel();
                }
            });
            g_modDebugMgr.AddDebugButton("min", function() {
                console.log('min');
                if (self.ingameUi && self.ingameUi.m_toolbar_listener) {
                    console.log('ingameUi');
                    self.ingameUi.m_toolbar_listener.setMinimized('PANEL_LNM_PANEL', true);
                }
            });
            this.initialize();
        } else {
            Include.addScript("/JS/debug.js", function () {
                if (typeof g_modDebugMgr != "undefined") {
                    g_modDebugMgr.AddConsole(null);
                    g_modDebugMgr.AddDebugButton("Clear", function() {
                        g_modDebugMgr.ClearConsole();
                        console.log('Clear');
                    });
                    g_modDebugMgr.AddDebugButton("Reload", function() {
                        console.log('Reload');
                        window.document.location.reload(true);
                    });
                    g_modDebugMgr.AddDebugButton("Source", function() {
                        console.log('Source');
                        console.log(window.document.documentElement.outerHTML);
                    });
                    g_modDebugMgr.AddDebugButton("close", function() {
                        console.log('close');
                        if (self.ingameUi) {
                            console.log('ingameUi');
                            self.ingameUi.closePanel();
                        }
                    });
                    g_modDebugMgr.AddDebugButton("min", function() {
                        console.log('min');
                        if (self.ingameUi && self.ingameUi.m_toolbar_listener) {
                            console.log('ingameUi');
                            self.ingameUi.m_toolbar_listener.setMinimized('PANEL_LNM_PANEL', true);
                        }
                    });
                    self.initialize();
                } else {
                    setTimeout(() => {
                        self.isDebugEnabled();
                    }, 2000);
                }
            });
        }
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.debugEnabled) {
            var self = this;
            setTimeout(() => {
                self.isDebugEnabled();
            }, 1000);
        } else {
            this.initialize();
        }
    }
    initialize() {
        if (this.started) {
            return;
        }

        var self = this;
        this.m_MainDisplay = document.querySelector("#MainDisplay");
        this.m_MainDisplay.classList.add("hidden");

        this.m_Footer = document.querySelector("#Footer");
        this.m_Footer.classList.add("hidden");

        this.errorElement = document.getElementById("LNMPanelImageError");
        this.imageElementFront = document.getElementById("LNMPanelImageFront");
        this.imageElementBack = document.getElementById("LNMPanelImageBack");
        this.ingameUi = this.querySelector('ingame-ui');

        if (this.imageElementFront && this.imageElementBack) {
            this.imageElementFront.addEventListener("error", () => {
                self.onImageError();
            });
            this.imageElementFront.addEventListener("load", () => {
                self.onImageLoad();
            });
            this.imageElementBack.addEventListener("error", () => {
                self.onImageError();
            });
            this.imageElementBack.addEventListener("load", () => {
                self.onImageLoad();
            });
        }

        if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", (e) => {
                self.updateImage();
            });
            this.ingameUi.addEventListener("onResizeElement", () => {
                self.updateImage();
            });
        }

        this.started = true;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    onImageError() {
        if (this.front) {
            if (this.imageElementFront) {
                this.imageElementFront.setAttribute('style', '');
                this.imageElementFront.setAttribute('class', 'hidden');
            }
            this.front = false;
        } else {
            if (this.imageElementBack) {
                this.imageElementBack.setAttribute('style', '');
                this.imageElementBack.setAttribute('class', 'hidden');
            }
            this.front = true;
        }
        if (this.errorElement) {
            this.errorElement.setAttribute('class', 'show');
        }
        this.busy = false;
        var self = this;
        setTimeout(function() {
            self.updateImage();
        }, 250);
    }
    onImageLoad() {
        if (this.errorElement) {
            this.errorElement.setAttribute('class', '');
        }
        if (this.front) {
            if (this.imageElementFront) {
                this.imageElementFront.setAttribute('class', '');
                this.imageElementFront.setAttribute('style', 'z-index: 2');
                if (this.imageElementBack) {
                    this.imageElementBack.setAttribute('style', '');
                }
            }
            this.front = false;
        } else {
            if (this.imageElementBack) {
                this.imageElementBack.setAttribute('class', '');
                this.imageElementBack.setAttribute('style', 'z-index: 2');
                if (this.imageElementFront) {
                    this.imageElementFront.setAttribute('style', '');
                }
            }
            this.front = true;
        }
        this.busy = false;
        var self = this;
        setTimeout(function() {
            self.updateImage();
        }, 250);
    }
    updateImage() {
        if (this.front) {
            if (this.imageElementFront) {
                if (! this.busy) {
                    this.busy = true;
                    this.imageElementFront.src = this.url + "/mapimage?format=jpg&quality=80&width=" + Math.max(this.imageElementFront.width, 160) + "&height=" + Math.max(this.imageElementFront.height, 90) +"&session&mapcmd=user&distance=5&cmd=" + Math.random();
                }
            }
        } else {
            if (this.imageElementBack) {
                if (! this.busy) {
                    this.busy = true;
                    this.imageElementBack.src = this.url + "/mapimage?format=jpg&quality=80&width=" + Math.max(this.imageElementBack.width, 160) + "&height=" + Math.max(this.imageElementBack.height, 90) +"&session&mapcmd=user&distance=5&cmd=" + Math.random();
                }
            }
        }
    }
}
window.customElements.define("ingamepanel-lnm", IngamePanelLNMPanel);
checkAutoload();