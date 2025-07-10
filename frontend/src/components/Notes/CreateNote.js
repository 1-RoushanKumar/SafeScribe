import React, {useState, useRef} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    MdNoteAdd,
    MdLightbulb,
    MdQuestionAnswer,
    MdOutlineContentPaste,
} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import {ClipLoader} from "react-spinners";
import {marked} from "marked";
import Quill from "quill";

const CreateNote = () => {
    const navigate = useNavigate();
    const [editorContent, setEditorContent] = useState("");
    const [loading, setLoading] = useState(false);

    const [aiExplanationQuery, setAiExplanationQuery] = useState("");
    const [aiExplanationLoading, setAiExplanationLoading] = useState(false);
    const [currentExplanation, setCurrentExplanation] = useState(null);

    const [aiAnswerQuestion, setAiAnswerQuestion] = useState("");
    const [aiAnswerLoading, setAiAnswerLoading] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState(null);

    const [activeAITab, setActiveAITab] = useState(null);

    const mainQuillRef = useRef(null);

    const handleChange = (content) => {
        setEditorContent(content);
    };

    const handleSubmit = async () => {
        const plainTextContent = editorContent.replace(/<[^>]*>/g, "").trim();
        if (plainTextContent.length === 0) {
            return toast.error("Note content cannot be empty.");
        }

        setLoading(true);
        try {
            const noteData = {content: editorContent};
            await api.post("/notes", noteData);
            toast.success("Note created successfully!");
            navigate("/notes");
        } catch (err) {
            toast.error("Failed to create note. Please try again.");
            console.error("Error creating note:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGetExplanation = async () => {
        if (aiExplanationQuery.trim().length === 0) {
            return toast.error("Please enter a concept or topic for explanation.");
        }

        setAiExplanationLoading(true);
        setCurrentExplanation(null);
        setCurrentAnswer(null);
        setActiveAITab(null);
        try {
            const response = await api.post("/research/process", {
                operation: "similar",
                question: aiExplanationQuery,
            });

            const aiExplanationMarkdown = response.data.answer;

            if (
                aiExplanationMarkdown &&
                typeof aiExplanationMarkdown === "string" &&
                aiExplanationMarkdown.trim().length > 0
            ) {
                const htmlExplanation = marked.parse(aiExplanationMarkdown);
                setCurrentExplanation(htmlExplanation);
                setActiveAITab("explanation");
            } else {
                toast.error("AI could not provide a relevant explanation.");
            }
        } catch (err) {
            toast.error("Failed to fetch AI explanation. Please try again.");
            console.error("Error fetching AI explanation:", err);
        } finally {
            setAiExplanationLoading(false);
        }
    };

    const handleGetAnswer = async () => {
        if (aiAnswerQuestion.trim().length === 0) {
            return toast.error("Please enter a question for the AI to answer.");
        }

        setAiAnswerLoading(true);
        setCurrentAnswer(null);
        setCurrentExplanation(null);
        setActiveAITab(null);
        try {
            const response = await api.post("/research/process", {
                operation: "answer",
                question: aiAnswerQuestion,
            });

            const aiAnswerText = response.data.answer;

            if (
                aiAnswerText &&
                typeof aiAnswerText === "string" &&
                aiAnswerText.trim().length > 0
            ) {
                const formattedAnswer = `<p>${aiAnswerText.replace(
                    /\n/g,
                    "</p><p>"
                )}</p>`;
                setCurrentAnswer(formattedAnswer);
                setActiveAITab("answer");
            } else {
                toast.error("AI could not provide a relevant answer.");
            }
        } catch (err) {
            toast.error("Failed to fetch AI answer. Please try again.");
            console.error("Error fetching AI answer:", err);
        } finally {
            setAiAnswerLoading(false);
        }
    };

    const handleInsertIntoMainEditor = (contentToInsert, type, query) => {
        if (!mainQuillRef.current) {
            console.error("Main Quill ref is not available");
            return;
        }

        const editor = mainQuillRef.current.getEditor();
        if (!editor) {
            console.error("Editor instance is not available");
            return;
        }

        try {
            // Get current cursor position or end of document
            const selection = editor.getSelection();
            const insertIndex = selection ? selection.index : editor.getLength() - 1;

            let separatorText = "";
            if (type === "explanation") {
                separatorText = `AI Explanation for '${query}'`;
            } else if (type === "answer") {
                separatorText = `AI Answer for '${query}'`;
            }

            // Create the content to insert
            const contentHtml = `
            <p><br/></p>
            <hr style="border-top: 1px dashed #ccc; margin: 20px 0;"/>
            <p><strong>${separatorText}</strong></p>
            <p><br/></p>
            ${contentToInsert}
            <p><br/></p>
        `;

            // Insert the HTML content
            editor.clipboard.dangerouslyPasteHTML(insertIndex, contentHtml);

            // Update the state with the new content
            const newContent = editor.root.innerHTML;
            setEditorContent(newContent);

            // Set cursor position after the inserted content
            const newLength = editor.getLength();
            editor.setSelection(newLength - 1, 0);

            toast.success(`AI ${type} inserted into your note!`);

            // Clear the current content and reset active tab
            if (type === "explanation") {
                setCurrentExplanation(null);
                setAiExplanationQuery("");
            }
            if (type === "answer") {
                setCurrentAnswer(null);
                setAiAnswerQuestion("");
            }
            setActiveAITab(null);

        } catch (error) {
            console.error("Error inserting content:", error);
            toast.error("Failed to insert content. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10 font-sans">
            <div
                className="max-w-8xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
                {/* Left Column: Create Note Section (Editor) */}
                <div className="w-full lg:w-2/3 p-4 sm:p-4 flex flex-col border-r border-gray-200">
                    {/* Header Section */}
                    <div
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-2 sm:p-2 rounded-lg shadow-md mb-2">
                        <MdNoteAdd className="text-4xl sm:text-5xl text-blue-200"/>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Create New Note
                        </h1>
                    </div>

                    {/* ReactQuill Editor Section */}
                    <div
                        className="flex-grow mb-6 border border-gray-200 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
                        <ReactQuill
                            ref={mainQuillRef}
                            className="h-full"
                            theme="snow"
                            value={editorContent}
                            onChange={handleChange}
                            modules={{
                                toolbar: [
                                    [{header: [1, 2, 3, 4, 5, 6, false]}],
                                    [{size: ["small", false, "large", "huge"]}],
                                    ["bold", "italic", "underline", "strike", "blockquote"],
                                    [{list: "ordered"}, {list: "bullet"}, {indent: "-1"}, {indent: "+1"}],
                                    ["link", "image"],
                                    [{color: []}, {background: []}],
                                    [{align: []}],
                                    ["clean"],
                                ],
                            }}
                        />
                    </div>

                    {/* Create Note Button */}
                    <div className="flex justify-end pt-4">
                        <Buttons
                            disabled={loading}
                            onClickhandler={handleSubmit}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <ClipLoader color="#fff" size={20}/>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                "Save Note"
                            )}
                        </Buttons>
                    </div>
                </div>

                {/* Right Column: AI Sections and Output */}
                <div className="w-full lg:w-1/3 p-6 sm:p-8 flex flex-col bg-gray-50 overflow-y-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                        AI Assistance
                    </h2>

                    {/* AI Explanation Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-md mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <MdLightbulb className="text-yellow-600 text-3xl"/>
                            <h3 className="text-xl font-bold text-gray-800">
                                AI Explanation{" "}
                                <span className="text-sm text-gray-600 font-normal">
                                    (Concepts, Theories)
                                </span>
                            </h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Explain a concept (e.g., 'Quantum Physics')"
                                className="flex-grow p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-500"
                                value={aiExplanationQuery}
                                onChange={(e) => setAiExplanationQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleGetExplanation();
                                    }
                                }}
                                disabled={aiExplanationLoading}
                            />
                            <Buttons
                                onClickhandler={handleGetExplanation}
                                disabled={aiExplanationLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base flex items-center justify-center gap-2"
                            >
                                {aiExplanationLoading ? (
                                    <>
                                        <ClipLoader color="#fff" size={20}/>
                                        <span>Getting Explanation...</span>
                                    </>
                                ) : (
                                    "Get Explanation"
                                )}
                            </Buttons>
                        </div>
                    </div>

                    {/* AI Answer Section */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 shadow-md mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <MdQuestionAnswer className="text-indigo-600 text-3xl"/>
                            <h3 className="text-xl font-bold text-gray-800">
                                AI Answer{" "}
                                <span className="text-sm text-gray-600 font-normal">
                                    (Factual Questions)
                                </span>
                            </h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Ask a factual question (e.g., 'Who developed Java?')"
                                className="flex-grow p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-500"
                                value={aiAnswerQuestion}
                                onChange={(e) => setAiAnswerQuestion(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleGetAnswer();
                                    }
                                }}
                                disabled={aiAnswerLoading}
                            />
                            <Buttons
                                onClickhandler={handleGetAnswer}
                                disabled={aiAnswerLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-base flex items-center justify-center gap-2"
                            >
                                {aiAnswerLoading ? (
                                    <>
                                        <ClipLoader color="#fff" size={20}/>
                                        <span>Getting Answer...</span>
                                    </>
                                ) : (
                                    "Get Answer"
                                )}
                            </Buttons>
                        </div>
                    </div>

                    {/* AI Output Display Area */}
                    {activeAITab === "explanation" && currentExplanation && (
                        <div
                            className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col flex-grow relative">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                AI Explanation for "{aiExplanationQuery}"
                            </h3>
                            <div className="flex-grow overflow-y-auto custom-scrollbar">
                                <ReactQuill
                                    value={currentExplanation}
                                    readOnly={true}
                                    theme="bubble"
                                    modules={{toolbar: false}}
                                    className="text-gray-800"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                                <Buttons
                                    onClickhandler={() =>
                                        handleInsertIntoMainEditor(
                                            currentExplanation,
                                            "explanation",
                                            aiExplanationQuery
                                        )
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 text-sm flex items-center gap-2"
                                >
                                    <MdOutlineContentPaste className="text-lg"/> Insert
                                </Buttons>
                            </div>
                        </div>
                    )}
                    {activeAITab === "answer" && currentAnswer && (
                        <div
                            className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col flex-grow relative">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                                AI Answer for "{aiAnswerQuestion}"
                            </h3>
                            <div className="flex-grow overflow-y-auto custom-scrollbar">
                                <ReactQuill
                                    value={currentAnswer}
                                    readOnly={true}
                                    theme="bubble"
                                    modules={{toolbar: false}}
                                    className="text-gray-800"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                                <Buttons
                                    onClickhandler={() =>
                                        handleInsertIntoMainEditor(
                                            currentAnswer,
                                            "answer",
                                            aiAnswerQuestion
                                        )
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 text-sm flex items-center gap-2"
                                >
                                    <MdOutlineContentPaste className="text-lg"/> Insert
                                </Buttons>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateNote;