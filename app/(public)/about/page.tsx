import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Metadata } from "next";

import fs from "fs";
import path from "path";

const content = fs.readFileSync(
  path.join(process.cwd(), "app/(public)/about/content.md"),
  "utf-8"
);

export const metadata: Metadata = {
  title: "About",
  description: "Learn about COMSATS University Islamabad.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <main className="pb-16">
        <Message from="system">
          <MessageContent>
            <MessageResponse className="marker:text-primary" mode="static">
              {content}
            </MessageResponse>
          </MessageContent>
        </Message>
      </main>
    </div>
  );
}
