"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
  length: number;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [seconds, setSeconds] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isRecordingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseTextRef = useRef("");
  const sessionFinalRef = useRef("");

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    setIsSupported(Boolean(Ctor));
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setIsSupported(false);
      return;
    }

    baseTextRef.current = "";
    sessionFinalRef.current = "";
    setFinalText("");
    setInterimText("");
    setSeconds(0);
    isRecordingRef.current = true;
    setIsRecording(true);

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const rawChunks: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        const piece = res[0]?.transcript?.trim() || "";
        if (piece) {
          rawChunks.push(piece);
        }
      }

      // Android Chrome cumulative chunk deduplication
      const cleaned: string[] = [];
      for (const raw of rawChunks) {
        if (cleaned.length === 0) {
          cleaned.push(raw);
        } else {
          const prev = cleaned[cleaned.length - 1];
          if (raw.toLowerCase().startsWith(prev.toLowerCase())) {
            cleaned[cleaned.length - 1] = raw;
          } else if (prev.toLowerCase().startsWith(raw.toLowerCase())) {
            // redundant prefix
          } else {
            cleaned.push(raw);
          }
        }
      }

      const sessionText = cleaned.join(" ").trim();
      sessionFinalRef.current = sessionText;

      const total = [baseTextRef.current, sessionText]
        .filter(Boolean)
        .join(" ")
        .trim();

      setFinalText(total);
      setInterimText("");
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        const combined = [baseTextRef.current, sessionFinalRef.current]
          .filter(Boolean)
          .join(" ")
          .trim();
        baseTextRef.current = combined;
        sessionFinalRef.current = "";
        setInterimText("");

        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognition.onerror = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // ignore
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stop = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setInterimText("");
  }, []);

  const reset = useCallback(() => {
    baseTextRef.current = "";
    sessionFinalRef.current = "";
    setFinalText("");
    setInterimText("");
    setSeconds(0);
  }, []);

  const handleSetFinalText = useCallback(
    (value: string | ((prev: string) => string)) => {
      setFinalText((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        baseTextRef.current = next;
        sessionFinalRef.current = "";
        return next;
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      recognitionRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isSupported,
    isRecording,
    finalText,
    interimText,
    seconds,
    start,
    stop,
    reset,
    setFinalText: handleSetFinalText,
  };
}
