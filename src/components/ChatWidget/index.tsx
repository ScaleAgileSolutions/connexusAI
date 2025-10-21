//to do, check chat gpt for the updated code,
//chnage the call state when new call is started with noah,
// sign over controls to the new calls with noah
// turn down the valume of the music


// importing external style
import { styles } from "../styles";
// import icon
import { BsFillTelephoneFill } from "react-icons/bs";
import React, { useEffect, useRef, useState } from "react";
//import ModalWindow
import ModalWindow from "./ModalWindow";
import {agent} from './constant'
import {getWidgetConfig} from "../../constants/config";

import 'bootstrap/dist/css/bootstrap.min.css';
function ChatWidget() {
    // state variable to track if widget button was hovered on
    const [hovered, setHovered] = useState(false);
    // state variable to track modal visibility
    const [visible, setVisible] = useState<boolean>(false);
    //creating a ref 'id'
    const widgetRef = useRef(null);
    const [micStatus, setMicStatus] = useState<"active" | "inactive" | "denied" | "checking">("checking");
    const [currentAgentName, setCurrentAgentName] = useState(getWidgetConfig().agentName);   
    const [currentStage, setCurrentStage] = useState('Speak With');
    const [callState, setCallState] = useState<'inactive' | 'active' | 'muted'>('inactive');
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [isClosed, setIsClosed] = useState(false);

    // use effect listener to check if the mouse was cliked outside the window 
    useEffect(() => {
        function handleClickOutside(event) {
            if (widgetRef.current && !widgetRef.current.contains(event.target)) {
                // setVisible(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [widgetRef]);

    async function checkMic() {
        if (navigator.mediaDevices && !visible) {
            navigator.mediaDevices
                .getUserMedia({ audio: true, video: false })
                .then((stream) => {
                    setMicStream(stream);
                     // Make stream available globally for Retell
                    (window as any).retellMicrophoneStream = stream;
                    setMicStatus("active");
                    setVisible(true);
                }).catch((error: any) => {
                    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                        setMicStatus("denied");
                    } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                        setMicStatus("denied");
                    } else {
                        setMicStatus("denied");
                    }
                });
        } else if (visible) {
            setVisible(false);
            setCurrentAgentName(getWidgetConfig().agentName);
            setCurrentStage('Speak With');
            stopMicrophone();
        }
    }

    // 🔁 This function allows you to update agent name and manage transfer behavior
    function handleAgentTransfer(newAgentName: string) {
        setCurrentAgentName(getWidgetConfig().transferAgentName);
        setCurrentStage('Calling')
        setMicStatus("active");
    }
    
    useEffect(() => {
        (window as any).transferToAgent = handleAgentTransfer;
    }, []);

    // 🔁 This function allows you to update agent name and manage transfer behavior
    function handleAgentHengUp(newAgentName: string) {
        setCurrentAgentName(getWidgetConfig().agentName);
        setCurrentStage('Speak With')
        setMicStatus("active");
        setVisible(false);
    }
    
    useEffect(() => {
        (window as any).hengUpAgent = handleAgentHengUp;
    }, []);

    // Function to handle call state changes
    function handleCallStateChange(state: 'inactive' | 'active' | 'muted') {
        setCallState(state);
    }
    
    useEffect(() => {
        (window as any).setCallState = handleCallStateChange;
        (window as any).muteMicrophone = muteMicrophone;
        (window as any).unmuteMicrophone = unmuteMicrophone;
        (window as any).stopMicrophone = stopMicrophone;
    }, []);

    // Cleanup microphone stream on component unmount
    useEffect(() => {
        return () => {
            stopMicrophone();
        };
    }, []);

    // Function to mute the microphone
    const muteMicrophone = () => {
        if ((window as any).retellWebClient) {
            (window as any).retellWebClient.mute();
            console.log('Microphone muted using Retell SDK');
        } else {
            console.log('not found');
        }
    };

    // Function to unmute the microphone
    const unmuteMicrophone = () => {
        if ((window as any).retellWebClient) {
            (window as any).retellWebClient.unmute();
            console.log('Microphone unmuted using Retell SDK');
        } else {
            console.log('Retell web client not found');
        }
    };

    // Function to stop the microphone stream completely
    const stopMicrophone = () => {
        if (micStream) {
            micStream.getTracks().forEach(track => {
                track.stop();
            });
            setMicStream(null);
            console.log('Microphone stream stopped');
        }
    };

    const openModal = () => {
        setVisible(true);
    };

    const handleWidgetClick = () => {
        if (callState === 'inactive') {
            // Start call - request microphone access
            checkMic();
            setCallState('active');
        } else if (callState === 'active') {
            // Mute call (but this will end the call instead)
            setVisible(false);
            stopMicrophone();
            setCallState('muted');
        } else if (callState === 'muted') {
            // Unmute call (start new call)
            checkMic();
            setCallState('active');
        }
    };

    return (
        <div ref={widgetRef}>
            {/* Call Modal Window */}
            <ModalWindow visible={visible} setVisible={setVisible} setCallState={setCallState} />

            {/* Show only icon when closed, full widget when open */}
            {isClosed ? (
                /* Closed state - show only main.png icon */
                <div
                    onClick={() => {
                        setIsClosed(false);
                        setCallState('inactive');
                    }}
                    style={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        width: 64,
                        height: 64,
                        cursor: 'pointer',
                        zIndex: 1000,
                        transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <img
                        src="/look/main.png"
                        alt="Open Widget"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            ) : (
                /* Full widget state */
                <div
                    onClick={handleWidgetClick}
                style={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    width: 'auto',
                    height: 'auto',
                    borderRadius: '40px',
                    background: 'linear-gradient(135deg, #D4E3F0 0%, #E8EFF5 50%, #FFFFFF 100%)',
                    boxShadow: callState === 'active' 
                        ? '0 0 0 3px rgba(49, 225, 123, 0.3), 0 6px 24px rgba(49, 225, 123, 0.4)' 
                        : callState === 'muted'
                        ? '0 0 0 3px rgba(236, 34, 31, 0.3), 0 6px 24px rgba(236, 34, 31, 0.4)'
                        : '0 6px 24px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    zIndex: 1000,
                    overflow: 'visible',
                    padding: '8px 14px',
                    border: 'none',
                    transition: 'all 0.3s ease',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Close Button - Show in all states */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setVisible(false);
                        setCallState('inactive');
                        stopMicrophone();
                        setIsClosed(true);
                    }}
                    style={{
                        position: 'absolute',
                        top: -35,
                        right: -5,
                        width: 40,
                        height: 40,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 4,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                    }}
                    aria-label="Close"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <img
                        src="/look/Icon_Close.svg"
                        alt="Close"
                        style={{
                            width: 24,
                            height: 24,
                        }}
                    />
                </button>

                {/* Test button to simulate call state - Remove this in production
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const nextState = callState === 'inactive' ? 'active' : callState === 'active' ? 'muted' : 'inactive';
                        setCallState(nextState);
                    }}
                    style={{
                        position: 'absolute',
                        top: -50,
                        left: -50,
                        background: callState === 'active' ? '#14AE5C' : callState === 'muted' ? '#EC221F' : '#FF6600',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        zIndex: 5,
                    }}
                >
                    {callState === 'inactive' ? 'Start Call' : callState === 'active' ? 'Mute' : 'Unmute'}
                </button> */}

                {/* Logo/Icon - Changes based on state */}
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: callState === 'muted' ? 'transparent' : callState === 'active' ? '#2D7F4F' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                    flexShrink: 0,
                    boxShadow: callState === 'muted' ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}>
                    {callState === 'muted' ? (
                        <img
                            src="/look/Icon_Mic02.png"
                            alt="Muted"
                            style={{
                                width: 48,
                                height: 48,
                                objectFit: 'contain',
                            }}
                        />
                    ) : callState === 'active' ? (
                        <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="white"
                        >
                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                        </svg>
                    ) : (
                        <img
                            src="/look/Logo_01.png"
                            alt="ConnexUS AI Logo"
                            style={{
                                width: 36,
                                height: 36,
                                objectFit: 'contain',
                            }}
                        />
                    )}
                </div>

                {/* Text content - Same structure, colors change based on state */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingRight: 8,
                }}>
                    <div style={{
                        color: callState === 'muted' ? '#C92A2A' : callState === 'active' ? '#2D7F4F' : '#001F54',
                        fontSize: '14px',
                        fontWeight: '700',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: 1.2,
                        marginBottom: 2,
                    }}>
                        {callState === 'muted' ? `You're OFF with ${currentAgentName}` : callState === 'active' ? `You're ON with ${currentAgentName}` : `Speak with ${currentAgentName} for Help`}
                    </div>
                    <div style={{
                        color: '#4A5568',
                        fontSize: '10px',
                        fontWeight: '400',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: 1.3,
                    }}>
                        Powered by ConnexUS AI
                    </div>
                </div>

            </div>
            )}
        </div>
    );
}

export default ChatWidget;



