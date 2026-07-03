export const timeFormat = (time) => {
    return new Date(time).toLocaleString('vi-VN', {
        month: '2-digit', 
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    });
} 