// Footer for all emails
const footer = `<p style="font-size: 12px; color: #777; margin-top: 20px;">הודעה זו נשלחה אוטומטית ממערכת The Guardian.</p>`;

exports.verification = (code) => `
    <div dir="rtl" style="font-family: Arial;">
        <h3>קוד האימות שלכם הוא: <b style="color:blue;">${code}</b></h3>
        ${footer}
    </div>
`;

exports.parentAlert = (childName, reason) => `
    <div dir="rtl" style="font-family: Arial; border: 1px solid #d9534f; padding: 15px; border-radius: 8px;">
        <h2 style="color: #d9534f;">שלום רב,</h2>
        <p>מערכת <b>The Guardian</b> זיהתה מדדי מצוקה המצריכים תשומת לב עבור <b>${childName}</b>.</p>
        <p>סיבת ההתראה: <b>${reason}</b>.</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-right: 5px solid #5bc0de; margin: 20px 0;">
            <p style="margin: 0; color: #333;">
                <b>המלצה לפנייה עדינה:</b> נסו לומר: "הרגשתי שמשהו אולי עובר עליך לאחרונה, אני כאן אם תרצה/י לשתף במשהו". 
                תנו לילד/ה את המקום להוביל את השיחה ולשתף בקצב שלהם.
            </p>
        </div>
        <p>מומלץ לקיים שיחה פתוחה ותומכת בהקדם.</p>
        ${footer}
    </div>
`;

exports.childSupport = (childName) => `
    <div dir="rtl" style="font-family: Arial; background-color: #f0f8ff; padding: 15px; border-radius: 8px;">
        <h2 style="color: #2e6da4;">היי ${childName},</h2>
        <p>שמנו לב שבימים האחרונים קצת פחות קל לך.</p>
        <p>אנחנו מאמינים ששיתוף של מבוגר שסומכים עליו יכול להקל מאוד על ההרגשה. לכן, שלחנו עדכון קטן להורים שלך כדי שהם יוכלו להיות שם בשבילך ולתת לך את התמיכה שמגיעה לך.</p>
        <div style="background-color: #eef7fa; padding: 15px; border-radius: 5px; margin: 15px 0; color: #31708f;">
            <b>טיפ מאיתנו:</b> לפעמים פשוט להתחיל ב"אפשר לדבר?" עושה את כל ההבדל. 💙
        </div>
        <p>זכור/י שאת/ה לא לבד!</p>
        ${footer}
    </div>
`;

exports.emergency = () => `
    <div dir="rtl" style="font-family: Arial;">
        <h2 style="color: red;">התראה דחופה</h2>
        <p>זוהתה בטקסט החופשי של הילד <b>רמת מצוקה גבוהה במיוחד</b>.</p>
        <p>מומלץ לפעול בהקדם ולבחון את מצבו הרגשי.</p>
        ${footer}
    </div>
`;