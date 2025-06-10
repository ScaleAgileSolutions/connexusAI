import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from '../src/components/ChatWidget';
import ChatWidgets from './components/ChatWidget/index'

import { getWidgetConfig, initializeWidgetConfig } from './constants/config';

// Create and export a global function to render the widget for embedding purposes
export const initializeChatWidget = async () => {
    try {
        await initializeWidgetConfig();
        console.log('Initializing chat widget...');
        const div = document.createElement('div');
        div.id = getWidgetConfig().divId;
        div.style.position = 'fixed';
        div.style.bottom = '0px';
        div.style.right = '0px';
        div.style.zIndex = '1000';
        document.body.appendChild(div);

        // For React 18+, use createRoot instead of ReactDOM.render
        const root = ReactDOM.createRoot(div);
        root.render(<ChatWidgets />);
    } catch (error) {
        console.error('Failed to initialize chat widget:', error);
    }
};

console.log('Window loaded, initializing widget... First step');
if (typeof window !== 'undefined') {
    window.onload = async () => {
        console.log('Window loaded, initializing widget... Second step');
        await initializeChatWidget();
    };
} else {
    console.log('Not Initialized');
}
