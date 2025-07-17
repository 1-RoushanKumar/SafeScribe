// In Testimonial.jsx
import React from "react";
import TestimonialItem from "./TestimonialItem";

const Testimonial = () => {
    return (
        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-10 md:px-0 px-5">
            <TestimonialItem
                title="Rock-Solid Security"
                text="I've never felt safer storing my notes online. With 2FA and OAuth2 login options, this app makes sure my data stays private and secure."
                name="Ankit Sharma"
                status="Tech Enthusiast"
            />
            <TestimonialItem
                title="Effortless Integration"
                text="I love how I can sign in using my Google or GitHub account. It saves me time and keeps all my credentials in one place."
                name="Riya Patel"
                status="Productivity Coach"
            />
            <TestimonialItem
                title="Support That Cares"
                text="Had a question? Their team responded within hours. Plus, I could even reach out via LinkedIn or GitHub. Super impressed!"
                name="John Doe"
                status="Early Adopter"
            />
            {/* NEW AI-FOCUSED TESTIMONIAL (Optional) */}
            <TestimonialItem
                title="AI Transforms My Workflow"
                text="The AI features are a game-changer! Summaries save me so much time, and text-to-speech is perfect for reviewing notes on the go. Highly recommend!"
                name="Priya Singh"
                status="Student & Researcher"
            />
            {/* END NEW AI-FOCUSED TESTIMONIAL */}
        </div>
    );
};

export default Testimonial;