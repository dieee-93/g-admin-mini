export const getStatusColor = (status: string) => {
    switch (status) {
        case 'available': return 'green';
        case 'occupied': return 'orange';
        case 'reserved': return 'blue';
        case 'cleaning': return 'gray';
        case 'ready_for_bill': return 'purple';
        case 'maintenance': return 'red';
        default: return 'gray';
    }
};

export const getStatusBorderColor = (status: string) => {
    switch (status) {
        case 'available': return 'green.400';
        case 'occupied': return 'orange.400';
        case 'reserved': return 'blue.400';
        case 'cleaning': return 'gray.400';
        case 'ready_for_bill': return 'purple.400';
        case 'maintenance': return 'red.400';
        default: return 'gray.200';
    }
};

export const getStatusBgColor = (status: string) => {
    switch (status) {
        case 'available': return 'green.subtle';
        case 'occupied': return 'orange.subtle';
        case 'reserved': return 'blue.subtle';
        case 'cleaning': return 'gray.subtle';
        case 'ready_for_bill': return 'purple.subtle';
        case 'maintenance': return 'red.subtle';
        default: return 'bg.panel';
    }
};

export const getPriorityIcon = (priority: string) => {
    switch (priority) {
        case 'vip': return '⭐';
        case 'high': return '🔥';
        case 'urgent': return '🚨';
        case 'attention_needed': return '⚠️';
        default: return '';
    }
};

export const formatDuration = (minutes: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};
