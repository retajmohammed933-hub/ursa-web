// reports.js - نظام البلاغات
(function() {
    // ==================== دوال التخزين ====================
    function getReports() {
        try {
            const reports = localStorage.getItem('ursa_reports');
            return reports ? JSON.parse(reports) : [];
        } catch (e) {
            return [];
        }
    }

    function saveReports(reports) {
        try {
            localStorage.setItem('ursa_reports', JSON.stringify(reports));
            return true;
        } catch (e) {
            return false;
        }
    }

    function getCurrentUser() {
        try {
            const user = localStorage.getItem('ursa_current_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    // ==================== دوال البلاغات ====================
    window.addReport = function(reportData) {
        const user = getCurrentUser();
        if (!user) {
            alert('❌ Please login first');
            return false;
        }

        if (!reportData.description || !reportData.category) {
            alert('❌ Please fill all required fields');
            return false;
        }

        try {
            const reports = getReports();
            
            const newReport = {
                id: 'REP-' + Date.now(),
                userId: user.nationalId || user.phone,
                userName: user.fullName || 'User',
                description: reportData.description,
                category: reportData.category,
                location: reportData.location || 'Benha',
                media: reportData.media || null,
                status: 'Under Review',
                date: new Date().toLocaleString()
            };

            reports.push(newReport);
            saveReports(reports);
            return true;
            
        } catch (error) {
            alert('Error saving report');
            return false;
        }
    };

    window.getUserReports = function() {
        const user = getCurrentUser();
        if (!user) return [];

        const reports = getReports();
        return reports.filter(r => r.userId === (user.nationalId || user.phone));
    };

    window.displayUserReports = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = getCurrentUser();
        
        if (!user) {
            container.innerHTML = '<p>Please login to view reports</p>';
            return;
        }

        const reports = window.getUserReports();

        if (reports.length === 0) {
            container.innerHTML = '<p>No reports yet</p>';
            return;
        }

        let html = '';
        reports.forEach(r => {
            html += `
                <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 10px;">
                    <p><strong>${r.description}</strong></p>
                    <p>Category: ${r.category}</p>
                    <p>Status: ${r.status}</p>
                    <p>Date: ${r.date}</p>
                </div>
            `;
        });
        container.innerHTML = html;
    };

    console.log('Reports system ready');
})();