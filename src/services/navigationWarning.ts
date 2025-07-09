interface NavigationWarningOptions {
  onBeforeNavigate: (targetUrl: string) => boolean | Promise<boolean>;
  onConfirmNavigate: (targetUrl: string) => void;
  onCancelNavigate: () => void;
}

class NavigationWarningService {
  private static instance: NavigationWarningService;
  private isCallActive: boolean = false;
  private isSPA: boolean = false;
  private warningOptions: NavigationWarningOptions | null = null;
  private originalBeforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null;

  private constructor() {
    this.detectSPA();
    this.setupNavigationListeners();
  }

  static getInstance(): NavigationWarningService {
    if (!NavigationWarningService.instance) {
      NavigationWarningService.instance = new NavigationWarningService();
    }
    return NavigationWarningService.instance;
  }

  private detectSPA(): void {
    // Check if the site is likely an SPA by looking for common indicators
    const hasHistoryAPI = 'pushState' in window.history;
    const hasRouter = !!(document.querySelector('[data-router]') || 
                     document.querySelector('[data-route]') ||
                     document.querySelector('[ng-app]') || // Angular
                     document.querySelector('[data-reactroot]') || // React
                     document.querySelector('[data-vue-app]')); // Vue
    
    this.isSPA = hasHistoryAPI && (hasRouter || window.location.hash.includes('#/'));
    
    console.log('Navigation Warning Service: Site detected as', this.isSPA ? 'SPA' : 'non-SPA');
  }

  private setupNavigationListeners(): void {
    // Listen for clicks on links
    document.addEventListener('click', this.handleLinkClick.bind(this));
    
    // Listen for form submissions
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Listen for beforeunload events (page refresh, close tab, etc.)
    this.originalBeforeUnloadHandler = window.onbeforeunload;
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  private handleLinkClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (!link || !this.isCallActive || this.isSPA) {
      return;
    }

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    // Check if it's an external link or different page
    const targetUrl = new URL(href, window.location.origin);
    if (targetUrl.origin !== window.location.origin || targetUrl.pathname !== window.location.pathname) {
      event.preventDefault();
      this.showNavigationWarning(targetUrl.href);
    }
  }

  private handleFormSubmit(event: Event): void {
    if (!this.isCallActive || this.isSPA) {
      return;
    }

    const form = event.target as HTMLFormElement;
    const action = form.getAttribute('action');
    
    if (action) {
      const targetUrl = new URL(action, window.location.origin);
      if (targetUrl.origin !== window.location.origin || targetUrl.pathname !== window.location.pathname) {
        event.preventDefault();
        this.showNavigationWarning(targetUrl.href);
      }
    }
  }

  private handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isCallActive && !this.isSPA) {
      event.preventDefault();
      event.returnValue = 'You have an active call. Are you sure you want to leave?';
      return event.returnValue;
    }
  }

  private showNavigationWarning(targetUrl: string): void {
    if (!this.warningOptions) {
      console.warn('Navigation warning options not set');
      return;
    }

    // Create and show the warning modal
    this.createWarningModal(targetUrl);
  }

  private createWarningModal(targetUrl: string): void {
    // Remove existing modal if any
    const existingModal = document.getElementById('navigation-warning-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'navigation-warning-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 12px;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = 'Active Call Warning';
    title.style.cssText = `
      margin: 0 0 1rem 0;
      color: #dc2626;
      font-size: 1.5rem;
      font-weight: 600;
    `;

    const message = document.createElement('p');
    message.textContent = `You have an active call that will end if you navigate away from this page. Would you like to open the new page in a new tab to keep your call active?`;
    message.style.cssText = `
      margin: 0 0 1.5rem 0;
      color: #374151;
      line-height: 1.6;
      font-size: 1rem;
    `;

    const targetInfo = document.createElement('p');
    targetInfo.textContent = `Destination: ${targetUrl}`;
    targetInfo.style.cssText = `
      margin: 0 0 1.5rem 0;
      color: #6b7280;
      font-size: 0.875rem;
      word-break: break-all;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    `;

    const newTabButton = document.createElement('button');
    newTabButton.textContent = 'Open in New Tab';
    newTabButton.style.cssText = `
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background-color 0.2s;
    `;
    newTabButton.onmouseover = () => newTabButton.style.background = '#1d4ed8';
    newTabButton.onmouseout = () => newTabButton.style.background = '#2563eb';
    newTabButton.onclick = () => {
      this.warningOptions?.onConfirmNavigate(targetUrl);
      modal.remove();
    };

    const leaveButton = document.createElement('button');
    leaveButton.textContent = 'Leave Page (End Call)';
    leaveButton.style.cssText = `
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background-color 0.2s;
    `;
    leaveButton.onmouseover = () => leaveButton.style.background = '#b91c1c';
    leaveButton.onmouseout = () => leaveButton.style.background = '#dc2626';
    leaveButton.onclick = () => {
      window.location.href = targetUrl;
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background-color 0.2s;
    `;
    cancelButton.onmouseover = () => cancelButton.style.background = '#4b5563';
    cancelButton.onmouseout = () => cancelButton.style.background = '#6b7280';
    cancelButton.onclick = () => {
      this.warningOptions?.onCancelNavigate();
      modal.remove();
    };

    buttonContainer.appendChild(newTabButton);
    buttonContainer.appendChild(leaveButton);
    buttonContainer.appendChild(cancelButton);

    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(targetInfo);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.warningOptions?.onCancelNavigate();
        modal.remove();
      }
    };
  }

  setCallActive(active: boolean): void {
    this.isCallActive = active;
    console.log('Navigation Warning Service: Call active state set to', active);
  }

  setWarningOptions(options: NavigationWarningOptions): void {
    this.warningOptions = options;
  }

  getIsSPA(): boolean {
    return this.isSPA;
  }

  getIsCallActive(): boolean {
    return this.isCallActive;
  }

  cleanup(): void {
    // Remove event listeners
    document.removeEventListener('click', this.handleLinkClick.bind(this));
    document.removeEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Restore original beforeunload handler
    if (this.originalBeforeUnloadHandler) {
      window.onbeforeunload = this.originalBeforeUnloadHandler;
    }
    
    // Remove any existing modal
    const existingModal = document.getElementById('navigation-warning-modal');
    if (existingModal) {
      existingModal.remove();
    }
  }
}

export const navigationWarningService = NavigationWarningService.getInstance(); 