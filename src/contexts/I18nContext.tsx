import React, { createContext, useContext, ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        dashboard: 'Dashboard',
        services: 'Services',
        orders: 'Orders',
        reports: 'Reports',
        profile: 'Profile',
        admin: 'Admin',
        logout: 'Logout',
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
      },
      // Authentication
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        username: 'Username',
        phone: 'Phone',
        country: 'Country',
        role: 'Role',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signInToAccount: 'Sign in to your account',
        createAccount: 'Create your account',
        welcomeBack: 'Welcome back!',
        joinUs: 'Join VBannaCorp GlobalSync',
      },
      // Dashboard
      dashboard: {
        welcome: 'Welcome to VBannaCorp GlobalSync',
        overview: 'Overview',
        stats: 'Statistics',
        recentOrders: 'Recent Orders',
        pendingTasks: 'Pending Tasks',
        quickActions: 'Quick Actions',
        viewAll: 'View All',
      },
      // Services
      services: {
        title: 'Services',
        documentation: 'Documentation Services',
        digital: 'Digital Services',
        businessPlan: 'Business Plan',
        logoDesign: 'Logo Design',
        website: 'Website Design',
        kycPreparation: 'KYC Preparation',
        tradeLeads: 'Trade Lead Sourcing',
        requestService: 'Request Service',
        viewDetails: 'View Details',
        pricing: 'Pricing',
        turnaround: 'Turnaround Time',
        features: 'Features',
      },
      // Orders
      orders: {
        title: 'Orders',
        orderNumber: 'Order Number',
        service: 'Service',
        status: 'Status',
        priority: 'Priority',
        totalPrice: 'Total Price',
        createdAt: 'Created At',
        dueDate: 'Due Date',
        actions: 'Actions',
        viewOrder: 'View Order',
        pending: 'Pending',
        inProgress: 'In Progress',
        completed: 'Completed',
        revised: 'Revised',
        cancelled: 'Cancelled',
        standard: 'Standard',
        rush: 'Rush',
        myOrders: 'My Orders',
        allOrders: 'All Orders',
      },
      // Profile
      profile: {
        title: 'Profile',
        personalInfo: 'Personal Information',
        accountSettings: 'Account Settings',
        changePassword: 'Change Password',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        timezone: 'Timezone',
        language: 'Language',
        notifications: 'Notifications',
        security: 'Security',
        updateProfile: 'Update Profile',
      },
      // Admin
      admin: {
        dashboard: 'Admin Dashboard',
        users: 'User Management',
        services: 'Service Management',
        orders: 'Order Management',
        reports: 'Reports',
        settings: 'Settings',
        analytics: 'Analytics',
        totalUsers: 'Total Users',
        totalOrders: 'Total Orders',
        totalRevenue: 'Total Revenue',
        activeServices: 'Active Services',
      },
      // Validation
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        password: 'Password must be at least 6 characters',
        passwordMatch: 'Passwords do not match',
        minLength: 'Must be at least {{min}} characters',
        maxLength: 'Must be no more than {{max}} characters',
      },
      // Countries
      countries: {
        singapore: 'Singapore',
        dubai: 'Dubai',
        malta: 'Malta',
        caymanIslands: 'Cayman Islands',
      },
      // Industries
      industries: {
        agriculture: 'Agriculture',
        manufacturing: 'Manufacturing',
        technology: 'Technology',
        retail: 'Retail',
        services: 'Services',
      },
    },
  },
  zh: {
    translation: {
      // Navigation
      nav: {
        home: '首页',
        dashboard: '仪表盘',
        services: '服务',
        orders: '订单',
        reports: '报告',
        profile: '个人资料',
        admin: '管理',
        logout: '登出',
      },
      // Common
      common: {
        loading: '加载中...',
        error: '错误',
        success: '成功',
        cancel: '取消',
        save: '保存',
        edit: '编辑',
        delete: '删除',
        create: '创建',
        update: '更新',
        search: '搜索',
        filter: '筛选',
        export: '导出',
        import: '导入',
        back: '返回',
        next: '下一步',
        previous: '上一步',
        submit: '提交',
        reset: '重置',
        confirm: '确认',
        yes: '是',
        no: '否',
      },
      // Authentication
      auth: {
        login: '登录',
        register: '注册',
        logout: '登出',
        email: '邮箱',
        password: '密码',
        firstName: '名',
        lastName: '姓',
        username: '用户名',
        phone: '电话',
        country: '国家',
        role: '角色',
        forgotPassword: '忘记密码？',
        rememberMe: '记住我',
        alreadyHaveAccount: '已有账户？',
        dontHaveAccount: '没有账户？',
        signIn: '登录',
        signUp: '注册',
        signInToAccount: '登录您的账户',
        createAccount: '创建账户',
        welcomeBack: '欢迎回来！',
        joinUs: '加入VBannaCorp GlobalSync',
      },
      // Dashboard
      dashboard: {
        welcome: '欢迎使用VBannaCorp GlobalSync',
        overview: '概览',
        stats: '统计',
        recentOrders: '最近订单',
        pendingTasks: '待处理任务',
        quickActions: '快速操作',
        viewAll: '查看全部',
      },
      // Services
      services: {
        title: '服务',
        documentation: '文档服务',
        digital: '数字服务',
        businessPlan: '商业计划',
        logoDesign: '标志设计',
        website: '网站设计',
        kycPreparation: 'KYC准备',
        tradeLeads: '贸易线索',
        requestService: '请求服务',
        viewDetails: '查看详情',
        pricing: '定价',
        turnaround: '周转时间',
        features: '特性',
      },
      // Orders
      orders: {
        title: '订单',
        orderNumber: '订单号',
        service: '服务',
        status: '状态',
        priority: '优先级',
        totalPrice: '总价',
        createdAt: '创建时间',
        dueDate: '截止日期',
        actions: '操作',
        viewOrder: '查看订单',
        pending: '待处理',
        inProgress: '进行中',
        completed: '已完成',
        revised: '已修订',
        cancelled: '已取消',
        standard: '标准',
        rush: '加急',
        myOrders: '我的订单',
        allOrders: '所有订单',
      },
      // Profile
      profile: {
        title: '个人资料',
        personalInfo: '个人信息',
        accountSettings: '账户设置',
        changePassword: '更改密码',
        currentPassword: '当前密码',
        newPassword: '新密码',
        confirmPassword: '确认密码',
        timezone: '时区',
        language: '语言',
        notifications: '通知',
        security: '安全',
        updateProfile: '更新资料',
      },
      // Admin
      admin: {
        dashboard: '管理仪表盘',
        users: '用户管理',
        services: '服务管理',
        orders: '订单管理',
        reports: '报告',
        settings: '设置',
        analytics: '分析',
        totalUsers: '总用户数',
        totalOrders: '总订单数',
        totalRevenue: '总收入',
        activeServices: '活跃服务',
      },
      // Validation
      validation: {
        required: '此字段为必填项',
        email: '请输入有效的邮箱地址',
        password: '密码至少需要6个字符',
        passwordMatch: '密码不匹配',
        minLength: '至少需要{{min}}个字符',
        maxLength: '不能超过{{max}}个字符',
      },
      // Countries
      countries: {
        singapore: '新加坡',
        dubai: '迪拜',
        malta: '马耳他',
        caymanIslands: '开曼群岛',
      },
      // Industries
      industries: {
        agriculture: '农业',
        manufacturing: '制造业',
        technology: '技术',
        retail: '零售',
        services: '服务',
      },
    },
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        home: 'الرئيسية',
        dashboard: 'لوحة التحكم',
        services: 'الخدمات',
        orders: 'الطلبات',
        reports: 'التقارير',
        profile: 'الملف الشخصي',
        admin: 'الإدارة',
        logout: 'تسجيل الخروج',
      },
      // Common
      common: {
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        cancel: 'إلغاء',
        save: 'حفظ',
        edit: 'تعديل',
        delete: 'حذف',
        create: 'إنشاء',
        update: 'تحديث',
        search: 'بحث',
        filter: 'تصفية',
        export: 'تصدير',
        import: 'استيراد',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        submit: 'إرسال',
        reset: 'إعادة تعيين',
        confirm: 'تأكيد',
        yes: 'نعم',
        no: 'لا',
      },
      // Authentication
      auth: {
        login: 'تسجيل الدخول',
        register: 'التسجيل',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        username: 'اسم المستخدم',
        phone: 'الهاتف',
        country: 'البلد',
        role: 'الدور',
        forgotPassword: 'نسيت كلمة المرور؟',
        rememberMe: 'تذكرني',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        dontHaveAccount: 'ليس لديك حساب؟',
        signIn: 'تسجيل الدخول',
        signUp: 'التسجيل',
        signInToAccount: 'تسجيل الدخول إلى حسابك',
        createAccount: 'إنشاء حسابك',
        welcomeBack: 'مرحباً بعودتك!',
        joinUs: 'انضم إلى VBannaCorp GlobalSync',
      },
      // Dashboard
      dashboard: {
        welcome: 'مرحباً بك في VBannaCorp GlobalSync',
        overview: 'نظرة عامة',
        stats: 'الإحصائيات',
        recentOrders: 'الطلبات الأخيرة',
        pendingTasks: 'المهام المعلقة',
        quickActions: 'الإجراءات السريعة',
        viewAll: 'عرض الكل',
      },
      // Services
      services: {
        title: 'الخدمات',
        documentation: 'خدمات التوثيق',
        digital: 'الخدمات الرقمية',
        businessPlan: 'خطة العمل',
        logoDesign: 'تصميم الشعار',
        website: 'تصميم الموقع',
        kycPreparation: 'إعداد KYC',
        tradeLeads: 'عملاء التجارة',
        requestService: 'طلب خدمة',
        viewDetails: 'عرض التفاصيل',
        pricing: 'التسعير',
        turnaround: 'وقت التسليم',
        features: 'الميزات',
      },
      // Orders
      orders: {
        title: 'الطلبات',
        orderNumber: 'رقم الطلب',
        service: 'الخدمة',
        status: 'الحالة',
        priority: 'الأولوية',
        totalPrice: 'السعر الإجمالي',
        createdAt: 'تاريخ الإنشاء',
        dueDate: 'تاريخ الاستحقاق',
        actions: 'الإجراءات',
        viewOrder: 'عرض الطلب',
        pending: 'معلق',
        inProgress: 'قيد التنفيذ',
        completed: 'مكتمل',
        revised: 'منقح',
        cancelled: 'ملغي',
        standard: 'عادي',
        rush: 'عاجل',
        myOrders: 'طلباتي',
        allOrders: 'جميع الطلبات',
      },
      // Profile
      profile: {
        title: 'الملف الشخصي',
        personalInfo: 'المعلومات الشخصية',
        accountSettings: 'إعدادات الحساب',
        changePassword: 'تغيير كلمة المرور',
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة',
        confirmPassword: 'تأكيد كلمة المرور',
        timezone: 'المنطقة الزمنية',
        language: 'اللغة',
        notifications: 'الإشعارات',
        security: 'الأمان',
        updateProfile: 'تحديث الملف الشخصي',
      },
      // Admin
      admin: {
        dashboard: 'لوحة تحكم الإدارة',
        users: 'إدارة المستخدمين',
        services: 'إدارة الخدمات',
        orders: 'إدارة الطلبات',
        reports: 'التقارير',
        settings: 'الإعدادات',
        analytics: 'التحليلات',
        totalUsers: 'إجمالي المستخدمين',
        totalOrders: 'إجمالي الطلبات',
        totalRevenue: 'إجمالي الإيرادات',
        activeServices: 'الخدمات النشطة',
      },
      // Validation
      validation: {
        required: 'هذا الحقل مطلوب',
        email: 'يرجى إدخال عنوان بريد إلكتروني صحيح',
        password: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
        passwordMatch: 'كلمات المرور غير متطابقة',
        minLength: 'يجب أن يكون {{min}} أحرف على الأقل',
        maxLength: 'يجب ألا يزيد عن {{max}} حرف',
      },
      // Countries
      countries: {
        singapore: 'سنغافورة',
        dubai: 'دبي',
        malta: 'مالطا',
        caymanIslands: 'جزر كايمان',
      },
      // Industries
      industries: {
        agriculture: 'الزراعة',
        manufacturing: 'التصنيع',
        technology: 'التكنولوجيا',
        retail: 'التجزئة',
        services: 'الخدمات',
      },
    },
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

interface I18nContextType {
  changeLanguage: (lng: string) => void;
  currentLanguage: string;
  availableLanguages: { code: string; name: string; nativeName: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const contextValue: I18nContextType = {
    changeLanguage,
    currentLanguage: i18n.language,
    availableLanguages,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default i18n;