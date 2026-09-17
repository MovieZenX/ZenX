"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Library page shell — styled with design system.
 * Full library data and database synchronization will be connected in Phase 10.
 */
export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("watchlist");

  const tabs = [
    { id: "watchlist", label: "Watchlist", badge: 0 },
    { id: "continue", label: "Continue Watching", badge: 0 },
    { id: "history", label: "Watch History", badge: 0 },
  ];

  return (
    <Container className="pt-24 sm:pt-28 pb-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            My Library
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Keep track of your saved titles, watch history, and in-progress playback.
          </p>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "watchlist" && (
        <EmptyState
          type="watchlist"
          title="Your watchlist is empty"
          description="Click the bookmark icon on any movie or TV series to add it to your watchlist."
          actionLabel="Browse Movies"
          actionHref="/"
        />
      )}

      {activeTab === "continue" && (
        <EmptyState
          type="history"
          title="No in-progress shows"
          description="When you pause a movie or episode partway through, it will appear here so you can easily resume."
          actionLabel="Start Watching"
          actionHref="/"
        />
      )}

      {activeTab === "history" && (
        <EmptyState
          type="history"
          title="No watch history yet"
          description="Titles you finish watching will be logged here for easy re-watching."
          actionLabel="Explore Trending"
          actionHref="/"
        />
      )}
    </Container>
  );
}
