import React from "react";
import CardSlider from "./CardSlider";

const State = () => {
    return (
        <div className="py-28">
            <div className="flex justify-between items-center md:px-0 px-4">
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 font-bold">
            99.9%
          </span>
                    <span className="text-slate-600 text-center sm:text-sm text-xs ">
            Uptime Guarantee
          </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 font-bold">
            10,000+
          </span>
                    <span className="text-slate-600 text-center sm:text-sm text-xs">
            Trusted Users
          </span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 font-bold">
            2x
          </span>
                    <span className="text-slate-600 text-center sm:text-sm text-xs">
            Faster Secure Access
          </span>
                </div>
                {/* NEW AI METRIC */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <span className="sm:text-4xl text-logoText text-slate-700 font-bold">
            AI
          </span>
                    <span className="text-slate-600 text-center sm:text-sm text-xs">
            Powered Features
          </span>
                </div>
                {/* END NEW AI METRIC */}
            </div>

            <div className="mt-10 md:px-0 px-4">
                <h3 className="text-slate-700 text-2xl font-semibold pb-5 pt-6">
                    Metrics & Intelligent Features for Secure Notes
                    {/* Original: Metrics for Secure Notes */}
                </h3>

                <div className="flex md:flex-row flex-col md:gap-0 gap-16 justify-between">
                    <ul className="list-disc sm:px-5 ps-10 text-slate-700 flex flex-col gap-5 flex-1 overflow-hidden">
                        <li>
                            OAuth2 authentication via Google & GitHub for seamless sign-in.
                        </li>
                        <li>
                            End-to-end security with JWT and Two-Factor Authentication (2FA).
                        </li>
                        <li>Encrypted note storage for maximum data protection.</li>
                        <li>
                            **AI-Powered Suggestions:** Get smart prompts and ideas as you create notes.
                        </li>
                        <li>
                            **Instant Summaries:** Quickly grasp the essence of long notes with AI-generated summaries.
                        </li>
                        <li>
                            **Multi-language Translation:** Translate notes to overcome language barriers.
                        </li>
                        <li>
                            **Text-to-Speech:** Listen to your notes on the go for convenience.
                        </li>
                        <li>
                            Create, manage, and organize notes effortlessly in a secure
                            workspace.
                        </li>
                        <li>Contact admin directly for support or feedback.</li>
                        <li>
                            Connect with us on LinkedIn, GitHub, and Google for quick help.
                        </li>
                        <li>
                            99.9% uptime and fast, reliable access to your notes anytime.
                        </li>
                    </ul>

                    <div className="flex-1 overflow-hidden">
                        <CardSlider/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default State;