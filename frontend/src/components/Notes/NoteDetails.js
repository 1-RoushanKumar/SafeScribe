import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import api from "../../services/api";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import Errors from "../Errors";
import toast from "react-hot-toast";
import Modals from "../PopModal";

import {MdRecordVoiceOver, MdStop} from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NoteDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [note, setNote] = useState(null);
    const [editorContent, setEditorContent] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [noteEditLoader, setNoteEditLoader] = useState(false);
    const [editEnable, setEditEnable] = useState(false);

    const [aiResponse, setAiResponse] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiResponseExpanded, setAiResponseExpanded] = useState(true);

    const [openSummarizeDialog, setOpenSummarizeDialog] = useState(false);
    const [summaryLength, setSummaryLength] = useState("medium");

    const [openAnswerDialog, setOpenAnswerDialog] = useState(false);
    const [question, setQuestion] = useState("");

    const [openTranslateDialog, setOpenTranslateDialog] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState("French");
    const [useCustomLanguage, setUseCustomLanguage] = useState(false);

    const [openReadDialog, setOpenReadDialog] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const commonLanguages = [
        "Spanish",
        "German",
        "Japanese",
        "Hindi",
        "Russian",
    ];

    const fetchNoteDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/notes/${id}`);
            const foundNote = response.data;
            if (foundNote) {
                try {
                    foundNote.parsedContent = JSON.parse(foundNote.content).content;
                } catch (e) {
                    console.error("Error parsing note content JSON:", e);
                    foundNote.parsedContent = foundNote.content;
                }
                setNote(foundNote);
                setEditorContent(foundNote.parsedContent);
            } else {
                setError("Note not found or invalid ID.");
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch note details.");
            console.error("Error fetching note details", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchNoteDetails();
        }
    }, [id, fetchNoteDetails]);

    useEffect(() => {
        if (note?.parsedContent) {
            setEditorContent(note.parsedContent);
        }
    }, [note?.parsedContent]);

    const handleChange = (content) => {
        setEditorContent(content);
    };

    const onNoteEditHandler = async () => {
        if (editorContent.trim().replace(/<[^>]*>/g, "").length === 0) {
            return toast.error("Note content shouldn't be empty");
        }

        try {
            setNoteEditLoader(true);
            const noteData = {content: editorContent};
            await api.put(`/notes/${id}`, noteData);
            toast.success("Note update successful");
            setEditEnable(false);
            fetchNoteDetails();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Update Note Failed");
            console.error("Error updating note:", err);
        } finally {
            setNoteEditLoader(false);
        }
    };

    const onBackHandler = () => {
        navigate(-1);
    };

    const stopSpeech = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            toast.success("Speech stopped.");
        }
    }, []);

    const callAiEndpoint = async (endpoint, payload = {}, params = {}) => {
        setAiLoading(true);
        setAiResponse(null);
        setAiError(null);
        setAiResponseExpanded(true);
        stopSpeech();

        try {
            const aiPayload = {
                ...payload,
                content: note.parsedContent,
            };
            const response = await api.post(`/notes/${id}/ai/${endpoint}`, aiPayload, {
                params,
            });
            setAiResponse({
                operation: endpoint,
                answer: response.data.answer,
                sources: response.data.sources,
            });
            toast.success(
                `${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} completed!`
            );
        } catch (err) {
            console.error(`Error calling AI endpoint ${endpoint}:`, err);
            setAiError(err.response?.data?.message || `Failed to ${endpoint}.`);
            toast.error(`Failed to ${endpoint}.`);
        } finally {
            setAiLoading(false);
        }
    };

    const handleSummarize = async () => {
        setOpenSummarizeDialog(false);
        await callAiEndpoint("summarize", {}, {length: summaryLength});
    };

    const handleAnswerQuestion = async () => {
        setOpenAnswerDialog(false);
        if (!question.trim()) {
            setAiError("Please enter a question.");
            toast.error("Please enter a question.");
            return;
        }
        await callAiEndpoint("answer", {question});
        setQuestion("");
    };

    const handleReadNote = async () => {
        setOpenReadDialog(false);
        await callAiEndpoint("read");
    };

    const handleTranslate = async () => {
        setOpenTranslateDialog(false);
        if (!targetLanguage.trim()) {
            setAiError("Please select or enter a target language.");
            toast.error("Please select or enter a target language.");
            return;
        }
        await callAiEndpoint("translate", {}, {targetLanguage});
        setTargetLanguage("French");
        setUseCustomLanguage(false);
    };

    const clearAiResponse = useCallback(() => {
        setAiResponse(null);
        setAiError(null);
        stopSpeech();
    }, [stopSpeech]);

    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, [stopSpeech]);

    const startSpeech = (text) => {
        if ("speechSynthesis" in window) {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            const cleanText = text
                .replace(/<[^>]*>/g, " ")
                .replace(/[#$%^&*;:{}=\-_`~()]/g, " ")
                .replace(/([.!?])\s*([A-Z])/g, "$1 $2")
                .replace(/,\s*/g, ", ")
                .replace(/\.\s*/g, ". ")
                .replace(/\s\s+/g, " ")
                .trim();

            if (!cleanText) {
                toast.error("No readable content found.");
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);

            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            utterance.lang = "en-US";

            utterance.onstart = () => {
                setIsSpeaking(true);
                toast.success("Speech started");
            };

            utterance.onend = () => {
                setIsSpeaking(false);
                toast.success("Speech completed");
            };

            utterance.onerror = (event) => {
                console.error("Speech synthesis error:", event.error, event);
                setIsSpeaking(false);

                if (event.error !== "interrupted" && event.error !== "canceled") {
                    toast.error(`Speech error: ${event.error}`);
                }
            };

            utterance.onpause = () => {
                console.log("Speech paused");
            };

            utterance.onresume = () => {
                console.log("Speech resumed");
            };

            window.speechSynthesis.speak(utterance);
        } else {
            toast.error("Text-to-speech not supported in this browser.");
        }
    };

    const renderAiAnswer = () => {
        if (!aiResponse) return null;

        const markdownWrapperClasses = "prose prose-sm max-w-none text-gray-700";

        if (
            aiResponse.operation === "summarize" ||
            aiResponse.operation === "answer"
        ) {
            return (
                <div className={markdownWrapperClasses}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResponse.answer}
                    </ReactMarkdown>
                </div>
            );
        } else if (aiResponse.operation === "translate") {
            return (
                <div
                    className={markdownWrapperClasses}
                    dangerouslySetInnerHTML={{__html: aiResponse.answer}}
                ></div>
            );
        } else if (aiResponse.operation === "read") {
            return (
                <div className={markdownWrapperClasses}>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                        <p className="font-semibold text-lg mb-2 text-blue-800">
                            📖 Text Ready for Speech
                        </p>
                        <div className="text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                            {aiResponse.answer}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => startSpeech(aiResponse.answer)}
                            disabled={isSpeaking}
                            className={`py-2 px-4 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 ${
                                isSpeaking
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                            }`}
                        >
                            <MdRecordVoiceOver className="text-lg"/>
                            {isSpeaking ? "Playing..." : "Play Audio"}
                        </button>

                        <button
                            onClick={stopSpeech}
                            disabled={!isSpeaking}
                            className={`py-2 px-4 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 ${
                                !isSpeaking
                                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                                    : "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                            }`}
                        >
                            <MdStop className="text-lg"/>
                            Stop
                        </button>
                        {isSpeaking && (
                            <button
                                onClick={() => {
                                    if (window.speechSynthesis.paused) {
                                        window.speechSynthesis.resume();
                                    } else {
                                        window.speechSynthesis.pause();
                                    }
                                }}
                                className="py-2 px-4 rounded-lg flex items-center gap-2 font-medium bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                {window.speechSynthesis.paused ? "▶️ Resume" : "⏸️ Pause"}
                            </button>
                        )}
                    </div>

                    {isSpeaking && (
                        <div className="mt-3 flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Speech in progress...</span>
                        </div>
                    )}
                </div>
            );
        }
        return (
            <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{__html: aiResponse.answer}}
            ></div>
        );
    };

    if (error) {
        return <Errors message={error}/>;
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <button
                onClick={onBackHandler}
                className="px-4 py-2 mb-6 text-white bg-gray-700 rounded-md"
            >
                Go Back
            </button>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3"> {/* Changed to 3 columns */}
                {/* Left Side: Note Details (takes 2/3 of space) */}
                <div className="lg:col-span-2 p-8 bg-slate-100 rounded-lg shadow-md"> {/* span 2 columns */}
                    <div className="flex justify-end mb-4 gap-2">
                        {!loading && (
                            <>
                                <button
                                    onClick={() => setEditEnable(!editEnable)}
                                    className={`px-4 py-2 text-white rounded-md ${
                                        editEnable ? 'bg-red-500' : 'bg-blue-600'
                                    }`}
                                >
                                    {editEnable ? 'Cancel' : 'Edit'}
                                </button>
                                {!editEnable && (
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="px-4 py-2 text-white bg-red-500 rounded-md"
                                    >
                                        Delete
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-96">
                            <span className="text-gray-600">Loading note...</span>
                        </div>
                    ) : (
                        <>
                            {editEnable ? (
                                <div className="flex flex-col">
                                    <ReactQuill
                                        className="min-h-[300px] border rounded-md"
                                        value={editorContent}
                                        onChange={handleChange}
                                    />
                                    <button
                                        disabled={noteEditLoader}
                                        onClick={onNoteEditHandler}
                                        className="px-6 py-3 mt-6 text-white bg-green-600 rounded-md self-end"
                                    >
                                        {noteEditLoader ? 'Saving...' : 'Update Note'}
                                    </button>
                                </div>
                            ) : (
                                <div className="min-h-[300px] p-4 border rounded-md">
                                    {note?.parsedContent ? (
                                        <div dangerouslySetInnerHTML={{__html: note.parsedContent}}/>
                                    ) : (
                                        <p className="text-gray-500">No content available.</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Side: AI Actions (takes 1/3 of space) */}
                {!loading && note && (
                    <div className="lg:col-span-1 p-8 bg-white rounded-lg shadow-md"> {/* span 1 column */}
                        <h2 className="mb-6 text-2xl font-bold text-gray-800">AI Actions</h2>

                        <div className="space-y-4">
                            <button
                                onClick={() => setOpenSummarizeDialog(true)}
                                disabled={aiLoading}
                                className="w-full px-4 py-3 text-white bg-purple-600 rounded-lg"
                            >
                                {aiLoading ? 'Processing...' : 'Summarize Note'}
                            </button>

                            <button
                                onClick={() => setOpenAnswerDialog(true)}
                                disabled={aiLoading}
                                className="w-full px-4 py-3 text-white bg-teal-600 rounded-lg"
                            >
                                {aiLoading ? 'Processing...' : 'Ask Question'}
                            </button>

                            <button
                                onClick={() => setOpenReadDialog(true)}
                                disabled={aiLoading}
                                className="w-full px-4 py-3 text-white bg-indigo-600 rounded-lg"
                            >
                                {aiLoading ? 'Processing...' : 'Read Note'}
                            </button>

                            <button
                                onClick={() => setOpenTranslateDialog(true)}
                                disabled={aiLoading}
                                className="w-full px-4 py-3 text-white bg-pink-600 rounded-lg"
                            >
                                {aiLoading ? 'Processing...' : 'Translate Note'}
                            </button>
                        </div>

                        {/* AI Response */}
                        {(aiResponse || aiError) && (
                            <div className="pt-6 mt-8 border-t">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">
                                        {aiError ? 'Error' : 'AI Response'}
                                    </h3>
                                    <button
                                        onClick={clearAiResponse}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        Clear
                                    </button>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    {aiError ? (
                                        <p className="text-red-600">{aiError}</p>
                                    ) : (
                                        <div>{renderAiAnswer()}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modals open={modalOpen} setOpen={setModalOpen} noteId={id}/>

            {/* Dialogs */}
            <Dialog open={openSummarizeDialog} onClose={() => setOpenSummarizeDialog(false)}>
                <DialogTitle>Summarize Note</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Summary Length</InputLabel>
                        <Select
                            value={summaryLength}
                            label="Summary Length"
                            onChange={(e) => setSummaryLength(e.target.value)}
                        >
                            <MenuItem value="short">Short</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="long">Long</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <button onClick={() => setOpenSummarizeDialog(false)} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button onClick={handleSummarize} className="px-4 py-2 text-white bg-blue-600 rounded">
                        Summarize
                    </button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAnswerDialog} onClose={() => setOpenAnswerDialog(false)}>
                <DialogTitle>Ask Question</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Question"
                        fullWidth
                        variant="outlined"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <button onClick={() => setOpenAnswerDialog(false)} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button onClick={handleAnswerQuestion} className="px-4 py-2 text-white bg-blue-600 rounded">
                        Ask
                    </button>
                </DialogActions>
            </Dialog>

            <Dialog open={openTranslateDialog} onClose={() => setOpenTranslateDialog(false)}>
                <DialogTitle>Translate Note</DialogTitle>
                <DialogContent>
                    <div className="mb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={useCustomLanguage}
                                onChange={(e) => setUseCustomLanguage(e.target.checked)}
                            />
                            Use Custom Language
                        </label>
                    </div>

                    {useCustomLanguage ? (
                        <TextField
                            margin="dense"
                            label="Enter Language"
                            fullWidth
                            variant="outlined"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                        />
                    ) : (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Select Language</InputLabel>
                            <Select
                                value={targetLanguage}
                                label="Select Language"
                                onChange={(e) => setTargetLanguage(e.target.value)}
                            >
                                {commonLanguages.map((lang) => (
                                    <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <button onClick={() => setOpenTranslateDialog(false)} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button onClick={handleTranslate} className="px-4 py-2 text-white bg-blue-600 rounded">
                        Translate
                    </button>
                </DialogActions>
            </Dialog>

            <Dialog open={openReadDialog} onClose={() => setOpenReadDialog(false)}>
                <DialogTitle>Read Note Aloud</DialogTitle>
                <DialogContent>
                    <p className="text-gray-700">
                        Click "Read" to have the AI process the note content for text-to-speech.
                    </p>
                </DialogContent>
                <DialogActions>
                    <button onClick={() => setOpenReadDialog(false)} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button onClick={handleReadNote} className="px-4 py-2 text-white bg-indigo-600 rounded">
                        Read
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default NoteDetails;