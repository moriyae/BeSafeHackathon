# 🛡️ The Guardian: Database Documentation (v1.3)

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
* **answers (Array of Numbers):** The raw values selected by the user (e.g., [1, 4, 7]).
* **log_text (String):** Optional free text input.
* **metadata (Object):**
    * **created_at (Date):** Timestamp (used for the 4/7 day logic and TTL).

#### **3. questions**
*Central repository for MCQ managed by the admin with strict validation.*

* **question_id (Int):** Unique numeric identifier (BSON Integer).
* **question_text (String):** The text shown to the child.
* **category (Enum):** `emotional`, `social`, `school`, `safety`.
* **is_active (Boolean):** Toggle to show/hide questions in the app.
* **options (Array of Objects):** Defines the 1-7 scale.
    * **option_id (Int):** Numeric value of the selection.
    * **text (String):** Display label for the option.

---

### 🧠 Scoring & Alert Logic (Dynamic System)

#### **Daily Score & Average**
To ensure the system is **scalable**, we use a **Weighted Average** based on the 1-7 scale answers.

1.  **Weights Assignment:**
    * **Value 1 (High Distress):** 7 points
    * **Value 4 (Neutral):** 4 points
    * **Value 7 (
