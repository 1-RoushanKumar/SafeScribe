import React, {useState, useRef} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    MdNoteAdd,
    MdLightbulb,
    MdQuestionAnswer,
    MdOutlineContentPaste,
} from "react-icons/md"; // Added MdOutlineContentPaste for paste icon
import {useNavigate} from "react-router-dom";
import api from "../../services/api";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import {ClipLoader} from "react-spinners";
import {marked} from "marked";
import Quill from "quill"; // For rich text selection handling

const CreateNote = () => {
    const navigate = useNavigate();
    const [editorContent, setEditorContent] = useState("");
    const [loading, setLoading] = useState(false);

    // States for AI Explanation section
    const [aiExplanationQuery, setAiExplanationQuery] = useState("");
    const [aiExplanationLoading, setAiExplanationLoading] = useState(false);
    const [currentExplanation, setCurrentExplanation] = useState(null); // Holds HTML content for explanation

    // States for AI Answer section
    const [aiAnswerQuestion, setAiAnswerQuestion] = useState("");
    const [aiAnswerLoading, setAiAnswerLoading] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState(null); // Holds HTML content for answer

    // Combined state to control which AI output is visible (if any)
    const [activeAITab, setActiveAITab] = useState(null); // 'explanation', 'answer', or null

    const mainQuillRef = useRef(null); // Ref for the main editor to insert content

    // Handles content change in the main editor
    const handleChange = (content, delta, source, editor) => {
        setEditorContent(content);
    };

    // Submits the main note
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

    // Fetches AI Explanation
    const handleGetExplanation = async () => {
        if (aiExplanationQuery.trim().length === 0) {
            return toast.error("Please enter a concept or topic for explanation.");
        }

        setAiExplanationLoading(true);
        setCurrentExplanation(null); // Clear previous explanation
        setCurrentAnswer(null); // Clear any active answer
        setActiveAITab(null); // Hide any previous AI output
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
                setActiveAITab("explanation"); // Show explanation output
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

    // Fetches AI Answer
    const handleGetAnswer = async () => {
        if (aiAnswerQuestion.trim().length === 0) {
            return toast.error("Please enter a question for the AI to answer.");
        }

        setAiAnswerLoading(true);
        setCurrentAnswer(null); // Clear previous answer
        setCurrentExplanation(null); // Clear any active explanation
        setActiveAITab(null); // Hide any previous AI output
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
                // For plain text answers, format for Quill
                const formattedAnswer = `<p>${aiAnswerText.replace(
                    /\n/g,
                    "</p><p>"
                )}</p>`;
                setCurrentAnswer(formattedAnswer);
                setActiveAITab("answer"); // Show answer output
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

    // Inserts content directly into the main editor
    const handleInsertIntoMainEditor = (contentToInsert, type, query) => {
        if (!mainQuillRef.current) return;

        const editor = mainQuillRef.current.getEditor();
        const currentLength = editor.getLength(); // Get current length to insert at end

        let separatorText = "";
        if (type === "explanation") {
            separatorText = `--- AI Explanation for '${query}' ---`;
        } else if (type === "answer") {
            separatorText = `--- AI Answer for '${query}' ---`;
        }

        // Convert separator and content to Delta format for insertion
        // Use Quill's clipboard.dangerouslyPasteHTML to insert raw HTML
        // However, for clean integration, it's better to insert as Delta
        // or set HTML if replacing entire content. Appending HTML requires converting to Delta.

        // Better way to append complex HTML:
        // Create a temporary Quill instance to convert the HTML string to Delta
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML =
            `<p><br/></p><hr style="border-top: 1px dashed #ccc; margin: 20px 0;"/><p><strong>${separatorText}</strong></p><p><br/></p>` +
            contentToInsert;
        const tempQuill = new Quill(tempDiv);
        const deltaToInsert = tempQuill.getContents();

        editor.updateContents(
            new Quill.import("delta")()
                .retain(currentLength - 1) // Go to the end of the current content (adjust for trailing newline)
                .concat(deltaToInsert)
        );

        setEditorContent(editor.getContents()); // Update React state with new editor content
        toast.success(`AI ${type} inserted into your note!`);

        // Optionally clear the AI output from the right panel after insertion
        if (type === "explanation") setCurrentExplanation(null);
        if (type === "answer") setCurrentAnswer(null);
        setActiveAITab(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10 font-sans">
            <div
                className="max-w-8xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
                {" "}
                {/* Added flex-row for layout */}
                {/* Left Column: Create Note Section (Editor) */}
                <div className="w-full lg:w-2/3 p-6 sm:p-8 flex flex-col border-r border-gray-200">
                    {/* Header Section */}
                    <div
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-2 sm:p-4 rounded-lg shadow-md mb-4">
                        <MdNoteAdd className="text-4xl sm:text-5xl text-blue-200"/>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Create New Note
                        </h1>
                    </div>

                    {/* ReactQuill Editor Section */}
                    <div
                        className="flex-grow mb-6 border border-gray-200 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
                        <ReactQuill
                            ref={mainQuillRef} // Assign ref to the main editor
                            className="h-full" // Make it take full height of its container
                            theme="snow"
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
                                "Save Note" // Changed from "Create Note" to "Save Note" for clarity
                            )}
                        </Buttons>
                    </div>
                </div>
                {" "}
                {/* End Left Column */}
                {/* Right Column: AI Sections and Output */}
                <div className="w-full lg:w-1/3 p-6 sm:p-8 flex flex-col bg-gray-50 overflow-y-auto">
                    {" "}
                    {/* Added overflow-y-auto */}
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
                                {" "}
                                {/* Added custom-scrollbar for styling scrollbar */}
                                <ReactQuill
                                    value={currentExplanation}
                                    readOnly={true} // Read-only for display
                                    theme="bubble" // Use 'bubble' theme for cleaner display without toolbar
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
                                    readOnly={true} // Read-only for display
                                    theme="bubble" // Use 'bubble' theme for cleaner display without toolbar
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
                {" "}
                {/* End Right Column */}
            </div>
        </div>
    );
};

export default CreateNote;
