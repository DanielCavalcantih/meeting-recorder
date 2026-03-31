"use client";

import { useEffect, useRef } from "react";

export function AudioCanvas({
	levels,
}: {
	levels: number[];
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const historyRef = useRef<number[]>([]);
	const animationRef = useRef<number | null>(null);

	useEffect(() => {
		if (!levels.length) return;

		const rms = Math.sqrt(
			levels.reduce((sum, v) => sum + v * v, 0) / levels.length
		);

		const amplified = Math.min(rms * 1.5, 1);

		const last = historyRef.current.at(-1) ?? 0;
		const smooth = last * 0.7 + amplified * 0.3;

		historyRef.current.push(smooth);

		if (historyRef.current.length > 120) {
			historyRef.current.shift();
		}
	}, [levels]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const resizeCanvas = () => {
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
		};

		const observer = new ResizeObserver(resizeCanvas);
		observer.observe(canvas);
		resizeCanvas();

		const render = () => {
			const width = canvas.width;
			const height = canvas.height;

			ctx.clearRect(0, 0, width, height);

			const bars = historyRef.current;

			if (bars.length > 0) {
				const barWidth = width / bars.length;

				bars.forEach((value, i) => {
					const barHeight = value * height;
					const x = i * barWidth;
					const y = height - barHeight;

					ctx.fillStyle = "#3b82f6";

					ctx.fillRect(x, y, Math.max(barWidth - 1, 0.1), barHeight);
				});
			}

			animationRef.current = requestAnimationFrame(render);
		};

		render();

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			observer.disconnect();
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="w-full h-[300px] bg-transparent"
		/>
	);
}
