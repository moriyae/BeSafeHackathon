The Guardian Database Documentation (MongoDB)
This document outlines the Database architecture, naming conventions, and data retention policies for the BeSafe project.

📊 Collections Structure
users
Stores child profiles, login credentials, and parental contact links.

child_email (String): Unique Username. Used as the primary login identifier.

child_name (String): Full name of the child.

password_hash (String): Secure hashed password.

type (String): User role (default: "child").

consecutive_low_emotions (Number): Counter for the 7-session alert logic (0-7).

is_approved (Boolean): Parental consent status.

parent_info (Object):

parent_name (String)

parent_email (String): Destination for emergency alerts.

parent_phone (String)

metadata (Object):

created_at (Date): Registration timestamp.

last_login (Date): Used for the 14-day inactivity reset logic.

daily_logs
Stores daily emotional reports and calculated distress scores.

child_id (ObjectId): Reference to the _id in the users collection.

daily_score (Number): The calculated distress score for the session (based on weighted MCQ answers).

answers (Array of Numbers): IDs of selected options (e.g., [3, 1, 4, 2]).

log_text (String): Optional free text input.

metadata (Object):

created_at (Date): Timestamp used by the TTL index for auto-deletion.

questions
Central repository for the multiple-choice questions managed by the DB admin.

question_id (Number): Unique ID for each question.

question_text (String): The question shown to the user.

options (Array of Objects): List of answers containing option_id and text.

category (String): emotional / social / school / safety.

is_active (Boolean): Toggle to show/hide questions in the app.

🧠 Scoring & Alert Logic
1. Daily Score Calculation
The daily_score is calculated by the Backend by summing the weights of the selected option_ids in the answers array:

Option 1: 0 points (Positive)

Option 2: 1 point (Neutral-Positive)

Option 3: 3 points (Neutral-Negative)

Option 4: 5 points (High Distress)

2. 7-Day Alert Trigger
Threshold: A session is considered a "Distress Day" if the daily_score is 8 or higher.

Counter:

If daily_score >= 8: Increment consecutive_low_emotions by 1.

If daily_score < 8: Reset consecutive_low_emotions to 0.

Action: When the counter reaches 7, an automated email alert is sent to the parent_email.

🔐 Schema Validation Rules
Users Validation
Email Integrity: child_email and parent_email must follow standard email patterns.

Range Protection: consecutive_low_emotions is restricted to an integer between 0 and 7.

Uniqueness: child_email is a unique index to prevent duplicate accounts.

Daily Logs Validation
Integrity: Each log must be linked to a valid child_id.

Score Validation: daily_score must be a positive integer (Int32).

Removed: emotion_level field is no longer required as of v1.1.

⏳ Data Retention Policy (TTL)
Privacy First: Documents in the daily_logs collection are automatically deleted 30 days after creation.

Mechanism: This is handled by a MongoDB TTL Index on the metadata.created_at field.