/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import {
  Calendar,
  Users,
  CheckCircle,
  Umbrella,
  XCircle,
  MapPin,
  Plus,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Trash2,
  MoreVertical,
  Edit2,
  X,
  FileText,
  User,
  Briefcase,
  ChevronDown,
  Home,
  PieChart,
  Settings,
  Download,
  Upload,
  ArrowDownAZ,
  Database,
  Send,
  Search,
  Share2,
  Clock,
  MessageCircle,
  Copy,
  RefreshCw,
  Check
} from "lucide-react";
// @ts-ignore
import html2pdf from "html2pdf.js";

type Status = "مداوم" | "إجازة" | "غياب";

interface Employee {
  id: string;
  name: string;
  location: string;
  status: Status;
  lastUpdated?: string;
}

const DEFAULT_DATA: Employee[] = [
  {
    id: "1",
    name: "درويش رياض صالح قاسم درويش",
    status: "مداوم",
    location: "عدن - بئر أحمد",
  },
  {
    id: "2",
    name: "محمد مهيوب احمد غالب",
    status: "مداوم",
    location: "عدن - بئر أحمد",
  },
  {
    id: "3",
    name: "يسلم سلام ثابت ناصر",
    status: "مداوم",
    location: "عدن - بئر أحمد",
  },
  {
    id: "4",
    name: "احمد مختار احمد زين",
    status: "مداوم",
    location: "عدن - التواهي",
  },
  {
    id: "5",
    name: "نبيل محسن حسين شايف",
    status: "مداوم",
    location: "عدن - التواهي",
  },
  {
    id: "6",
    name: "شايف جمال شايف سبيت",
    status: "مداوم",
    location: "لحج - الرباط",
  },
  {
    id: "7",
    name: "وجدي صالح قاسم محمد",
    status: "مداوم",
    location: "لحج - الرباط",
  },
  {
    id: "8",
    name: "ماهر فضل البكري",
    status: "مداوم",
    location: "لحج - الرباط",
  },
  {
    id: "9",
    name: "عيدروس حسن محمد",
    status: "مداوم",
    location: "لحج - الرباط",
  },
  { id: "10", name: "هايل سعيد هيثم", status: "إجازة", location: "-" },
  { id: "11", name: "محضار علي مثى", status: "إجازة", location: "-" },
  {
    id: "12",
    name: "امجد عبدالحميد طاهر شعفل",
    status: "إجازة",
    location: "-",
  },
];

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentDate, setCurrentDate] = useState("");

  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    status: "مداوم",
  });
  
  const [activeTab, setActiveTab] = useState('home');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'location' | 'lastUpdated'>('name');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | 'الكل'>('الكل');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState("تقرير التمام اليومي");
  const [pdfSubtitle, setPdfSubtitle] = useState("الفصيل الطبي - اللواء ٤٣ عمالقة");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formDragControls = useDragControls();
  const menuDragControls = useDragControls();

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("ar-EG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formatted);

    const saved = localStorage.getItem("tamam_pro_data");
    const savedSort = localStorage.getItem("tamam_pro_sort");
    const savedTitle = localStorage.getItem("tamam_pro_pdf_title");
    const savedSubtitle = localStorage.getItem("tamam_pro_pdf_subtitle");
    
    if (savedSort) {
      setSortBy(savedSort as 'name' | 'status' | 'location');
    }
    if (savedTitle) setPdfTitle(savedTitle);
    if (savedSubtitle) setPdfSubtitle(savedSubtitle);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
          const withIds = parsed.map((emp: any, index: number) => ({
            ...emp,
            id: emp.id || Date.now().toString() + index,
          }));
          setEmployees(withIds);
        } else {
          setEmployees([...DEFAULT_DATA]);
        }
      } catch (e) {
        setEmployees([...DEFAULT_DATA]);
      }
    } else {
      setEmployees([...DEFAULT_DATA]);
    }
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      localStorage.setItem("tamam_pro_data", JSON.stringify(employees));
    } else if (
      employees.length === 0 &&
      localStorage.getItem("tamam_pro_data")
    ) {
      localStorage.setItem("tamam_pro_data", JSON.stringify([]));
    }
  }, [employees]);

  const stats = {
    total: employees.length,
    present: employees.filter((emp) => emp.status === "مداوم").length,
    leave: employees.filter((emp) => emp.status === "إجازة").length,
    absent: employees.filter((emp) => emp.status === "غياب").length,
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  const locationStats = employees.reduce((acc, emp) => {
    const loc = emp.location || "غير محدد";
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter and Sort employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'الكل' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
    if (sortBy === 'status') return a.status.localeCompare(b.status, 'ar');
    if (sortBy === 'location') return a.location.localeCompare(b.location, 'ar');
    if (sortBy === 'lastUpdated') {
      if (!a.lastUpdated && !b.lastUpdated) return 0;
      if (!a.lastUpdated) return 1;
      if (!b.lastUpdated) return -1;
      return b.lastUpdated.localeCompare(a.lastUpdated, 'ar'); // Descending order
    }
    return 0;
  });

  const handleSortChange = (newSort: 'name' | 'status' | 'location' | 'lastUpdated') => {
    setSortBy(newSort);
    localStorage.setItem("tamam_pro_sort", newSort);
  };

  const handleBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employees));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `tamam_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (Array.isArray(parsed) && parsed.every(emp => emp.id && emp.name && emp.status)) {
            setEmployees(parsed);
            alert("تم استعادة البيانات بنجاح!");
          } else {
            alert("ملف غير صالح أو بيانات غير مكتملة!");
          }
        } catch (error) {
          alert("حدث خطأ أثناء قراءة الملف!");
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert("يرجى إدخال اسم الموظف");
      return;
    }

    if (formData.id) {
      // Edit existing
      setEmployees(
        employees.map((emp) =>
          emp.id === formData.id ? ({ 
            ...emp, 
            ...formData,
            lastUpdated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          } as Employee) : emp,
        ),
      );
    } else {
      // Add new
      const newEmp: Employee = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        location: formData.location?.trim() || "-",
        status: (formData.status as Status) || "مداوم",
        lastUpdated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setEmployees([newEmp, ...employees]);
    }

    setIsFormOpen(false);
    setFormData({ status: "مداوم" });
  };

  const openEditForm = (emp: Employee) => {
    setFormData(emp);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setFormData({ status: "مداوم" });
    setIsFormOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { 
          ...emp, 
          status: newStatus,
          lastUpdated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        } : emp,
      ),
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      setEmployees(employees.filter((emp) => emp.id !== id));
    }
  };

  const handleReset = () => {
    if (window.confirm("سيتم استعادة القائمة الافتراضية. هل تريد المتابعة؟")) {
      setEmployees([...DEFAULT_DATA]);
      setIsMenuOpen(false);
    }
  };

  const handleClear = () => {
    if (employees.length === 0) {
      alert("القائمة فارغة بالفعل.");
      return;
    }
    if (
      window.confirm(
        "⚠️ تحذير: سيتم حذف جميع الموظفين بشكل نهائي. هل أنت متأكد؟",
      )
    ) {
      setEmployees([]);
      setIsMenuOpen(false);
    }
  };

  const handleResetDay = () => {
    if (window.confirm("هل أنت متأكد من بدء يوم جديد؟ سيتم تصفير حالة جميع الأفراد إلى 'مداوم' ومسح وقت آخر تحديث.")) {
      setEmployees(employees.map(emp => ({
        ...emp,
        status: 'مداوم',
        lastUpdated: undefined
      })));
      showToast("تم بدء يوم جديد بنجاح");
      setIsMenuOpen(false);
    }
  };

  const handleExportExcel = () => {
    let htmlContent = `
      <html>
      <head><meta charset="UTF-8"><title>تقرير التمام</title>
      <style>th,td{border:1px solid #888;padding:8px;text-align:center;} th{background:#1F4E78;color:white;}</style></head>
      <body dir="rtl">
          <h2>تقرير التمام والحضور</h2>
          <p>التاريخ: ${new Date().toLocaleDateString("ar-EG")}</p>
          <table><thead><tr><th>الاسم</th><th>الموقع</th><th>الحالة</th></tr></thead><tbody>`;
    employees.forEach((emp) => {
      htmlContent += `<tr><td>${escapeHtml(emp.name)}</td><td>${escapeHtml(emp.location)}</td><td>${escapeHtml(emp.status)}</td></tr>`;
    });
    htmlContent += `</tbody></table>
          <p>الإجمالي: ${stats.total} | مداوم: ${stats.present} | إجازة: ${stats.leave} | غياب: ${stats.absent}</p>
      </body></html>`;
    const blob = new Blob(["\uFEFF" + htmlContent], {
      type: "application/vnd.ms-excel",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "تقرير_الحضور.xls";
    link.click();
    URL.revokeObjectURL(link.href);
    setIsMenuOpen(false);
  };

  const handlePdfTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPdfTitle(newTitle);
    localStorage.setItem("tamam_pro_pdf_title", newTitle);
  };

  const handlePdfSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubtitle = e.target.value;
    setPdfSubtitle(newSubtitle);
    localStorage.setItem("tamam_pro_pdf_subtitle", newSubtitle);
  };

  const generatePDFHTML = () => {
    return `
      <div style="direction: rtl; font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1e293b; background-color: #ffffff; width: 100%; box-sizing: border-box;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 15px;">
          <div>
            <h1 style="margin: 0; font-size: 22px; color: #1e40af; font-weight: 800;">${escapeHtml(pdfTitle)}</h1>
            <h2 style="margin: 4px 0 0 0; font-size: 14px; color: #475569; font-weight: 600;">${escapeHtml(pdfSubtitle)}</h2>
          </div>
          <div style="text-align: left;">
            <div style="background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 10px; color: #64748b; font-weight: bold;">تاريخ التقرير</p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #0f172a; font-weight: bold;">${new Date().toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 15px;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; border-top: 3px solid #3b82f6;">
            <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: bold;">إجمالي القوة</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; color: #1e293b; font-weight: 900;">${stats.total}</p>
          </div>
          <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center; border-top: 3px solid #22c55e;">
            <p style="margin: 0; font-size: 11px; color: #166534; font-weight: bold;">مداوم</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; color: #15803d; font-weight: 900;">${stats.present}</p>
          </div>
          <div style="flex: 1; background: #fffbeb; border: 1px solid #fef08a; border-radius: 8px; padding: 10px; text-align: center; border-top: 3px solid #eab308;">
            <p style="margin: 0; font-size: 11px; color: #854d0e; font-weight: bold;">إجازة</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; color: #a16207; font-weight: 900;">${stats.leave}</p>
          </div>
          <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px; text-align: center; border-top: 3px solid #ef4444;">
            <p style="margin: 0; font-size: 11px; color: #991b1b; font-weight: bold;">غياب</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; color: #b91c1c; font-weight: 900;">${stats.absent}</p>
          </div>
        </div>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
          <thead>
            <tr style="background-color: #1e293b; color: #ffffff;">
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #334155; width: 5%;">م</th>
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #334155; width: 40%;">الاسم الرباعي</th>
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #334155; width: 25%;">الموقع</th>
              <th style="padding: 6px 8px; text-align: center; border: 1px solid #334155; width: 15%;">الحالة</th>
              <th style="padding: 6px 8px; text-align: center; border: 1px solid #334155; width: 15%;">آخر تحديث</th>
            </tr>
          </thead>
          <tbody>
            ${employees.map((emp, index) => {
              let statusColor = "";
              let statusBg = "";
              if (emp.status === "مداوم") { statusColor = "#15803d"; statusBg = "#dcfce7"; }
              else if (emp.status === "إجازة") { statusColor = "#a16207"; statusBg = "#fef9c3"; }
              else { statusColor = "#b91c1c"; statusBg = "#fee2e2"; }

              return `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #64748b;">${index + 1}</td>
                  <td style="padding: 6px 8px; border: 1px solid #e2e8f0; font-weight: 600;">${escapeHtml(emp.name)}</td>
                  <td style="padding: 6px 8px; border: 1px solid #e2e8f0; color: #475569;">${escapeHtml(emp.location)}</td>
                  <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center;">
                    <span style="background-color: ${statusBg}; color: ${statusColor}; padding: 2px 8px; border-radius: 12px; font-weight: bold; font-size: 10px; display: inline-block;">
                      ${escapeHtml(emp.status)}
                    </span>
                  </td>
                  <td style="padding: 6px 8px; border: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 10px;">
                    ${emp.lastUpdated || '-'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Footer Signatures -->
        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; border-top: 1px dashed #cbd5e1; page-break-inside: avoid;">
          <div style="text-align: center; width: 30%;">
            <p style="margin: 0 0 20px 0; font-weight: bold; color: #475569; font-size: 12px;">الكاتب / محرر التقرير</p>
            <p style="margin: 0; border-top: 1px solid #94a3b8; padding-top: 5px; color: #1e293b; font-weight: bold; font-size: 12px;">التوقيع</p>
          </div>
          <div style="text-align: center; width: 30%;">
            <p style="margin: 0 0 20px 0; font-weight: bold; color: #475569; font-size: 12px;">القائد المباشر</p>
            <p style="margin: 0; border-top: 1px solid #94a3b8; padding-top: 5px; color: #1e293b; font-weight: bold; font-size: 12px;">الاسم والتوقيع</p>
          </div>
        </div>
        
        <!-- Generated Timestamp -->
        <div style="margin-top: 15px; text-align: left; font-size: 8px; color: #94a3b8; page-break-inside: avoid;">
          تم استخراج التقرير آلياً بتاريخ: ${new Date().toLocaleString("ar-EG")}
        </div>
      </div>
    `;
  };

  const handleExportPDF = () => {
    const element = document.createElement("div");
    element.innerHTML = generatePDFHTML();

    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
      filename: "تقرير_الحضور.pdf",
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
    setIsMenuOpen(false);
  };

  const getReportText = () => {
    let text = `*${pdfTitle}*\n`;
    text += `*${pdfSubtitle}*\n`;
    text += `التاريخ: ${new Date().toLocaleDateString("ar-EG")}\n\n`;
    text += `*الإحصائيات:*\n`;
    text += `إجمالي القوة: ${stats.total}\n`;
    text += `مداوم: ${stats.present}\n`;
    text += `إجازة: ${stats.leave}\n`;
    text += `غياب: ${stats.absent}\n\n`;
    
    text += `*التفاصيل:*\n`;
    employees.forEach((emp, index) => {
      text += `${index + 1}. ${emp.name} - ${emp.status}\n`;
    });
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getReportText());
      showToast("تم نسخ التقرير إلى الحافظة");
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showToast("فشل نسخ التقرير");
    }
  };

  const handleShareTextWhatsApp = () => {
    const text = getReportText();
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    setIsMenuOpen(false);
  };

  const handleSendWhatsApp = async () => {
    const element = document.createElement("div");
    element.innerHTML = generatePDFHTML();

    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3] as [number, number, number, number],
      filename: "تقرير_الحضور.pdf",
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 800 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      const file = new File([pdfBlob], "تقرير_الحضور.pdf", { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "تقرير التمام",
          text: "مرفق تقرير التمام بصيغة PDF"
        });
      } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(pdfBlob);
        link.download = "تقرير_الحضور.pdf";
        link.click();
        URL.revokeObjectURL(link.href);
        alert("تم تنزيل الملف. يرجى مشاركته يدوياً عبر واتساب لأن متصفحك لا يدعم المشاركة المباشرة للملفات.");
      }
    } catch (error) {
      console.error("Error sharing PDF:", error);
      alert("حدث خطأ أثناء محاولة مشاركة الملف.");
    }
    setIsMenuOpen(false);
  };

  const escapeHtml = (str: string) => {
    if (!str) return "";
    return str.replace(/[&<>]/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    });
  };

  const handlePrint = () => {
    setIsMenuOpen(false);
    setTimeout(() => window.print(), 300);
  };

  const getStatusStyles = (status: Status) => {
    switch (status) {
      case "مداوم":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "إجازة":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "غياب":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-blue-200">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen relative shadow-2xl sm:border-x border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-full">
        {/* App Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-5 py-4 flex justify-between items-center print:hidden">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              {activeTab === 'home' ? 'تقرير التمام' : activeTab === 'stats' ? 'الإحصائيات' : 'الإعدادات'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
              <Calendar size={12} /> {currentDate}
            </p>
          </div>
          {activeTab === 'home' && (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-95"
            >
              <MoreVertical size={20} />
            </button>
          )}
        </header>

        {/* Main Content Area */}
        <div className="pb-36 print:pb-0">
          {activeTab === 'home' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Stats Section */}
              <div className="px-5 py-4 print:hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">
                        {stats.total}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        إجمالي القوة
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">
                        {stats.present}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        مداوم
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Umbrella size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">
                        {stats.leave}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        إجازة
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                      <XCircle size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-800">
                        {stats.absent}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        غياب
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee List */}
              <div className="px-5 print:hidden">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-sm font-bold text-slate-800">قائمة الأفراد</h2>
                  <span className="text-xs font-medium text-slate-500 bg-slate-200/50 px-2 py-1 rounded-full">
                    {filteredEmployees.length} فرد
                  </span>
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="بحث بالاسم أو الموقع..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                  {(['الكل', 'مداوم', 'إجازة', 'غياب'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        statusFilter === status
                          ? "bg-slate-800 text-white shadow-md"
                          : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {sortedEmployees.map((emp) => (
                      <motion.div
                        key={emp.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative group flex flex-col gap-4"
                      >
                        {/* Top row: Info and Actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-base shrink-0 border border-slate-200">
                              {getInitials(emp.name)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-800 text-base truncate">
                                {emp.name}
                              </h3>
                              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="truncate">{emp.location}</span>
                              </p>
                              {emp.lastUpdated && (
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Clock size={10} />
                                  <span>آخر تحديث: {emp.lastUpdated}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons (Edit/Delete) */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditForm(emp)}
                              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                              aria-label="تعديل"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id, emp.name)}
                              className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              aria-label="حذف"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Bottom row: Status Buttons */}
                        <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
                          <button
                            onClick={() => handleStatusChange(emp.id, "مداوم")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                              emp.status === "مداوم"
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                : "text-slate-500 hover:bg-slate-200/50"
                            }`}
                          >
                            مداوم
                          </button>
                          <button
                            onClick={() => handleStatusChange(emp.id, "إجازة")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                              emp.status === "إجازة"
                                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                                : "text-slate-500 hover:bg-slate-200/50"
                            }`}
                          >
                            إجازة
                          </button>
                          <button
                            onClick={() => handleStatusChange(emp.id, "غياب")}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                              emp.status === "غياب"
                                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                : "text-slate-500 hover:bg-slate-200/50"
                            }`}
                          >
                            غياب
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {filteredEmployees.length === 0 && (
                    <div className="text-center py-12 px-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users size={32} />
                      </div>
                      <h3 className="text-slate-800 font-bold mb-1">لا يوجد أفراد</h3>
                      <p className="text-slate-500 text-sm">
                        {searchQuery ? "لا توجد نتائج مطابقة للبحث." : "اضغط على زر الإضافة لإدخال أفراد جدد إلى القائمة."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-6 print:hidden">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">نسبة الحضور</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-black text-blue-600">{attendanceRate}%</span>
                  <span className="text-sm font-medium text-slate-500 mb-1">مداومون</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(stats.present / stats.total) * 100 || 0}%` }} />
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${(stats.leave / stats.total) * 100 || 0}%` }} />
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${(stats.absent / stats.total) * 100 || 0}%` }} />
                </div>
                <div className="flex justify-between mt-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> مداوم ({stats.present})</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/> إجازة ({stats.leave})</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"/> غياب ({stats.absent})</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">تفاصيل الحالات</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">مداوم</p>
                        <p className="text-xs text-slate-500">{stats.present} فرد</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-emerald-600">{stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center"><Umbrella size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">إجازة</p>
                        <p className="text-xs text-slate-500">{stats.leave} فرد</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-amber-500">{stats.total > 0 ? Math.round((stats.leave / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><XCircle size={20} /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">غياب</p>
                        <p className="text-xs text-slate-500">{stats.absent} فرد</p>
                      </div>
                    </div>
                    <span className="text-lg font-black text-rose-600">{stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-4">توزيع الأفراد حسب الموقع</h3>
                <div className="space-y-4">
                  {Object.entries(locationStats).map(([loc, count]) => (
                    <div key={loc}>
                      <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>{loc}</span>
                        <span>{count} فرد</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(Number(count) / stats.total) * 100 || 0}%` }} />
                      </div>
                    </div>
                  ))}
                  {Object.keys(locationStats).length === 0 && (
                    <div className="text-center text-slate-500 text-sm py-4">لا توجد بيانات للمواقع</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-6 space-y-6 print:hidden">
              
              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">تفضيلات العرض</h3>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><ArrowDownAZ size={16} /></div>
                    <span className="font-bold text-sm">ترتيب القائمة حسب</span>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-bold outline-none"
                  >
                    <option value="name">الاسم</option>
                    <option value="status">الحالة</option>
                    <option value="location">الموقع</option>
                    <option value="lastUpdated">آخر تحديث</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">تخصيص التقرير (PDF)</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">عنوان التقرير الرئيسي</label>
                    <input
                      type="text"
                      value={pdfTitle}
                      onChange={handlePdfTitleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="مثال: تقرير التمام اليومي"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">العنوان الفرعي (اسم الوحدة)</label>
                    <input
                      type="text"
                      value={pdfSubtitle}
                      onChange={handlePdfSubtitleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="مثال: الفصيل الطبي - اللواء ٤٣ عمالقة"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">إدارة البيانات</h3>
                </div>
                <button onClick={handleResetDay} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><RefreshCw size={16} /></div>
                  <span className="font-bold text-sm">بدء يوم جديد (تصفير الحالات)</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">تصدير وطباعة</h3>
                </div>
                <button onClick={handleExportExcel} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><FileSpreadsheet size={16} /></div>
                  <span className="font-bold text-sm">تصدير كملف Excel</span>
                </button>
                <button onClick={handleExportPDF} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><FileText size={16} /></div>
                  <span className="font-bold text-sm">تصدير كملف PDF</span>
                </button>
                <button onClick={handleCopyText} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Copy size={16} /></div>
                  <span className="font-bold text-sm">نسخ التقرير كنص</span>
                </button>
                <button onClick={handleSendWhatsApp} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><Send size={16} /></div>
                  <span className="font-bold text-sm">مشاركة PDF عبر WhatsApp</span>
                </button>
                <button onClick={handleShareTextWhatsApp} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><MessageCircle size={16} /></div>
                  <span className="font-bold text-sm">مشاركة نصية عبر WhatsApp</span>
                </button>
                <button onClick={handlePrint} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Printer size={16} /></div>
                  <span className="font-bold text-sm">طباعة التقرير</span>
                </button>
              </div>

              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">النسخ الاحتياطي</h3>
                </div>
                <button onClick={handleBackup} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><Download size={16} /></div>
                  <span className="font-bold text-sm">تنزيل نسخة احتياطية (JSON)</span>
                </button>
                <div className="relative w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><Upload size={16} /></div>
                  <span className="font-bold text-sm">استعادة نسخة احتياطية</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    ref={fileInputRef}
                    onChange={handleRestore}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">إدارة البيانات</h3>
                </div>
                <button onClick={handleReset} className="w-full flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><RotateCcw size={16} /></div>
                  <span className="font-bold text-sm">استعادة القائمة الافتراضية</span>
                </button>
                <button onClick={handleClear} className="w-full flex items-center gap-3 p-4 text-rose-600 hover:bg-rose-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><Trash2 size={16} /></div>
                  <span className="font-bold text-sm">مسح جميع السجلات</span>
                </button>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs font-bold text-slate-400">الإصدار 1.0.0</p>
                <p className="text-[10px] text-slate-400 mt-1">تطبيق تقرير التمام - الفصيل الطبي</p>
              </div>

            </motion.div>
          )}
        </div>

        {/* Floating Action Button */}
        <AnimatePresence>
          {activeTab === 'home' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed sm:absolute bottom-24 left-6 z-30 print:hidden"
            >
              <button
                onClick={openAddForm}
                className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={28} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation Bar */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-20 flex justify-between items-center print:hidden pb-safe">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Home size={24} className={activeTab === 'home' ? 'fill-blue-100' : ''} />
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <PieChart size={24} className={activeTab === 'stats' ? 'fill-blue-100' : ''} />
            <span className="text-[10px] font-bold">الإحصائيات</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings size={24} className={activeTab === 'settings' ? 'fill-blue-100' : ''} />
            <span className="text-[10px] font-bold">الإعدادات</span>
          </button>
        </div>

        {/* --- Bottom Sheet: Add / Edit Form --- */}
        <AnimatePresence>
          {isFormOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 print:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                drag="y"
                dragControls={formDragControls}
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    setIsFormOpen(false);
                  }
                }}
                className="fixed sm:absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-6 shadow-2xl print:hidden pb-safe"
              >
                <div 
                  className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing" 
                  onPointerDown={(e) => formDragControls.start(e)}
                />
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">
                    {formData.id ? "تعديل بيانات الفرد" : "إضافة فرد جديد"}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 bg-slate-100 rounded-full text-slate-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                      <User size={14} /> الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="أدخل الاسم الرباعي"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                      <MapPin size={14} /> الموقع
                    </label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="مكان التواجد"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                      <Briefcase size={14} /> الحالة
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status || "مداوم"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as Status,
                          })
                        }
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                      >
                        <option value="مداوم">مداوم</option>
                        <option value="إجازة">إجازة</option>
                        <option value="غياب">غياب</option>
                      </select>
                      <ChevronDown
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full mt-4 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    {formData.id ? "حفظ التعديلات" : "إضافة للقائمة"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Bottom Sheet: Actions Menu --- */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 print:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                drag="y"
                dragControls={menuDragControls}
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) {
                    setIsMenuOpen(false);
                  }
                }}
                className="fixed sm:absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 p-6 shadow-2xl print:hidden pb-safe"
              >
                <div 
                  className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => menuDragControls.start(e)}
                />
                <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">
                  خيارات التقرير
                </h2>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={handleExportExcel}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all text-center"
                  >
                    <FileSpreadsheet size={24} />
                    <span className="text-xs font-bold">Excel</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 hover:bg-rose-100 active:scale-95 transition-all text-center"
                  >
                    <FileText size={24} />
                    <span className="text-xs font-bold">PDF</span>
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-2xl border border-green-100 hover:bg-green-100 active:scale-95 transition-all text-center"
                  >
                    <Send size={24} />
                    <span className="text-xs font-bold">PDF واتساب</span>
                  </button>
                  <button
                    onClick={handleShareTextWhatsApp}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 active:scale-95 transition-all text-center"
                  >
                    <MessageCircle size={24} />
                    <span className="text-xs font-bold">نص واتساب</span>
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 hover:bg-indigo-100 active:scale-95 transition-all text-center"
                  >
                    <Copy size={24} />
                    <span className="text-xs font-bold">نسخ النص</span>
                  </button>
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-2xl border border-slate-100 hover:bg-slate-100 active:scale-95 transition-all mb-3"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Printer size={18} />
                  </div>
                  <span className="font-bold">طباعة التقرير</span>
                </button>

                <div className="h-px bg-slate-100 my-4" />

                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 p-4 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  <RotateCcw size={20} />
                  <span className="font-semibold">
                    استعادة القائمة الافتراضية
                  </span>
                </button>
                <button
                  onClick={handleClear}
                  className="w-full flex items-center gap-3 p-4 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                  <span className="font-semibold">مسح جميع السجلات</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Hidden Print Layout --- */}
        <div className="hidden print:block bg-white w-full">
          <div className="text-center mb-6 border-b-2 border-slate-800 pb-4 pt-4">
            <h2 className="text-2xl font-bold mb-2">
              تقرير التمام - الفصيل الطبي اللواء ٤٣ عمالقه
            </h2>
            <span className="text-slate-600 font-medium">
              {new Date().toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex justify-between mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {stats.total}
              </div>
              <div className="text-sm text-slate-600">إجمالي القوة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.present}
              </div>
              <div className="text-sm text-slate-600">مداوم</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {stats.leave}
              </div>
              <div className="text-sm text-slate-600">إجازة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">
                {stats.absent}
              </div>
              <div className="text-sm text-slate-600">غياب</div>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-3 text-right">
                  الاسم
                </th>
                <th className="border border-slate-300 p-3 text-right">
                  الموقع
                </th>
                <th className="border border-slate-300 p-3 text-center">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="border border-slate-300 p-3">{emp.name}</td>
                  <td className="border border-slate-300 p-3">
                    {emp.location}
                  </td>
                  <td
                    className={`border border-slate-300 p-3 text-center font-bold ${emp.status === "مداوم" ? "text-emerald-600" : emp.status === "إجازة" ? "text-amber-600" : "text-rose-600"}`}
                  >
                    {emp.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center mt-12 font-bold text-lg">
            قائد الفصيل الطبي / يسلم سلام
          </div>
        </div>
        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="fixed bottom-24 left-1/2 z-50 bg-slate-800 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold print:hidden"
            >
              <Check size={16} className="text-emerald-400" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
