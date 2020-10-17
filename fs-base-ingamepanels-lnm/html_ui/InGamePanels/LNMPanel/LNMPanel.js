class IngamePanelLNMPanel extends TemplateElement {
    constructor() {
        super(...arguments);

        this.started = false;
        this.busy = false;
        this.front = true;
        this.url = "";
        this.zoom = 4;
        this.debugEnabled = false;
        this.onStorageReady = () => {
            if (this.debugEnabled) {
                var self = this;
                setTimeout(() => {
                    self.isDebugEnabled();
                }, 1000);
            } else {
                this.initialize();
            }
        };
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
        document.addEventListener("dataStorageReady", this.onStorageReady);
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

        this.url = GetStoredData("INGAME_PANEL_LNMPANEL_URL");
        if (! this.url) {
            this.url = "http://localhost:8965";
        }

        this.urlElement = document.querySelector("#LNMPanelAddress");
        this.saveElement = document.querySelector("#LNMPanelSave");
        this.errorElement = document.getElementById("LNMPanelImageError");
        this.imageElementFront = document.getElementById("LNMPanelImageFront");
        this.imageElementBack = document.getElementById("LNMPanelImageBack");
        this.imageElementZoom = document.getElementById("LNMPanelImageZoom");
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
            if (this.imageElementZoom) {
                var panzoom = Panzoom(this.imageElementZoom, {
                    disablePan: true,
                    maxScale: 4,
                    minScale: 0.01,
                    step: -1
                });
                const panzoomParent = this.imageElementZoom.parentElement;
                panzoomParent.addEventListener('wheel', panzoom.zoomWithWheel);
                this.imageElementZoom.addEventListener('panzoomchange', (event) => {
                    if (event.detail.scale > 4) {
                        self.zoom = 4;
                    } else if (event.detail.scale < 0) {
                        self.zoom = 0;
                    } else {
                        self.zoom = event.detail.scale.toFixed(2);
                    }
                });

            }
        }

        if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", (e) => {
                self.updateImage();
            });
            this.ingameUi.addEventListener("onResizeElement", () => {
                self.updateImage();
            });
            this.ingameUi.addEventListener("dblclick", () => {
                if (self.m_Footer) {
                    self.m_Footer.classList.remove("hidden");
                }
            });
        }

        if (this.saveElement) {
            this.saveElement.addEventListener("click", (e) => {
                if (self.urlElement &&
                    self.urlElement.value
                ) {
                    self.url = self.urlElement.value;
                    SetStoredData("INGAME_PANEL_LNMPANEL_URL", self.url);
                    setTimeout(function() {
                        self.updateImage();
                    }, 250);
                    if (self.m_Footer) {
                        self.m_Footer.classList.add("hidden");
                    }
                }
            });
        }
        if (this.urlElement) {
            this.urlElement.value = this.url;
        }

        this.started = true;
    }
    disconnectedCallback() {
        document.removeEventListener("dataStorageReady", this.onStorageReady);
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
        if (! this.url) {
            var self = this;
            setTimeout(function() {
                self.updateImage();
            }, 250);
            return;
        }
        if (this.front) {
            if (this.imageElementFront) {
                if (! this.busy) {
                    this.busy = true;
                    this.imageElementFront.src = this.url + "/mapimage?format=jpg&quality=80&width=" + Math.max(this.imageElementFront.width, 160) + "&height=" + Math.max(this.imageElementFront.height, 90) +"&session&mapcmd=user&distance="+this.zoom.toString()+"&cmd=" + Math.random();
                }
            }
        } else {
            if (this.imageElementBack) {
                if (! this.busy) {
                    this.busy = true;
                    this.imageElementBack.src = this.url + "/mapimage?format=jpg&quality=80&width=" + Math.max(this.imageElementBack.width, 160) + "&height=" + Math.max(this.imageElementBack.height, 90) +"&session&mapcmd=user&distance="+this.zoom.toString()+"&cmd=" + Math.random();
                }
            }
        }
    }
}
window.customElements.define("ingamepanel-lnm", IngamePanelLNMPanel);
checkAutoload();