"use client";

import { Button } from "@heroui/react";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
			<h1 className="text-3xl font-bold">Meeting Recorder</h1>
			<p className="text-xl">Grave, organize e transforme suas reuniões em insights claros em segundos.</p>
			<div>
				<Button className="bg-blue-400" variant="solid">Iniciar gravação</Button>
			</div>
        </div>
      </main>
    </div>
  );
}
