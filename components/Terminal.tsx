"use client";
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface TerminalProps {
  projectId: string;
  className?: string;
}

export default function Terminal({ projectId, className = '' }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    const term = new XTerminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#ffffff',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      },
      allowProposedApi: true,
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Open terminal in DOM
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Display welcome message
    term.writeln('\x1b[32mFrogable Terminal\x1b[0m');
    term.writeln('Type commands and press Enter to execute.');
    term.writeln('');
    term.write('$ ');

    // Handle terminal input
    let commandBuffer = '';
    let cursorPosition = 0;

    const executeCommand = async (cmd: string) => {
      if (!cmd.trim()) {
        term.write('\r\n$ ');
        return;
      }

      setIsExecuting(true);
      term.write('\r\n');

      try {
        const response = await fetch(`/api/projects/${projectId}/terminal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: cmd }),
        });

        const result = await response.json();

        if (result.output) {
          // Process and display output
          const lines = result.output.split('\n');
          lines.forEach((line: string, index: number) => {
            if (index < lines.length - 1 || line) {
              term.writeln(line);
            }
          });
        }

        if (result.error && result.error.trim()) {
          // Display error in red
          const errorLines = result.error.split('\n');
          errorLines.forEach((line: string) => {
            if (line.trim()) {
              term.writeln(`\x1b[31m${line}\x1b[0m`);
            }
          });
        }

        // Add to history
        setCommandHistory(prev => [...prev, cmd]);
        setHistoryIndex(-1);
      } catch (error) {
        term.writeln(`\x1b[31mError: Failed to execute command\x1b[0m`);
        console.error('Command execution error:', error);
      } finally {
        setIsExecuting(false);
        term.write('$ ');
        commandBuffer = '';
        cursorPosition = 0;
      }
    };

    term.onData((data) => {
      if (isExecuting) return;

      // Handle special characters
      if (data === '\r') {
        // Enter key - execute command
        executeCommand(commandBuffer);
      } else if (data === '\x7f') {
        // Backspace
        if (cursorPosition > 0) {
          commandBuffer = commandBuffer.slice(0, cursorPosition - 1) + commandBuffer.slice(cursorPosition);
          cursorPosition--;
          // Clear line and rewrite
          term.write('\r\x1b[K$ ' + commandBuffer);
          // Position cursor
          if (cursorPosition < commandBuffer.length) {
            term.write('\x1b[' + (commandBuffer.length - cursorPosition) + 'D');
          }
        }
      } else if (data === '\x1b[A') {
        // Up arrow - previous command in history
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = historyIndex + 1;
          const historicalCommand = commandHistory[commandHistory.length - 1 - newIndex];
          if (historicalCommand) {
            setHistoryIndex(newIndex);
            commandBuffer = historicalCommand;
            cursorPosition = commandBuffer.length;
            term.write('\r\x1b[K$ ' + commandBuffer);
          }
        }
      } else if (data === '\x1b[B') {
        // Down arrow - next command in history
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const historicalCommand = commandHistory[commandHistory.length - 1 - newIndex];
          setHistoryIndex(newIndex);
          commandBuffer = historicalCommand;
          cursorPosition = commandBuffer.length;
          term.write('\r\x1b[K$ ' + commandBuffer);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          commandBuffer = '';
          cursorPosition = 0;
          term.write('\r\x1b[K$ ');
        }
      } else if (data === '\x1b[D') {
        // Left arrow
        if (cursorPosition > 0) {
          cursorPosition--;
          term.write(data);
        }
      } else if (data === '\x1b[C') {
        // Right arrow
        if (cursorPosition < commandBuffer.length) {
          cursorPosition++;
          term.write(data);
        }
      } else if (data === '\x03') {
        // Ctrl+C - cancel current input
        commandBuffer = '';
        cursorPosition = 0;
        term.write('^C\r\n$ ');
      } else if (data === '\x0c') {
        // Ctrl+L - clear screen
        term.clear();
        term.write('$ ' + commandBuffer);
      } else if (data.charCodeAt(0) >= 32) {
        // Regular character
        commandBuffer = commandBuffer.slice(0, cursorPosition) + data + commandBuffer.slice(cursorPosition);
        cursorPosition++;
        // Clear line and rewrite
        term.write('\r\x1b[K$ ' + commandBuffer);
        // Position cursor
        if (cursorPosition < commandBuffer.length) {
          term.write('\x1b[' + (commandBuffer.length - cursorPosition) + 'D');
        }
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [projectId, isExecuting, commandHistory, historyIndex]);

  // Fit terminal when container changes size
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    });

    if (terminalRef.current) {
      observer.observe(terminalRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`relative h-full w-full bg-[#1e1e1e] ${className}`}>
      <div ref={terminalRef} className="h-full w-full" />
      {isExecuting && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded animate-pulse">
            Executing...
          </span>
        </div>
      )}
    </div>
  );
}