// Toast Notification System - Detective Conan Style
// Reusable toast notifications to replace alerts throughout the app

const toastSystem = {
    container: null,
    
    init() {
        // Create toast container if it doesn't exist
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 4000) {
        this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        // Determine icon and colors based on type
        let icon = '🔍';
        let bgColor = 'linear-gradient(135deg, #fff9e6 0%, #fffef7 100%)';
        let borderColor = '#1d3557';
        let textColor = '#1a1a1a';
        
        switch(type) {
            case 'success':
                icon = '✓';
                bgColor = 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)';
                borderColor = '#2e7d32';
                break;
            case 'error':
                icon = '⚠️';
                bgColor = 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)';
                borderColor = '#c62828';
                break;
            case 'warning':
                icon = '⚠';
                bgColor = 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';
                borderColor = '#ef6c00';
                break;
            case 'info':
            default:
                icon = '🔍';
                break;
        }
        
        toast.style.cssText = `
            position: relative;
            background: ${bgColor};
            border: 3px solid ${borderColor};
            border-radius: 8px;
            padding: 16px 20px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3), 4px 4px 0 rgba(0,0,0,0.2);
            font-family: 'Comic Neue', 'Comic Sans MS', cursive, sans-serif;
            color: ${textColor};
            font-size: 14px;
            line-height: 1.5;
            pointer-events: auto;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        `;
        
        const iconEl = document.createElement('div');
        iconEl.textContent = icon;
        iconEl.style.cssText = `
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
        `;
        
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            flex: 1;
            font-weight: 500;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: transparent;
            border: none;
            color: ${textColor};
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
            transition: opacity 0.2s;
            flex-shrink: 0;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.opacity = '1';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.opacity = '0.7';
        });
        
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });
        
        toast.appendChild(iconEl);
        toast.appendChild(messageEl);
        toast.appendChild(closeBtn);
        
        this.container.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }
        
        return toast;
    },
    
    remove(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    },
    
    // Convenience methods
    success(message, duration) {
        return this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    },
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// Export globally
if (typeof window !== 'undefined') {
    window.toast = toastSystem;
    window.showToast = (message, type, duration) => toastSystem.show(message, type, duration);
}
