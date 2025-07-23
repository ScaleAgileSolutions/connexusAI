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

// console.log('Window loaded, initializing widget... First step');
// if (typeof window !== 'undefined') {
//     window.onload = async () => {
//         console.log('Window loaded, initializing widget... Second step');
//         try{
//             await initializeWidgetConfig();
//             let data = getWidgetConfig().domains.includes(window.location.origin)
//             console.log('this is the window that origin',window.parent.location.origin )
//             console.log(getWidgetConfig().domains,'this is the list of domains')
//              console.log('this is data in the initializeWidgetConfig',data)
//             if(data){
//                 console.log('this is data in the second step',data)
//                 await initializeChatWidget();
//             }
//         }catch(err){
//             console.log('Please check your widget configuration')
//         }
//     };
// } else {
//     console.log('Not Initialized');
// }
console.log('Window loaded, initializing widget... First step');

if (typeof window !== 'undefined') {
    const initializeWidget = async () => {
        console.log('Window loaded, initializing widget... Second step');
        try {
            await initializeWidgetConfig();
            
            // Request parent origin via postMessage
            window.parent.postMessage({ type: 'GET_PARENT_ORIGIN' }, "*");
            
            // Listen for response from parent with timeout
            const handleParentMessage = (event) => {
                console.log('Received message from parent:', event);
                console.log('Event data:', event.data);
                
                if (event.data && event.data.type === 'PARENT_ORIGIN_RESPONSE') {
                    const parentOrigin = event.data.origin;
                    console.log('Parent origin:', parentOrigin);
                    
                    const widgetConfig = getWidgetConfig();
                    if (!widgetConfig || !widgetConfig.domains) {
                        console.error('Widget configuration is missing or invalid');
                        return;
                    }
                    
                    console.log('Configured domains:', widgetConfig.domains);
                    
                    const isAllowedDomain = widgetConfig.domains.includes(parentOrigin);
                    console.log('Domain verification result:', isAllowedDomain);
                    
                    if (isAllowedDomain) {
                        console.log('Domain verified, initializing chat widget');
                        initializeChatWidget();
                    } else {
                        console.warn('Domain not allowed:', parentOrigin);
                    }
                    
                    // Clean up event listener
                    window.removeEventListener('message', handleParentMessage);
                }
            };
            
            window.addEventListener('message', handleParentMessage);
            
            // Optional: Add timeout to prevent hanging
            setTimeout(() => {
                window.removeEventListener('message', handleParentMessage);
                console.warn('Parent origin request timed out');
            }, 5000); // 5 second timeout
            
        } catch (err) {
            console.error('Widget initialization failed:', err);
            console.log('Please check your widget configuration');
        }
    };
    
    // Check if DOM is already loaded
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        // DOM is already loaded
        initializeWidget();
    }
} else {
    console.log('Not in browser environment - widget not initialized');
}