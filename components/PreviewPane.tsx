"use client";
import { FaPlay } from 'react-icons/fa';
import { MotionDiv } from '@/lib/motion';

interface PreviewPaneProps {
  previewUrl: string | null;
  deviceMode: 'desktop' | 'mobile';
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isStartingPreview: boolean;
  previewInitializationMessage: string;
  hasActiveRequests: boolean;
  isRunning: boolean;
  activeBrandColor: string;
  start: () => void;
}

export default function PreviewPane({
  previewUrl,
  deviceMode,
  iframeRef,
  isStartingPreview,
  previewInitializationMessage,
  hasActiveRequests,
  isRunning,
  activeBrandColor,
  start,
}: PreviewPaneProps) {
  if (previewUrl) {
    return (
      <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
        <div
          className={`bg-white ${
            deviceMode === 'mobile'
              ? 'w-[375px] h-[667px] rounded-[25px] border-8 border-gray-800 shadow-2xl'
              : 'w-full h-full'
          } overflow-hidden`}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-none bg-white"
            src={previewUrl}
            onError={() => {
              const overlay = document.getElementById('iframe-error-overlay');
              if (overlay) overlay.style.display = 'flex';
            }}
            onLoad={() => {
              const overlay = document.getElementById('iframe-error-overlay');
              if (overlay) overlay.style.display = 'none';
            }}
          />

          <div
            id="iframe-error-overlay"
            className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10"
            style={{ display: 'none' }}
          >
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Connection Issue
              </h3>
              <p className="text-gray-600 mb-4">
                The preview couldn&apos;t load properly. Try clicking the refresh button to reload the page.
              </p>
              <button
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                onClick={() => {
                  const iframe = document.querySelector('iframe');
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                  const overlay = document.getElementById('iframe-error-overlay');
                  if (overlay) overlay.style.display = 'none';
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50 relative">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-white" />
        <div
          className="absolute inset-0 block transition-all duration-1000 ease-in-out"
          style={{
            background: `radial-gradient(circle at 50% 100%,
              ${activeBrandColor}40 0%,
              ${activeBrandColor}26 25%,
              transparent 50%)`
          }}
        />
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isStartingPreview ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-40 h-40 mx-auto mb-6 relative">
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: activeBrandColor,
                  mask: 'url(/Symbol_white.png) no-repeat center/contain',
                  WebkitMask: 'url(/Symbol_white.png) no-repeat center/contain',
                  opacity: 0.9
                }}
              />

              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 border-4 rounded-full animate-spin"
                  style={{
                    borderTopColor: 'transparent',
                    borderRightColor: activeBrandColor,
                    borderBottomColor: activeBrandColor,
                    borderLeftColor: activeBrandColor,
                  }}
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Starting Preview Server
            </h3>

            <div className="flex items-center justify-center gap-1 text-gray-600">
              <span>{previewInitializationMessage}</span>
              <MotionDiv
                className="flex gap-1 ml-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <MotionDiv
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-1 h-1 bg-gray-600 rounded-full"
                />
                <MotionDiv
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="w-1 h-1 bg-gray-600 rounded-full"
                />
                <MotionDiv
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  className="w-1 h-1 bg-gray-600 rounded-full"
                />
              </MotionDiv>
            </div>
          </MotionDiv>
        ) : (
          <div className="text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {hasActiveRequests ? (
                <>
                  <div className="w-40 h-40 mx-auto mb-6 relative">
                    <MotionDiv
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      style={{ transformOrigin: "center center" }}
                      className="w-full h-full"
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: activeBrandColor,
                          mask: 'url(/Symbol_white.png) no-repeat center/contain',
                          WebkitMask: 'url(/Symbol_white.png) no-repeat center/contain',
                          opacity: 0.9
                        }}
                      />
                    </MotionDiv>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 relative overflow-hidden inline-block">
                    <span
                      className="relative"
                      style={{
                        background: `linear-gradient(90deg,
                          #6b7280 0%,
                          #6b7280 30%,
                          #ffffff 50%,
                          #6b7280 70%,
                          #6b7280 100%)`,
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'shimmerText 5s linear infinite'
                      }}
                    >
                      Building...
                    </span>
                    <style>{`
                      @keyframes shimmerText {
                        0% {
                          background-position: 200% center;
                        }
                        100% {
                          background-position: -200% center;
                        }
                      }
                    `}</style>
                  </h3>
                </>
              ) : (
                <>
                  <div
                    onClick={!isRunning && !isStartingPreview ? start : undefined}
                    className={`w-40 h-40 mx-auto mb-6 relative ${!isRunning && !isStartingPreview ? 'cursor-pointer group' : ''}`}
                  >
                    <MotionDiv
                      className="w-full h-full"
                      animate={isStartingPreview ? { rotate: 360 } : {}}
                      transition={{ duration: 6, repeat: isStartingPreview ? Infinity : 0, ease: "linear" }}
                    >
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: activeBrandColor,
                          mask: 'url(/Symbol_white.png) no-repeat center/contain',
                          WebkitMask: 'url(/Symbol_white.png) no-repeat center/contain',
                          opacity: 0.9
                        }}
                      />
                    </MotionDiv>

                    <div className="absolute inset-0 flex items-center justify-center">
                      {isStartingPreview ? (
                        <div
                          className="w-14 h-14 border-4 rounded-full animate-spin"
                          style={{
                            borderTopColor: 'transparent',
                            borderRightColor: activeBrandColor,
                            borderBottomColor: activeBrandColor,
                            borderLeftColor: activeBrandColor,
                          }}
                        />
                      ) : (
                        <MotionDiv
                          className="flex items-center justify-center"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaPlay size={32} />
                        </MotionDiv>
                      )}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Preview Not Running
                  </h3>

                  <p className="text-gray-600 max-w-lg mx-auto">
                    Start your development server to see live changes
                  </p>
                </>
              )}
            </MotionDiv>
          </div>
        )}
      </div>
    </div>
  );
}