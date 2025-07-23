import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from '../src/components/ChatWidget';
import ChatWidgets from './components/ChatWidget/index'

import { getWidgetConfig, initializeWidgetConfig } from './constants/config';

// Create and export a global function to render the widget for embedding purposes
export const initializeChatWidget = async () => {
    try {
   
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

console.log('Window loaded, initializing widget... First step',window);
if (typeof window !== 'undefined') {
    console.log(' First step under if',window);
 
    window.onload = async () => {
        console.log('Window loaded, initializing widget... Second step');
        try{
            await initializeWidgetConfig();
            // Request parent origin from the parent window
            window.parent.postMessage("REQUEST_PARENT_ORIGIN", "*");

            // Listen for a response from the parent window
            const handleParentMessage = async (event: MessageEvent) => {
                // Ensure the message is from the parent and has the expected structure
                if (event.source === window.parent && event.data && event.data.type === 'PARENT_ORIGIN') {
                    const parentOrigin = event.data.origin;
                    console.log('Received parent origin:', parentOrigin);

                    let data = getWidgetConfig().domains.includes(parentOrigin);
                    console.log('this is the window parent origin from the widget', parentOrigin);
                    console.log(getWidgetConfig().domains, 'this is the list of domains');
                    console.log('this is data in the initializeWidgetConfig', data);

                    if (data) {
                        console.log('this is data in the second step', data);
                        await initializeChatWidget();
                    }

                    // Clean up the event listener once we have the origin
                    window.removeEventListener('message', handleParentMessage);
                }
            };

            window.addEventListener('message', handleParentMessage);
        }catch(err){
            console.log('Please check your widget configuration')
        }
    };
} else {
    console.log('Not Initialized');
}

