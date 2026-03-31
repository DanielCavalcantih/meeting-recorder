"use client";

import { Button } from "@/components/ui/button";
import { AudioCanvas } from "@/custom-components/AudioCanvas";
import { useRecorder } from "@/hooks/useRecorder";
import ReactMarkdown from "react-markdown";

export default function Home() {
	const {
		isRecording,
		levels,
		startRecording,
		stopRecording,
		audioBlob,
		sendAudio,
		resume,
		pauseRecording,
		resumeRecording,
		isPaused
	} = useRecorder();

	return (
		<div className="flex min-h-screen items-center justify-center">
			<main className="flex flex-col items-center gap-6">

				<h1 className="text-3xl font-bold">
					Meeting Recorder
				</h1>

				<p className="text-xl">
					Grave, organize e transforme suas reuniões em insights claros em segundos.
				</p>


				<AudioCanvas levels={levels} />

				{
					!isRecording ? (
						<Button size="lg" onClick={startRecording}>
							Iniciar gravação
						</Button>
					) : (
						<div className="flex gap-3">
							{!isPaused ? (
								<Button size="lg" onClick={pauseRecording}>
									Pausar
								</Button>
							) : (
								<Button size="lg" onClick={resumeRecording}>
									Continuar
								</Button>
							)}

							<Button
								size="lg"
								variant="destructive"
								onClick={stopRecording}
							>
								Finalizar
							</Button>
						</div>
					)
				}

				{audioBlob && (
					<div className="flex flex-col justify-center items-center gap-3">
						<audio controls src={URL.createObjectURL(audioBlob)} />
						<Button size="lg" onClick={sendAudio}>
							Gerar resumo
						</Button>
					</div>
				)}

				{resume && (
					<div className="prose prose-sm max-w-none">
						<ReactMarkdown
							components={{
								h1: ({ children }) => <h1 className="text-xl3 font-bold mb-3">{children}</h1>,
								h2: ({ children }) => <h2 className="text-xl2 font-semibold mt-4 mb-2">{children}</h2>,
								h3: ({ children }) => <h3 className="text-xl font-semibold mt-3 mb-2">{children}</h3>,
								p: ({ children }) => <p className="mb-2 text-lg leading-relaxed">{children}</p>,
								ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
								li: ({ children }) => <li className="leading-relaxed">{children}</li>,
								strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
							}}
						>
							{resume}
						</ReactMarkdown>
					</div>
				)}
			</main>
		</div>
	);
}