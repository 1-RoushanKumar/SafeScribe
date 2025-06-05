import React from "react";
import { MdSecurity } from "react-icons/md";
import { FcCollaboration } from "react-icons/fc";
import { RiContactsBook2Line } from "react-icons/ri";
import BrandItem from "./BrandItem";

const Brands = () => {
  return (
    <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-x-4 gap-y-10 pt-20 md:px-0 px-5">
      <BrandItem
        title="Secure Notes, Your Way"
        text="Your notes are safe with us. We use OAuth2 (Google, GitHub), JWT authentication, and Google Authenticator-based 2FA to ensure your data stays protected."
        icon={MdSecurity}
      />
      <BrandItem
        title="Connect & Collaborate"
        text="Get in touch with our team via Google, LinkedIn, and GitHub. Share feedback, ask questions, and collaborate easily within a secure environment."
        icon={FcCollaboration}
      />
      <BrandItem
        title="Your Notes, Your Voice"
        text="Easily create and manage your notes. Share feedback or reach out to our support team anytime. Your ideas matter, and we’re here to help."
        icon={RiContactsBook2Line}
      />
    </div>
  );
};

export default Brands;
