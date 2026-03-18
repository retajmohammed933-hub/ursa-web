// reports.js - Complete Reports Management System
(function() {
    // localStorage storage keys
    const STORAGE_KEYS = {
        REPORTS: 'ursa_reports',
        CURRENT_USER: 'ursa_current_user'
    };

    // ==================== Core Helper Functions ====================

    // Get all reports from localStorage
    function getReports() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
        } catch (e) {
            console.error('Error fetching reports:', e);
            return [];
        }
    }

    // Save reports to localStorage
    function saveReports(reports) {
        try {
            localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
            return true;
        } catch (e) {
            console.error('Error saving reports:', e);
            return false;
        }
    }

    // Get current logged-in user
    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
        } catch (e) {
            console.error('Error fetching user:', e);
            return null;
        }
    }

    // ==================== Report Management Functions ====================

    /**
     * Add a new report
     * @param {Object} reportData - Report data object
     * @returns {boolean} - Success or failure
     */
    window.addReport = function(reportData) {
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user) {
            alert('❌ Please login first');
            return false;
        }

        // Validate required data
        if (!reportData.description || !reportData.category) {
            alert('❌ Incomplete data');
            return false;
        }

        try {
            const reports = getReports();
            
            // Create new report object
            const newReport = {
                id: 'REP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                userId: user.nationalId || user.phone,
                userName: user.fullName || 'User',
                title: reportData.title || reportData.description.substring(0, 50),
                description: reportData.description,
                category: reportData.category,
                location: reportData.location || 'Benha',
                media: reportData.media || null,
                status: 'Under Review',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            reports.push(newReport);
            
            if (saveReports(reports)) {
                console.log('✅ Report added successfully:', newReport.id);
                return true;
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error adding report:', error);
            alert('An error occurred while saving the report');
            return false;
        }
    };

    /**
     * Get current user's reports
     * @returns {Array} - Array of reports
     */
    window.getUserReports = function() {
        const user = getCurrentUser();
        if (!user) return [];

        try {
            const reports = getReports();
            const userReports = reports
                .filter(report => report.userId === (user.nationalId || user.phone))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log(`📊 Fetched ${userReports.length} reports for user`);
            return userReports;
            
        } catch (error) {
            console.error('❌ Error fetching user reports:', error);
            return [];
        }
    };

    /**
     * Get all reports (for administrators)
     * @returns {Array} - Array of all reports
     */
    window.getAllReports = function() {
        try {
            return getReports().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('❌ Error fetching all reports:', error);
            return [];
        }
    };

    /**
     * Update report status
     * @param {string} reportId - Report ID
     * @param {string} newStatus - New status
     * @returns {boolean} - Success or failure
     */
    window.updateReportStatus = function(reportId, newStatus) {
        try {
            const reports = getReports();
            const reportIndex = reports.findIndex(r => r.id === reportId);
            
            if (reportIndex !== -1) {
                reports[reportIndex].status = newStatus;
                reports[reportIndex].updatedAt = new Date().toISOString();
                
                if (saveReports(reports)) {
                    console.log(`✅ Updated report ${reportId} status to ${newStatus}`);
                    return true;
                }
            }
            return false;
            
        } catch (error) {
            console.error('❌ Error updating report status:', error);
            return false;
        }
    };

    // ==================== Display Functions ====================

    /**
     * Display user reports in an HTML element
     * @param {string} containerId - Container element ID
     */
    window.displayUserReports = function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container element not found:', containerId);
            return;
        }

        const user = getCurrentUser();
        
        // Check login status
        if (!user) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 40px;">
                    <i class="fas fa-user-lock" style="font-size: 3rem; color: var(--primary);"></i>
                    <h3 style="margin: 20px 0;">Please Login</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">
                        You need to login to view your reports
                    </p>
                    <button class="glass-btn primary" onclick="showPage('login')">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </div>
            `;
            return;
        }

        const reports = window.getUserReports();

        // No reports case
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; padding: 40px;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; color: var(--primary);"></i>
                    <h3 style="margin: 20px 0;">No Reports Yet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">
                        Start by adding a new report from the Report page
                    </p>
                    <button class="glass-btn primary" onclick="showPage('report')">
                        <i class="fas fa-plus-circle"></i> Add Report
                    </button>
                </div>
            `;
            return;
        }

        // Display reports
        let html = '<div style="display: flex; flex-direction: column; gap: 20px;">';
        
        reports.forEach(report => {
            // Format date
            const date = new Date(report.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Status color and icon configuration
            let statusConfig = {
                color: '#ffa500',
                icon: 'fa-hourglass-half',
                text: report.status
            };

            if (report.status.includes('Resolved')) {
                statusConfig = { color: '#2ba36a', icon: 'fa-check-circle', text: 'Resolved' };
            } else if (report.status.includes('In Progress')) {
                statusConfig = { color: '#4fd1c5', icon: 'fa-spinner fa-spin', text: 'In Progress' };
            }

            html += `
                <div class="glass-card" style="position: relative; overflow: hidden;">
                    <!-- Media display if exists -->
                    ${report.media ? `
                        <div style="margin-bottom: 20px; max-height: 200px; overflow: hidden; border-radius: 15px;">
                            ${report.media.type?.startsWith('video/') ? 
                                `<video src="${report.media.url}" controls style="width: 100%;"></video>` : 
                                `<img src="${report.media.url}" alt="Report media" style="width: 100%; object-fit: cover;">`
                            }
                        </div>
                    ` : ''}
                    
                    <!-- Report header with status -->
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin-bottom: 5px; color: var(--primary);">
                                ${report.title}
                            </h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                                ${report.id}
                            </p>
                        </div>
                        <span style="
                            background: ${statusConfig.color};
                            color: white;
                            padding: 6px 16px;
                            border-radius: 30px;
                            font-size: 0.85rem;
                            font-weight: 600;
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fas ${statusConfig.icon}"></i>
                            ${statusConfig.text}
                        </span>
                    </div>
                    
                    <!-- Report content -->
                    <p style="color: var(--text-primary); margin: 15px 0; line-height: 1.6;">
                        ${report.description}
                    </p>
                    
                    <!-- Additional information -->
                    <div style="display: flex; gap: 20px; flex-wrap: wrap; margin: 15px 0; padding: 10px 0; border-top: 1px solid rgba(47, 164, 164, 0.2); border-bottom: 1px solid rgba(47, 164, 164, 0.2);">
                        <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                            <i class="fas fa-tag" style="color: var(--primary);"></i>
                            ${report.category}
                        </span>
                        <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                            <i class="fas fa-map-marker-alt" style="color: var(--primary);"></i>
                            ${report.location}
                        </span>
                        <span style="display: flex; align-items: center; gap: 6px; color: var(--text-secondary);">
                            <i class="fas fa-clock" style="color: var(--primary);"></i>
                            ${date}
                        </span>
                    </div>
                    
                    <!-- Control buttons -->
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="glass-btn small" onclick="viewReportDetails('${report.id}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    };

    /**
     * Display report details in a popup window
     * @param {string} reportId - Report ID
     */
    window.viewReportDetails = function(reportId) {
        try {
            const reports = getReports();
            const report = reports.find(r => r.id === reportId);
            
            if (!report) {
                alert('❌ Report not found');
                return;
            }

            const date = new Date(report.createdAt).toLocaleString('en-US');
            const updateDate = report.updatedAt ? new Date(report.updatedAt).toLocaleString('en-US') : '—';
            
            // Create popup window
            const detailsWindow = window.open('', '_blank', 'width=600,height=700,left=200,top=100');
            
            detailsWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Report Details - ${report.id}</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                            padding: 30px;
                        }
                        .container {
                            max-width: 550px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 30px;
                            padding: 30px;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        }
                        h1 {
                            color: #2fa4a4;
                            font-size: 2rem;
                            margin-bottom: 25px;
                            border-bottom: 3px solid #2fa4a4;
                            padding-bottom: 15px;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        .field {
                            margin-bottom: 20px;
                        }
                        .label {
                            font-weight: 700;
                            color: #1e4f4f;
                            margin-bottom: 8px;
                            font-size: 0.95rem;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        .value {
                            padding: 12px 18px;
                            background: #f8fafc;
                            border-radius: 16px;
                            color: #1e293b;
                            font-size: 1rem;
                            line-height: 1.6;
                            border: 1px solid #e2e8f0;
                        }
                        .media {
                            margin-top: 20px;
                            text-align: center;
                            background: #0f172a;
                            border-radius: 20px;
                            padding: 15px;
                        }
                        .media img, .media video {
                            max-width: 100%;
                            border-radius: 12px;
                            max-height: 300px;
                            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                        }
                        .status-badge {
                            display: inline-block;
                            padding: 6px 20px;
                            border-radius: 40px;
                            font-weight: 600;
                            font-size: 0.9rem;
                            background: ${report.status.includes('Resolved') ? '#2ba36a' : 
                                         report.status.includes('In Progress') ? '#4fd1c5' : '#ffa500'};
                            color: white;
                        }
                        .close-btn {
                            background: #2fa4a4;
                            color: white;
                            border: none;
                            padding: 12px 30px;
                            border-radius: 40px;
                            cursor: pointer;
                            font-size: 1rem;
                            font-weight: 600;
                            width: 100%;
                            margin-top: 25px;
                            transition: all 0.3s;
                        }
                        .close-btn:hover {
                            background: #1e7a7a;
                            transform: translateY(-2px);
                            box-shadow: 0 10px 20px -5px #2fa4a4;
                        }
                        .id-badge {
                            background: #e2e8f0;
                            color: #475569;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-family: monospace;
                            font-size: 0.9rem;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>
                            <i class="fas fa-file-alt"></i>
                            Report Details
                        </h1>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                            <span class="id-badge">
                                <i class="fas fa-hashtag"></i> ${report.id}
                            </span>
                            <span class="status-badge">
                                <i class="fas ${report.status.includes('Resolved') ? 'fa-check-circle' : 
                                            report.status.includes('In Progress') ? 'fa-spinner fa-spin' : 'fa-hourglass-half'}"></i>
                                ${report.status}
                            </span>
                        </div>
                        
                        <div class="field">
                            <div class="label"><i class="fas fa-heading"></i> Title</div>
                            <div class="value">${report.title}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label"><i class="fas fa-align-left"></i> Description</div>
                            <div class="value">${report.description}</div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="field">
                                <div class="label"><i class="fas fa-tag"></i> Category</div>
                                <div class="value" style="background: #e6f7f7;">${report.category}</div>
                            </div>
                            
                            <div class="field">
                                <div class="label"><i class="fas fa-map-pin"></i> Location</div>
                                <div class="value" style="background: #e6f7f7;">${report.location}</div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="field">
                                <div class="label"><i class="fas fa-calendar"></i> Created</div>
                                <div class="value" style="background: #f1f5f9;">${date}</div>
                            </div>
                            
                            <div class="field">
                                <div class="label"><i class="fas fa-history"></i> Updated</div>
                                <div class="value" style="background: #f1f5f9;">${updateDate}</div>
                            </div>
                        </div>
                        
                        ${report.media ? `
                            <div class="field">
                                <div class="label"><i class="fas fa-paperclip"></i> Attachment</div>
                                <div class="media">
                                    ${report.media.type?.startsWith('video/') ? 
                                        `<video src="${report.media.url}" controls></video>` : 
                                        `<img src="${report.media.url}" alt="Report attachment">`
                                    }
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="field">
                            <div class="label"><i class="fas fa-user"></i> Reported by</div>
                            <div class="value" style="background: #f1f5f9;">
                                <i class="fas fa-user-circle"></i> ${report.userName}
                            </div>
                        </div>
                        
                        <button class="close-btn" onclick="window.close()">
                            <i class="fas fa-times-circle"></i> Close
                        </button>
                    </div>
                </body>
                </html>
            `);
            
            detailsWindow.document.close();
            
        } catch (error) {
            console.error('❌ Error displaying details:', error);
            alert('An error occurred while displaying details');
        }
    };

    // ==================== Statistics Functions ====================

    /**
     * Get user statistics
     * @returns {Object} - Statistics object
     */
    window.getUserStats = function() {
        const reports = window.getUserReports();
        
        return {
            total: reports.length,
            pending: reports.filter(r => r.status === 'Under Review').length,
            inProgress: reports.filter(r => r.status === 'In Progress').length,
            resolved: reports.filter(r => r.status === 'Resolved').length,
            categories: reports.reduce((acc, r) => {
                acc[r.category] = (acc[r.category] || 0) + 1;
                return acc;
            }, {})
        };
    };

    /**
     * Clear all reports (development only)
     */
    window.clearAllReports = function() {
        if (confirm('⚠️ Are you sure you want to clear all reports?')) {
            localStorage.removeItem(STORAGE_KEYS.REPORTS);
            console.log('🗑️ All reports cleared');
            alert('All reports cleared');
        }
    };

    // Initialize the system
    console.log('✅ Reports system initialized successfully');
})();