export const exportService = {
    exportToExcel: async (): Promise<void> => {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const token = localStorage.getItem('cp_access_token');

        const response = await fetch(`${apiUrl}/export/excel`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to export data');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Generate filename with timestamp in CIS format (YYYY-MM-DD-HH-mm)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timestamp = `${year}-${month}-${day}-${hours}-${minutes}`;
        a.download = `careerpilot-export-${timestamp}.xlsx`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
