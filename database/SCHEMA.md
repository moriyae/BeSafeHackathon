# 🛡️ The Guardian: Database Documentation (v1.2)

### 📊 Collections Structure

#### **1. Users**
*Stores child profiles, login credentials, and parental contact links.*

* **child_email (String):** Unique Username. Primary login identifier.
* **child_name (String):** Display name of the child.
* **password (String):** Secure hashed password (bcrypt).
* **consecutive_low_emotions (Number):** Counter for the 3-day consecutive alert logic (0-3).
* **isVerified (Boolean):** Status of parental email verification.
* **Verification_code (String):** 6-digit code for account activation.
* **parent_email (String):** Destination for emergency alerts and verification.
* **parent_info (Object):**
    * **parent_email (String)**
* **metadata (Object):**
    * **created_at (Date):** Registration timestamp.

#### **2. daily_logs (JournalAnswers)**
*Stores daily emotional reports and weighted scores.*

* **child_id (String/ObjectId):** Reference to the user who submitted the log.
* **daily_score (Number):** The **sum** of weights for that session.
* **answers (Array of Numbers):** The raw values selected by the user (e.g., [1, 4, 2]).
* **log_text (String):** Optional free text input.
* **metadata (Object):**
    * **created_at (Date):** Timestamp (used for the 4/7 day logic and TTL).

#### **3. questions**
*Central repository for MCQ managed by the admin.*

* **question_text (String):** The text shown to the child.
* **is_active (Boolean):** Toggle to show/hide questions in the app.

---

### 🧠 Scoring & Alert Logic (Dynamic System)

#### **Daily Score & Average**
To ensure the system is **scalable** (works with any number of questions), we use a **Weighted Average** instead of a fixed sum.

1.  **Weights Assignment:**
    * **1 (High Distress):** 7 points
    * **4 (Neutral):** 4 points
    * **7 (Positive):** 0 points
2.  **Calculation:** $$Average = \frac{Total Score}{Number of Answers}$$
3.  **Distress Definition:** A session is flagged as a **"Distress Day"** if the $$Average \ge 4.25$$.

#### **Alert Trigger (The Hybrid Rule)**
An automated email is sent to the parent if **EITHER** condition is met:
1.  **The Streak Rule:** `consecutive_low_emotions` $\ge 3$ (Three consecutive Distress Days).
2.  **The 4/7 Rule:** The system detects $\ge 4$ Distress Days within the last 7 calendar days.

---

### 🔐 Schema Validation & Privacy

* **Email Integrity:** Both `child_email` and `parent_email` must follow standard patterns.
* **Data Retention (TTL):** To protect child privacy, documents in `daily_logs` are automatically deleted **30 days** after creation using a MongoDB TTL Index on `metadata.created_at`.
* **Dynamic Thresholds:** By using averages, the backend remains compatible with future changes to the number of questions without requiring code updates.
