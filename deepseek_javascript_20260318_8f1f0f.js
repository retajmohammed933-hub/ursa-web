function handleReportSubmit(event) {
    event.preventDefault();

    const selectedCategory = document.getElementById("selectedCategory").value;
    const description = document.getElementById("reportDescription").value.trim();
    const location = document.getElementById("reportLocation")?.value || "بنها";
    
    // جلب الملف المرفق
    const cameraInput = document.getElementById("cameraInput");
    const mediaFile = cameraInput?.files?.[0];

    if (!selectedCategory) {
        alert("Please select a category.");
        return;
    }

    if (!description) {
        alert("Please write a description.");
        return;
    }

    // تجهيز بيانات البلاغ
    const reportData = {
        title: description.substring(0, 50) + (description.length > 50 ? '...' : ''),
        description: description,
        category: selectedCategory,
        location: location
    };

    // لو في ملف مرفق
    if (mediaFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            reportData.media = {
                url: e.target.result,
                type: mediaFile.type
            };
            
            // حفظ البلاغ
            if (window.addReport && window.addReport(reportData)) {
                alert('✅ Report submitted successfully!');
                
                // تنظيف الفورم
                document.getElementById("reportForm").reset();
                document.getElementById("selectedCategory").value = "";
                document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("primary"));
                
                const cameraPreview = document.getElementById("cameraPreview");
                if (cameraPreview) {
                    cameraPreview.innerHTML = "";
                    cameraPreview.classList.remove("active");
                }
                
                // لو عايزة المستخدم يروح لصفحة البلاغات
                if (confirm('Do you want to view your reports?')) {
                    showPage('myreports');
                    if (window.displayUserReports) {
                        setTimeout(() => window.displayUserReports('reportsContainer'), 100);
                    }
                }
            }
        };
        reader.readAsDataURL(mediaFile);
    } else {
        // حفظ البلاغ من غير ملف
        if (window.addReport && window.addReport(reportData)) {
            alert('✅ Report submitted successfully!');
            
            document.getElementById("reportForm").reset();
            document.getElementById("selectedCategory").value = "";
            document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("primary"));
            
            if (confirm('Do you want to view your reports?')) {
                showPage('myreports');
                if (window.displayUserReports) {
                    setTimeout(() => window.displayUserReports('reportsContainer'), 100);
                }
            }
        }
    }
}