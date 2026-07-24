import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import SignupFlow from "@/components/SignupFlow";
import EmbeddedSignupButton from "@/components/EmbeddedSignupButton";
import CodeBlock from "@/components/CodeBlock";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Meta Embedded Signup — Connect WhatsApp in Minutes",
  description:
    "Onboard to the WhatsApp Business API with Meta Embedded Signup. Login with Facebook, verify your business, connect your number and activate the API in one flow.",
};

const sdkCode = `// Launch Meta Embedded Signup (Facebook JS SDK)
FB.login(
  (response) => {
    if (response.authResponse) {
      const code = response.authResponse.code;
      // Send 'code' to your backend to exchange for a business token,
      // then register the customer's phone number for messaging.
      fetch("/api/embedded-signup/exchange", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    }
  },
  {
    config_id: "YOUR_CONFIG_ID",      // from Meta App > WhatsApp > Configuration
    response_type: "code",
    override_default_response_type: true,
    extras: { sessionInfoVersion: "2" },
  }
);`;

export default function EmbeddedSignupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Meta Embedded Signup"
        title={<>Connect WhatsApp in <span className="gradient-text">minutes</span></>}
        subtitle="One Facebook popup links your Business Manager, verifies your number and activates the official API — no manual paperwork."
      />

      <section className="container-px py-16">
        <SignupFlow />
      </section>

      <section className="container-px py-8">
        <div className="mx-auto max-w-3xl">
          <EmbeddedSignupButton />
        </div>
      </section>

      <section className="container-px py-12">
        <SectionHeading
          eyebrow="For developers"
          title="Sample implementation"
          subtitle="Drop this into the Facebook JS SDK callback. We handle the token exchange and number registration on the backend."
        />
        <div className="mx-auto mt-10 max-w-3xl">
          <CodeBlock title="embedded-signup.ts" code={sdkCode} />
        </div>
      </section>
    </>
  );
}
