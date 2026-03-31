"use client";

import { sendAudioToResume } from "@/services/record";
import { useCallback, useEffect, useRef, useState } from "react";

export function useRecorder() {
	const streamRef = useRef<MediaStream | null>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const dataArrayRef = useRef<Uint8Array | null>(null);
	const animationRef = useRef<number | null>(null);

	const chunks = useRef<Blob[]>([]);

	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const [levels, setLevels] = useState<number[]>([]);
	const [resume, setResume] = useState<string | null>(null);
	const [isPaused, setIsPaused] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const updateLevels = useCallback(() => {
		if (!analyserRef.current || !dataArrayRef.current) return;

		analyserRef.current.getByteFrequencyData(
			dataArrayRef.current as Uint8Array
		);

		const normalized = Array.from(dataArrayRef.current).map((v) => v / 255);
		setLevels(normalized);

		animationRef.current = requestAnimationFrame(updateLevels);
	}, []);

	const startRecording = async () => {
		try {
			setError(null);
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			streamRef.current = stream;

			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;

			chunks.current = [];

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunks.current.push(e.data);
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(chunks.current, { type: "audio/webm" });
				setAudioBlob(blob);
			};

			mediaRecorder.start();

			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			const ctx = new AudioContextClass();
			audioContextRef.current = ctx;

			const source = ctx.createMediaStreamSource(stream);
			const analyser = ctx.createAnalyser();

			analyser.fftSize = 256;

			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);

			source.connect(analyser);

			analyserRef.current = analyser;
			dataArrayRef.current = dataArray;

			setIsRecording(true);
			setIsPaused(false);
			setAudioBlob(null);

			updateLevels();
		} catch (err) {
			console.error("Erro ao acessar o microfone", err);
			setError("Permissão negada ou nenhum microfone encontrado.");
		}
	};

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
			mediaRecorderRef.current.stop();
		}

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}

		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		if (audioContextRef.current) {
			audioContextRef.current.close().catch(console.error);
			audioContextRef.current = null;
		}

		setIsRecording(false);
		setIsPaused(false);
		setLevels([]);
	}, []);

	const sendAudio = useCallback(async () => {
		if (!audioBlob) return;
		try {
			const response = await sendAudioToResume(audioBlob);
			setResume(response.summary);
		} catch (err) {
			console.error("Erro ao enviar áudio", err);
			setError("Falha ao enviar o áudio.");
		}
	}, [audioBlob]);

	const pauseRecording = useCallback(() => {
		if (mediaRecorderRef.current?.state === "recording") {
			mediaRecorderRef.current.pause();
			setIsPaused(true);
		}

		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}
	}, []);

	const resumeRecording = useCallback(() => {
		if (mediaRecorderRef.current?.state === "paused") {
			mediaRecorderRef.current.resume();
			setIsPaused(false);
			updateLevels();
		}
	}, [updateLevels]);

	useEffect(() => {
		return () => {
			stopRecording();
		};
	}, [stopRecording]);

	return {
		isRecording,
		audioBlob,
		levels,
		startRecording,
		stopRecording,
		sendAudio,
		resume,
		pauseRecording,
		resumeRecording,
		isPaused,
		error
	};
}
