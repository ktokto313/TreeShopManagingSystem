import { useState, useRef, useEffect } from "react";
import useNotifications from "../hooks/useNotification";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next) {
            fetchNotifications();
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition-colors hover:bg-green-50 hover:text-interactive hover:border-interactive"
                onClick={toggleDropdown}
                aria-label="Notifications"
                aria-expanded={isOpen}
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-[calc(100%+8px)] z-50 flex max-h-[420px] w-[340px] flex-col overflow-hidden rounded-lg border border-border bg-bg-base shadow-lg"
                    role="menu"
                >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm font-semibold text-stone-800">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                className="text-xs font-medium text-interactive hover:underline"
                                onClick={markAllAsRead}
                            >
                                Đánh dấu đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                        {isLoading && (
                            <div className="px-4 py-6 text-center text-sm text-stone-400">
                                Đang tải...
                            </div>
                        )}

                        {!isLoading && notifications.length === 0 && (
                            <div className="px-4 py-6 text-center text-sm text-stone-400">
                                Không có thông báo.
                            </div>
                        )}

                        {!isLoading &&
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    className={
                                        "flex w-full flex-col gap-0.5 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-green-50" +
                                        (n.read ? "" : " bg-green-50/60 hover:bg-green-50")
                                    }
                                    onClick={() => handleNotificationClick(n)}
                                >
                  <span className="text-sm font-semibold text-stone-800">
                    {n.subject}
                  </span>
                                    <span className="line-clamp-2 text-xs text-stone-600">
                    {n.content}
                  </span>
                                    <span className="mt-0.5 text-[11px] text-stone-400">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function BellIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function formatRelativeTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "gần đây";
    if (diffMins < 60) return `${diffMins}phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}ngày trước`;
    return date.toLocaleDateString();
}