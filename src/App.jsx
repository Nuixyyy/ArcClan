import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'; 

// ********************************************************************
// ********************* المكون الرئيسي App ***************************
// ********************************************************************
const App = () => {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'weapons', 'admins'
  const [message, setMessage] = useState('');
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // حالة القائمة المنبثقة الرئيسية

  // تهيئة Firebase والمصادقة
  useEffect(() => {
    // ************************************************************
    // ************ تنبيه أمني: معلومات Firebase هنا مباشرة *********
    // ************ لا يُنصح بهذا في بيئات الإنتاج الحقيقية *********
    // ************************************************************
    const firebaseConfig = {
      apiKey: "AIzaSyAx7UPYl64o8Au8OeYnAcRks_h9sf_XWjE",
      authDomain: "lodoutcode.firebaseapp.com",
      projectId: "lodoutcode",
      storageBucket: "lodoutcode.firebasestorage.app",
      messagingSenderId: "359841865848",
      appId: "1:359841865848:web:d2799f32da4747709a0d8d",
      measurementId: "G-0R2NFL9W03"
    };

    const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
    const initialAuthToken = null; // تم تعيينه إلى null لأنه لم يعد يُجلب من المتغيرات السرية

    try {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
            setUserId(firebaseAuth.currentUser?.uid || crypto.randomUUID());
          } catch (error) {
            console.error("خطأ في تسجيل الدخول:", error);
            setMessage('خطأ في تسجيل الدخول. يرجى التحقق من إعدادات المصادقة.');
            setUserId(crypto.randomUUID());
          }
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("خطأ في تهيئة Firebase:", error);
      setMessage('فشل تهيئة Firebase. يرجى التحقق من إعداداتك.');
    }
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMessage(''); // مسح الرسائل عند التنقل بين الصفحات
    setIsMenuOpen(false); // إغلاق القائمة عند التنقل
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // دالة لإرسال إشعار إلى الديسكورد (تتطلب خادمًا خلفيًا)
  const notifyDiscordOfCopy = async (type, value, userId) => {
    try {
      // هذا استدعاء وهمي لنقطة نهاية خادم خلفي
      // يجب عليك بناء خادم خلفي (مثل Node.js) يتعامل مع هذا الطلب
      // ويستخدم رمز البوت الخاص بك لإرسال رسالة إلى الديسكورد.
      const response = await fetch('/api/discord-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, value, userId }),
      });

      if (!response.ok) {
        console.error('فشل إرسال إشعار الديسكورد:', response.statusText);
      }
    } catch (error) {
      console.error('خطأ في الاتصال بخادم إشعار الديسكورد:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 flex flex-col relative">
      {/* Hamburger Icon - Always visible, top-left */}
      <button
        onClick={toggleMenu}
        className="absolute top-4 left-4 z-50 p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-300 shadow-lg"
      >
        <div className="w-6 h-0.5 bg-white mb-1"></div>
        <div className="w-6 h-0.5 bg-white mb-1"></div>
        <div className="w-6 h-0.5 bg-white"></div>
      </button>

      {/* Menu Overlay/Drawer */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu} // Close menu when clicking outside
        ></div>
      )}

      {/* Menu Content (Slide-in from left) */}
      <div
        className={`fixed top-0 left-0 bg-gray-800 shadow-xl z-50 transition-transform duration-300 ease-out
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 sm:w-72 h-full p-4 flex flex-col items-start`} // Fixed width, full height, column layout
      >
        <button
          onClick={toggleMenu} // Close button inside menu
          className="self-end text-gray-400 hover:text-white text-xl p-2" // Position close button at top-right of menu
        >
          &times;
        </button>
        <div className="flex flex-col items-start space-y-4 w-full mt-8"> {/* Buttons content */}
          <button
            onClick={() => { navigateTo('admins'); }} // استخدام navigateTo مباشرة
            className="w-full text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            style={{ backgroundColor: '#1d0a47' }} // لون مخصص لزر مشرفين الكلان
          >
            مشرفين الكلان
          </button>
          <button
            onClick={() => { navigateTo('weapons'); }} // استخدام navigateTo مباشرة
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            تركيبات الأسلحة
          </button>
        </div>
      </div>

      {/* عرض الرسالة العامة */}
      {message && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
          {message}
        </div>
      )}

      {currentPage === 'landing' && (
        <LandingPage onNavigate={navigateTo} />
      )}
      {currentPage === 'weapons' && db && userId && (
        <WeaponsPage 
          db={db} 
          userId={userId} 
          setMessage={setMessage} 
          onNavigateBack={() => navigateTo('landing')} 
          notifyDiscordOfCopy={notifyDiscordOfCopy} // تمرير دالة الإشعار
        />
      )}
      {currentPage === 'admins' && db && userId && (
        <AdminsPage 
          db={db} 
          userId={userId} 
          setMessage={setMessage} 
          onNavigateBack={() => navigateTo('landing')} 
          notifyDiscordOfCopy={notifyDiscordOfCopy} // تمرير دالة الإشعار
        />
      )}

      {/* قسم Powered by Nuix في الأسفل */}
      <footer className="mt-8 text-center text-gray-400 text-sm">
        Powered by{' '}
        <a
          href="https://www.instagram.com/imis2i?igsh=MWR0dmx2MXNsN2Rycw=="
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 font-semibold transition duration-300"
        >
          Nuix
        </a>
      </footer>
    </div>
  );
};

// ********************************************************************
// ********************* مكون LandingPage ***************************
// ********************************************************************
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center relative p-4 sm:p-6"> {/* تم إضافة p-4 sm:p-6 هنا */}
      {/* Hamburger Icon is now in App.jsx, so remove it from here */}

      {/* Main Page Content Group */}
      <div className="flex flex-col items-center justify-center flex-grow px-4 w-full">
        {/* الصورة الجديدة فوق النص */}
        <img
          src="/Arcclan.png" // اسم الصورة من مجلد public
          alt="شعار كلان Arc"
          className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto mb-8 rounded-lg object-contain select-none" // تحديد الحجم والمحاذاة ومنع التحديد
          style={{ aspectRatio: '3 / 1' }} // نسبة العرض إلى الارتفاع 3:1
          onContextMenu={(e) => e.preventDefault()} // منع تنزيل الصورة
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/768x256/1a202c/e2e8f0?text=Arcclan+Logo`; // صورة بديلة
          }}
        />

        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed select-none"> {/* منع تحديد النص */}
          اهلا وسهلا في موقع كلان Arc من هنا يمكنلك الحصول على كل معلومات التي تفيدك اذا كنت تريد عرض مشرفين الكلان او تركيبات الاسلحة اضغط على 3 خطوط في زاوية واذا كنت تريد الانظمام زر ديسكورد موجود في الاسفل اضغط عليه وسيتم ضمك الى سيرفر الكلان
        </p>

        {/* Discord Button (remains at the bottom) */}
        <a
          href="https://discord.gg/AJwSfEntT4"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-2xl text-center transition duration-300 ease-in-out transform hover:scale-105 shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md" /* Added responsive widths */
        >
          الديسكورد
        </a>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون WeaponsPage ****************************
// ********************************************************************
const WeaponsPage = ({ db, userId, setMessage, onNavigateBack, notifyDiscordOfCopy }) => {
  const [weapons, setWeapons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWeapons, setFilteredWeapons] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showAddWeaponModal, setShowAddWeaponModal] = useState(false);
  const [showDeleteWeaponModal, setShowDeleteWeaponModal] = useState(false);
  const [showDevConfirmModal, setShowDevConfirmModal] = useState(false);
  const clickTimerRef = useRef(null);
  const [copyCooldown, setCopyCooldown] = useState(false); // حالة Cooldown

  // جلب الأسلحة من Firestore
  useEffect(() => {
    const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
    const weaponsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/weapons`);

    const unsubscribeWeapons = onSnapshot(weaponsCollectionRef, (snapshot) => {
      const weaponsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWeapons(weaponsData);
    }, (error) => {
      console.error("خطأ في جلب الأسلحة:", error);
      setMessage('فشل تحميل الأسلحة.');
    });

    return () => {
      unsubscribeWeapons();
    };
  }, [db, userId, setMessage]);

  // تصفية الأسلحة بناءً على مصطلح البحث
  useEffect(() => {
    setFilteredWeapons(
      weapons.filter((weapon) =>
        weapon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, weapons]);

  // التعامل مع تفعيل وضع المطور
  const handleTitleClick = () => {
    setClickCount(prevCount => prevCount + 1);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 20000); // 20 ثانية

    if (clickCount + 1 >= 5) {
      setShowDevConfirmModal(true); // إظهار نافذة تأكيد المطور
      setClickCount(0); // إعادة تعيين العدد
      clearTimeout(clickTimerRef.current); // مسح المؤقت فورًا
    }
  };

  // دالة لنسخ النص إلى الحافظة مع Cooldown
  const copyToClipboard = (text, type) => {
    if (copyCooldown) {
      setMessage('الرجاء الانتظار قبل النسخ مرة أخرى.');
      return;
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setMessage('تم النسخ!');

      setCopyCooldown(true);
      setTimeout(() => setCopyCooldown(false), 3000); // 3 ثواني Cooldown

      // إرسال إشعار للديسكورد
      notifyDiscordOfCopy(type, text, userId);

      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('فشل نسخ النص: ', err);
      setMessage('فشل النسخ.');
    }
  };

  // دالة إضافة سلاح
  const addWeapon = async (newWeapon) => {
    if (!db) {
      setMessage('قاعدة البيانات غير جاهزة.');
      return;
    }
    try {
      const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
      await addDoc(collection(db, `artifacts/${currentAppId}/public/data/weapons`), newWeapon);
      setMessage('تمت إضافة السلاح بنجاح!');
      setShowAddWeaponModal(false);
    } catch (e) {
      console.error("خطأ في إضافة المستند: ", e);
      setMessage('فشل إضافة السلاح.');
    }
  };

  // دالة حذف سلاح
  const deleteWeapon = async (weaponId) => {
    if (!db) {
      setMessage('قاعدة البيانات غير جاهزة.');
      return;
    }
    try {
      const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
      await deleteDoc(doc(db, `artifacts/${currentAppId}/public/data/weapons`, weaponId));
      setMessage('تم حذف السلاح بنجاح!');
      setShowDeleteWeaponModal(false);
    } catch (e) {
      console.error("خطأ في حذف المستند: ", e);
      setMessage('فشل حذف السلاح.');
    }
  };

  // دالة لتأكيد رمز المطور (الآن الرمز ثابت في الكود)
  const handleDevConfirm = (code) => {
    const HARDCODED_DEV_CODE = '2007122'; // الرمز الثابت
    if (code === HARDCODED_DEV_CODE) {
      setIsDeveloperMode(true);
      setShowDevConfirmModal(false);
      setMessage('تم تفعيل وضع المطور بنجاح!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('رمز المطور غير صحيح.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-grow relative">
      {/* زر الرجوع - Moved to top-right */}
      <button
        onClick={onNavigateBack}
        className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-110 shadow-lg flex items-center justify-center w-12 h-12"
      >
        &larr; {/* سهم الرجوع فقط */}
      </button>

      {/* Header Section */}
      <header className="mb-8 text-center">
        <h1
          className="text-3xl sm:text-4xl font-bold text-green-400 mb-4 cursor-pointer select-none"
          onClick={handleTitleClick}
        >
          تركيبات الأسلحة
        </h1>
      </header>

      {/* أزرار وضع المطور */}
      {isDeveloperMode && (
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowAddWeaponModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            إضافة سلاح
          </button>
          <button
            onClick={() => setShowDeleteWeaponModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            حذف سلاح
          </button>
        </div>
      )}

      {/* شريط البحث */}
      <div className="mb-8 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="ابحث عن سلاح..."
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* شبكة بطاقات الأسلحة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
        {filteredWeapons.length > 0 ? (
          filteredWeapons.map((weapon) => (
            <WeaponCard 
              key={weapon.id} 
              weapon={weapon} 
              copyToClipboard={copyToClipboard} 
              isCopyCooldown={copyCooldown} // تمرير حالة الكول داون
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-xl">
            انتظر بعض الثواني لتحميل الاسلحة
          </p>
        )}
      </div>

      {/* نافذة إضافة سلاح */}
      {showAddWeaponModal && (
        <AddWeaponModal
          onClose={() => setShowAddWeaponModal(false)}
          onAddWeapon={addWeapon}
        />
      )}

      {/* نافذة حذف سلاح */}
      {showDeleteWeaponModal && (
        <DeleteWeaponModal
          onClose={() => setShowDeleteWeaponModal(false)}
          onDeleteWeapon={deleteWeapon}
          weapons={weapons}
        />
      )}

      {/* نافذة تأكيد المطور */}
      {showDevConfirmModal && (
        <DeveloperConfirmationModal
          onClose={() => setShowDevConfirmModal(false)}
          onConfirm={handleDevConfirm}
          isLoading={false} 
        />
      )}
    </div>
  );
};

// ********************************************************************
// ********************* مكون AdminCard ******************************
// ********************************************************************
const AdminCard = ({ admin, copyToClipboard, isCopyCooldown }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col">
      {/* صورة المشرف */}
      <div className="w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden rounded-t-xl">
        <img
          src={admin.imageUrl}
          alt={admin.personalName || admin.name} // استخدام personalName أو name كبديل
          className="object-cover w-full h-full"
          onContextMenu={(e) => e.preventDefault()} // منع تنزيل الصورة
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x150/1a202c/e2e8f0?text=${admin.personalName || admin.name}`;
          }}
        />
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* اسم المشرف ومستواه */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-green-300">{admin.personalName || admin.name}</h2> {/* استخدام personalName أو name كبديل */}
          <span className="text-sm text-gray-400">
            المستوى: {admin.level}
          </span>
        </div>

        {/* معلومات المشرف */}
        <div className="grid grid-cols-1 gap-2 text-sm text-gray-300 mb-4">
          <p>
            <span className="font-medium text-gray-200">اسم اللعبة:</span> {admin.gameName || 'غير متوفر'}
          </p> 
          <p>
            <span className="font-medium text-gray-200">الأيدي:</span> {admin.adminId}
          </p>
          <p>
            <span className="font-medium text-gray-200">الديسكورد:</span>{' '} {/* تغيير التسمية هنا */}
            <a 
              href={admin.discordUrl} // استخدام discordUrl هنا
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline break-all"
            >
              {admin.discordUrl ? admin.discordUrl.split('/').pop().split('?')[0] : 'غير متوفر'}
            </a>
          </p>
        </div>

        {/* زر نسخ الأيدي */}
        <button
          onClick={() => copyToClipboard(admin.adminId, 'admin_id')} // تمرير نوع المحتوى
          className={`w-full bg-green-600 ${isCopyCooldown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md`}
          disabled={isCopyCooldown}
        >
          نسخ الأيدي
        </button>

        {/* عرض الأيدي تحت زر النسخ */}
        <p className="text-xs text-gray-500 mt-2 break-all">
          {admin.adminId}
        </p>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون AdminsPage *****************************
// ********************************************************************
const AdminsPage = ({ db, userId, setMessage, onNavigateBack, notifyDiscordOfCopy }) => {
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
  const [showDevConfirmModal, setShowDevConfirmModal] = useState(false);
  const clickTimerRef = useRef(null);
  const [copyCooldown, setCopyCooldown] = useState(false); // حالة Cooldown

  // جلب المشرفين من Firestore
  useEffect(() => {
    const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
    const adminsCollectionRef = collection(db, `artifacts/${currentAppId}/public/data/admins`);

    const unsubscribeAdmins = onSnapshot(adminsCollectionRef, (snapshot) => {
      const adminsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(adminsData);
    }, (error) => {
      console.error("خطأ في جلب المشرفين:", error);
      setMessage('فشل تحميل المشرفين.');
    });

    return () => {
      unsubscribeAdmins();
    };
  }, [db, userId, setMessage]);

  // تصفية المشرفين بناءً على مصطلح البحث (يمكن البحث بالاسم أو الأيدي أو اسم اللعبة)
  useEffect(() => {
    setFilteredAdmins(
      admins.filter((admin) =>
        (admin.personalName || admin.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.adminId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (admin.gameName || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, admins]);

  // التعامل مع تفعيل وضع المطور
  const handleTitleClick = () => {
    setClickCount(prevCount => prevCount + 1);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 20000); // 20 ثانية

    if (clickCount + 1 >= 5) {
      setShowDevConfirmModal(true); // إظهار نافذة تأكيد المطور
      setClickCount(0); // إعادة تعيين العدد
      clearTimeout(clickTimerRef.current); // مسح المؤقت فورًا
    }
  };

  // دالة لنسخ النص إلى الحافظة مع Cooldown
  const copyToClipboard = (text, type) => {
    if (copyCooldown) {
      setMessage('الرجاء الانتظار قبل النسخ مرة أخرى.');
      return;
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setMessage('تم النسخ!');

      setCopyCooldown(true);
      setTimeout(() => setCopyCooldown(false), 3000); // 3 ثواني Cooldown

      // إرسال إشعار للديسكورد
      notifyDiscordOfCopy(type, text, userId);

      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      console.error('فشل نسخ النص: ', err);
      setMessage('فشل النسخ.');
    }
  };

  // دالة إضافة مشرف
  const addAdmin = async (newAdmin) => {
    if (!db) {
      setMessage('قاعدة البيانات غير جاهزة.');
      return;
    }
    try {
      const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
      await addDoc(collection(db, `artifacts/${currentAppId}/public/data/admins`), newAdmin);
      setMessage('تمت إضافة المشرف بنجاح!');
      setShowAddAdminModal(false);
    } catch (e) {
      console.error("خطأ في إضافة المستند: ", e);
      setMessage('فشل إضافة المشرف.');
    }
  };

  // دالة حذف مشرف
  const deleteAdmin = async (adminId) => {
    if (!db) {
      setMessage('قاعدة البيانات غير جاهزة.');
      return;
    }
    try {
      const currentAppId = "1:359841865848:web:d2799f32da4747709a0d8d"; // تم وضع appId مباشرة هنا
      await deleteDoc(doc(db, `artifacts/${currentAppId}/public/data/admins`, adminId));
      setMessage('تم حذف المشرف بنجاح!');
      setShowDeleteAdminModal(false);
    } catch (e) {
      console.error("خطأ في حذف المستند: ", e);
      setMessage('فشل حذف المشرف.');
    }
  };

  // دالة لتأكيد رمز المطور (الآن الرمز ثابت في الكود)
  const handleDevConfirm = (code) => {
    const HARDCODED_DEV_CODE = '2007122'; // الرمز الثابت
    if (code === HARDCODED_DEV_CODE) {
      setIsDeveloperMode(true);
      setShowDevConfirmModal(false);
      setMessage('تم تفعيل وضع المطور بنجاح!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setMessage('رمز المطور غير صحيح.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="flex flex-col flex-grow relative">
      {/* زر الرجوع - Moved to top-right */}
      <button
        onClick={onNavigateBack}
        className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white text-2xl font-bold p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-110 shadow-lg flex items-center justify-center w-12 h-12"
      >
        &larr; {/* سهم الرجوع فقط */}
      </button>

      {/* Header Section */}
      <header className="mb-8 text-center">
        <h1
          className="text-3xl sm:text-4xl font-bold text-green-400 mb-4 cursor-pointer select-none"
          onClick={handleTitleClick}
        >
          مشرفين الكلان
        </h1>
      </header>

      {/* أزرار وضع المطور */}
      {isDeveloperMode && (
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowAddAdminModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            إضافة مشرف
          </button>
          <button
            onClick={() => setShowDeleteAdminModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            حذف مشرف
          </button>
        </div>
      )}

      {/* شريط البحث */}
      <div className="mb-8 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="ابحث عن مشرف..."
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* شبكة بطاقات المشرفين */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
        {filteredAdmins.length > 0 ? (
          filteredAdmins.map((admin) => (
            <AdminCard 
              key={admin.id} 
              admin={admin} 
              copyToClipboard={copyToClipboard} 
              isCopyCooldown={copyCooldown} // تمرير حالة الكول داون
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-xl">
            انتظر بعض الثواني لتحميل المشرفين
          </p>
        )}
      </div>

      {/* نافذة إضافة مشرف */}
      {showAddAdminModal && (
        <AddAdminModal
          onClose={() => setShowAddAdminModal(false)}
          onAddAdmin={addAdmin}
        />
      )}

      {/* نافذة حذف مشرف */}
      {showDeleteAdminModal && (
        <DeleteAdminModal
          onClose={() => setShowDeleteAdminModal(false)}
          onDeleteAdmin={deleteAdmin}
          admins={admins}
        />
      )}

      {/* نافذة تأكيد المطور */}
      {showDevConfirmModal && (
        <DeveloperConfirmationModal
          onClose={() => setShowDevConfirmModal(false)}
          onConfirm={handleDevConfirm}
          isLoading={false} 
        />
      )}
    </div>
  );
};

// ********************************************************************
// ********************* مكون WeaponCard ******************************
// ********************************************************************
const WeaponCard = ({ weapon, copyToClipboard, isCopyCooldown }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col">
      {/* صورة السلاح */}
      <div className="w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden rounded-t-xl">
        <img
          src={weapon.imageUrl}
          alt={weapon.name}
          className="object-cover w-full h-full"
          onContextMenu={(e) => e.preventDefault()} // منع تنزيل الصورة
          onError={(e) => {
            e.target.onerror = null; // منع حلقة لا نهائية
            e.target.src = `https://placehold.co/300x150/1a202c/e2e8f0?text=${weapon.name}`; // صورة بديلة احتياطية
          }}
        />
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* اسم السلاح ومستواه */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-green-300">{weapon.name}</h2>
          <span className="text-sm text-gray-400">
            المستوى: {weapon.level}
          </span>
        </div>

        {/* إحصائيات السلاح */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-4">
          {/* ترتيب الإحصائيات في العرض */}
          <p>
            <span className="font-medium text-gray-200">الضرر:</span> {weapon.damage}
          </p>
          <p>
            <span className="font-medium text-gray-200">النطاق:</span> {weapon.range}
          </p>
          <p>
            <span className="font-medium text-gray-200">التحكم:</span> {weapon.control}
          </p>
          <p>
            <span className="font-medium text-gray-200">المعالجة:</span> {weapon.accuracy}
          </p>
          <p>
            <span className="font-medium text-gray-200">الاستقرار:</span> {weapon.stability}
          </p>
          <p>
            <span className="font-medium text-gray-200">دقة:</span> {weapon.model}
          </p>
        </div>

        {/* زر نسخ الكود */}
        <button
          onClick={() => copyToClipboard(weapon.code, 'weapon_code')} // تمرير نوع المحتوى
          className={`w-full bg-green-600 ${isCopyCooldown ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'} text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md`}
          disabled={isCopyCooldown}
        >
          نسخ الكود
        </button>

        {/* عرض كود السلاح (اختياري، للتصحيح/الرؤية) */}
        <p className="text-xs text-gray-500 mt-2 break-all">
          {weapon.code}
        </p>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون AddWeaponModal *************************
// ********************************************************************
const AddWeaponModal = ({ onClose, onAddWeapon }) => {
  const [newWeapon, setNewWeapon] = useState({
    name: '',
    level: '',
    damage: '',
    range: '',
    control: '',
    model: '',
    stability: '',
    accuracy: '',
    code: '',
    imageUrl: '',
  });

  // تحديد الترتيب الجديد للحقول
  const fieldOrder = [
    'name',
    'level',
    'damage',
    'range',
    'control',
    'model',
    'stability',
    'accuracy',
    'code',
    'imageUrl',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewWeapon(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // تحويل الحقول الرقمية إلى أرقام
    const weaponToAdd = {
      ...newWeapon,
      damage: Number(newWeapon.damage),
      range: Number(newWeapon.range),
      control: Number(newWeapon.control),
      stability: Number(newWeapon.stability),
      accuracy: Number(newWeapon.accuracy),
      level: Number(newWeapon.level),
      model: Number(newWeapon.model), // Model field was converted to number
    };
    onAddWeapon(weaponToAdd);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg my-auto">
        <h2 className="text-2xl font-bold text-green-400 mb-4">إضافة سلاح جديد</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {fieldOrder.map((key) => (
            <div key={key}>
              <label htmlFor={key} className="block text-gray-300 text-sm font-bold mb-1">
                {key === 'name' && 'الاسم'}
                {key === 'level' && 'المستوى'}
                {key === 'damage' && 'الضرر'}
                {key === 'range' && 'النطاق'}
                {key === 'control' && 'التحكم'}
                {key === 'model' && 'الموديل'}
                {key === 'stability' && 'الثبات'}
                {key === 'accuracy' && 'الدقة'}
                {key === 'code' && 'الكود'}
                {key === 'imageUrl' && 'رابط الصورة'}
              </label>
              <input
                type={['damage', 'range', 'control', 'stability', 'accuracy', 'level', 'model'].includes(key) ? 'number' : 'text'}
                id={key}
                name={key}
                value={newWeapon[key]}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون DeleteWeaponModal ***********************
// ********************************************************************
const DeleteWeaponModal = ({ onClose, onDeleteWeapon, weapons }) => {
  const [selectedWeaponId, setSelectedWeaponId] = useState('');

  const handleDelete = () => {
    if (selectedWeaponId) {
      onDeleteWeapon(selectedWeaponId);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-red-400 mb-4">حذف سلاح</h2>
        <div className="mb-4">
          <label htmlFor="select-weapon" className="block text-gray-300 text-sm font-bold mb-1">
            اختر سلاحاً للحذف:
          </label>
          <select
            id="select-weapon"
            value={selectedWeaponId}
            onChange={(e) => setSelectedWeaponId(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- اختر سلاحاً --</option>
            {weapons.map((weapon) => (
              <option key={weapon.id} value={weapon.id}>
                {weapon.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedWeaponId}
            className={`font-bold py-2 px-4 rounded-lg transition duration-300 ${
              selectedWeaponId ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون AddAdminModal **************************
// ********************************************************************
const AddAdminModal = ({ onClose, onAddAdmin }) => {
  const [newAdmin, setNewAdmin] = useState({
    personalName: '',
    gameName: '',
    adminId: '',
    level: '',
    discordUrl: '', // تم تغيير instagramUrl إلى discordUrl
    imageUrl: '',
  });

  const fieldOrder = [
    'personalName',
    'gameName',
    'adminId',
    'level',
    'discordUrl', // تم تغيير instagramUrl إلى discordUrl
    'imageUrl',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminToAdd = {
      ...newAdmin,
      level: Number(newAdmin.level),
    };
    onAddAdmin(adminToAdd);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg my-auto">
        <h2 className="text-2xl font-bold text-green-400 mb-4">إضافة مشرف جديد</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {fieldOrder.map((key) => (
            <div key={key}>
              <label htmlFor={key} className="block text-gray-300 text-sm font-bold mb-1">
                {key === 'personalName' && 'الاسم الشخصي'}
                {key === 'gameName' && 'اسم اللعبة'}
                {key === 'adminId' && 'الأيدي'}
                {key === 'level' && 'المستوى'}
                {key === 'discordUrl' && 'رابط الديسكورد'}
                {key === 'imageUrl' && 'رابط الصورة'}
              </label>
              <input
                type={key === 'level' ? 'number' : 'text'}
                id={key}
                name={key}
                value={newAdmin[key]}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون DeleteAdminModal ***********************
// ********************************************************************
const DeleteAdminModal = ({ onClose, onDeleteAdmin, admins }) => {
  const [selectedAdminId, setSelectedAdminId] = useState('');

  const handleDelete = () => {
    if (selectedAdminId) {
      onDeleteAdmin(selectedAdminId);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-red-400 mb-4">حذف مشرف</h2>
        <div className="mb-4">
          <label htmlFor="select-admin" className="block text-gray-300 text-sm font-bold mb-1">
            اختر مشرفاً للحذف:
          </label>
          <select
            id="select-admin"
            value={selectedAdminId}
            onChange={(e) => setSelectedAdminId(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- اختر مشرفاً --</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.personalName || admin.name} ({admin.adminId})
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!selectedAdminId}
            className={`font-bold py-2 px-4 rounded-lg transition duration-300 ${
              selectedAdminId ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

// ********************************************************************
// ********************* مكون DeveloperConfirmationModal *************
// ********************************************************************
const DeveloperConfirmationModal = ({ onClose, onConfirm, isLoading }) => {
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim() === '') {
      setError('الرجاء إدخال الرمز.');
      return;
    }
    onConfirm(inputCode);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-green-400 mb-4">تأكيد المطور</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="dev-code" className="block text-gray-300 text-sm font-bold mb-1">
                الرجاء إدخال رمز المطور:
              </label>
              <input
                type="password"
                id="dev-code"
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setError('');
                }}
                required
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                تأكيد
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default App;
