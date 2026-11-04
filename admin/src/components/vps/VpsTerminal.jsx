import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Plug, PlugZap, RotateCw, TerminalSquare } from 'lucide-react';
import { terminalSocketUrl } from '@/services/vpsApi';
import { cn } from '@/lib/utils';

/**
 * Interactive root SSH shell.
 *
 * A real terminal emulator rather than a log pane, so pagers, colours and
 * full-screen tools (top, vim, journalctl) behave as they do over ssh. Keystrokes
 * go straight to the remote pty; the backend accepts the socket only while the
 * console is unlocked and ends the session the moment it is locked again.
 */

const THEME = {
  background: '#0b1020',
  foreground: '#e2e8f0',
  cursor: '#38bdf8',
  selectionBackground: '#1e3a5f',
  black: '#0b1020',
  red: '#f87171',
  green: '#4ade80',
  yellow: '#fbbf24',
  blue: '#60a5fa',
  magenta: '#c084fc',
  cyan: '#22d3ee',
  white: '#e2e8f0',
};

const STATUS = {
  idle: { label: 'Not connected', tone: 'bg-muted text-muted-foreground' },
  connecting: { label: 'Connecting…', tone: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  open: { label: 'Connected', tone: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  closed: { label: 'Disconnected', tone: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
};

const VpsTerminal = ({ host }) => {
  const hostRef = useRef(null);
  const termRef = useRef(null);
  const fitRef = useRef(null);
  const socketRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [note, setNote] = useState('');

  // Tear down the socket without touching the terminal buffer, so output stays readable
  const closeSocket = useCallback(() => {
    const socket = socketRef.current;
    socketRef.current = null;
    if (socket) {
      socket.onclose = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.close();
    }
  }, []);

  const connect = useCallback(() => {
    const term = termRef.current;
    if (!term) return;
    closeSocket();
    setStatus('connecting');
    setNote('');

    const { rows, cols } = term;
    let socket;
    try {
      socket = new WebSocket(terminalSocketUrl({ rows, cols }));
    } catch (error) {
      setStatus('closed');
      setNote(error?.message || 'Could not open the terminal socket.');
      return;
    }
    socketRef.current = socket;

    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === 'data') term.write(message.data);
      else if (message.type === 'ready') {
        setStatus('open');
        term.write(`\r\n\x1b[38;5;45m${message.message}\x1b[0m\r\n`);
      } else if (message.type === 'error') {
        setNote(message.message || 'Terminal error');
        term.write(`\r\n\x1b[38;5;203m${message.message}\x1b[0m\r\n`);
      } else if (message.type === 'exit') {
        term.write(`\r\n\x1b[38;5;245m${message.message}\x1b[0m\r\n`);
      }
    };

    socket.onerror = () => setNote('The terminal connection failed.');
    socket.onclose = () => {
      setStatus('closed');
      socketRef.current = null;
    };
  }, [closeSocket]);

  // Build the emulator once; the socket is connected on demand
  useEffect(() => {
    const term = new Terminal({
      fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
      fontSize: 13,
      cursorBlink: true,
      convertEol: false,
      scrollback: 5000,
      theme: THEME,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(hostRef.current);
    fit.fit();
    termRef.current = term;
    fitRef.current = fit;

    term.write('\x1b[38;5;245mPress Connect to open a root shell on the VPS.\x1b[0m\r\n');

    const onData = term.onData((data) => {
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'input', data }));
    });

    const observer = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        return;
      }
      const socket = socketRef.current;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'resize', rows: term.rows, cols: term.cols }));
      }
    });
    observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      onData.dispose();
      closeSocket();
      term.dispose();
      termRef.current = null;
    };
  }, [closeSocket]);

  const disconnect = () => {
    closeSocket();
    setStatus('closed');
    termRef.current?.write('\r\n\x1b[38;5;245mDisconnected.\x1b[0m\r\n');
  };

  const badge = STATUS[status];
  const live = status === 'open' || status === 'connecting';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TerminalSquare className="size-4 text-primary" />
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', badge.tone)}>{badge.label}</span>
          {host && <span className="font-mono">{host}</span>}
        </div>
        <div className="flex items-center gap-2">
          {live ? (
            <button
              type="button"
              onClick={disconnect}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
            >
              <PlugZap className="size-3.5" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={connect}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plug className="size-3.5" />
              Connect
            </button>
          )}
          <button
            type="button"
            onClick={connect}
            title="Reconnect"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          >
            <RotateCw className="size-3.5" />
            Reconnect
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-[#0b1020] p-2">
        <div ref={hostRef} className="h-[380px] w-full" />
      </div>

      {note && <p className="text-xs text-rose-600 dark:text-rose-400">{note}</p>}
      <p className="text-[11px] text-muted-foreground">
        Everything typed here runs as the SSH user on the VPS and is recorded in the console audit log. The session closes after 15 minutes idle,
        or as soon as the console is locked.
      </p>
    </div>
  );
};

export default VpsTerminal;
