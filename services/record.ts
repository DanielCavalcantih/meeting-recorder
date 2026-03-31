import { api } from "./api";

export const sendAudioToResume = async (audio: Blob) => {
    const formData = new FormData();
    formData.append("file", audio, "recording.webm");

    const response = await api.post(
        "/recorder/audio", 
        formData, 
        {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        }
    );
    
    return response.data;
};
