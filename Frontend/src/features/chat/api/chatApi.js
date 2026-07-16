const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function sendMessage(message, sessionId = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (sessionId) {
        headers['X-Session-Id'] = sessionId;
    }

    const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}

export async function getChatHistory(sessionId) {
    const response = await fetch(`${API_BASE}/api/chat/history`, {
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to get history');
    }

    return response.json();
}

export async function clearChatHistory(sessionId) {
    const response = await fetch(`${API_BASE}/api/chat/history`, {
        method: 'DELETE',
        headers: {
            'X-Session-Id': sessionId,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to clear history');
    }

    return response.json();
}
