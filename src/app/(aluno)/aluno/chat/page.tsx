"use client";

import { ChatThread } from "@/components/chat/ChatThread";
import { PageHeader } from "@/components/ui";
import { useEffect, useState } from "react";

export default function AlunoChatPage() {
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("nfit_aluno_id") ?? "";
    setStudentId(id);
  }, []);

  return (
    <div className="flex h-[calc(100dvh-10rem)] flex-col">
      <PageHeader title="Chat" description="Com seu personal" />
      {studentId ? <ChatThread conversationId={studentId} myId={studentId} /> : null}
    </div>
  );
}
