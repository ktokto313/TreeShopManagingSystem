import { useState, useEffect, useCallback } from "react";

export default function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications/unread-count", {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            setUnreadCount(data.unreadCount ?? 0);
        } catch (err) {
            console.log(err);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/notifications", {
                credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const markAsRead = useCallback(async (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: "PATCH",
                credentials: "include",
            });
        } catch (err) {
            console.log(err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        try {
            await fetch("/api/notifications/read-all", {
                method: "PATCH",
                credentials: "include",
            });
        } catch (err) {
            console.log(err);
        }
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}