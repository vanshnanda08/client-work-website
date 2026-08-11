"use client";

import React, { useState } from "react";
import { MessageSquare, Send, User, Sparkles, Bot, Shield } from "lucide-react";
import { Comment, Writer } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CommentsThreadProps {
  comments: Comment[];
  assignedWriter?: Writer;
  onAddComment: (body: string) => void;
}

export const CommentsThread: React.FC<CommentsThreadProps> = ({
  comments,
  assignedWriter,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddComment(newComment);
      setNewComment("");
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">Order Discussion</h3>
            <p className="text-[11px] text-neutral-500">
              Direct communication with {assignedWriter?.full_name || "the agency"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
        {comments.map((c) => {
          const isSystem = c.author_type === "system";
          const isWriter = c.author_type === "writer";
          const isClient = c.author_type === "client";

          if (isSystem) {
            return (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 text-xs text-neutral-500 flex items-start gap-2"
              >
                <Bot className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{c.body}</span>
                  <span className="block text-[10px] text-neutral-400 mt-0.5">
                    {formatRelativeTime(c.created_at)}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                isWriter
                  ? "bg-purple-50/40 border-purple-100"
                  : "bg-white border-neutral-200/80"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isWriter && c.writer ? (
                    <img
                      src={c.writer.avatar_url}
                      alt={c.writer.full_name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold">
                      C
                    </div>
                  )}

                  <span className="font-bold text-neutral-900">
                    {isWriter ? c.writer?.full_name : c.author_name || "You (Client)"}
                  </span>

                  {isWriter && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 font-bold border border-purple-200">
                      Assigned Writer
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-neutral-400">
                  {formatRelativeTime(c.created_at)}
                </span>
              </div>

              <p className="text-neutral-700 leading-relaxed pl-7">{c.body}</p>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-neutral-100 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question or leave a note for the writer..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 h-10 px-3.5 bg-neutral-50 focus:bg-white text-neutral-900 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          isLoading={isSubmitting}
          leftIcon={<Send className="h-3.5 w-3.5" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
