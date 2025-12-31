import { useEffect, useRef, useState } from 'react';
import { FiX, FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiPhoneOff } from 'react-icons/fi';

const VideoCall = ({ roomName, displayName, onClose, bookingId }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Jitsi Meet API script
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) return;

        // Configure Jitsi Meet
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName || `TutoringSession_${bookingId || Date.now()}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName || 'User',
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'download',
              'help',
              'mute-everyone',
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            SHOW_POWERED_BY: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            APP_NAME: 'EXCEL Tutoring',
            NATIVE_APP_NAME: 'EXCEL Tutoring',
            PROVIDER_NAME: 'EXCEL',
            MOBILE_APP_PROMO: false,
          },
        };

        // Initialize Jitsi Meet API
        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        // Event listeners
        api.addEventListener('videoConferenceJoined', () => {
          console.log('User joined the conference');
          setIsLoading(false);
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('User left the conference');
          if (onClose) onClose();
        });

        api.addEventListener('readyToClose', () => {
          console.log('Ready to close');
          if (onClose) onClose();
        });

        api.addEventListener('errorOccurred', (error) => {
          console.error('Jitsi error:', error);
          setError('An error occurred during the video call');
        });

      } catch (err) {
        console.error('Failed to load Jitsi:', err);
        setError('Failed to load video call. Please try again.');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, displayName, bookingId, onClose]);

  const handleClose = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <h2 className="text-xl font-semibold">Live Tutoring Session</h2>
            <p className="text-sm text-gray-300">Room: {roomName || 'Session'}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FiPhoneOff size={20} />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white text-lg">Connecting to video call...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we set up your session</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-white text-xl font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default VideoCall;
