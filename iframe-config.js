// Music Player Iframe Configuration
// This file helps configure the app when embedded in an iframe

(function() {
    'use strict';
    
    // Detect if running in iframe
    const isInIframe = window.self !== window.top;
    
    // Configuration object
    window.MusicPlayerConfig = {
        isIframe: isInIframe,
        
        // Iframe-specific settings
        iframe: {
            // Disable certain features that don't work well in iframes
            disableFullscreen: true,
            // Adjust UI for iframe context
            compactMode: true,
            // Auto-hide certain UI elements
            hideHeader: false,
            // Adjust heights for iframe
            maxHeight: '800px'
        },
        
        // Communication with parent window
        postMessage: {
            enabled: true,
            // Events to send to parent
            events: [
                'audioStarted',
                'audioPaused',
                'audioEnded',
                'playlistChanged',
                'errorOccurred'
            ]
        },
        
        // Auto-configuration based on iframe size
        responsive: {
            enabled: true,
            breakpoints: {
                mobile: 480,
                tablet: 768,
                desktop: 1024
            }
        }
    };
    
    // Helper functions for iframe integration
    window.MusicPlayerIframe = {
        // Send message to parent window
        sendToParent: function(type, data) {
            if (isInIframe && window.parent) {
                window.parent.postMessage({
                    source: 'music-player',
                    type: type,
                    data: data
                }, '*');
            }
        },
        
        // Listen for messages from parent
        listenToParent: function(callback) {
            window.addEventListener('message', function(event) {
                if (event.data && event.data.source === 'music-player-parent') {
                    callback(event.data.type, event.data.data);
                }
            });
        },
        
        // Auto-resize iframe based on content
        autoResize: function() {
            if (isInIframe) {
                const height = document.body.scrollHeight;
                this.sendToParent('resize', { height: height });
            }
        },
        
        // Initialize iframe-specific features
        init: function() {
            if (isInIframe) {
                // Add iframe-specific CSS class
                document.body.classList.add('iframe-embedded');
                
                // Set up auto-resize observer
                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(() => {
                        this.autoResize();
                    });
                    resizeObserver.observe(document.body);
                }
                
                // Send ready message to parent
                this.sendToParent('ready', {
                    version: '1.0.0',
                    features: ['audio-playback', 'playlist-management']
                });
            }
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.MusicPlayerIframe.init();
        });
    } else {
        window.MusicPlayerIframe.init();
    }
    
})();

// CSS for iframe-specific styling
if (window.MusicPlayerConfig && window.MusicPlayerConfig.isIframe) {
    const style = document.createElement('style');
    style.textContent = `
        .iframe-embedded {
            margin: 0 !important;
            padding: 0 !important;
            min-height: 100vh;
        }
        
        .iframe-embedded .header {
            padding-top: 20px !important;
        }
        
        .iframe-embedded .container {
            padding: 10px !important;
        }
        
        @media (max-width: 768px) {
            .iframe-embedded .title {
                font-size: 24px !important;
            }
        }
    `;
    document.head.appendChild(style);
}
