import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import api from "../../services/api";
import "react-quill/dist/quill.snow.css";
import {Blocks} from "react-loader-spinner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Buttons from "../../utils/Buttons";
import Errors from "../Errors";
import toast from "react-hot-toast";
import Modals from "../PopModal";

import {ClipLoader} from "react-spinners";
import {
    MdEdit,
    MdSave,
    MdCancel,
    MdAutoAwesome,
    MdClose,
    MdExpandMore,
    MdExpandLess,
    MdRecordVoiceOver,
    MdStop, // Import the Stop icon
} from "react-icons/md";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";

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

    // State for Read Note confirmation dialog
    const [openReadDialog, setOpenReadDialog] = useState(false);
    // State to track if speech is currently active
    const [isSpeaking, setIsSpeaking] = useState(false);

    const commonLanguages = [
        "French",
        "Spanish",
        "German",
        "Italian",
        "Japanese",
        "Chinese (Simplified)",
        "Hindi",
        "Arabic",
        "Russian",
        "Portuguese",
        "Korean",
        "Vietnamese",
        "Dutch",
        "Swedish",
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
            const noteData = {content: JSON.stringify({content: editorContent})};
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

    // Function to stop speech (centralized)
    const stopSpeech = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            toast.success("Speech stopped.");
        }
    }, []); // useCallback to memoize the function

    const callAiEndpoint = async (endpoint, payload = {}, params = {}) => {
        setAiLoading(true);
        setAiResponse(null);
        setAiError(null);
        setAiResponseExpanded(true);
        // Stop any ongoing speech when a new AI action is initiated
        stopSpeech(); // Use the centralized stopSpeech function

        try {
            const aiPayload = {
                ...payload,
                content: note.parsedContent,
            };
            const response = await api.post(
                `/notes/${id}/ai/${endpoint}`,
                aiPayload,
                {
                    params,
                }
            );
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

    // Handler for Read Note
    const handleReadNote = async () => {
        setOpenReadDialog(false); // Close the confirmation dialog
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
        setTargetLanguage("French"); // Reset to default after translation
        setUseCustomLanguage(false); // Reset to dropdown after translation
    };

    const clearAiResponse = useCallback(() => {
        // Using useCallback
        setAiResponse(null);
        setAiError(null);
        // Ensure speech stops when response is cleared
        stopSpeech(); // Use the centralized stopSpeech function
    }, [stopSpeech]); // Dependency array includes stopSpeech

    // useEffect for cleanup on unmount:
    useEffect(() => {
        return () => {
            // Cleanup speech when component unmounts
            stopSpeech(); // Use the centralized stopSpeech function
        };
    }, [stopSpeech]); // Dependency array includes stopSpeech

    // We can remove the periodic check, as the onend/onerror should be reliable enough
    // and the cancel calls will also trigger onend/onerror.
    // const checkSpeechStatus = () => {
    //   if (!window.speechSynthesis.speaking && isSpeaking) {
    //     setIsSpeaking(false);
    //   }
    // };
    // const interval = setInterval(checkSpeechStatus, 100);
    // return () => clearInterval(interval);

    const startSpeech = (text) => {
        if ("speechSynthesis" in window) {
            // Stop any ongoing speech first
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }

            // Clean the text while preserving natural pauses and sentence structure
            const cleanText = text
                // Remove HTML tags if any (assuming text can come from Quill)
                .replace(/<[^>]*>/g, " ")
                // Remove excessive special characters but keep sentence-ending punctuation
                .replace(/[#$%^&*;:{}=\-_`~()]/g, " ")
                // Keep periods, commas, exclamation marks, question marks for natural pauses
                .replace(/([.!?])\s*([A-Z])/g, "$1 $2") // Ensure space after sentence endings
                // Add slight pause after commas by ensuring space
                .replace(/,\s*/g, ", ")
                // Ensure proper spacing around periods
                .replace(/\.\s*/g, ". ")
                // Replace multiple spaces with single space
                .replace(/\s\s+/g, " ")
                // Remove leading/trailing whitespace
                .trim();

            // If text is empty after cleaning, don't proceed
            if (!cleanText) {
                toast.error("No readable content found.");
                return;
            }

            const utterance = new SpeechSynthesisUtterance(cleanText);

            // Configure speech settings for better readability
            utterance.rate = 0.9; // Slightly slower for better comprehension
            utterance.pitch = 1.0; // Normal pitch
            utterance.volume = 0.8; // Comfortable volume
            utterance.lang = "en-US"; // Set language explicitly

            // Set up event listeners
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

                // Only show error toast for actual errors, not intentional cancellations
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

            // Start speaking
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
        } // Enhanced renderAiAnswer function for read operation
        else if (aiResponse.operation === "read") {
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

                        {/* Optional: Add pause/resume functionality */}
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

                    {/* Speech status indicator */}
                    {isSpeaking && (
                        <div className="mt-3 flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Speech in progress...</span>
                        </div>
                    )}
                </div>
            );
        }
        // Default fallback if no specific rendering logic is matched
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

    const getLayoutClasses = () => {
        if (!note || loading) return "flex flex-col lg:flex-row gap-8";
        if (aiResponse && aiResponseExpanded) {
            return "flex flex-col xl:flex-row gap-8";
        }
        return "flex flex-col lg:flex-row gap-8";
    };

    const getNoteContentClasses = () => {
        if (!note || loading) return "flex-1";
        if (aiResponse && aiResponseExpanded) {
            return "flex-1 xl:flex-[2]";
        }
        return "flex-1";
    };

    const getAiSectionClasses = () => {
        if (!note || loading) return "lg:w-1/3";
        if (aiResponse && aiResponseExpanded) {
            return "w-full xl:w-1/3 xl:min-w-[400px]";
        }
        return "lg:w-1/3";
    };

    return (
        <div className="min-h-[calc(100vh-74px)] p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50">
            <Buttons
                onClickhandler={onBackHandler}
                className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-md mb-6 transition-colors duration-200"
            >
                Go Back
            </Buttons>

            <div className={getLayoutClasses()}>
                {/* Left Side: Note Details */}
                <div
                    className={`${getNoteContentClasses()} bg-white p-6 md:p-8 rounded-lg shadow-lg border border-gray-200`}
                >
                    <div className="flex justify-end mb-4 gap-2">
                        {!loading && (
                            <>
                                {!editEnable ? (
                                    <Buttons
                                        onClickhandler={() => setEditEnable(!editEnable)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <MdEdit/> Edit
                                    </Buttons>
                                ) : (
                                    <Buttons
                                        onClickhandler={() => {
                                            setEditEnable(!editEnable);
                                            if (note?.parsedContent) {
                                                setEditorContent(note.parsedContent); // Reset content on cancel
                                            }
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-1"
                                    >
                                        <MdCancel/> Cancel
                                    </Buttons>
                                )}
                                {!editEnable && (
                                    <Buttons
                                        onClickhandler={() => setModalOpen(true)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                                    >
                                        Delete
                                    </Buttons>
                                )}
                            </>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-96 bg-gray-50 rounded-md">
                            <Blocks
                                height="70"
                                width="70"
                                color="#4fa94d"
                                ariaLabel="blocks-loading"
                                wrapperStyle={{}}
                                wrapperClass="blocks-wrapper"
                                visible={true}
                            />
                            <span className="mt-4 text-gray-600">Loading note...</span>
                        </div>
                    ) : (
                        <>
                            {editEnable ? (
                                <div className="min-h-[400px] flex flex-col">
                                    <ReactQuill
                                        className="flex-grow min-h-[300px] border border-gray-300 rounded-md"
                                        value={editorContent}
                                        onChange={handleChange}
                                        modules={{
                                            toolbar: [
                                                [{header: [1, 2, 3, 4, 5, 6, false]}],
                                                [{size: ["small", false, "large", "huge"]}],
                                                ["bold", "italic", "underline", "strike", "blockquote"],
                                                [
                                                    {list: "ordered"},
                                                    {list: "bullet"},
                                                    {indent: "-1"},
                                                    {indent: "+1"},
                                                ],
                                                ["link", "image"],
                                                ["clean"],
                                            ],
                                        }}
                                    />
                                    <Buttons
                                        disabled={noteEditLoader}
                                        onClickhandler={onNoteEditHandler}
                                        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-semibold transition-colors duration-200 self-end flex items-center gap-2"
                                    >
                                        {noteEditLoader ? (
                                            <ClipLoader color="#fff" size={16}/>
                                        ) : (
                                            <MdSave/>
                                        )}{" "}
                                        Update Note
                                    </Buttons>
                                </div>
                            ) : (
                                <div
                                    className="text-gray-800 leading-relaxed ql-editor border border-gray-200 p-4 rounded-md min-h-[300px]">
                                    {note?.parsedContent ? (
                                        <div
                                            dangerouslySetInnerHTML={{__html: note.parsedContent}}
                                        ></div>
                                    ) : (
                                        <p className="text-gray-500">
                                            No content available for this note.
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Side: AI Functionality */}
                {!loading && note && (
                    <div
                        className={`${getAiSectionClasses()} bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col transition-all duration-300`}
                    >
                        {/* AI Actions Header */}
                        <div className="p-6 md:p-8 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <MdAutoAwesome className="text-yellow-500 text-3xl"/> AI
                                Actions
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <Buttons
                                    onClickhandler={() => setOpenSummarizeDialog(true)}
                                    disabled={aiLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <ClipLoader color="#fff" size={16}/>
                                    ) : (
                                        <MdAutoAwesome/>
                                    )}{" "}
                                    Summarize Note
                                </Buttons>

                                <Buttons
                                    onClickhandler={() => setOpenAnswerDialog(true)}
                                    disabled={aiLoading}
                                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <ClipLoader color="#fff" size={16}/>
                                    ) : (
                                        <MdAutoAwesome/>
                                    )}{" "}
                                    Ask Question
                                </Buttons>

                                <Buttons
                                    onClickhandler={() => setOpenReadDialog(true)}
                                    disabled={aiLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <ClipLoader color="#fff" size={16}/>
                                    ) : (
                                        <MdRecordVoiceOver/>
                                    )}{" "}
                                    Read Note
                                </Buttons>

                                <Buttons
                                    onClickhandler={() => setOpenTranslateDialog(true)}
                                    disabled={aiLoading}
                                    className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <ClipLoader color="#fff" size={16}/>
                                    ) : (
                                        <MdAutoAwesome/>
                                    )}{" "}
                                    Translate Note
                                </Buttons>
                            </div>
                        </div>

                        {/* AI Response Section */}
                        {(aiResponse || aiError) && (
                            <div className="flex-1 flex flex-col">
                                {/* Response Header */}
                                <div
                                    className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            {aiError
                                                ? "AI Error"
                                                : `AI Response (${aiResponse?.operation})`}
                                        </h3>
                                        {aiResponse && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {aiResponse.operation}
                      </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setAiResponseExpanded(!aiResponseExpanded)}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                            title={aiResponseExpanded ? "Collapse" : "Expand"}
                                        >
                                            {aiResponseExpanded ? (
                                                <MdExpandLess className="w-5 h-5 text-gray-600"/>
                                            ) : (
                                                <MdExpandMore className="w-5 h-5 text-gray-600"/>
                                            )}
                                        </button>
                                        <button
                                            onClick={clearAiResponse}
                                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                            title="Clear response"
                                        >
                                            <MdClose className="w-5 h-5 text-gray-600"/>
                                        </button>
                                    </div>
                                </div>

                                {/* Response Content */}
                                {aiResponseExpanded && (
                                    <div className="flex-1 p-4 overflow-y-auto">
                                        {aiError ? (
                                            <div
                                                className="text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                                                <p className="font-medium">Error:</p>
                                                <p className="text-sm mt-1">{aiError}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Main Response */}
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    {renderAiAnswer()}
                                                </div>

                                                {/* Sources */}
                                                {aiResponse?.sources &&
                                                    aiResponse.sources.length > 0 && (
                                                        <div
                                                            className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                                <span
                                                                    className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                                Sources:
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {aiResponse.sources.map((source, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-start gap-2"
                                                                    >
                                    <span className="text-xs text-gray-500 mt-1 min-w-[20px]">
                                      {index + 1}.
                                    </span>
                                                                        <a
                                                                            href={source}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline text-sm break-all leading-relaxed"
                                                                        >
                                                                            {source}
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modals open={modalOpen} setOpen={setModalOpen} noteId={id}/>

            {/* Summarize Dialog */}
            <Dialog
                open={openSummarizeDialog}
                onClose={() => setOpenSummarizeDialog(false)}
            >
                <DialogTitle>Summarize Note</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Summary Length</InputLabel>
                        <Select
                            value={summaryLength}
                            label="Summary Length"
                            onChange={(e) => setSummaryLength(e.target.value)}
                        >
                            <MenuItem value="short">Short (1-2 sentences)</MenuItem>
                            <MenuItem value="medium">Medium (3-5 sentences)</MenuItem>
                            <MenuItem value="long">Long (1-2 paragraphs)</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Buttons
                        onClickhandler={() => setOpenSummarizeDialog(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                        Cancel
                    </Buttons>
                    <Buttons
                        onClickhandler={handleSummarize}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        Summarize
                    </Buttons>
                </DialogActions>
            </Dialog>

            {/* Ask Question Dialog */}
            <Dialog
                open={openAnswerDialog}
                onClose={() => setOpenAnswerDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Ask AI a Question about this Note</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Question"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Buttons
                        onClickhandler={() => setOpenAnswerDialog(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                        Cancel
                    </Buttons>
                    <Buttons
                        onClickhandler={handleAnswerQuestion}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        Ask
                    </Buttons>
                </DialogActions>
            </Dialog>

            {/* Translate Dialog */}
            <Dialog
                open={openTranslateDialog}
                onClose={() => {
                    setOpenTranslateDialog(false);
                    setUseCustomLanguage(false); // Reset toggle when closing
                    setTargetLanguage("French"); // Reset language when closing
                }}
            >
                <DialogTitle>Translate Note</DialogTitle>
                <DialogContent>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-700">Use Custom Language</span>
                        <Switch
                            checked={useCustomLanguage}
                            onChange={(e) => {
                                setUseCustomLanguage(e.target.checked);
                                setTargetLanguage(""); // Clear language when switching
                            }}
                            color="primary"
                        />
                    </div>

                    {useCustomLanguage ? (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Enter Target Language (e.g., Hindi, Klingon)"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                        />
                    ) : (
                        <FormControl fullWidth margin="dense">
                            <InputLabel id="target-language-select-label">
                                Select Target Language
                            </InputLabel>
                            <Select
                                labelId="target-language-select-label"
                                value={targetLanguage}
                                label="Select Target Language"
                                onChange={(e) => setTargetLanguage(e.target.value)}
                            >
                                {commonLanguages.map((lang) => (
                                    <MenuItem key={lang} value={lang}>
                                        {lang}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Buttons
                        onClickhandler={() => {
                            setOpenTranslateDialog(false);
                            setUseCustomLanguage(false);
                            setTargetLanguage("French");
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                        Cancel
                    </Buttons>
                    <Buttons
                        onClickhandler={handleTranslate}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                        Translate
                    </Buttons>
                </DialogActions>
            </Dialog>

            {/* Read Note Dialog */}
            <Dialog
                open={openReadDialog}
                onClose={() => setOpenReadDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Read Note Aloud</DialogTitle>
                <DialogContent>
                    <p className="text-gray-700">
                        Click "Read" to have the AI process the note content for
                        text-to-speech. A play button will appear in the AI response
                        section.
                    </p>
                </DialogContent>
                <DialogActions>
                    <Buttons
                        onClickhandler={() => setOpenReadDialog(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                    >
                        Cancel
                    </Buttons>
                    <Buttons
                        onClickhandler={handleReadNote}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    >
                        Read
                    </Buttons>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default NoteDetails;
