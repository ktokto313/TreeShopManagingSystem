export const timeFormat = (time) => {
    return new Date(time).toLocaleString('en-US', {
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit'
    });
} 