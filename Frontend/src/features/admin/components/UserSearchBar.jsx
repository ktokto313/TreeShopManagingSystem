// features/admin-users/components/UserSearchBar.jsx
import { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

/**
 * @param {{ onSearch: (q: string) => void, onClear: () => void, isSearching: boolean }} props
 */
export function UserSearchBar({ onSearch, onClear, isSearching }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <Input
          className="pl-9 pr-3"
          placeholder="Search name, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={isSearching}>
        {isSearching ? "Searching…" : "Search"}
      </Button>
      {query && (
        <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  );
}
