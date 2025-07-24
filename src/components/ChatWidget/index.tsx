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
            console.log('Retell web client not found');
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
            // Mute call
            muteMicrophone();
            setCallState('muted');
        } else if (callState === 'muted') {
            // Unmute call
            unmuteMicrophone();
            setCallState('active');
        }
    };

    return (
        <div ref={widgetRef}>
            {/* Call Modal Window */}
            <ModalWindow visible={visible} setVisible={setVisible} />

            {/* Voice Assistant Prompt Widget - Based on image.json specs */}
            <div
                onClick={handleWidgetClick}
                style={{
                    position: 'fixed',
                    bottom: 45,
                    right: 32,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: callState === 'muted' ? '#EC221F' : 'white',
                    boxShadow: callState === 'active' 
                        ? '0 8px 32px rgba(0,0,0,0.25), 0 0 0 4px rgba(20, 174, 92, 0.3)' 
                        : callState === 'muted'
                        ? '0 8px 32px rgba(0,0,0,0.25), 0 0 0 4px rgba(236, 34, 31, 0.3)'
                        : '0 8px 32px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1000,
                    overflow: 'visible',
                    padding: '24px',
                    border: callState === 'active' ? '3px solid #14AE5C' : callState === 'muted' ? '3px solid #EC221F' : 'none',
                    animation: callState === 'active' ? 'pulse-green 2s infinite' : callState === 'muted' ? 'pulse-red 2s infinite' : 'none',
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Close Button - Top right, outside the circle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setVisible(false);
                        setCallState('inactive');
                        stopMicrophone();
                    }}
                    style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        width: 30,
                        height: 30,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 4,
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    aria-label="Close"
                >
                    <img
                        src="/widget/Icon_Close.svg"
                        alt="Close"
                        style={{
                            width: 18,
                            height: 18,
                            color: '#000000',
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

                {/* Blue horizontal line accent or Audio Wave when call is active */}
                {callState === 'active' || callState === 'muted' ? (
                    <img
                        src="/widget/Audio Wave.gif"
                        alt="Audio Wave"
                        style={{
                            position: 'absolute',
                            left: 28,
                            top: 45,
                            width: 100,
                            height: 12,
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute',
                        left: 28,
                        top: 50,
                        width: 100,
                        height: 2,
                        background: '#000080', // primaryColor from specs
                        borderRadius: 1,
                    }} />
                )}

                {/* Text content - matching image.json textStyles */}
                <div style={{
                    position: 'absolute',
                    left: 28,
                    top: 60,
                    width: 130,
                }}>
                    {/* Title: "Need more info?" */}
                    <div style={{
                        position: 'absolute',
                        top: 9,
                        left: -20,
                        color: callState === 'muted' ? 'white' : '#000090', // title color from specs
                        fontWeight: 'normal', // normal weight from specs
                        fontSize: '12px', // medium size
                        marginBottom: 6,
                        fontFamily: 'inherit',
                        lineHeight: 1.2,
                    }}>
                        {callState === 'muted' ? 'Microphone muted' : callState === 'active' ? 'Call active' : 'Need more info?'}
                    </div>
                    {/* Subtitle: "Speak with Carolyn now" */}
                    <div style={{
                        position: 'absolute',
                        left: -20,
                        top: 30,
                        color: callState === 'muted' ? 'white' : '#000080', // subtitle color from specs (primaryColor)
                        fontWeight: 'bold', // bold from specs
                        fontSize: '14px', // medium size, slightly larger
                        fontStyle: 'italic', // italic from specs
                        fontFamily: 'inherit',
                        lineHeight: 1.1,
                    }}>
                        {callState === 'muted' ? 'Click to unmute' : callState === 'active' ? 'Click to mute' : 'Speak with'}<br />{callState === 'muted' || callState === 'active' ? '' : currentAgentName}
                    </div>
                </div>

                {/* Agent Image - Business casual female with headset, positioned right inside circle */}
                <img
                    src="/widget/agent.png"
                    alt="Voice Assistant"
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 20,
                        width: 200,
                        height: 180,
                        objectFit: 'cover',
                        borderRadius: 16,
                        // boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 2,
                    }}
                />

                {/* Microphone Button - Orange, Green, or Red based on call state */}
                {callState === 'active' ? (
                    <img
                        src="/widget/Icon_MicrophoneGreen.svg"
                        alt="Active Microphone"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: -55,
                            transform: 'translateX(-50%)',
                            width: 111,
                            height: 111,
                            cursor: 'pointer',
                            zIndex: 3,
                            transition: 'transform 0.2s ease',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            muteMicrophone();
                            setCallState('muted');
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                        }}
                    />
                ) : callState === 'muted' ? (
                    <img
                        src="/widget/Icon_MicrophoneRed.svg"
                        alt="Muted Microphone"
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: -55,
                            transform: 'translateX(-50%)',
                            width: 111,
                            height: 111,
                            cursor: 'pointer',
                            zIndex: 3,
                            transition: 'transform 0.2s ease',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            unmuteMicrophone();
                            setCallState('active');
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            bottom: -40,
                            transform: 'translateX(-50%)',
                            width: 85,
                            height: 85,
                            borderRadius: '50%',
                            background: '#FF6600', // accentColor from specs
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 6px 20px rgba(255,102,0,0.3)',
                            zIndex: 3,
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setCallState('active');
                            setVisible(true);
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,102,0,0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,102,0,0.3)';
                        }}
                    >
                        {/* Microphone icon - white on orange background */}
                        <svg 
                            width="48" 
                            height="48" 
                            viewBox="0 0 24 24" 
                            fill="white"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                        >
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatWidget;



