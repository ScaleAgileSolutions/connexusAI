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
    // console.log(' First step under if',window);
 
    const runWidgetInitialization = async () => {
        console.log('Window loaded, initializing widget... Second step');
        try{
            await initializeWidgetConfig();
           let parentOrigin = getWidgetConfig().parentOrigin;
           let data = getWidgetConfig().domains.includes(parentOrigin)
        //    console.log('this is the window parent origin from the widget',parentOrigin )
        //    console.log(getWidgetConfig().domains,'this is the list of domains')
        //     console.log('this is data in the initializeWidgetConfig',data)
            
            // if(data){
            //    console.log('this is data in the second step',data)
               await initializeChatWidget();
            // }
        }catch(err){
            console.log('Please check your widget configuration')
        }
    };

    if (document.readyState === 'complete') {
      // The page is already loaded, so run the initialization immediately.
      runWidgetInitialization();
    } else {
      // The page is still loading, so wait for the 'load' event.
      window.addEventListener('load', runWidgetInitialization);
    }
} else {
    console.log('Not Initialized');
}

