# KaNeXT Product Knowledge Base

---

## 1. What is KaNeXT?

KaNeXT is an institutional technology company. It builds and operates the digital infrastructure that institutions run on. Sports programs, universities, businesses, churches, and individuals. The company is headquartered in Miami, Florida. The founder and CEO is Oluwadara Samuel Kalejaiye.

KaNeXT operates across three business layers. The first is the School Network. These are institutions KaNeXT owns or controls through Institutional Operating Agreements, starting with Florida Memorial University. The second is the Governing Body Mandate. These are exclusive agreements with athletic governing bodies that deploy KaNeXT across all member schools. The third is the Platform. This is KaNeXT OS, the application that powers everything.

## 2. What is KaNeXT OS?

KaNeXT OS is the application. It is a single app that serves as the complete operating system for any institution. Every user holds one account with one identity, one wallet, one phone number, and one set of credentials. That single account operates across every institution the user belongs to simultaneously.

The app is organized around brands. A brand is any entity a user operates within. A basketball team, a company, a church, a school, or their own personal identity. Users can belong to multiple brands across multiple modes. The five modes are Sports, Business, Community, Education, and Personal. Each brand lives in a mode, and the mode determines which tools appear in the interface. When a user switches brands, the mode follows automatically.

Every mode includes native communication (messaging, voice calls, email), native financial infrastructure (wallet, payments, commerce), native media (video streaming, content distribution), and native AI (Nexus, the intelligence layer that executes tasks within the user's authority). These are not integrations or third-party tools. They are built into the system.

Role-based access control governs what every user can see and do. The same brand looks different depending on the user's role. A coach sees full roster data, recruiting pipelines, scouting reports, and intelligence tools. A player sees their own stats, schedule, and team communication. A parent sees game schedules, highlights, and their child's public information. The system enforces these boundaries automatically through a four-dimensional RBAC framework that controls authority, scope, visibility, and decision rights. No one configures permissions manually. They are determined by the user's role within each brand.

---

## 3. Role-Based Access Control (RBAC)

Every user in KaNeXT has a role within each brand they belong to. That role determines what they can see, what they can do, and what actions they can take. Two users can open the same screen inside the same brand and see completely different things based on their role. The system enforces this automatically. There is no settings page where permissions are configured manually. The role defines the experience.

RBAC is invisible to the user. There are no role badges, no "admin view" labels, no toggle between front and back facing views. The interface is the same for everyone. The content changes based on who you are.

Every role is defined across four dimensions.

Authority controls the organizational tier of the role, from observer to institutional leadership. Scope controls how far the role's reach extends, from personal (self only) to global (entire organization). Visibility controls what data the role can access, from minimal public information to full institutional data. Decision controls what actions the role can take, from view only to high-impact actions like approving financial transactions or executing institutional agreements.

Every mode has its own role hierarchy. The roles are different because the institutions are different. A basketball program has coaches, players, and scouts. A business has owners, employees, and clients. A church has pastors, ministry leaders, and members. But the four-dimensional structure is the same across all of them.

### Sports Mode Roles (R0-R13)

| Role | Title | Authority | Scope | Visibility | Decision |
|------|-------|-----------|-------|------------|----------|
| R0 | System Owner | 5 | Global | Full | Full |
| R1 | Institution Leadership / HC / GM | 5 | Global | Full | Full |
| R2 | Athletic Director | 4 | Domain | High | High |
| R3 | Head Coach / GM | 4 | Domain | High | High |
| R4 | Assistant Coach | 3 | Program | Moderate | Moderate |
| R5 | Medical / Performance / External | 3 | Specialized | Specialized | Limited |
| R6 | Academic / Compliance | 3 | Specialized | Specialized | Limited |
| R7 | Housing / Operations | 2 | Specialized | Limited | Limited |
| R8 | Player | 2 | Personal | Self + Team Public | Self |
| R9 | Family / Advisor | 1 | Personal | View Only (child) | None |
| R10 | Student (non-athlete) | 1 | Personal | Public | None |
| R11 | Fan | 1 | Public | Public | None |
| R12 | Booster / Donor / NIL | 1 | Public | Public + Giving | Giving |
| R13 | Agent / Scout (external) | 1 | Restricted | Restricted | None |

### Business Mode Roles (R0-R11)

| Role | Title | Authority | Scope | Visibility | Decision |
|------|-------|-----------|-------|------------|----------|
| R0 | System Owner | 5 | Global | Full | Full |
| R1 | CEO / Owner | 5 | Global | Full | Full |
| R2 | C-Suite / Partner | 4 | Global | Full | High |
| R3 | VP / Director | 4 | Domain | High | High |
| R4 | Manager / Team Lead | 3 | Department | Moderate | Moderate |
| R5 | Employee | 2 | Team | Team + Self | Limited |
| R6 | Finance / HR / Legal | 3 | Specialized | Specialized | Specialized |
| R7 | Contractor / Freelancer | 2 | Project | Project | Limited |
| R8 | Intern | 1 | Team | Limited | Minimal |
| R9 | Client / Customer | 1 | External | Public + Own Account | Own Account |
| R10 | Vendor / Supplier | 1 | External | Transactional | Transactional |
| R11 | Visitor / Prospect | 0 | Public | Public | None |

### Education Mode Roles (R0-R12)

| Role | Title | Authority | Scope | Visibility | Decision |
|------|-------|-----------|-------|------------|----------|
| R0 | System Owner | 5 | Global | Full | Full |
| R1 | President / Chancellor | 5 | Global | Full | Full |
| R2 | Provost / VP Academic Affairs | 4 | Global | Full | High |
| R3 | Dean / Department Chair | 4 | Domain | High | High |
| R4 | Faculty / Professor | 3 | Department | Moderate | Moderate |
| R5 | Registrar / Financial Aid | 3 | Specialized | Specialized | Specialized |
| R6 | Academic Advisor / Counselor | 3 | Specialized | Specialized | Limited |
| R7 | Staff / Administration | 2 | Department | Limited | Limited |
| R8 | Student (enrolled) | 2 | Personal | Self + Class | Self |
| R9 | Parent / Guardian | 1 | Personal | View Only (child) | None |
| R10 | Prospective Student / Applicant | 1 | Public | Public + Own App | Own Application |
| R11 | Alumni | 1 | Public | Public + Own Record | Giving |
| R12 | Visitor / Guest | 0 | Public | Public | None |

### Community Mode Roles (R0-R11)

| Role | Title | Authority | Scope | Visibility | Decision |
|------|-------|-----------|-------|------------|----------|
| R0 | System Owner | 5 | Global | Full | Full |
| R1 | Senior Pastor / Executive Director | 5 | Global | Full | Full |
| R2 | Associate Pastor / Deputy Director | 4 | Global | High | High |
| R3 | Ministry Leader / Department Head | 4 | Domain | High | Moderate |
| R4 | Elder / Board Member | 3 | Advisory | High | Advisory |
| R5 | Deacon / Coordinator | 3 | Department | Moderate | Moderate |
| R6 | Volunteer Leader / Group Leader | 2 | Group | Group | Group |
| R7 | Staff (admin, facilities, comms) | 2 | Specialized | Specialized | Limited |
| R8 | Member (active) | 1 | Personal | Public + Own | Own |
| R9 | Regular Attendee (non-member) | 1 | Public | Public | Giving |
| R10 | Visitor / First-Time Guest | 0 | Public | Public | None |
| R11 | Online / Remote Participant | 1 | Public | Public + Stream | Giving |

### Personal Mode Roles (R0-R3)

| Role | Title | Authority | Scope | Visibility | Decision |
|------|-------|-----------|-------|------------|----------|
| R0 | Owner | 5 | Global | Full | Full |
| R1 | Manager / Agent | 3 | Delegated | High | Delegated |
| R2 | Moderator | 2 | Social | Social | Moderation |
| R3 | Subscriber / Follower | 0 | Public | Public | None |

### Nexus Capabilities by Role Level

Nexus is RBAC-gated. What a user can ask Nexus to do depends on their role within the active brand. The capabilities scale with authority.

| Capability | R0-R1 | R2-R3 | R4-R5 | R6-R7 | R8+ |
|------------|-------|-------|-------|-------|-----|
| Ask questions | Yes | Yes | Yes | Yes | Yes |
| Navigate the app | Yes | Yes | Yes | Yes | Yes |
| Create tasks | Yes | Yes | Yes | Yes | Limited |
| Create requests | Yes | Yes | Yes | Yes | Yes |
| Post to rooms | Yes | Yes | Yes | Limited | No |
| Summarize rooms | Yes | Yes | Limited | No | No |
| Approve or deny requests | Yes | Yes | No | No | No |
| High-impact actions | Yes | No | No | No | No |
| Cross-context search | Yes | No | No | No | No |

---

## 4. Education Mode

Education mode is the operating environment for schools, universities, and academic institutions. The demo brand is Lincoln University (Oakland, CA, founded 1919, 436 students, WSCUC accredited). Three demo roles: Dean (R3), Student (R8), Parent (R9).

Education mode home grid:

| Hub | Agenda | Social |
|-----|--------|--------|
| Campus | Admissions | Fund |
| KayTV | KayPay | KayStudios |

### 4.1 Education Hub

The Hub is the operations center and learning management system for the institution. It replaces Canvas, Blackboard, Ellucian, Panopto, the student portal, the admin dashboard, and every disconnected system a school currently uses. One screen, three tabs, RBAC determines depth. This is where the institution runs and where students do their daily academic work.

Tabs: Overview / Courses / Student Life

Side panel (swipe right or menu icon). Dean: enrollment dashboard shortcut, announcements tool, application queue, grade submission queue, accreditation checklist, registration management, faculty directory, financial overview, settings. Faculty: my courses, grade submission queue, office hours management, student roster, course builder tools, settings. Student: my schedule (today's classes), my grades shortcut, financial aid status, advisor contact, degree progress, campus directory, transcript request, settings. Parent: child's overview, tuition status, advisor contact, school directory, settings.

#### Overview Tab

**Dean View (R3):**
- Enrollment dashboard at the top. Total enrolled (436), undergraduate (204), graduate (232). Semester over semester trend line. Retention rate (89%). New applications count with status breakdown (pending, accepted, enrolled, declined).
- Financial summary cards. Tuition collected this term, outstanding balances, institutional aid distributed, revenue by program (Business Admin, Diagnostic Imaging, MBA, MS IBFM, DBA).
- Accreditation status banner. WSCUC accredited, next review date June 2026. IACBE active. Visual indicator: green (current), yellow (review approaching), red (action required).
- Announcements composer. Draft and push announcements to all students, specific departments, specific class years, or individual students. Announcements appear in recipients' Pulse feed.
- Faculty snapshot. 9 full-time, 18 part-time. Student-to-faculty ratio 15:1. Open positions if any.
- At-risk student alerts. Students flagged by the system based on attendance drops, GPA decline, missing assignments, or reduced engagement. Tap to see details and take action.
- Quick actions row: View Applications, Generate Report, Schedule Meeting, Contact Registrar.

**Faculty View (R4):**
- My courses this semester listed as cards. Each card shows course name, section, enrolled student count, next class session date/time, ungraded assignments count. Tap card to enter course (see Courses tab).
- Upcoming deadlines. Assignment due dates across all courses the faculty member teaches.
- Ungraded submissions count. Total across all courses with "Grade Now" shortcut.
- Office hours. Current schedule, upcoming appointments, edit hours.
- Announcements. Recent announcements from administration relevant to faculty.

**Student View (R8):**
- Today's schedule at the top. Class cards showing: course name, time, location, instructor name. Next class highlighted. Countdown to next class or event.
- GPA card. Current cumulative GPA (e.g., 3.4). This semester GPA. Credits completed vs credits required for degree. Visual progress bar toward graduation.
- Upcoming deadlines. Assignments, exams, registration dates, tuition due dates. Pulled from course data and institutional calendar. Sorted by urgency. Overdue items highlighted in red.
- Announcements feed. School-wide and targeted announcements from administration. Unread badge count.
- Quick actions row: View Grades, Register for Courses, Contact Advisor, Pay Tuition, Submit Maintenance Request.

**Parent View (R9):**
- FERPA consent required for academic data. Before consent: school announcements (public), campus events, emergency contacts, quick actions (Pay Tuition, Contact Financial Aid, View Event Calendar).
- After consent granted: child's schedule for today and this week (view only), child's current GPA (cumulative and this semester, course-level grades only, no individual assignment grades), upcoming important dates (tuition due, registration deadlines, academic calendar milestones), quick actions (Pay Tuition via KayPay, Contact Financial Aid, Contact Advisor, View Event Calendar).

#### Courses Tab

This is the LMS. It replaces Canvas, Blackboard, and every other learning management system. Course-centric design: tap a course to enter it, everything for that course lives inside it.

**Dean View (R3):**
- All courses across all departments listed. Each course card: course name, instructor, department, enrollment count, section count, schedule. Filter by department, term, instructor, status (active, upcoming, archived).
- Tap course to see the same course detail view as faculty but in read-only mode with additional analytics: student performance distribution, assignment completion rates, engagement metrics, grade trends.
- Department management. Department list (Business Administration, Diagnostic Imaging, Graduate Programs). Each department: chair, faculty count, enrolled students, courses offered this term, average GPA.
- Faculty management. All faculty with name, department, courses assigned, teaching load, office hours, contact. Tap faculty for full profile.
- Grade distribution. Histogram of GPA distribution across the institution. Filter by department, program, class year. Flagged students below 2.0 GPA.
- Degree audit tools. Track students' progress toward degree completion. Filter by program, class year, at-risk status.
- Course creation and management. Create new course, set schedule, assign instructor, set enrollment cap, publish to course catalog.

**Faculty View (R4):**
- My courses listed as cards. Each card: course name, section, schedule, enrolled count, ungraded count badge.
- Tap course to enter Course Detail View (the daily workspace):

**Course Detail View (Faculty):**
- Course home page. Customizable landing page with announcements, upcoming deadlines, and quick links.
- Modules. Content organized by week or unit. Each module contains: pages (text, images, embedded video from KayTV), assignments, quizzes, discussions, files. Faculty creates modules, sets order, sets prerequisites (must complete Module 1 before Module 2 unlocks). Drag to reorder.
- Assignments. Create assignment with: title, description (rich text), due date, points, submission type (file upload, text entry, URL, media recording), rubric attachment. Set availability window. Allow late submissions with penalty rules. Peer review option. View all submissions. Grade inline with annotation tools (markup PDFs, comment on text, audio/video feedback). Bulk download submissions.
- Quizzes. Create quiz with question types: multiple choice, true/false, fill in blank, matching, essay, short answer. Question banks for randomization. Set time limit, attempt limit, availability window. Auto-grade objective questions. Manual grade essays. View results and analytics (which questions students struggle with).
- Discussions. Create discussion threads per module or standalone. Threaded replies. Grade participation if desired. Pin important threads. Close discussion after date. Each discussion also creates a linked Room in Messages for real-time chat.
- Gradebook. All students in rows, all assignments in columns. Enter grades, view submission status (submitted, late, missing, graded), sort by student or assignment, filter by assignment group. Assignment groups with weights (Exams 40%, Homework 30%, Participation 20%, Quizzes 10%). Calculate running grade automatically. Export grades to CSV.
- Syllabus. Rich text page with course policies, schedule, grading breakdown, instructor info, office hours. Auto-generated assignment calendar pulled from module due dates.
- Files. Course file repository. Organize by folder. Upload documents, slides, readings. Students can access files linked in modules.
- People. Enrolled student list with name, email, profile photo, last activity, current grade. Message individual or all students. View student activity analytics.
- Analytics. Per-student engagement: page views, assignment submissions, participation, time on task. Identify students falling behind. "Message Students Who" feature (message all students who scored below X, or haven't submitted Y).
- Course settings. Grading scheme, late policy, course dates, publish/unpublish.
- Nexus integration for faculty: "Show me which students haven't submitted the midterm paper", "Draft an announcement about the deadline extension", "What is the class average on Quiz 3?"

**Student View (R8):**
- My courses listed as cards. Each card: course name, instructor, schedule, current grade (letter and percentage), next deadline. Tap course to enter Course Detail View.

**Course Detail View (Student):**
- Course home page with announcements and upcoming deadlines for this course.
- Modules. Organized content. Tap a module item to view: read a page, watch an embedded video (linked from KayTV), view assignment details, take a quiz, join a discussion. Progress indicators (completed, in progress, locked). Prerequisites enforced (cannot skip ahead if faculty set sequential modules).
- Assignments. View assignment details: description, rubric, due date, points. Submit work: upload file (documents, PDFs, images, media), text entry, URL submission, media recording (record video/audio directly). View submission status (submitted, graded, late). View grade and faculty feedback (written comments, annotated document, audio/video feedback). Resubmit if allowed.
- Quizzes. Take quiz. Timer shown if timed. One question at a time or all at once (faculty configures). Submit. View score immediately for auto-graded questions. View correct answers after due date if faculty allows. Retake if multiple attempts allowed.
- Discussions. Read and reply to threads. View classmate responses. Threaded conversations. Linked Room in Messages for real-time discussion.
- Grades. All assignments with grades, sorted by assignment group. Running course grade. "What-If" calculator: enter hypothetical grades on upcoming assignments to see projected final grade ("If I get 85% on the final, my course grade will be..."). View rubric feedback per assignment.
- Syllabus. Course policies, schedule, grading breakdown, instructor info and office hours.
- Files. Access course materials uploaded by faculty.
- People. View classmates. Message instructor or classmates (opens in Messages).
- Nexus integration for students: "When is my Business Ethics paper due?", "What grade do I need on the final to get an A?", "Summarize the reading for Module 3", "Register me for Business Ethics next semester."
- Course registration. Search available courses by department, time, instructor. View open seats, waitlist status. Add to cart and submit registration. Drop courses with confirmation.
- Degree progress. Visual degree audit. Credits completed, credits remaining, required courses vs electives. Courses still needed highlighted. Projected graduation date.
- Academic advisor. Advisor name, contact, office hours, next scheduled meeting. Request meeting button. Chat opens in Messages.
- Transcript request. Submit official or unofficial transcript request. Status tracking (submitted, processing, sent).
- For Lincoln demo: Laolu Kalejaiye enrolled in English Literature (TTh 10am, Prof. Johnson), Calculus II (MWF 9am, Prof. Pantos), Business Ethics (MW 2pm, Prof. Garcia). Each course has 3-4 modules with mock content, 2-3 assignments (one submitted and graded, one upcoming, one in progress), 1 quiz (completed with score), 1 active discussion thread. Gradebook shows running grades.

**Parent View (R9):**
- If FERPA consent granted: child's enrolled courses listed. Tap course to see: course name, instructor, current letter grade. No access to modules, assignments, discussions, syllabus, or files. No assignment-level grades. View only.
- If no FERPA consent: sees general course catalog (browse programs offered at Lincoln: BA Business Administration, BS Diagnostic Imaging, MBA, MS IBFM, DBA) with descriptions and requirements. Informational, not operational.

#### Student Life Tab

- Campus event calendar. Upcoming events with type badges (academic, social, athletics, administrative). Create event button (admin only).
- Student organizations list. Each org shows: name, faculty advisor, member count, meeting schedule, recent activity. For Lincoln: Student Government, International Student Association, Business Club, Athletics Boosters.
- Housing overview (Dean: occupancy rates, maintenance queue, assignments. Student: current assignment, roommate, maintenance request. Parent: child's housing address if FERPA consent).
- Dining (Dean: vendor management, transaction volume. Student: meal plan balance, dining hours, menus, pay with KayPay. Parent: not visible).
- Student wellness indicators (Dean only). Attendance trends, engagement metrics, at-risk students flagged automatically.
- Conduct and incident log (Dean only, R3 and above). Recent reports, status, severity.

#### FERPA Compliance

Parent access to student academic records in KaNeXT is governed by FERPA (Family Educational Rights and Privacy Act). Under FERPA, once a student turns 18 or enrolls at a postsecondary institution, all rights over educational records transfer to the student. Parents have no automatic right to view grades, schedules, academic records, or any other protected information.

KaNeXT enforces this through RBAC. By default, a Parent (R9) sees only publicly available institutional information. Academic data is locked until the student explicitly grants access from their own account settings.

The student consent flow works as follows. In the student's Settings, there is a "Family Access" section. The student adds a parent by name, email, or handle. The student then selects what to share: Schedule (on/off), Grades (on/off), Degree Progress (on/off), Financial (on/off). The student can revoke access at any time. Changes take effect immediately. There is no institutional override. Only the student controls this gate.

The system logs all consent grants and revocations with timestamps for institutional compliance records.

---

### 4.2 Agenda (Education Mode)

Agenda is the calendar and scheduling center. It replaces Google Calendar, MyStudyLife, the academic calendar PDF, and every disconnected scheduling tool. One screen, three views, RBAC determines what events are visible and what actions are available.

Views: Day / Week / Month (centered contextual pill to switch)

Side panel (swipe right or menu icon): upcoming deadlines sorted by urgency, quick-add event, filter by type (academic, athletics, administrative, personal), semester date range selector, sync settings.

#### Dean View (R3)

- Full institutional calendar. Every event across every department, every sport, every administrative function.
- Event types with color-coded badges: Academic (class sessions, exam periods, registration windows, add/drop deadlines), Administrative (board meetings, accreditation deadlines, faculty meetings, budget reviews), Athletics (games, practices, team travel), Campus (orientation, commencement, open house, campus tours), Holidays and breaks.
- Create event with full controls: title, description, date/time, location, recurrence, attendees (individual, department, all-campus), notification settings, attach files. Events can push to recipients' Pulse feed.
- Conflict detection. If a new event overlaps with existing events for the same group, the system flags it before creation.
- Faculty schedule overview. See all faculty teaching schedules, office hours, and meeting blocks. Identify open time slots for committee meetings or reviews.
- For Lincoln demo data: WSCUC accreditation review June 2026, GAAC conference tournament dates, semester start/end dates, final exam period, registration windows, basketball schedule (Pepperdine, Eastern Washington, San Jose State, Weber State, Long Beach State, UC Irvine games).
- Quick actions: Schedule Faculty Meeting, Add Academic Deadline, Push Campus Announcement, View Room Availability.

#### Student View (R8)

- Personal academic calendar. Only events relevant to this student: their enrolled class schedule, assignment due dates, exam dates, registration deadlines, campus events they have RSVPed to, personal events they have added.
- Class schedule as the backbone. Each class session appears as a recurring block showing course name, time, location, and instructor. Tap a class block to see: next assignment due, current grade in that course, instructor contact, link to course materials in Hub.
- Assignment deadlines integrated into the calendar. Each assignment appears on its due date with course name, assignment title, and status (upcoming, submitted, graded, late). Overdue items highlighted in red.
- Exam dates prominently displayed. Exam blocks show course, date, time, location, and a countdown (e.g., "5 days until Calculus II Midterm").
- Add personal events. Study sessions, work shifts, club meetings, personal commitments. These appear alongside academic events in a different color.
- Reminders and notifications. Push notifications for upcoming deadlines (configurable: 1 day before, 3 days before, 1 week before). Class reminders 15 minutes before. Nexus can manage this conversationally: "Remind me about my Business Ethics paper 3 days before it's due."
- Today view as default. Shows today's schedule timeline with current time indicator. Scroll down to see upcoming items for the rest of the week.
- For Lincoln demo data: Laolu Kalejaiye's schedule. Business Administration courses (English Literature TTh 10am, Calculus II MWF 9am, Business Ethics MW 2pm). Basketball practice schedule. Upcoming games. Assignment deadlines.

#### Parent View (R9)

- Child's academic calendar only (requires FERPA consent from student). If consent not granted, parent sees only public institutional calendar (campus events, holidays, semester dates).
- If consent granted: child's class schedule (view only), exam dates, important academic deadlines (registration, add/drop, tuition due dates). No assignment-level detail. No personal events the student added.
- Institutional calendar. Public campus events, holidays, breaks, commencement. Parent-specific events if any (parent weekend, family day).
- Game schedule (if child is an athlete). Dates, times, locations for all games. This is public athletic schedule data, not FERPA protected.

---

### 4.3 Social (Education Mode)

Social is the institutional social feed. It replaces fragmented communication across Instagram, GroupMe, email newsletters, and campus bulletin boards. One screen, three views, RBAC determines posting ability and content visibility.

Views: Feed / Reels / Profile (segmented pill, swipe to switch)

Top bar: "+" create button (top-left), segmented pill Feed / Reels / Profile (center), filter icon (top-right).

Scope filter (hidden by default, revealed by filter icon): Brand / Mode / All. Feed defaults to Brand. Reels defaults to All. When scope is Mode or All, each post displays a brand tag so the user knows which brand the content is from.

Side panel (swipe right or menu icon): saved posts, drafts, scheduled posts, analytics (admin only), content settings, notification preferences.

#### Feed View

- Stories row at top. Circular avatars with accent-colored ring for unread. Your story first with "+" indicator to add. Stories disappear after 24 hours. Tap to view full-screen, tap sides to navigate, swipe to next person. Admin can save stories to Highlights (permanent collections on brand profile). Reply bar at bottom to message the poster.
- Post cards below stories. Each post shows: poster avatar, name, @handle, Role and Brand tag (top row), timestamp, content (text, single image, multi-image carousel, video, or link preview with caption), reaction bar (like, comment, share, bookmark), reaction count and comment count.
- Interactions: single tap like icon or double-tap post for heart animation. Long press like icon for emoji reaction picker (5 options). Tap comment icon to open comments inline below post (threaded replies supported). Tap share icon for bottom sheet (Share to Chat, Share to Room, Copy Link). Tap bookmark to save. Three dots menu on each post with RBAC-controlled options.
- Three dots menu (own post): Edit Caption, Pin to Profile, Archive, Share, Copy Link, Delete.
- Three dots menu (other's post): Save, Share, Copy Link, Report, Mute, Block.
- Three dots menu (admin viewing any post): all above plus Pin to Brand Page, Hide from Feed, Remove Post.

#### Reels View

- Full screen vertical video. Swipe up for next, swipe down for previous. Autoplay with sound on. Tap to pause/play. Double tap to like.
- Each reel shows: poster name, @handle, brand tag (bottom-left), caption text expandable (bottom-left), reaction buttons vertical on right side (like, comment, share, bookmark), sound indicator (bottom-right).
- Comment tap slides up half-screen bottom sheet, scrollable. Share same options as Feed.

#### Profile View

- Your social profile within the active brand. Avatar, name, @handle, Role and Brand, stats (posts, followers, following), bio/description, Edit Profile button. Story Highlights row (named circular icons with custom covers). Grid tabs: Posts / Reels / Tagged. Tap grid photo opens in feed-style view. Tap grid reel opens in full-screen Reels viewer.
- Tap any person's name/avatar on a post to open their profile within the brand. Same layout.
- Brand profile (tap brand name on any post): brand avatar, brand name, mode tag, member count, bio/description, tabs for Posts / Members / About. Admin sees edit controls. Non-members see Follow button.

#### Create Flow

- "+" top-left opens full-screen camera. Bottom tabs: Post / Story / Reel. Gallery picker bottom-left. Flip camera bottom-right. Capture button center (tap for photo, hold for video on Story/Reel). Settings gear top-right (grid overlay toggle, video quality, save to device, hands-free recording).
- Post creation: capture or pick from gallery, edit screen (filters, crop, adjust, text overlay), publish screen (caption input, tag people by @handle, add location, category tags, post visibility Brand/Mode/All, Share button, Save as Draft, Schedule options).
- Story creation: capture or pick from gallery, edit screen (text overlay, stickers, drawings, music, polls, questions, countdown, links, mentions), share immediately. Options before share: Your Story (all brand members) or Close Friends (limited list). Save to Highlights option after posting.
- Reel creation: record video (hold to record, multi-clip, up to 3 minutes) or pick from gallery, edit screen (trim, reorder clips, music/audio, text overlay, effects, transitions, speed control, voiceover), "Edit in KayStudios" button for advanced editing, publish screen (caption, tags, cover image picker, visibility Brand/Mode/All, Also Share to Feed toggle on by default).

#### Dean View (R3)

- All posting abilities plus brand-authored posts (posts as Lincoln University, not as personal account).
- Pin posts to brand page. Hide or remove any member's post. Moderate comments.
- Feature content (highlight specific posts/reels on brand page).
- Access analytics: post reach, engagement rates, follower growth, most engaged content.
- Manage posting permissions (control which roles can post publicly for the brand).
- Push institutional announcements as posts (these appear with a distinct announcement badge).
- For Lincoln demo: campus event photos, student achievement spotlights, academic announcements, basketball game highlights, enrollment updates.

#### Student View (R8)

- Create posts, stories, and reels as themselves within the brand.
- Like, comment, share, bookmark. Follow other members and brands.
- Cannot post on behalf of the brand. Cannot hide/remove others' posts. Cannot access brand analytics. Can see brand profile but not edit it.
- For Lincoln demo: Laolu posting workout clips, campus life photos, study group content, game day stories.

#### Parent View (R9)

- View only. Can see Feed and Reels. Can like and comment. Cannot create posts, stories, or reels within the brand.
- Can follow the brand and individual members (like their child).
- Profile tab shows their own minimal profile (name, @handle, no grid since they do not post).
- For Lincoln demo: parent watching game highlight reels, liking campus event photos, commenting on their child's posts.

---

### 4.4 Campus (Education Mode)

Campus is the campus experience tile. It covers everything about being physically and socially present at the school. It is not academics (that is Hub) and it is not a people directory (that is also Hub). Campus is the school's website in your hand but better because it is personalized to your role.

Views: Map / Life / Resources (centered contextual pill to switch)

Side panel (swipe right or menu icon): campus directory quick search, emergency contacts, campus safety alerts, parking info, shuttle/transit schedule, campus hours, weather, settings.

#### Map View

**Dean View (R3):**
- Full interactive campus map. All buildings shown as labeled pins, color-coded by type: academic (blue), residential (green), athletic (red), dining (orange), administrative (gray).
- Tap any building to see info card: building name, photo, hours of operation, departments and offices inside, floor directory, accessibility info, directions button (opens native maps), current occupancy or event status.
- Admin tools: add or edit buildings, update hours, upload photos, add construction or closure notices (these appear as alert badges on the map), manage parking zones, set emergency rally points.
- Room availability overlay. See which classrooms, conference rooms, and event spaces are open right now. Book rooms directly from the map.
- For Lincoln demo: main building at 401 15th Street (library, classrooms, offices), second building across the street (auditorium, DI lab, offices), DI lab at 420 15th Street, Laney College athletics venue at 900 Fallon Street. Downtown Oakland location, 1 block from 12th Street/City Center BART station.

**Student View (R8):**
- Same interactive map but no admin tools. Search bar at top to search by building name, department, or service ("where is the library", "parking", "dining"). User location shown as blue dot.
- Tap building for info card with hours, what is inside, directions. Favorite frequently visited buildings for quick access.
- Class location pins. If FERPA consent to link academic data, the student's class locations are highlighted on the map with the next class marked prominently and a "navigate" button.
- Nexus integration: "Where is my next class?" and Nexus responds with the building, room, and walking directions.

**Parent View (R9):**
- Campus map with all buildings labeled. Same info cards (hours, directions, what is inside). No admin tools, no room booking.
- Key locations highlighted: admissions office, financial aid, visitor parking, main office, athletics venue.
- "Plan a Visit" button that links to Admissions for tour scheduling.

#### Life View

**Dean View (R3):**
- Student organizations management. Full list of all clubs and organizations with: name, faculty advisor, member count, meeting schedule, budget allocation, recent activity, approval status. Create new organization, approve pending organizations, assign faculty advisors, set budget caps.
- Housing management. All housing units with occupancy status, room assignments, lease details, maintenance request queue. For Lincoln: Alameda apartment complex, 2BR units, 4 students per unit, approximately $900/month, property manager Mikk Teeveer.
- Dining management. Vendor contracts, menu oversight, meal plan enrollment numbers, transaction volume, food safety compliance.
- Campus event management. All upcoming events with attendance projections, budget, venue assignments, staffing. Approve or deny event requests from student organizations.
- Student conduct dashboard. Open cases, resolved cases, severity tracking. RBAC restricted to R3 and above.

**Student View (R8):**
- Student organizations. Browse all clubs and orgs. Each shows: name, description, faculty advisor, meeting schedule, member count, upcoming events, join button. See which orgs the student belongs to. Each org has a linked Room in Messages for group communication.
- For Lincoln demo: Student Government, International Student Association, Business Club, Athletics Boosters.
- Housing info. Current housing assignment (if applicable). Roommate info. Lease details. Maintenance request form with photo upload, priority selection, and status tracking. For Lincoln: Alameda apartment address, unit number, property manager contact.
- Dining. Campus dining locations and hours. Menu for today if available. Meal plan balance. Pay with KayPay wallet. Rate meals.
- Campus events. Upcoming events with RSVP button. Filter by type (social, academic, athletics, cultural). Share events to Social or Agenda. Suggest events through Nexus: "What events are happening this weekend?"
- Campus news feed. School announcements, club updates, student government news.

**Parent View (R9):**
- View only. Campus events calendar (public events only). Housing information for their child (if FERPA consent granted): address, emergency maintenance contact. Cannot submit maintenance requests.
- Student organizations (public list only, can see what organizations exist but not whether their child is a member unless child shares).
- Campus news and announcements (public).

#### Resources View

**Dean View (R3):**
- Full resource management. Every campus resource with: name, location, hours, staff assigned, utilization data, budget. Edit hours, update contact information, add or remove resources.
- Resource categories: Library, Tutoring Center, Health Services, Counseling, Career Center, IT Help Desk, Financial Aid Office, Bookstore, Writing Center, Disability Services, Veterans Services.
- Utilization reports. Which resources are most used, peak hours, student satisfaction.
- For Lincoln: Library at main building (librarian Nicole Marsh, 510-379-4053), DI Lab at 420 15th Street (director Marina Kay).

**Student View (R8):**
- Quick access cards for every campus resource. Each card shows: name, location, hours (open now indicator), phone number, tap to call, tap to message, tap for directions, book appointment button where applicable.
- Resources organized by category: Academic Support (library, tutoring, writing center), Health and Wellness (health center, counseling, disability services), Career (career center, job board), Technology (IT help desk, computer labs), Campus Services (bookstore, mailroom, parking).
- Nexus integration: "Book me a tutoring session for Calculus" or "What time does the library close?" or "I need to talk to someone at the career center."

**Parent View (R9):**
- Campus resources list (view only). Name, location, hours, contact information. Useful for parents visiting campus or helping their child find resources.
- Emergency contacts prominently displayed. Campus security, health center, dean of students.

---

### 4.5 Admissions (Education Mode)

Admissions is the enrollment pipeline. It is position 5, the pipeline tile. Same pattern as Recruits (Sports), Inquiries (Business), Outreach (Community), Deals (Personal). It is the engine that brings students into the school. From the admin side it is a CRM. From the prospective student side it is the application portal.

Views: Pipeline / Applications / Campaigns (centered contextual pill to switch)

Side panel (swipe right or menu icon). Dean/Admin: enrollment dashboard (total apps, acceptance rate, yield rate, enrolled count vs goal), incomplete applications queue, upcoming campus visits, counselor assignments, workflow editor, settings (application form builder, stage definitions, email templates, deadline management). Prospective Student: my application status, checklist (what is done, what is needed), counselor contact info, campus visit schedule, financial aid status, FAQs.

#### Dean View (R3)

**Pipeline tab:**
- Enrollment funnel visualization at top showing stage counts and conversion rates: Inquiry, Applied, Under Review, Accepted, Enrolled, Declined.
- Below funnel: list of all prospects and applicants sorted by most recent activity. Each prospect card shows name, @handle (if on KaNeXT), contact info, current stage, program/major interest, high school or transfer institution, GPA and test scores, last interaction date, assigned counselor.
- Tap prospect for full applicant detail page: all submitted information, uploaded documents (transcripts, essays, test scores, recommendations), reviewer notes, decision history, communication log (auto-pulled from Messages/Phone/Email), financial aid status, timeline of all events.
- Drag and drop between stages. Total count and conversion rate shown per stage.
- Quick filter pills (hidden by default): All, Inquiry, Applied, Under Review, Accepted, Enrolled, This Term, Next Term.
- Action row on applicant detail: Call, Email, Message, Assign Counselor.
- Decision buttons: Request Documents, Send Update, Move to Review, Accept, Waitlist, Deny.
- Bulk operations: select multiple applicants for batch status update or batch email.
- Digital connect card: prospective students scan QR code at events or tap NFC to instantly share their info. Creates a new prospect in Pipeline at Inquiry stage automatically. Admin gets a Pulse notification.
- For Lincoln demo: 25 inquiries, 15 applied, 8 under review, 5 accepted, 3 enrolled. 6-8 mock applicants with full profiles.

**Applications tab:**
- All submitted applications listed. Each card shows applicant name, date submitted, program applied to, status (Received, Documents Pending, Complete, Under Review, Decision Made), checklist completion percentage.
- Tap application for full detail: all submitted info, documents viewable inline, reviewer notes, decision history, communication log.
- Financial aid integration. When applicant is accepted, admin builds and sends financial aid package from the detail page. Aid package builder: tuition amount ($13,150 for Lincoln undergrad), grants, scholarships (merit, need-based, athletic), institutional aid. Package auto-calculates net cost. Student sees aid package in their application view with Accept/Decline buttons. Accepted package syncs to Hub financial overview and KayPay for payment.
- Enrollment completion. When accepted student confirms enrollment, system auto-creates: student account in Hub Academics, course registration access, Room in Messages for their cohort, housing assignment (if applicable), meal plan activation, Campus map and resources access. One acceptance triggers the full student setup across the OS.

**Campaigns tab:**
- Recruitment campaign management. List of active and past campaigns. Each campaign card: name, type (Campus Visit Day, Virtual Open House, High School Visit, Digital Campaign, Direct Mail), status, date range, reach count, applications generated.
- Tap campaign for detail: description, target audience, assigned staff, budget, results metrics.
- Create Campaign button. Campaign types: Campus Visit Day (schedule tours, RSVP tracking, day-of check-in), Virtual Open House (video event, registration, follow-up), High School Visits (assign counselors to schools, track visits), Digital Campaign (social media, email, targeted outreach).
- Each campaign tracks: prospects reached, inquiries generated, applications submitted, enrolled.
- Automated follow-up workflows. Admin creates workflows triggered by applicant actions. Example: inquiry submitted triggers auto-email with program brochure. Three days later auto-text from assigned counselor. If application started, auto-email with completion checklist. If documents pending for 7 days, auto-reminder. If accepted, auto-email congratulations package with enrollment steps.
- For Lincoln demo: "Spring Campus Visit Day" (active, 45 RSVPs), "Fall 2026 Digital Campaign" (active, 200 reached), "High School Tour - MLK Academy" (completed).

#### Student View (R8) / Prospective Student (R10)

**Pipeline tab:**
- Not visible. Prospective students do not see the admin pipeline.

**Applications tab:**
- Application status tracker at top showing current stage with progress bar (Applied, Documents, Review, Decision, Enrolled).
- If not yet applied: full application form. Personal info (name, date of birth, address, contact), academic history (high school or transfer institution, GPA, test scores, transcript upload), program selection (desired major from Lincoln offerings: BA Business Administration, BS Diagnostic Imaging, MBA, MS IBFM, DBA), essay or personal statement, recommendations (invite recommenders via email), financial aid (scholarship interest), documents (upload transcripts, test scores, additional docs). Save Draft and Submit buttons.
- If already applied: checklist showing what is received vs outstanding (green check, red X). Status updates appear here and in Pulse. Financial aid package when offered with Accept/Decline. Enrollment confirmation button when accepted.
- Nexus integration: "What do I need to apply?", "What is the deadline for fall enrollment?", "What scholarships am I eligible for?", "What is my application status?"

**Campaigns tab:**
- Upcoming recruitment events. Campus Visit Days with RSVP button. Virtual Open Houses with Register button. Information sessions. Campus tour scheduling. Event cards show name, date, time, location (or virtual link), description, RSVP/Register button.

#### Parent View (R9)

**Pipeline tab:**
- Not visible.

**Applications tab:**
- Read-only view of their child's application (requires FERPA consent). Same progress tracker. Read-only view of submitted application. Checklist of documents (can see what is outstanding but cannot upload on behalf of student). Financial aid status. Contact admissions office button.
- If no FERPA consent: sees only general admissions information, application deadlines, and contact info for the admissions office.

**Campaigns tab:**
- Same as prospective student view. Upcoming events with RSVP. Campus visit scheduling. For parents accompanying prospective students, this is the tour and event portal.

---

### 4.6 Fund (Education Mode)

Fund is the fundraising and giving engine for the school. It is position 6, the money tile. Same pattern as Booster (Sports), Give (Community), Earn (Personal), Store (Business). It replaces GiveCampus, Almabase, iDonate, and every disconnected fundraising tool. All transactions flow through KayPay natively, so there is no external payment processor, no redirect, no third-party receipt system.

Views: Give / Campaigns / History (centered contextual pill to switch)

Side panel (swipe right or menu icon). Dean/Admin: fundraising dashboard (total raised this year, donor count, alumni participation rate, average gift size, recurring donor count), top donors, upcoming campaigns, scholarship fund balances, pledge tracking, donor segmentation tools, export, settings (fund definitions, receipt templates, matching gift rules). Donor: my giving summary, recurring gifts, tax receipts, pledge status, matching gift status, settings.

#### Dean View (R3)

**Give tab:**
- Fundraising dashboard. Total raised this fiscal year, donor count, alumni participation rate (key metric for university rankings), average gift size, new donors this period, recurring donor count, lapsed donors flagged.
- Fund list with balances. Each fund shows: name, current balance, goal, progress bar, number of donors. Fund types: Annual Fund, Scholarship Fund, Athletics Fund, Capital Campaign, Building Fund, Unrestricted, Class Gift, Department-specific funds.
- Donor management. Full donor list with: name, class year, lifetime giving total, last gift date, engagement score (tracks beyond giving: events attended, volunteering, mentoring, social activity). Tap donor for full profile: giving history, communication log, engagement timeline, wealth indicators, matching gift eligibility.
- Donor segmentation. Filter by giving level (major donor, mid-level, annual, first-time, lapsed), class year, program affiliation, engagement score. Build targeted outreach lists.
- Scholarship management. Named scholarships with criteria (GPA, major, financial need, demographics). View applicants, review, award. Awarded scholarships sync to student's Hub financial overview and KayPay.
- Matching gift tracking. Track which donors' employers match gifts. Automated reminders to donors to submit matching gift requests. Estimated unclaimed matching gift revenue.
- For Lincoln demo: Annual Fund ($50K goal, $32K raised), Oaklanders Athletic Scholarship ($25K goal, $18K raised), Business Program Excellence Fund ($15K goal, $8K raised). 10-15 mock donors with class years and giving histories.

**Campaigns tab:**
- Fundraising campaign management. Active and past campaigns. Each campaign card: name, type, status, date range, goal, raised, donor count, progress percentage.
- Campaign types: Giving Day (time-bound 24-48 hours, live thermometer, donor ticker, leaderboard by class year, challenge gifts, milestone celebrations), Capital Campaign (multi-year, major gifts, naming opportunities, phase tracking), Class Gift (class year competition, reunion-tied), Scholarship Drive (specific scholarship funding), Annual Fund Appeal (year-round, recurring focus), Peer-to-Peer (alumni create personal fundraising pages with goal, pitch, progress, share link).
- Giving Day features: real-time thermometer, live donor feed ticker, leaderboard by class year or affinity group, challenge gifts ("If 100 alumni give today, a board member will match $50K"), social sharing integration with Social tile, milestone celebrations (confetti animation at goal thresholds), countdown timer.
- Create Campaign button. Set goal, date range, type, featured funds, challenge gift rules, leaderboard criteria, marketing assets.
- Campaign analytics: conversion rates, average gift by channel, peak giving times, social sharing metrics.
- For Lincoln demo: "Oaklanders Giving Day 2026" (upcoming, $100K goal), "Class of 2020 Reunion Gift" (active, $10K goal, 45% progress), "New DI Lab Equipment" (completed, $30K raised).

**History tab:**
- All transactions. Searchable, filterable. Each record: donor name, amount, fund, date, method, receipt status, matching gift status.
- Donor profiles with engagement scores and full giving timelines.
- Export options: CSV, PDF reports, tax year summaries.
- Batch gift entry for offline donations (checks, cash, wire transfers).
- Pledge tracking. Outstanding pledges with payment schedules, reminder automation, fulfillment rates.

#### Student View (R8)

**Give tab:**
- Clean giving screen. Minimal friction, under 10 seconds. Large amount input center with preset buttons ($5, $10, $25, $50, custom). Fund picker pills below: Annual Fund, Scholarship, Athletics, Unrestricted, Senior Class Gift.
- Recurring option toggle (one-time or monthly).
- Payment through KayPay wallet. Tap, confirm, done. No redirect, no external form.
- "My employer matches gifts" checkbox with company search. If match found, shows estimated total impact ("Your $25 becomes $50").
- Dedicate gift option ("In honor of" or "In memory of" with name field).
- Below giving input: active campaign highlight (if a Giving Day or drive is live, show thermometer and leaderboard), recent gifts feed (anonymized or named based on donor preference).

**Campaigns tab:**
- Active campaigns the student can participate in. Giving Day with live thermometer, leaderboard, and social sharing. Peer-to-peer: "Start a Fundraising Page" button to create personal page with goal, pitch, progress tracker, and shareable link.
- Senior Class Gift campaign (if applicable). Class progress bar, class participation percentage, class leaderboard.

**History tab:**
- Personal giving history. Grouped by year. Amount, fund, date, receipt. Tax receipt download. Year-end giving summary. Lifetime total. Recurring gift management (pause, cancel, update amount).

**Scholarship browse:**
- Available scholarships the student can apply for. Each shows: name, amount, criteria, deadline, application status. Apply button opens application form within the tile. Application status tracking (submitted, under review, awarded, not selected). Nexus integration: "What scholarships am I eligible for?" and Nexus filters based on the student's GPA, major, and profile data.

#### Parent View (R9)

**Give tab:**
- Same clean giving screen as student. Preset amounts, fund picker, KayPay payment. Parents are often the largest donor segment for active students.
- Dedicate gift to their child's program or department.
- Matching gift checkbox with employer search.
- Active campaign highlight if a Giving Day is live.

**Campaigns tab:**
- Active campaigns with participation options. Giving Day, peer-to-peer (parents can create fundraising pages too).

**History tab:**
- Personal giving history. Receipts, tax summaries, recurring management. Pledge tracking if applicable.

---

### 4.7 KayTV (Education Mode)

KayTV is the media and streaming platform. It is the single source of truth for all video content within a brand. It replaces YouTube, Panopto, Kaltura, Vimeo, FloSports, and every other platform where institutional video currently lives scattered and unowned. All video lives in KayTV. Other tiles (Hub, Social) can pull from KayTV and layer context on top, but the library itself lives here.

KayTV serves three functions simultaneously. It is the distribution layer that puts institutional content in front of its community. It is the acquisition engine that converts viewers into platform users (every parent who watches a game is inside the app, one tap from a wallet). And it is the data ingestion layer that feeds the intelligence system in Sports mode (every game processed is every game evaluated).

Views: Featured / Library / Live (centered contextual pill to switch)

Side panel (swipe right or menu icon). Dean/Admin: upload queue, content management (organize, tag, set permissions), analytics dashboard (views, watch time, peak hours, most-watched content), scheduled uploads, content calendar, access permission settings, monetization settings (if applicable), settings. Student: watch history, saved/bookmarked videos, downloads (offline access), subscriptions/followed channels, settings. Parent: watch history, saved videos, settings.

#### Featured View

All roles see the Featured view but content differs based on RBAC.

- Hero video at top. Full-width, auto-playing (muted) preview of featured content. Admin selects the featured video. Could be the latest basketball game, a campus promotional video, commencement highlights, or a recruitment piece.
- Category rows below (horizontal scroll per row, Netflix-style). Each row is a content category with a "See All" button. Categories adapt to mode and brand.
- For Lincoln Education mode categories: Recent Games (basketball, soccer), Campus Life, Lectures and Academics, Commencement and Events, Student Spotlight, Recruitment and Admissions, Athletics Highlights.
- Each video thumbnail shows: title, duration, view count, date posted. Live badge if currently streaming. New badge if posted within 48 hours.
- Tap thumbnail to open video player.

#### Library View

- Full searchable catalog of all video content the user has access to.
- Search bar at top. Smart search: search by title, description, speaker name, spoken words in transcribed content (if transcription is enabled), tags.
- Filter pills (hidden by default): By Type (game, lecture, event, promotional, student-produced), By Sport (basketball, soccer, football), By Department (Business, DI, Graduate), By Date Range, By Duration.
- Grid or list view toggle.
- Content organized by collections/playlists created by admin. For Lincoln: "2025-26 Basketball Season", "Campus Tour Series", "Guest Lectures", "Commencement 2026", "Student Projects".

**Dean View (R3) additions:**
- Upload button. Upload video with metadata: title, description, category, tags, thumbnail, access permissions (public, enrolled students only, specific department, specific course, staff only), schedule publish date, auto-caption toggle.
- Content management. Edit metadata, move between collections, set/change access permissions, feature/unfeature, delete.
- Analytics per video: views, unique viewers, average watch time, completion rate, peak viewing times, geographic distribution of viewers.
- Bulk operations: tag, move, set permissions on multiple videos.
- For Lincoln demo: 15-20 mock videos across categories. Real Lincoln basketball game footage where available, mock lecture recordings, campus b-roll.

**Student View (R8) additions:**
- Access to all content marked for enrolled students. Lecture recordings for their courses (if faculty uploads them). All athletics content. Campus events. Student-produced content.
- Cannot upload to the institutional KayTV (they upload to their personal brand or to Social). Cannot change permissions or manage content.
- Course-linked content: if a faculty member uploads a lecture recording and tags it to a course, it appears in both KayTV Library and in Hub Academics under that course.
- Download for offline viewing (if admin enables).

**Parent View (R9) additions:**
- Access to all public content only. Athletics games, commencement, campus tours, recruitment videos, public events.
- Cannot access lecture recordings, internal campus content, or anything marked for enrolled students only.
- This is the primary use case for parents: watching their child's basketball game from across the country. The "Open KayTV" button on the home screen video hero leads here.

#### Live View

- Currently live streams. If nothing is live, shows upcoming scheduled streams with countdown timers.
- Live stream player: full-screen video with live chat overlay (chat messages from viewers, moderated). Viewer count displayed. React with emoji reactions that float on screen.
- Upcoming streams: schedule cards showing what is streaming next with date, time, description, "Set Reminder" button (adds to Agenda and sends push notification when live).
- For Lincoln demo: upcoming basketball games as scheduled streams. If a game is "live" in the demo, show the live player experience with mock chat.

#### Video Player

- Full-screen or inline playback. Scrub bar with chapter markers (if set by uploader). Speed controls (0.5x, 1x, 1.25x, 1.5x, 2x). Quality selector (auto, 720p, 1080p, 4K). Closed captions toggle (auto-generated or uploaded). AirPlay/Chromecast support for casting to TV.
- Share button: share to Messages, Social, copy link. Clip creation: select start/end points to create a shareable clip (clips link back to the full video).
- Comment layer below player (when not full-screen): comments from viewers, threaded replies, reactions. RBAC controls who can comment.
- Related content below comments: more videos from the same collection, same sport, same category.
- Nexus integration (Sports mode specific, not Education): when a coach watches game film through Hub, Nexus can overlay intelligence. This does not apply in the KayTV player itself. KayTV is the pure viewing experience. Intelligence overlay lives in Hub.

---

### 4.8 KayPay (Education Mode)

KayPay is the financial layer of KaNeXT. Every user who downloads the app receives a wallet. It is not a payment feature bolted onto the platform. It is the financial infrastructure the platform runs on. All transactions across every tile flow through KayPay. Fund donations, Admissions application fees, Campus dining and bookstore purchases, tuition payments, financial aid disbursement, payroll, vendor contracts. Every dollar has a governed chain: Event, Rules, Authorization, Payment, Settlement, Audit. Every dollar is traceable and auditable.

KayPay replaces Cash App (peer-to-peer), Venmo (social payments), Western Union (remittance at 0.2% vs 5-10%), campus card systems, tuition payment portals, institutional payment processors, and payroll services. One tile. One wallet. One identity.

Views: Wallet / Pay / Invest (centered contextual pill to switch)

Side panel (swipe right or menu icon). All users: quick balance, recent transactions, card controls (freeze/unfreeze, view card number with biometric), payment methods (linked banks and cards), rewards summary (Capital Points balance and tier), limits (daily send/receive/withdraw), security settings (PIN, biometric, notifications), support. Dean/Admin additional: switch between personal wallet and brand account, brand account balance and fund balances, pending authorizations, settlement summary, payroll status, commerce processing summary, export/reports, audit log, settings (auto-split rules, authorized signers, spending limits per role, compliance).

#### Wallet View

**Dean View (R3):**

Personal wallet:
- Balance displayed large and prominent at top. 4% APY indicator showing daily earnings on balance.
- KaNeXT Card section. Virtual card visible (last 4 digits), Apple Pay and Google Pay integration. Freeze/unfreeze toggle. Boosts (instant discounts at participating merchants).
- Transaction history. Filterable: All, Sent, Received, Purchases, Deposits, Withdrawals. Time filters: Today, This Week, This Month, Custom.
- Savings goals. Named goals with progress bars and auto-save rules ("$200/month to Emergency Fund").

Institutional account (toggle to brand account in side panel):
- Governed settlement dashboard. Real-time feed of all financial activity across the institution. Every transaction shows the full settlement chain: what event triggered it, what rules applied, who authorized it, where the money went, and the audit timestamp.
- Auto-split configuration. Define how revenue is distributed automatically. Example: a ticket sale of $20 auto-splits to 80% Athletics Operating, 10% Facilities, 5% Student Life, 5% KaNeXT. No human touches it. The split is defined once and executes on every transaction of that type.
- Fund accounts. Operating Fund, Scholarship Fund, Athletics Fund, Facilities Fund, Emergency Reserve. Each shows balance, recent activity, and authorized roles for withdrawal.
- Pending authorizations. Transactions awaiting dean approval based on RBAC thresholds. Example: any vendor payment over $5,000 requires R3 approval.
- Payroll. Next pay date, total payroll amount, employee count. Run payroll button (authorized roles only). Payroll history. Each employee: salary, deductions, net pay, payment method (KayPay wallet or external bank).
- Vendor payments. Outstanding invoices, scheduled payments, payment history. Add vendor. Approve/reject payments.
- Commerce processing. Real-time feed of ticket sales, merch orders, donations, tuition payments. Processing rates displayed: 5% on card, 3% on wallet. Revenue by channel.
- Financial reports. P&L summary, balance sheet, cash flow. Custom report builder. Export to PDF, CSV. Audit log: every transaction, every authorization, every override, timestamped and immutable.
- For Lincoln demo: operating balance $847,000, 4 fund accounts, 5 governed settlement examples with full chain visible, next payroll March 31 $48,000, $12,400 commerce processed this month.

**Student View (R8):**

- Balance displayed large at top. 4% APY earning indicator. $5 sign-up credit for new accounts.
- Campus card functionality. This IS the student's campus card. Dining balance and meal plan status. Bookstore purchases. Campus vending and services. Library printing. Laundry (if applicable). All campus transactions happen through the wallet with a tap (NFC) or QR scan.
- Tuition section. Current balance due. Payment schedule. Make payment button (pay from wallet balance, linked bank, or linked card). Payment plan setup (split tuition into installments). Payment confirmation and receipt.
- Financial aid. Aid package summary: grants, scholarships, institutional aid, work-study. Disbursement schedule. Disbursed funds appear directly in wallet balance. For Lincoln: no Title IV/FAFSA (Lincoln does not participate in federal student aid), institutional cost-of-attendance scholarships only.
- Transaction history with filters. See every campus purchase, tuition payment, peer-to-peer transfer, dining charge.
- KaNeXT Card. Virtual card for online purchases. Physical card for off-campus. Apple Pay and Google Pay. Boosts at local merchants near campus.
- Savings goals. Students can set goals and auto-save.
- For Lincoln demo: Laolu Kalejaiye's wallet. Balance $340. Meal plan active. Recent transactions: dining hall $8.50, bookstore $45, received $200 from parent, sent $15 to teammate. Tuition: $13,150/year, $6,575 due this semester, $4,575 remaining after institutional scholarship.

**Parent View (R9):**

- Personal wallet. Balance, 4% APY, card, transaction history. Same personal wallet as any other user.
- Send to child. Prominent "Send to [child's name]" button. One tap sends money directly to their child's KayPay wallet. Frequent action row shows child as first recipient.
- Pay tuition. If authorized as a payer on the student account, parent can pay tuition directly. View balance due, make payment, see payment history and receipts.
- Remittance. For international families (40% of Lincoln's undergrads are international), send money at 0.2% instead of Western Union's 5-10%. Saved recipients with country flags. Real-time exchange rates. Delivery estimate. Fee comparison showing savings vs traditional services.
- Transaction history filtered to show payments related to their child's education.
- For Lincoln demo: parent wallet with $1,200 balance. Recent: sent $200 to Laolu, paid $2,000 tuition installment. Remittance: saved recipient in Lagos, Nigeria.

#### Pay View

**All roles:**
- Send money. Search by @username, phone, email, or scan QR. Recent recipients as avatar row. 3-step flow: Who, How Much, Confirm. Biometric to confirm. Wallet-to-wallet is free.
- Receive/request money. Enter amount and memo, send request. Recipient gets notification in Pulse and Messages.
- QR code. Personal QR for receiving payments. Camera scan for sending. Works for person-to-person and merchant.
- Split payments. Select a transaction, add people, even or custom split, send requests, track who paid.
- Remittance. International transfers at 0.2%. Saved recipients. Real-time rates. Fee savings calculator ("You save $47.80 compared to Western Union on this transfer").
- Inline payments from Messages. "Send $20 to Marcus" without leaving the conversation. Nexus can execute: "Hey Nexus, send $100 to Mom."

**Dean View (R3) additional:**
- Vendor payment initiation from Pay view.
- Institutional transfers between fund accounts.

#### Invest View

**All roles:**
- Infrastructure Fund. Real assets (student housing, campus buildings, institutional infrastructure). Minimum $100. Target 10-15% return. Portfolio view with project updates and photos. Buy/sell.
- Bitcoin. Buy, sell, send, receive. Price chart. Portfolio value. Simple interface.
- Capital Points. Two-tier rewards system. Tier 1: cashback on transactions. Tier 2: ecosystem points earned through platform engagement (watching KayTV, posting on Social, attending events). Points redeemable for wallet credit, merch, event tickets, or Infrastructure Fund investment. Behavioral ladder: the more you use the ecosystem, the better your rewards tier.

**Dean View (R3) additional:**
- Institutional investment dashboard. School endowment positions in Infrastructure Fund (if applicable).

**Student View (R8) additional:**
- KaNeXT Capital Fund visibility only for accredited/qualified investors. Not visible to typical students.
- Infrastructure Fund emphasized as an alternative to traditional savings. "Your $100 builds a student housing unit that earns 12% while your savings account earns 0.5%."

---

### 4.9 KayStudios (Education Mode)

KayStudios is the interactive experiences hub. It is stuff you do, not stuff you watch. Games, courses, quizzes, simulations, trivia, challenges, flashcards, and learning modules. It replaces casual learning apps, trivia platforms, educational games, and creator course tools. KayStudios is the one tile that breaks the mode-scoping pattern. It is cross-mode. All content is available to all users regardless of which mode or brand they are in. A basketball trivia game is fun whether you are in Sports mode or Education mode. A business simulation is valuable in any context.

This is NOT the institutional LMS. Formal academic coursework (enrolled courses, assignments, grades, faculty grading) lives in Hub Courses. KayStudios is informal, entertainment-driven, and creator-built. A professor might build a fun study quiz in KayStudios. The formal midterm exam lives in Hub.

Views: Home / Explore / Library (centered contextual pill to switch)

Top bar: "+" create button (top-left, RBAC controlled), centered pill Home / Explore / Library (center), filter icon (top-right).

Pills are RBAC-controlled. Creators see creator-specific pills (My Content, Published, Drafts, Analytics). Consumers see content-type or engagement pills. Exact pill definitions per role will be defined in the pill pass.

Side panel (swipe right or menu icon). All users: In Progress (content you are in the middle of with progress bars, tap to resume), My Courses (courses you are enrolled in), Saved (bookmarked for later), Achievements (badges, streaks, completion count, high scores, leaderboard rank, gamification dashboard), Subscriptions (creators and brands you follow for interactive content). Creator/Admin additional: My Content (interactive experiences you have published), Create shortcut (opens creation flow), Analytics (plays, completions, ratings, revenue per item), Manage Content (edit, unpublish, delete), Drafts (unpublished work in progress). Settings at bottom.

#### Home View

- Personalized feed based on your interests and activity, not your mode. Shows content from all brands across all modes that you have interacted with or that is trending.
- Content cards in a vertical feed. Each card shows: thumbnail (square or 16:9), title (bold), creator/brand name and @handle, type badge (Game, Course, Quiz, Simulation, Trivia, Challenge), participant count or completion percentage, rating (stars), duration or question count.
- Tap card to open content detail page.
- Recommendations based on what you have played and completed before.

#### Explore View

- Discovery across all of KaNeXT. Content you have not interacted with yet.
- Category rows (horizontal scroll): Trending, New This Week, Popular Courses, Quick Games (under 5 minutes), Brain Teasers, Sports and Athletics, Business and Career, Faith and Spirituality, Academic Support.
- Each row has "See All" to expand full list.
- Search FAB bottom-right. Tap to open search bar. Search by title, creator, category, content type.

#### Library View

- Your personal collection across all modes. Everything you have ever interacted with in one place.
- Sections: In Progress (resume where you left off, progress bars on cards), Completed (history of everything finished), Saved (bookmarked for later), My Courses (enrolled creator courses). Each section shows 3-4 items with "See All."

#### Content Detail Page

- Tap any card from Home, Explore, or Library to open detail.
- Full-width banner image at top. Title (large bold), type badge, creator name and brand, description paragraph. Metadata: duration or question count, difficulty level, participant count, rating.
- Launch button (full width, prominent). "Play" for games, "Start" for courses, "Begin" for quizzes, "Join" for challenges.
- Price displayed if paid content. Purchase through KayPay. Free content shows "Free" badge.
- Action row: Save, Share, Rate.
- Reviews section below with star ratings and written reviews.
- Related content section below reviews.

#### Content Players

**Course player:**
- Full-screen learning experience. Module sidebar (collapsible list of lessons). Current lesson content area: video player (pulls from KayTV if video-based), text content, embedded quiz or assessment within the lesson. Progress bar at top showing completion percentage. Next/Previous lesson navigation. Notes section (personal notes per lesson). Discussion (links to a course Room in Messages). Mark Complete button per lesson. Certificate of completion when 100% done.

**Quiz player:**
- Full-screen. Question displayed one at a time. Answer options below. Timer if timed. Progress bar (question 3 of 10). Score tallied as you go. Results screen at end: score, percentage, correct/wrong breakdown, share results button (post to Social), leaderboard (if competitive quiz), retake button.

**Game player:**
- Full-screen. Game loads and runs. Back button to exit. High score tracking. Leaderboard. Share score to Social.

**Challenge player:**
- Join a challenge. Track progress against rules and duration. See other participants' progress. Leaderboard. Complete to earn badge or achievement.

**Flashcard player:**
- Card deck with front/back flip. Swipe right (know it) or left (study again). Spaced repetition tracking. Progress through the deck. Session summary at end.

#### Creator Flow

- "+" top-left opens creation type selector: Course, Quiz, Trivia, Challenge, Flashcard Deck, Poll/Survey.
- Course Builder: module structure with lessons. Each lesson: add video (from KayTV or upload), add text, add quiz section. Drag to reorder modules and lessons. Set pricing (free or paid through KayPay). Preview before publishing. Publish to KayStudios library.
- Quiz Builder: question bank. Question types: multiple choice, true/false, fill in blank, open-ended. Set scoring, timer, attempt limits. Results page with share button. Publish.
- Trivia Builder: themed trivia with rounds. Set topic, difficulty, question count. Can pull from existing question banks or create custom.
- Challenge Builder: set rules, duration, criteria, participant cap. Track progress. Award badges on completion.
- Flashcard Builder: create card decks with front/back content. Tag by subject and difficulty.
- All published content appears in the creator's KayStudios library for their audience to find and play. Revenue from paid content flows through KayPay and appears in the Earn tile (Personal mode).

#### Education Mode Context

While KayStudios is cross-mode, in an Education brand context it serves as the supplementary learning layer. A Lincoln University professor could build a "Business Ethics Case Study Quiz" in KayStudios as a fun, optional study tool for students. The formal graded exam lives in Hub Courses. The KayStudios quiz is extra credit or self-study.

Students at Lincoln might see in their KayStudios feed: "Basketball IQ Test" (from Sports brands they follow), "U.S. History Trivia" (trending in Academic Support category), "Intro to Investing" (creator course from a business brand), "Bible Trivia Night" (from ICCLA Community brand), and "Business Ethics Practice Quiz" (from their professor). All in one feed, cross-mode.

For Lincoln demo data: "How Well Do You Know Lincoln?" (quiz, 10 questions about the school, free, 45 plays), "Business Ethics Case Study Challenge" (challenge, 12 participants), "Basketball IQ Test" (trivia, trending, 200+ plays), "KaNeXT Masterclass" (course, 12 lessons, $200, 8 enrolled).

---

## 5. Home Screen

The Home screen is the landing page of the app. It is the first thing a user sees after login. It consists of three layers stacked vertically: the video hero, the brand pill, and the icon grid.

The video hero occupies the top portion of the screen. It auto-plays muted video or displays a static image or gradient. Each brand sets their own hero content. This could be a game highlight, a promotional video, a campus tour, a sermon clip, or anything the brand chooses. An "Open KayTV" button is overlaid on the video at the bottom-left. A mute/unmute toggle sits at the bottom-right. Tapping the video or the "Open KayTV" button navigates to KayTV for that brand.

Below the video hero is the brand pill. It displays the active brand name (e.g., "KaNeXT", "LU Men's Basketball", "ICCLA", "Lincoln University", "Sammy Kalejaiye"). Tapping the brand pill opens the Brand Drawer. The brand pill is how the user always knows which brand they are operating in.

Below the brand pill is the 3x3 icon grid. Nine squircle tiles arranged in three rows. Each tile has an icon and a label. The top row (Hub, Agenda, Social) and bottom row (KayTV, KayPay, KayStudios) are universal across all modes. The middle row shifts per mode:

| Mode | Position 4 | Position 5 | Position 6 |
|------|-----------|-----------|-----------|
| Sports | Roster | Recruits | Booster |
| Business | Team | Inquiries | Store |
| Education | Campus | Admissions | Fund |
| Community | Members | Outreach | Give |
| Personal | Network | Deals | Earn |

Swiping left on the grid navigates to Nexus with a slide animation.

When a user switches brands (via the Brand Drawer), the video hero changes, the brand pill text updates, the middle row tiles swap if the mode changed, and all content inside every tile reloads for the new brand context.

The Home button is position 1 in the footer (leftmost). Tap navigates to the Home screen. Hold opens the Brand Drawer.

---

## 6. Brand Drawer

The Brand Drawer is how users switch between brands. It opens as a bottom sheet from two entry points: tapping the brand pill on the Home screen or holding the Home button in the footer.

The Brand Drawer contains the following from top to bottom:

Mode filter pills. Horizontal scrollable row: All, Personal, Business, Education, Community, Sports. "All" is selected by default showing every brand the user belongs to. Tapping a mode pill filters the list to only brands in that mode.

Search bar. "Search brands..." for users with many brands.

Brand list. Each row shows the brand's initials avatar (colored circle with initials), brand name, and a radio selector on the right. The active brand has a coral checkmark and a highlighted row background. Brands are listed with the personal brand pinned at the top, then all others alphabetically.

A user can belong to multiple brands within the same mode. You could be part of three different Sports brands or five Business brands. The only mode with a single brand is Personal, which is always just you.

Tapping a brand selects it, closes the drawer, and the app reloads in that brand's context. If the new brand is in a different mode than the current one, the mode switches automatically. The user never "picks a mode" separately. They pick a brand and the mode follows.

Settings link at the bottom of the drawer for account-level settings, preferences, and profile management.

---

## 7. Phone

Phone is footer position 2. It is a full VoIP phone system built into the app. Every user gets a real phone number per brand. On-network calls (KaNeXT user to KaNeXT user) are free, domestically and internationally. Phone is brand-scoped. It shows contacts and calls for the active brand. Switch brands through the Brand Drawer and the Phone view updates to that brand's contacts and call history.

Top bar: Edit (top-left on Calls view) or "+" add contact (top-left on Contacts view), centered contextual pill with chevron (Calls/Missed/Voicemail/Contacts dropdown), filter icon (top-right).

The centered pill dropdown switches between four views. Tap the chevron to open the dropdown, select a view, dropdown closes.

### Calls View (default)

- Favorites row. Horizontal scroll of avatar circles with initials, names below, online indicators (green dots). No label above the row.
- Breathing room below favorites.
- Recents list. Each entry: avatar with online indicator, name, @handle, direction and status (Missed in red, Outgoing with arrow, Incoming), duration, timestamp on right, quick-call phone icon on far right.
- Two stacked FABs bottom-right above footer: dialer (top, green), search (bottom, coral).

### Missed View

- Same list format as Calls but filtered to missed calls only. No favorites row. Missed entries shown in red.

### Voicemail View

- Voicemail list. Each entry: caller name or number, date, duration, quick-call icon on right for immediate callback.
- Tap row to open voicemail detail page. Known contact: avatar, name (tap for profile), date, audio player with scrubber, transcript below. Unknown number: phone number, date, audio player, Add Contact and Report Spam buttons, transcript below. Back arrow to return.

### Contacts View

- "+" add contact button top-left (replaces Edit).
- Filter pills below the centered pill (RBAC-controlled, hidden by default, revealed by filter icon). Pills change per brand and role. For KaNeXT Business: All, Leadership, Product, Engineering. For Lincoln Education: All, Faculty, Staff, Students, Athletics.
- User's own profile card at top. Coral avatar with initials, name, role, phone number, online indicator.
- Contact list below, alphabetical, grouped by letter with sticky letter headers. Each contact: avatar with online indicator, name (bold last name), @handle, role, brand name. Alphabet index on right edge for fast scrolling.

### Interactions

**Long press on any entry (calls, missed, voicemail):**
- iOS-style context menu. Known contact: Call, Message, Video, Delete (red). Unknown number: Call, Message, Add to Existing Contact, Create New Contact, Delete (red). Icon and label only, no chevrons.

**Dialer FAB:**
- Tap opens keypad bottom sheet (90% height). Letters under numbers, backspace, call button. Swipe down to dismiss.
- Live search: as numbers are typed, matching contacts appear as suggestions above the number display. Matches by phone number and name (T9 letter matching). Tap contact to auto-fill and call.

**Search FAB:**
- Tap opens search bar that slides up from the bottom (iOS style). Normal screen fades out. Results grouped: Top match (best result by name and frequency), Calls, Voicemails, Contacts. Each section has "See All." Live results as you type. FABs hide during search. X or swipe down to dismiss.

**Profile bottom sheet (tap any contact):**
- Avatar, name, role, brand. Action row: Call, Video, Message, Mail. All phone numbers listed with mode labels (e.g., "Business +1 (555) 247-8302", "Sports +1 (555) 891-4420"), each tappable to call. Edit button (RBAC controls edit permissions).

### Call Screens

- Voice call: full screen, name/number at top, call status. Action buttons: Speaker, Video, Mute (top row), More, End (red), Keypad (bottom row).
- Video call: full screen camera feed. Self-view in small floating PiP (draggable). Camera flip replaces Speaker. Tap screen to show/hide controls.

---

## 8. Nexus

Nexus is footer position 3 (center). It is the AI intelligence layer of KaNeXT. Powered by Claude (Haiku for general queries, Sonnet for basketball intelligence, with prompt caching on static intelligence files). Nexus is not a chatbot. It executes. It drafts communications, schedules meetings, processes payments, evaluates players, generates reports, answers questions, and routes decisions. Every action is constrained by the user's RBAC role within the active brand. Every action is traceable and auditable.

Nexus is cross-mode. It is not scoped to the active brand or mode. A user can ask about basketball while in Education mode, ask about tuition while in Sports mode, or ask about anything from anywhere. Nexus knows everything the system knows. The suggestion chips on the empty state are mode-aware to help users get started, but the actual capability is unlimited.

Three access methods:
- Tap Nexus footer icon = full Nexus page (standalone chat)
- Double tap Nexus footer icon = half-screen contextual overlay on current screen
- Hold Nexus footer icon = voice mode (speak to Nexus, Nexus listens and responds)

### Full Nexus Page

The full page chat experience. Modeled after Claude's mobile app.

**Top bar:** sidebar menu icon (top-left, opens sidebar), centered pill showing "Nexus 1.0" with chevron (tappable for version/model info), new chat compose icon (top-right, pen icon, starts fresh conversation).

**Empty state:** Nexus sparkle icon centered, greeting based on time of day ("Good morning", "Good afternoon", "Good evening"), "How can I help you today?" below. Four suggestion chips in a 2x2 grid. Chips are mode-aware:
- Sports mode: "Evaluate a player", "Compare two teams", "Build a recruiting board", "Game prep report"
- Education mode: "Check my grades", "When is my next class", "Help with an assignment", "Register for courses"
- Business mode: "Draft a proposal", "Show me this week's pipeline", "Prepare a meeting agenda", "Analyze Q1 revenue"
- Community mode: "Plan this Sunday's service", "Who volunteered this week", "Draft an announcement", "Giving report"
- Personal mode: "Schedule my day", "Draft a post", "Check my earnings", "Manage my content"

**Chat experience:**
- No message bubbles. Clean text on background (matching Claude's mobile design). User messages right-aligned with user avatar circle. Nexus responses left-aligned, no bubble, just text with full markdown rendering (headers, bold, lists, code blocks, tables).
- Streaming responses. Text appears token by token as Nexus generates.
- Action icons below each Nexus response: copy, share, thumbs up, thumbs down, retry.
- Code blocks render as tappable artifact cards with syntax highlighting and language badge.
- Multi-turn conversation. 6 turns of history for basketball intelligence queries, 20 turns for general queries.
- Stop button appears during streaming to cancel generation.
- "Nexus is AI and can make mistakes. Please double-check responses." disclaimer below first Nexus response.

**Input bar (flush to footer, no gap):**
- "Message Nexus" placeholder text (or "Reply to Nexus" in an active conversation).
- "+" button on left for attachments (photos, files, documents).
- Mic button for voice input (tap to dictate, converts speech to text in the input field).
- Send button on right (coral accent when text is present, muted when empty).
- Voice mode button (waveform icon, activates full voice conversation mode).

**Intelligence routing:**
- User sends message. classifyQuery() determines if it is a basketball intelligence question or general.
- Basketball queries: buildIntelligenceSystemPrompt() assembles SKILL.md + File 01 + relevant legends as system prompt, routes to Claude Sonnet.
- General queries: routes to Claude Haiku with standard prompt.
- Prompt caching on static intelligence files reduces cost by approximately 85%.
- Nexus has access to: all basketball intelligence files (Files 01-07, 14 legends), all product knowledge (this document), all data room documents (33 docs), brand-specific data, user-specific data based on RBAC.

**Nexus capabilities by RBAC (see Section 3 for full table):**
- All roles: ask questions, navigate the app
- R4-R5: create tasks, create requests
- R2-R3: post to rooms, summarize rooms
- R0-R1: approve/deny, high-impact actions, cross-context search

### Nexus Sidebar

Full-screen-width drawer, opens from sidebar menu icon (top-left) or swipe right. Matches Claude's mobile sidebar layout.

**Top:** large "Nexus" header. X close button top-right.

**Navigation:** icon-based nav row. Chats (active by default, highlighted), Projects, Artifacts. Tap to switch which list is shown below.

**Search:** search input below nav row. Filters the list below by title match (case-insensitive). Shows "No results" empty state if nothing matches.

**Chats list (default):**
- Date-grouped sections: Today, Yesterday, Previous 7 Days, Previous 30 Days, Older. Only sections with chats appear.
- Each chat row: title (auto-generated from first message), timestamp. Tap to load that conversation.
- Star icon on each row to pin. Starred chats appear in a separate "Starred" section above date groups.
- Swipe left on row to delete.
- New Chat button (coral accent) at top of list.

**Projects list:**
- List of saved projects. Each project is a collection of related chats. Project name, chat count, last activity date.
- Tap project to see its chats.
- Create Project button.

**Artifacts list:**
- List of code/JSON/SQL/data blocks extracted from conversations. Each shows: title, language badge, source conversation, date.
- Tap artifact to view full content with syntax highlighting and copy button.

**Bottom of sidebar:** user info (avatar, name, @handle). Settings link.

### Half-Screen Contextual Overlay

Activated by double-tapping the Nexus footer icon. Nexus appears as a bottom sheet overlay on the current screen at 50%. Can drag up to 100% for full-screen. Drag down or tap backdrop to dismiss.

The overlay is context-aware. Nexus knows what screen the user is currently on and can reference it:
- On KayTV watching a game: "What defense is Howard running here?" Nexus analyzes the content.
- On Roster viewing a player: "What's this player's development outlook?" Nexus pulls the player's data.
- On Hub Courses looking at an assignment: "Help me understand this problem." Nexus reads the assignment content.
- On KayPay looking at a transaction: "What was this payment for?" Nexus traces the settlement chain.
- On Agenda looking at the schedule: "Move my 3pm to tomorrow." Nexus reschedules.

The overlay has the same chat input bar as the full page. Same streaming, same markdown, same artifacts. Just in half-screen format overlaid on whatever the user was doing. The conversation in the overlay is separate from the full-page Nexus conversations (it does not appear in the sidebar chat history unless the user explicitly saves it).

This is the feature that separates Nexus from every general-purpose AI assistant. ChatGPT does not know what app you are looking at. Siri does not know what content is on your screen inside a third-party app. Nexus does, because Nexus IS the app.

### Voice Mode

Activated by holding the Nexus footer icon. Full-screen voice interface. Waveform animation while listening. Nexus processes speech, responds with text and optionally with voice (text-to-speech). Tap to interrupt. Say "stop" to end.

Voice mode can do everything the text interface does. "Evaluate Cameron Boozer" triggers the full basketball intelligence pipeline. "Send $50 to Marcus" initiates a KayPay transfer. "What's my GPA?" pulls from Hub Courses. Voice mode is not a degraded experience. It is the same Nexus with a different input method.

Voice mode is especially powerful for coaches during practice or games (hands-free operation), for students walking between classes, and for accessibility.

### Escalation Feature

When Nexus does not know the answer to a question, it does not guess. It escalates.

The escalation flow: Nexus gives the best answer it can with a disclaimer that it is not certain. Simultaneously, the unanswered question is routed to a "Nexus Escalations" thread in Messages. The thread appears as a DM to the person in the brand who is authorized to answer that type of question, determined by RBAC.

The user does not choose who to escalate to. Nexus routes it automatically based on the question topic and the brand's RBAC structure. The authorized person answers when they can. The answer is delivered back to the original user in their Nexus conversation. And Nexus absorbs the answer. The next time anyone in the brand asks the same question, Nexus knows.

The institution gets smarter every time a human teaches Nexus something it did not know. Knowledge compounds. When people leave the institution, the knowledge they contributed remains.

---

## 9. Messages

Messages is footer position 4. It is the complete communication layer for the institution. Three channels in one page: Chats (direct messages), Rooms (group channels), and Emails (full email client). Messages is brand-scoped. It shows conversations for the active brand. Switch brands through the Brand Drawer and Messages updates to that brand's conversations.

Top bar: Edit (top-left), centered contextual pill with chevron (Chats/Rooms/Emails dropdown), filter icon (top-right).

The centered pill dropdown switches between three views. Tap the chevron to open the dropdown, select a view, dropdown closes.

Two stacked FABs bottom-right above footer on all three views: compose (top, coral), search (bottom, coral).

### Chats View (default)

- Filter pills (hidden by default, revealed by filter icon): All (with count), Unread, Recently Deleted. Active pill filled black with white text.
- Pinned avatars row. Horizontal scroll of circular avatars with initials and names below. Unread indicator (coral dot) on avatars with new messages. Long press to enter edit mode (minus button to unpin).
- Chat list below. Each row: avatar with initials, name (bold), @handle below name, unread coral dot if unread, message preview text, timestamp on right (13h, Yesterday, Mar 3, etc.).
- Tap row to open conversation thread. Full chat view with messages, input bar at bottom.
- Long press on chat row: iOS-style context menu. Pin/Unpin, Mark as Read/Unread, Hide Alerts, Delete (red).
- Compose FAB: tap to open new message composer. Search recipients by name or @handle.
- Search FAB: tap to open full search. Results grouped: Contacts, Pins, Chats, Links, Photos, Locations, Documents. Each section has "See All."
- Edit button (top-left): tap for dropdown with "Select Chats" (bulk delete/manage) and "Edit Pins."

### Rooms View

- Filter pills (hidden by default): All (with count), Unread, Muted, Archived, Recently Deleted. Scrollable.
- Pinned rooms row. Circular icons with # symbol in colored circles. Room name below (truncated if long). Unread dot indicator.
- Room list below. Each row: # icon in colored circle, room name (bold), lock icon if private room, message preview text, timestamp on right.
- Tap row to open room. Same chat layout as Chats but with thread support (reply to specific messages).
- Long press on room row: iOS-style context menu. Pin, Mark as Read/Unread, Hide Alerts, Leave Room (red).
- Compose FAB: tap to create new room. Room name field with # icon (tappable to change room icon/color/emoji). Description field (optional). Add Members section (search by name or @handle, selected members show as pills). Create button.
- Rooms are brand-scoped. Every course auto-creates a Room (Hub Courses). Every club auto-creates a Room (Campus). Every team or department can have Rooms. RBAC controls who can create rooms and who can join.

### Emails View

- Filter pills (hidden by default): Inbox (with unread count), Starred, Sent, Drafts, Archived. Scrollable.
- No pinned row on Emails.
- Email list. Each row: avatar with initials, sender name (bold), subject line (bold), preview text below subject, status in green ("Opened" with timestamp), timestamp on right, star icon on far right (tap to star/unstar).
- Tap row to open email thread. Full email view with sender, recipients, subject, body, attachments, reply/forward/reply all actions.
- Swipe right on email: Star. Swipe left on email: Archive.
- Long press on email row: iOS-style context menu. Star/Unstar, Mark as Read/Unread, Archive, Move to Folder, Delete (red).
- Compose FAB: tap to open email composer. To, CC, BCC fields. Subject line. Rich text body. Attachments. Send button.
- Email is a full email client. Not a link to Gmail. Institutional email lives inside KaNeXT. Every user gets an institutional email address per brand (e.g., sammy@kanext.io, laolu@lincolnuca.edu).

### Inside a Conversation (Chats and Rooms)

- Messages flow vertically. Sent messages right-aligned. Received messages left-aligned with avatar.
- Input bar at bottom: "+" button (opens attachment sheet: Camera, Photos, Files, Location, Contact, KayPay, Polls, Audio), text input field ("Message" placeholder), mic button, send button.
- Long press on a message (inside conversation): iOS-style context menu.
  - In Chats: Reply, React (emoji picker), Copy, Forward, Delete (red, own messages only).
  - In Rooms: Reply (starts thread), React, Copy, Pin (RBAC controlled), Forward, Delete (red, own messages only, admins can delete any).
- Thread support in Rooms: reply to a specific message creates a thread under that message. Threaded replies collapse. Tap to expand.
- Inline KayPay: type "$" or tap KayPay in the "+" menu to send money within the conversation without leaving Messages.

### Connection to Other Tiles

- Every course in Hub creates a Room automatically. Students and instructor auto-added. Instructor is room admin.
- Every club/organization in Campus creates a Room automatically.
- Every team/department in the brand can have Rooms.
- Nexus Escalations appear as a DM thread in Chats.
- Announcements from Hub push into Messages as system messages.

---

## 10. Pulse

Pulse is footer position 5 (rightmost). It is the single source of truth for everything happening across all brands and all modes. Pulse is the ONLY screen in KaNeXT that breaks the single-brand, single-mode silo. Every other screen is brand-scoped. Pulse sees everything.

"Pulse" centered pill at top. Static label, not a dropdown. No filter icon. No filter pills. No FABs. No Edit button. Just the pill. Clean.

Pull-to-refresh for manual updates. Real-time push for new items (appear at top of relevant section with animation). "New activity" pill appears if user is scrolled down, tap to jump to top.

### Section Structure

Four sections, each auto-hides when empty. Sections with no items do not show at all, not even an empty state. Each section shows max 3 items by default with "See All" to expand. Only one item expanded at a time. Expanding a new item collapses the previous. Tap expanded item again to collapse.

Section order is RBAC-aware. Smart defaults per role:
- Admin/Dean/Coach (R0-R3): Needs Attention, Money, Upcoming, Messages
- Staff/Faculty (R4-R7): Needs Attention, Messages, Upcoming, Money
- Student/Member (R8-R10): Messages, Upcoming, Needs Attention, Money
- Parent/Visitor (R9+): Upcoming, Messages, Needs Attention, Money

### Needs Attention

What is on fire right now. Items sorted by urgency tier (highest first), then chronological within tier.

Urgency tiers (highest to lowest): failed payments and security alerts, RBAC approval requests and expiring documents, missed calls and urgent emails, overdue deadlines and pending actions.

Each item: brand avatar (left), bold action title ("Sarah Chen - 3 missed calls"), brand name subtitle, timestamp (far right), inline action button ("Call Back" / "Reply" / "Approve" / "Review"). Unread items have coral accent dot on left.

Tap item to expand inline: shows full detail and additional action buttons. Examples:
- Missed call expands to: caller info, call history, Call Back / Message / Dismiss buttons.
- RBAC approval expands to: request detail, who requested, what it is, Approve / Deny / Ask for More Info buttons.
- Failed payment expands to: transaction detail, error reason, Retry / Contact Support buttons.
- Overdue deadline expands to: assignment or task detail, how overdue, Open / Snooze / Mark Complete buttons.

Approval requests and payment actions require biometric confirmation before executing.

### Messages

Conversations happening across all brands. New chats and room messages since last check.

Each item: brand avatar, sender name bold (if unread), @handle, brand subtitle, timestamp. Below the item: full message text visible (not truncated).

Inline reply: input field below each message with send button. For DMs, placeholder text says "Reply to [Name]." For Room messages, the card shows "#room-name - Sender: message" and placeholder text says "Reply to #[room-name]." Reply posts directly to the room (everyone sees it) or directly to the DM thread. You read and reply without leaving Pulse.

Multiple messages from same person grouped. Shows latest message with count ("3 messages"). Room messages show the room name prominently so you know where you are posting.

### Upcoming

What is next on your calendar across all brands. Meetings, games, events, deadlines within 24 hours.

Each item: brand avatar, event title bold, brand name plus date/time plus location subtitle, relative timestamp ("in 2h", "Tomorrow at 9am").

Inline action buttons: "Join" for video meetings (launches call), "Details" for events and games, "RSVP" for events not yet confirmed.

Tap to expand: full details, attendees list, location with directions link, action buttons (Join / Reschedule / Decline / Add to Agenda).

### Money

Every dollar moving across all brands. Payments received, payments sent, invoices, KayPay transactions, financial aid disbursements, tuition payments. Completed transactions only. Pending approvals go to Needs Attention.

Each item: brand avatar, transaction title bold ("Payment received - $500"), detail subtitle ("From Alex Kim - KaNeXT - Invoice #4821"), timestamp, "Receipt" button.

Tap to expand: full transaction detail with settlement chain, balance update, action buttons (View Receipt / Send Thanks / Dispute / Open in KayPay).

Section auto-hides for roles that do not have financial activity (a student with no recent transactions does not see Money).

### Gestures and Interactions

- Swipe right-to-left on any item: Mark as Read / Dismiss.
- Swipe left-to-right on any item: Pin to section top.
- Long press on any item: iOS-style context menu. Mark as Read, Pin, Mute Brand (stop seeing this brand in Pulse temporarily), Mute Type (stop seeing this type of notification), Open in Brand (auto-switches entire OS context to that brand and navigates to the relevant screen).

### Notification Routing

Pulse is the single source of truth for all alerts across the app.

Only the Pulse footer icon gets a badge count. This is the total unread count across all brands and all modes. No other footer icon gets a badge. This solves the problem of "which brand has activity" because you check Pulse and it tells you everything.

Brand Drawer unread counts pull from Pulse data. Each brand row in the Brand Drawer shows a number on the far right if there is unread activity in that brand. This number comes from Pulse.

OS push notifications for urgent items (Needs Attention tier 1 and tier 2) deep-link directly into Pulse. Non-urgent items generate silent badge updates only.

### Empty State

All sections empty: centered "You're all caught up" text with Pulse icon above. Clean, satisfying, done.

---

## 11. Pill Pass (RBAC-Controlled Pills Per Tile)

Pills are the horizontal scrollable filter chips that appear below the centered contextual pill on each screen. They are hidden by default and revealed by tapping the filter icon (top-right). The active pill is filled black with white text. Inactive pills are outline style on surface background.

Pills change based on RBAC role. A dean sees administrative pills. A student sees personal pills. A parent sees simplified pills. This section defines the exact pills per role per tile for Education mode.

Universal rule: pills are always hidden by default. Filter icon reveals them. Tapping a pill filters the view. Tapping the active pill again or tapping "All" returns to unfiltered.

### Hub (Section 4.1)

**Overview Tab:**
- Dean (R3): All, Undergraduate, Graduate, At-Risk, New Applications
- Faculty (R4): All, My Courses, Ungraded, Office Hours
- Student (R8): All, Today, This Week, Overdue
- Parent (R9): no pills

**Courses Tab:**
- Dean (R3): All, Business Admin, Diagnostic Imaging, Graduate, Active, Archived
- Faculty (R4): All, Active, Upcoming, Past
- Student (R8): All, In Progress, Completed, Available
- Parent (R9): no pills

**Student Life Tab:**
- Dean (R3): All, Events, Organizations, Housing, Dining, Conduct
- Faculty (R4): All, Events, Organizations
- Student (R8): All, My Orgs, Events, Housing, Dining
- Parent (R9): All, Events

### Agenda (Section 4.2)

- Dean (R3): All, Academic, Administrative, Athletics, Faculty, Campus
- Faculty (R4): All, My Classes, Office Hours, Department, Campus
- Student (R8): All, Classes, Assignments, Exams, Personal
- Parent (R9): All, Child's Schedule, Campus Events

### Social (Section 4.3)

Scope pills (all roles): Brand, Mode, All

Content pills:
- Dean (R3): All, Posts, Reels, Stories, Analytics
- Faculty (R4): All, Posts, Reels, Stories
- Student (R8): All, Posts, Reels, Stories
- Parent (R9): All, Posts, Reels

### Campus (Section 4.4)

**Map View:**
- Dean (R3): All, Academic, Residential, Athletic, Dining, Administrative, Construction
- Student (R8): All, My Classes, Dining, Library, Parking
- Parent (R9): All, Visitor, Admissions, Athletics

**Life View:**
- Dean (R3): All, Organizations, Housing, Dining, Events, Conduct
- Student (R8): All, My Orgs, Housing, Dining, Events
- Parent (R9): All, Events

**Resources View:**
- Dean (R3): All, Academic Support, Health, Career, Technology, Campus Services
- Student (R8): All, Academic, Health, Career, Tech, Services
- Parent (R9): no pills

### Admissions (Section 4.5)

**Pipeline Tab:**
- Dean (R3): All, Inquiry, Applied, Under Review, Accepted, Enrolled, This Term, Next Term
- Student (R8): not visible
- Parent (R9): not visible

**Applications Tab:**
- Dean (R3): All, Received, Pending Documents, Complete, Under Review, Decision Made
- Student (R8): no pills (single application view)
- Parent (R9): no pills

**Campaigns Tab:**
- Dean (R3): All, Active, Upcoming, Completed, Campus Visits, Virtual, Digital
- Student (R8): All, Upcoming, Campus Visits, Virtual
- Parent (R9): All, Upcoming, Campus Visits

### Fund (Section 4.6)

**Give Tab:**
- Dean (R3): All, Annual Fund, Scholarship, Athletics, Capital Campaign, Building, Unrestricted
- Student (R8): All, Annual Fund, Scholarship, Athletics, Senior Class Gift
- Parent (R9): All, Annual Fund, Scholarship, Athletics

**Campaigns Tab:**
- Dean (R3): All, Active, Upcoming, Completed, Giving Day, Capital, Peer-to-Peer
- Student (R8): All, Active, Giving Day, Peer-to-Peer
- Parent (R9): All, Active, Giving Day

**History Tab:**
- Dean (R3): All, This Month, This Year, By Fund, By Donor, Pledges
- Student (R8): All, This Year, Recurring
- Parent (R9): All, This Year, Recurring, Tax Receipts

### KayTV (Section 4.7)

**Featured View:**
- All roles: no pills (curated hero and category rows)

**Library View:**
- Dean (R3): All, Games, Lectures, Events, Promotional, Student, By Department, By Sport
- Student (R8): All, My Courses, Games, Campus, Student
- Parent (R9): All, Games, Events, Campus

**Live View:**
- All roles: no pills

### KayPay (Section 4.8)

**Wallet View:**
- Dean (R3): All, Sent, Received, Purchases, Deposits, Withdrawals, Settlement, Payroll
- Student (R8): All, Sent, Received, Campus, Tuition, Financial Aid
- Parent (R9): All, Sent to Child, Tuition, Received

**Pay View:**
- All roles: no pills

**Invest View:**
- Dean (R3): All, Infrastructure Fund, Crypto, Institutional
- Student (R8): All, Infrastructure Fund, Crypto, Rewards
- Parent (R9): All, Infrastructure Fund, Rewards

### KayStudios (Section 4.9)

KayStudios is cross-mode. Pills are by role within KayStudios, not by institutional role.
- Creator/Admin: All, My Content, Published, Drafts, Analytics
- Consumer: All, Courses, Games, Quizzes, Trivia, Challenges, Flashcards

### Phone Contacts (Section 7)

Pills change per brand:
- KaNeXT Business: All, Leadership, Product, Engineering
- Lincoln Education Dean (R3): All, Faculty, Staff, Students, Athletics, Administration
- Lincoln Education Student (R8): All, Faculty, Staff, Students, Athletics
- Lincoln Education Parent (R9): All, Faculty, Administration

Phone Calls/Missed/Voicemail views: no pills.

### Messages (Section 9)

**Chats View:**
- All roles: All (with count), Unread, Recently Deleted

**Rooms View:**
- Dean (R3): All (with count), Unread, Muted, Archived, Recently Deleted
- Faculty (R4): All, Unread, Muted, Archived
- Student (R8): All, Unread, Muted, Archived
- Parent (R9): All, Unread

**Emails View:**
- Dean (R3): Inbox (with count), Starred, Sent, Drafts, Archived, Folders
- Faculty (R4): Inbox, Starred, Sent, Drafts, Archived
- Student (R8): Inbox, Starred, Sent, Drafts
- Parent (R9): Inbox, Sent

### Pulse (Section 10)

No pills. Static view.

---

## 12. Footer Gesture System

The footer is a 5-position navigation bar fixed at the bottom of every screen. It is always visible except when scrolling down (hides on scroll down, reappears on scroll up). The footer never changes regardless of mode or brand.

Footer positions left to right: Home, Phone, Nexus, Messages, Pulse.

### Home (Position 1)
- Tap: navigate to Home screen (video hero, brand pill, 3x3 grid)
- Hold: open Brand Drawer (bottom sheet)

### Phone (Position 2)
- Tap: navigate to Phone page

### Nexus (Position 3, center)
- Tap: navigate to full Nexus page (standalone chat)
- Double tap: open half-screen contextual overlay on current screen (context-aware, knows what you are looking at)
- Hold: activate voice mode (full-screen voice interface, speak to Nexus)

### Messages (Position 4)
- Tap: navigate to Messages page

### Pulse (Position 5)
- Tap: navigate to Pulse page
- Badge count: only footer icon that shows a badge. Total unread count across all brands and modes.

### Design Notes

Only Home and Nexus have multi-gesture interactions. Phone, Messages, and Pulse are tap only. This keeps the gesture system learnable. Two buttons with gestures, three without.

The Nexus icon is visually distinct (sparkle icon, centered, slightly larger) to signal that it has additional interactions beyond tap.

Footer icons use the KaNeXT color system. Active icon uses label color. Inactive icons use muted label color. No text labels below icons.

---

## 13. Claude Code Implementation Guide

This section provides the design system tokens, component patterns, and data shapes needed to implement KaNeXT OS. This is the deployment spec for Claude Code.

### Tech Stack

- Frontend: React Native / Expo (iOS simulator, TestFlight)
- Backend: Railway proxy (~$5/month)
- Database: PostgreSQL with Supabase migrations
- AI: Anthropic API (Claude Haiku for general queries, Claude Sonnet for basketball intelligence)
- API calls: Nexus calls Anthropic directly via `EXPO_PUBLIC_ANTHROPIC_API_KEY` (bypasses Railway proxy)
- Repo: GitHub at `/coachkanext/kanext-os`
- Data: 37K-player JSON pool export, ESPN, Rolling Insights NCAA Basketball API (planned), Sportradar/Synergy API (trial active)

### Color System (LOCKED)

All colors accessed via the `useColors()` hook which returns the correct set based on system appearance. Never hardcode color values in components.

**Light mode:**
- BG: `#FFFFFF` (pure white)
- Surface: `#F5F5F7` (Apple gray)
- Surface pressed: `rgba(0,0,0,0.04)`
- Label: `#111111` (near black)
- Secondary: `#6B7280` (gray-500)
- Muted: `#9CA3AF` (gray-400)
- Separator: `#E5E7EB` (gray-200)
- Input border: `#D1D5DB` (gray-300)
- Primary (electric blue): `#3B82F6`
- Primary light (soft blue): `#60A5FA`
- Gold: `#C5A55A` (premium moments only)
- Success (green): `#22C55E`
- Danger (red): `#EF4444`
- Warning (amber): `#F59E0B`

**Dark mode (OLED true black):**
- BG: `#000000` (true black)
- Surface: `#1A1A1A`
- Surface pressed: `rgba(255,255,255,0.06)`
- Label: `#F5F5F7`
- Secondary: `#6B7280`
- Muted: `#4B5563`
- Separator: `#2A2A2A`
- Input border: `#333333`
- Primary (soft blue): `#60A5FA`
- Primary light: `#93C5FD`
- Gold: `#D4B96A`
- Success: `#4ADE80`
- Danger: `#F87171`
- Warning: `#FBBF24`

**Mode accent colors (for mode indicator dots and brand context, not primary UI):**
- Sports: `#990000` (maroon)
- Business: `#1D9BF0`
- Education: `#003A63`
- Community: `#7B68A0`
- Personal: `#3B82F6` (same as primary)

**Gold usage rules:** Gold appears ONLY on verified badges, premium tier indicators, achievement unlocks, Capital Points rewards, and investor-level features. If gold shows up everywhere it looks cheap. If it shows up only on premium moments it feels earned.

### Typography

System font only. No custom fonts. No font downloads. San Francisco on iOS, Roboto on Android.

- Page headers: fontSize 28, fontWeight 700
- Section headers: fontSize 20, fontWeight 600
- Card titles: fontSize 17, fontWeight 500
- Body text: fontSize 15, fontWeight 400
- Caption/metadata: fontSize 13, fontWeight 400
- Small labels: fontSize 11, fontWeight 500
- Monospace (code blocks, amounts): system monospace (Menlo on iOS, Roboto Mono on Android), fontSize 13

### Component Patterns

**Centered contextual pill:**
- Positioned top-center of screen. Surface background, rounded full (borderRadius 20), paddingHorizontal 16, paddingVertical 8. Label text fontSize 15, fontWeight 500. Chevron down icon to the right of text. Tap opens dropdown.
- Dropdown: small menu positioned directly below pill. Surface background, separator border, borderRadius 12. Each option is a row with fontSize 15, height 44, paddingHorizontal 16. Active option has primary color text. Tap outside to dismiss.

**Filter pills (horizontal scroll):**
- Hidden by default. Revealed by filter icon (top-right). Horizontal ScrollView with 8px gap between pills.
- Active pill: BG label color (#111111 light, #F5F5F7 dark), text color BG (#FFFFFF light, #000000 dark). Includes count if applicable ("All 4").
- Inactive pill: BG surface, text secondary, border separator. BorderRadius 20, paddingHorizontal 14, paddingVertical 6, fontSize 13, fontWeight 500.

**Pinned row (favorites/rooms):**
- Horizontal ScrollView. Each item: circular avatar (56px diameter) with initials, name below (fontSize 12, maxWidth 64, numberOfLines 1). Unread dot: 10px coral circle positioned top-right of avatar. Gap 16 between items. PaddingHorizontal 16.

**List rows:**
- Height auto (minimum 64). PaddingHorizontal 16, paddingVertical 12. Separator line below (0.5px, separator color, left inset 72px to clear avatar).
- Avatar (40px circle) left. Content area: name (fontSize 15, fontWeight 500, label), subtitle (@handle or preview, fontSize 13, secondary). Timestamp far right (fontSize 12, muted). Unread indicator: coral dot (8px) left of avatar or on content.

**Cards:**
- Surface background, borderRadius 12, border 0.5px separator. Padding 14. No shadows.

**Bottom sheets:**
- Standard iOS pattern. Surface background, 40% dim backdrop, borderTopLeftRadius 16, borderTopRightRadius 16. Grab handle pill at top center (36px wide, 4px tall, muted color, borderRadius 2). Two snap points: 50% and 95%.

**FABs (stacked):**
- Two circular buttons, 48px diameter, stacked vertically with 12px gap. Positioned bottom-right, 16px from edge, above footer.
- Top FAB: primary action (compose). BG primary, icon white.
- Bottom FAB: secondary action (search). BG surface, icon primary, border separator.

**Input bars:**
- Flush to footer, no gap. Surface background, borderTop 0.5px separator. PaddingHorizontal 12, paddingVertical 8. Inner row: "+" button (32px circle, surface pressed BG), text input (flex 1, fontSize 15, placeholder in muted), action buttons right (mic, send). Send button: 32px circle, BG primary when text present, BG surface when empty.

**Footer:**
- Height 48 plus safe area bottom. BG matches screen BG (white light, black dark). BorderTop 0.5px separator. 5 icons evenly spaced. Active icon: label color. Inactive icon: muted color. Nexus icon slightly larger (24px vs 20px).

### Data Shapes

**Brand:**
```
{ id, name, handle, mode, avatarInitials, avatarColor, memberCount, role }
```

**User:**
```
{ id, name, handle, avatarInitials, role, brandId, phone, email, online }
```

**Chat/Message:**
```
{ id, participants[], lastMessage, lastMessageAt, unreadCount, pinned }
{ id, chatId, senderId, content, segments[], createdAt, readAt }
```

**Room:**
```
{ id, name, color, icon, private, brandId, memberCount, lastMessage, lastMessageAt, unreadCount, pinned, muted }
```

**Email:**
```
{ id, from, to[], cc[], subject, preview, body, attachments[], starred, read, openedAt, createdAt, folder }
```

**Course (Hub LMS):**
```
{ id, name, section, instructorId, department, schedule, enrolledCount, modules[], gradebook }
```

**Module:**
```
{ id, courseId, title, order, items[], prerequisiteModuleId }
```

**Assignment:**
```
{ id, courseId, moduleId, title, description, dueDate, points, submissionType, rubric, submissions[] }
```

**Transaction (KayPay):**
```
{ id, type, amount, currency, from, to, brandId, status, settlementChain, createdAt, receiptUrl }
```

**Nexus conversation:**
```
{ id, title, messages[], createdAt, updatedAt, starred, projectId }
{ id, role, content, segments[], createdAt }
```

**Pulse item:**
```
{ id, section, brandId, brandName, brandAvatar, title, subtitle, timestamp, actions[], read, pinned, urgencyTier }
```

### Navigation Architecture

- Footer is always visible (5 positions, fixed bottom)
- Each footer position is a top-level screen (no nested tab navigation within footer)
- Within each screen, the centered contextual pill switches views (Calls/Missed/Voicemail/Contacts, Chats/Rooms/Emails, etc.)
- Tiles are accessed from the Home grid. Each tile is a full-screen push with back gesture
- Side panels are drawer overlays (swipe right or menu icon)
- Bottom sheets for detail views, confirmations, profiles
- Brand Drawer is a bottom sheet from Home button hold
- Nexus overlay is a bottom sheet from Nexus double-tap

### AI Routing Architecture

```
User message → classifyQuery()
  ├── Basketball intelligence → Claude Sonnet
  │   System prompt: SKILL.md + File 01 + relevant legends
  │   Prompt caching on static files (~85% cost reduction)
  │   6-turn conversation history
  └── General query → Claude Haiku
      System prompt: product knowledge + brand context + user RBAC
      20-turn conversation history
```

Tools available to Nexus: pool tools (player search, roster lookup), corpus tools (document search), app data tools (schedule, grades, transactions), web search.

### Demo Data Requirements

All demo data uses real names, realistic numbers, and KaNeXT-specific references. Five test brands pre-loaded:

- Personal: Sammy Kalejaiye (@sammyk), Owner
- Business: KaNeXT (KaNeXT LLC), Owner
- Education: Lincoln University (Oakland, CA), Owner
- Sports: LU Men's Basketball, Owner
- Community: ICCLA, Owner

Default active brand: KaNeXT. Each brand has 10-20 mock contacts, 5-10 mock conversations, 3-5 mock rooms, realistic transaction history, and mode-appropriate content across all tiles.

---

## 14. Community Mode

Community mode is the operating environment for churches, ministries, and faith-based organizations. The demo brand is ICCLA - International Christian Center Los Angeles. Founded and pastored by Drs. Oladipo and Nonyelum Kalejaiye. Interdenominational, Pentecostal. One of the fastest growing Pentecostal churches in California founded by a pastor of African origin. Multicultural, grace-centered. Has 10 ministries, a radio ministry (Hotline to Heaven), and an existing mobile app.

Community mode RBAC roles for the demo: Pastor (R1), Ministry Leader (R3), Volunteer (R5), Member (R8), Visitor (R10).

Community mode home grid:

| Hub | Agenda | Social |
|-----|--------|--------|
| Members | Outreach | Give |
| KayTV | KayPay | KayStudios |

ICCLA Ministries (10): Men Wondered At Fellowship (men's), Virtuous Women's Ministry (women's), T.O.R.C.H. Nation (young adults, led by David Eze), Sheepfold (children's church), Fresh Fire Teens Church (youth), Rooted (new member connection/discipleship), ICC Connect Groups (small groups/fellowship), Vineyard Voices (music ministry, led by Dr. Kunle Pinmiloye aka Ksticks), Single Saved Serving (singles), The Harvesters (evangelism/outreach).

### 14.1 Community Hub

The Hub is the operations center and ministry management system for the church. It replaces Planning Center, Subsplash, Pushpay, Church Community Builder, and every disconnected church management tool. One screen, three tabs, RBAC determines depth. This is where the church runs and where members experience their faith community digitally.

Tabs: Overview / Services / Groups

Side panel (swipe right or menu icon). Pastor: church dashboard shortcut, announcements composer, visitor follow-up queue, volunteer gaps (unfilled positions this week), attendance trends, financial overview, ministry health scores, settings. Ministry Leader: my ministry dashboard, my volunteer schedule, upcoming ministry events, announcements from pastor, settings. Volunteer: my schedule, my teams, upcoming services, block out dates, settings. Member: my next service, my groups, my volunteer schedule, sermon notes, giving shortcut, settings. Visitor: about ICCLA, service times, beliefs, connect card, Rooted signup, settings.

#### Overview Tab

**Pastor View (R1):**
- Church health dashboard at the top. Weekly attendance (this Sunday vs last Sunday vs 4-week average), total membership count, new members this month, first-time visitors this month, baptisms this year.
- Giving summary cards. Tithes and offerings this week, this month, year-to-date vs budget. Average gift amount. Recurring donor count. Giving trend line.
- Visitor follow-up pipeline. Funnel: First Visit, Connected (filled out connect card), Follow-Up Sent, Returned, Joined Rooted, Became Member. Each stage shows count and conversion rate. Tap any stage to see the people in it. Automated workflows trigger follow-up at each stage.
- Ministry health overview. All 10 ministries listed with health indicators: volunteer fill rate (percentage of volunteer slots filled), attendance trend (up/down/flat), leader engagement score. Red flag ministries that need attention highlighted.
- Announcements composer. Draft and push announcements to entire congregation, specific ministries, specific groups, or individuals. Schedule announcements for future delivery. Announcements appear in recipients' Pulse and Messages.
- Upcoming services preview. This Sunday's service status: volunteers confirmed (8/12 filled), service order drafted (yes/no), sermon notes uploaded (yes/no). Quick tap to jump to Services tab.
- At-risk members. Members flagged by the system: attendance dropped (missed 3+ consecutive weeks), giving stopped, disengaged from groups. Tap to see details and assign follow-up.
- Quick actions row: View Visitors, Schedule Volunteers, Create Announcement, Financial Report.
- For ICCLA demo: weekly attendance 180, membership 420, 8 first-time visitors this month, tithes this month $42,000, 10 ministries with health scores.

**Ministry Leader View (R3):**
- My ministry dashboard. Ministry name (e.g., "T.O.R.C.H. Nation - Young Adults"), member count, volunteer count, next ministry event.
- Volunteer status for this week. Who is confirmed, who hasn't responded, open positions that need filling. One-tap to message unconfirmed volunteers.
- Recent ministry activity. Attendance at last ministry event, new members who joined the ministry, messages in ministry Room.
- Announcements from pastor. Church-wide and ministry-specific announcements.
- Quick actions: Schedule Volunteer, Post to Ministry Room, View My Ministry Members.

**Volunteer View (R5):**
- My volunteer schedule at the top. Next service or ministry event where they are serving. Role, date, time, location, team members. Confirm/decline buttons if pending.
- Upcoming schedule. All scheduled volunteer slots for the next 4 weeks. Tap any to see details. Block out dates button (mark unavailable dates, syncs to Agenda).
- Announcements. Church-wide announcements and announcements for teams they serve on.
- My groups. Groups they belong to with latest activity preview.

**Member View (R8):**
- Next service at the top. This Sunday's service time, location, sermon series name and topic preview. "I'm coming" RSVP button (optional, helps pastor estimate attendance).
- Latest sermon. Card showing last week's sermon title, speaker, scripture reference, "Watch" button (links to KayTV) and "Notes" button (links to sermon notes in Services tab).
- My groups. Connect groups and ministries they belong to. Each shows: group name, next meeting, last activity. Tap to enter group detail.
- My volunteer schedule (if they serve). Next scheduled service with role. Confirm/decline.
- Announcements. Church-wide announcements. Unread badge count.
- Quick actions: Watch Last Sermon, Find a Group, Volunteer, Give.

**Visitor View (R10):**
- Welcome section. "Welcome to ICCLA" with church photo. Brief description: "International Christian Center Los Angeles - A Multicultural Christian Haven for Worshipping Jesus Christ."
- About ICCLA. Pastors Oladipo and Nonyelum Kalejaiye, vision statement, core beliefs, what to expect on your first visit.
- Service times and location. Sunday service schedule, address, directions button (opens native maps), parking info.
- Digital connect card. Name, email, phone, how did you hear about us, prayer requests. Submit button. Submitting creates a prospect in the visitor follow-up pipeline and sends a welcome email automatically.
- Rooted signup. "New to ICCLA? Join Rooted - connect with God, the ICCLA family, and your purpose in unexpected, life-changing ways." Sign up button.
- Explore ministries. Scrollable cards for each ministry with brief description and "Learn More" button.
- Watch a sermon. Featured recent sermon card with "Watch" button linking to KayTV.

#### Services Tab

This is the worship planning and sermon management system. It replaces Planning Center Services. The weekly service is the core operational unit of a church, the way a course is the core unit of a school.

**Pastor View (R1):**
- Service list. All upcoming and past services. Each card: date, service type (Sunday Morning, Wednesday Night, Special Event), sermon title, status (Draft, Ready, Complete), volunteer fill count.
- Tap service to enter Service Detail View:

**Service Detail View (Pastor):**
- Service date, time, type at top.
- Order of service. Drag and drop items to build the flow: Pre-Service (worship team warmup, prayer), Welcome and Announcements, Worship Set (song 1, song 2, song 3), Offering, Sermon, Altar Call, Closing Song, Dismissal. Each item: title, assigned person, duration, notes. Add item button. Color-code items by type.
- Sermon section. Title, speaker (default: Pastor Dipo), scripture references, sermon notes (rich text), sermon series info (series name, week number, series art). Upload sermon audio/video to KayTV directly from here. Sermon notes visible to members after service.
- Worship planning. Song list with keys, arrangements, tempo. Chord charts and lyrics viewable by worship team. Link to rehearsal audio. Integration with song library (search by title, key, theme, scripture). For ICCLA: Vineyard Voices music ministry led by Dr. Kunle Pinmiloye.
- Volunteer assignments. All volunteer roles for this service: Worship Team (lead vocals, guitar, keys, drums, bass, backup vocals), Production (sound, lights, slides/projection), Ushers, Greeters, Nursery/Sheepfold (children's church), Youth/Fresh Fire, Parking, Setup/Teardown. Each role shows assigned person or "Open" if unfilled. Tap open slot to search and assign. Send schedule requests. Auto-reminders 48 hours and 2 hours before service.
- Check-in setup. Enable check-in for this service. Child check-in with security codes (parent receives matching label). Visitor check-in (auto-creates prospect in pipeline). Attendance tracking.
- Service notes. Private notes visible only to service team ("Remember to announce building fund", "Special prayer for the Johnson family").
- After service: mark complete. Attendance auto-recorded from check-ins. Sermon auto-published to KayTV. Notes released to members.
- For ICCLA demo: 4 upcoming Sundays with service orders, sermon series "The Recipe for Divine Manifestation" (Parts 1-4), 15+ volunteer roles per service.

**Ministry Leader View (R3):**
- Upcoming services where their ministry is involved. Worship leaders see their song assignments and rehearsal schedule. Children's church leaders see their volunteer schedule for Sheepfold.
- Can view service order (read only, cannot edit).
- Can manage their own ministry's volunteer slots within the service.

**Volunteer View (R5):**
- My upcoming services. Each shows: date, role, time to arrive, team members, service order (what comes before and after their part). Confirm/decline button.
- Song charts and rehearsal materials (if worship team). Audio files for practice. Chord charts with key and arrangement notes.
- Service notes relevant to their role.

**Member View (R8):**
- Sermon library. Past messages organized by series. Each sermon card: title, speaker, date, scripture, series name with art. Tap to see: full sermon notes (text), watch button (KayTV link), audio player (listen without video), scripture references (tappable, opens Bible passage), share button.
- Current series highlighted at top. "The Recipe for Divine Manifestation" with series art, description, and all parts listed.
- Sermon search. Search by topic, scripture, speaker, date, keyword.
- Upcoming service. This Sunday's sermon topic preview (if pastor has published it).
- Nexus integration: "What did Pastor Dipo preach about last Sunday?", "Find me a sermon about grace", "What scriptures were in the Divine Manifestation series?"

**Visitor View (R10):**
- Featured sermon. One sermon card to introduce them to the teaching style.
- Service times and what to expect breakdown.
- "Watch Live" button linking to KayTV live stream.

#### Groups Tab

All the ways people organize within the church. Connect groups, ministries, volunteer teams, Bible studies. The equivalent of Student Life in Education.

**Pastor View (R1):**
- All groups overview. Total groups count, total group members, group participation rate (percentage of members in at least one group).
- Ministry management. All 10 ICCLA ministries listed: Men Wondered At Fellowship, Virtuous Women's Ministry, T.O.R.C.H. Nation, Sheepfold, Fresh Fire Teens Church, Rooted, ICC Connect Groups, Vineyard Voices, Single Saved Serving, The Harvesters. Each shows: leader name, member count, volunteer count, meeting schedule, health score. Tap for full ministry detail.
- Connect Groups management. All small groups with: leader, meeting day/time/location, member count, open seats, curriculum/study topic. Create new group button.
- Volunteer teams. All volunteer teams across all ministries. Fill rates, scheduling gaps, burnout indicators (volunteers serving too frequently without breaks).
- Group analytics. Which groups are growing, which are shrinking, which have low attendance. Recommendations from Nexus.
- New group request queue. Members can request to start a new group. Pastor approves/denies.

**Ministry Leader View (R3):**
- My ministry detail. Full view of their ministry: description, mission, member list, volunteer list, upcoming events, past events, ministry Room (links to Messages), photos, resources.
- Member management for their ministry. Add/remove members. Assign roles within the ministry (leader, co-leader, member). View attendance per event.
- Event planning for their ministry. Create ministry-specific events (meeting, outing, service project). RSVP tracking. Send reminders via Messages.
- Resources. Upload ministry-specific documents, study guides, schedules. Members can access from within the group.
- For ICCLA demo: David Eze leading T.O.R.C.H. with 35 young adults, Dr. Kunle Pinmiloye leading Vineyard Voices with 20 musicians.

**Volunteer View (R5):**
- My teams. Volunteer teams they are part of. Each shows: team name, leader, next scheduled date, role.
- Group directory. Browse and request to join connect groups and ministries.

**Member View (R8):**
- My groups. Groups and ministries they belong to. Each shows: name, type (Connect Group, Ministry, Bible Study), next meeting, latest activity, member count. Tap to enter group.
- Inside a group: description, member list, meeting schedule, shared resources, group Room (links to Messages), photo gallery, attendance history.
- Group directory. Browse all available groups. Filter by type (Connect Group, Ministry, Bible Study, Volunteer Team), meeting day, topic. Each shows: name, description, leader, meeting schedule, open seats. "Join" or "Request to Join" button.
- Rooted progress (if enrolled). Progress through Rooted sessions with completion tracking.
- Nexus integration: "What groups meet on Wednesday nights?", "Join the men's fellowship", "Who leads Vineyard Voices?"
- For ICCLA demo: member belongs to one Connect Group (Tuesday Night Bible Study, 12 members, led by Deacon Johnson), one ministry (The Harvesters, 25 members). Group directory shows all 10 ministries plus 6 Connect Groups.

**Visitor View (R10):**
- Explore groups. Read-only view of available groups and ministries. Each shows description and "I'm interested" button (adds to their connect card data for follow-up).
- Rooted spotlight. Rooted is the recommended first step. "Join Rooted and discover your place at ICCLA."

---

### 14.2 Community Agenda

Agenda in Community mode is the church calendar. Same structure as Education Agenda (Day / Week / Month views, centered contextual pill, filter icon, side panel). Content shifts entirely based on RBAC role.

Side panel (swipe right or menu icon). Pastor: upcoming service prep deadlines, unconfirmed volunteers, ministry event conflicts, building availability, quick-add event, settings. Ministry Leader: my ministry upcoming events, my volunteer schedule, quick-add ministry event, settings. Volunteer: my serving schedule, block out dates, team rehearsals, settings. Member: my groups' meeting times, church events I RSVPed to, service reminders, settings. Visitor: upcoming public events, service times, settings.

#### Day / Week / Month Views

**Pastor View (R1):**
- Full church calendar. Every event across every ministry, every service, every meeting. Color-coded by type: services (blue), ministry events (green), administrative meetings (gray), counseling appointments (private, purple), building reservations (orange), community outreach events (teal).
- Service blocks show: service type, volunteer confirmation status (8/12 confirmed), sermon prep status. Tap to jump to service detail in Hub Services.
- Ministry events show: ministry name, leader, expected attendance, room assignment.
- Conflict detection. Visual warning when two events overlap in the same room or when a volunteer is double-booked.
- Create event. Full event creation: title, type, date/time, duration, location (room picker showing availability), recurring (weekly, biweekly, monthly, custom), description, attach ministry, assign volunteers, RSVP toggle, public/private toggle. Events auto-create a Room in Messages and appear in attendees' Agenda.
- Building and room management. View all rooms and their schedules. Sanctuary, fellowship hall, nursery, youth room, conference room, parking lot. Block rooms for maintenance or special events.
- Hotline to Heaven radio schedule. Recurring broadcast times visible on the calendar.
- For ICCLA demo: Sundays (Morning Service 10am), Wednesdays (Midweek Prayer 7pm), Tuesday (Connect Group 7pm), Thursday (Vineyard Voices Rehearsal 6:30pm), Saturday (T.O.R.C.H. meetup biweekly 5pm), monthly events (Men Wondered At Fellowship first Saturday, Virtuous Women second Saturday).

**Ministry Leader View (R3):**
- Church-wide services and events plus their ministry's events highlighted. Their ministry events in bold or accent-colored.
- Can create events for their ministry only. Room request goes to pastor for approval if room is shared.
- Volunteer schedule for their ministry. Who is serving when. Gaps visible.
- Rehearsal and preparation events. Vineyard Voices rehearsal, Sheepfold teacher prep, Harvesters outreach planning.

**Volunteer View (R5):**
- My serving schedule prominent. Service dates where they are assigned shown as colored blocks with role label ("Usher - Sunday 10am", "Drums - Sunday 10am"). Confirm/decline if pending.
- Team events. Rehearsals, team meetings, training sessions for their volunteer teams.
- Church-wide events. Services and open events shown but lighter/secondary to their personal schedule.
- Block out dates. Long press on any date to mark unavailable. Syncs to Hub volunteer scheduling so leaders know not to schedule them.

**Member View (R8):**
- Church services on the calendar. Every Sunday and Wednesday recurring.
- My group meetings. Connect Group meeting times, ministry meetings for ministries they belong to. Each shows group name, time, location.
- Events I RSVPed to. Church events they said "I'm coming" to. Reminder notifications before each.
- Church-wide events. Open events anyone can attend: Rhythms From The Roots, holiday celebrations, baptism services, special guest speakers. RSVP button on event cards.
- Sermon reminders. If current sermon series has study materials, a reminder to complete weekly reading before Sunday.
- Nexus integration: "When is the next T.O.R.C.H. meeting?", "What's happening this Saturday at church?", "Add Wednesday prayer to my calendar."

**Visitor View (R10):**
- Public events only. Sunday service times recurring. Special events (Rhythms From The Roots, Christmas service, Easter). Rooted session dates.
- Each event card shows: title, date/time, location, description, RSVP or "I'm interested" button.
- Service times prominently displayed. "Join us this Sunday at 10am."

---

### 14.3 Community Social

Social in Community mode is the church's internal and external social platform. Same structure as Education Social (Feed/Reels/Profile views, scope filter Brand/Mode/All, create flow). It replaces the church's scattered presence across Facebook, Instagram, YouTube, and TikTok with one owned platform where every interaction happens inside the KaNeXT ecosystem.

Community mode adds one unique feature no other mode has: the Prayer Wall. Prayer requests submitted by members appear as a special post type in the feed. Other members can tap "Praying" (instead of "Like") to show support. Prayer requests can be anonymous. Answered prayers can be marked as "Answered" which triggers a celebration animation and moves them to a Testimonies section.

Scope filter: Brand (ICCLA only), Mode (all Community brands), All (everything across all modes).

#### Feed View

**Pastor View (R1):**
- Full feed with all content from the brand. Posts, reels, stories from all members and the church account.
- Create button. Can post as the church brand (ICCLA official) or as personal account. Post types: text, photo, video, event announcement, prayer request, testimony, scripture graphic, sermon clip, poll.
- Pin posts to top of feed (pinned announcement stays at top for all members).
- Moderate content. Remove posts, hide posts, flag for review. Content moderation queue accessible from side panel.
- Analytics on all posts: reach, engagement, shares, saves.
- Prayer Wall management. View all prayer requests, mark as followed up, assign pastoral care team to sensitive requests.

**Ministry Leader View (R3):**
- Full feed. Can post as themselves or on behalf of their ministry.
- Create button. Post types: text, photo, video, ministry update, event promotion, volunteer callout, prayer request.
- Can pin posts within their ministry's content (if viewing ministry-filtered feed).
- Ministry spotlight posts. Highlight what their ministry is doing with photos, videos, and member features.

**Volunteer View (R5):**
- Full feed. Can post as themselves.
- Create button. Standard post types: text, photo, video, prayer request, testimony.
- Can share and interact with all content. Like, comment, share, save, "Praying" on prayer requests.

**Member View (R8):**
- Full feed. Posts from the church, ministries, and other members.
- Create button. Post types: text, photo, video, prayer request (can be anonymous), testimony, scripture share.
- Prayer Wall visible in feed as special cards with "Praying" button instead of "Like." Anonymous requests show "A Member" as the poster.
- Interact with all content. Like, comment, share, save, "Praying."
- Testimony posts. Share how God has worked in their life. Testimony posts get a special badge and can be featured by the pastor.

**Visitor View (R10):**
- Feed visible (public posts only). Can like and comment. Cannot create posts or prayer requests until they become a member.
- Can see the Prayer Wall (public requests only). Can tap "Praying."
- Profile tab shows their own minimal profile. "Join ICCLA" prompt to upgrade to member.

#### Reels View

- Short-form video feed. Same structure as Education.
- Pastor can post sermon clips, worship highlights, behind-the-scenes ministry moments as official ICCLA reels.
- Ministry leaders post ministry highlights.
- Members post personal faith content, worship moments, testimony clips.
- Visitors can watch but not post.

#### Profile View

- Same structure as Education. Profile photo, bio, follower/following counts, post grid.
- Church brand profile (ICCLA): all official posts, sermon clips, event announcements, ministry spotlights, prayer wall highlights, testimony features.
- For ICCLA demo: 15-20 mock posts across types. 3 prayer requests (1 anonymous, 1 answered with celebration, 1 active with 12 "Praying" responses). 2 testimonies. 3 sermon clips from "The Recipe for Divine Manifestation" series. 2 ministry spotlight posts (T.O.R.C.H. event, Vineyard Voices rehearsal). 2 event announcement posts (Rhythms From The Roots, Sunday service). 1 pinned announcement from Pastor Dipo.

---

### 14.4 Community Members

Members is the people tile for the church. Position 4 in the grid. Same pattern as Roster (Sports), Team (Business), Campus (Education), Network (Personal). It is the church directory, the member database, the attendance tracker, the visitor follow-up system, the volunteer manager, the household manager, and the spiritual growth tracker. It replaces Planning Center People, Breeze, ChurchTrac membership modules, and every spreadsheet a church uses to track its congregation.

Views: Directory / Households / Check-In (centered contextual pill to switch)

Side panel (swipe right or menu icon). Pastor: membership dashboard (total members, new this month, attendance trends, engagement scores), quick search, visitor follow-up queue, at-risk members, background check status, custom lists builder, tags manager, export, settings. Ministry Leader: my ministry members, quick search, attendance for my ministry, settings. Volunteer: quick search, my teams, settings. Member: quick search, my profile, my household, settings. Visitor: my connect card status, settings.

#### Directory View

**Pastor View (R1):**
- Full member directory. Every person connected to ICCLA: members, regular attendees, visitors, children, staff, volunteers. Total count at top.
- Each person card: avatar, name (bold), role badge (Pastor, Ministry Leader, Volunteer, Member, Visitor), @handle, phone, email, last attendance date, engagement score (computed from attendance + giving + group participation + volunteering). Online indicator.
- Search bar at top. Search by name, phone, email, address, tags.
- Filter pills: All, Members, Regular Attendees, Visitors, Children, Staff, Volunteers, New (last 30 days), At-Risk, Inactive, By Ministry, By Tag.
- Tap person to open full Member Detail Page:

**Member Detail Page (Pastor view):**
- Profile header: avatar (photo or initials), name, role badge, membership status (Active Member, Regular Attendee, Visitor, Inactive), member since date, baptism date.
- Contact section: phone (tappable to call), email (tappable to email), address, social handles.
- Household section: family members linked (spouse, children, parents). Tap any family member to view their profile.
- Engagement dashboard: attendance chart (last 12 weeks, visual), giving summary (this year total, last gift date, trend), groups and ministries they belong to, volunteer roles, spiritual milestones (salvation date, baptism date, completed Rooted, membership class, serving, leading).
- Spiritual growth pathway. Visual timeline: First Visit, Connected, Rooted, Baptized, Serving, Leading, Multiplying. Shows where this person is on their journey. Pastor can update milestones.
- Communication log. Every interaction auto-pulled from Messages, Phone, Email. Private pastoral notes (visible only to R1-R2). Add note button.
- Tags. Custom tags for segmentation: "Men's Fellowship", "Worship Team", "Tither", "New Parent", "College Student", "International." Add/remove tags.
- Follow-up workflows. Active workflows this person is in (visitor follow-up, new member onboarding, re-engagement). Progress through workflow steps visible. Pastor can manually add to a workflow.
- Background check status (for volunteers). Ordered, passed, expiration date. Order new check button.
- Actions row: Call, Message, Email, Add to Group, Add to Workflow, Assign Pastoral Visit.
- For ICCLA demo: 30-40 mock member profiles with varied engagement levels. 5 visitors in follow-up pipeline, 3 at-risk members (missed 3+ weeks), 2 new members this month.

**Ministry Leader View (R3):**
- Directory filtered to their ministry by default. Can switch to full directory.
- Each person card: avatar, name, role within their ministry (leader, co-leader, member, volunteer), contact info, last attendance at ministry event.
- Filter pills: All, My Ministry, Leaders, Members, Volunteers, Active, Inactive.
- Tap person: simplified detail page. Contact info, attendance at ministry events, volunteer schedule, communication log (ministry-related only). No giving data, no pastoral notes, no background checks.
- Can add people to their ministry. Search and invite.

**Volunteer View (R5):**
- Directory of people in their volunteer teams. Can also browse full directory.
- Each person card: avatar, name, role, contact info.
- Filter pills: All, My Team, Serving This Week, Available.
- Tap person: contact info and quick actions (Call, Message). No engagement data, no pastoral notes.

**Member View (R8):**
- Church directory. All members and regular attendees (not visitors, not children unless parent). Each card: avatar, name, ministry/group affiliation, contact info. Privacy settings respected (members can hide phone/email/address from directory).
- Search by name.
- Filter pills: All, Leadership, By Ministry, By Group.
- Tap person: public profile. Name, avatar, groups/ministries they belong to, contact info (if shared). Quick actions: Call, Message.
- My profile. Edit own profile: photo, bio, contact info, privacy settings (choose what to share in directory), notification preferences.

**Visitor View (R10):**
- Limited directory. Can see pastors and ministry leaders (public leadership directory). Cannot see general member list.
- Filter pills: none (simplified view).
- My connect card status. If they submitted a digital connect card, shows "Thank you! Someone from our team will reach out soon."

#### Households View

**Pastor View (R1):**
- All households listed. Each household card: family last name, family photo (if uploaded), family members listed (with ages for children), address, primary contact phone.
- Filter pills: All, Families with Children, Couples, Singles, New Households, By Neighborhood.
- Household analytics. Average household size, families with children count, single-member households.
- Tap household to see all family members, their individual profiles linked, household communication log, household giving summary (combined family giving).
- Create household. Link existing members into a family unit. Set primary contact. Define relationships (spouse, child, parent, grandparent).
- For ICCLA demo: 15 mock households. Mix of families with children, couples, and single-member households.

**Ministry Leader View (R3):**
- Households of members in their ministry. Useful for knowing family context (e.g., children's church leader sees which families have kids in Sheepfold).

**Member View (R8):**
- My household. See and edit own household members. Add family members (spouse, children). Set relationships.

**Visitor View (R10):**
- Not visible.

#### Check-In View

**Pastor View (R1):**
- Check-in dashboard. Live check-in feed for current or most recent service. Total checked in, breakdown by service area (Main Sanctuary, Sheepfold/Children, Fresh Fire/Youth, Nursery).
- Filter pills: All, Main Sanctuary, Children, Youth, Nursery, Volunteers, Visitors, This Week, This Month.
- Child check-in management. Security code system: parent checks in child, receives a security label with unique code. Child receives matching label. Pickup requires matching code. Allergies and special needs flagged on child's check-in label.
- Visitor check-in. First-time visitors flagged with special badge. Auto-creates prospect in Outreach pipeline. Assigns follow-up team.
- Attendance history. Week-over-week attendance chart. Filter by service type, date range. Identify trends (Easter spike, summer dip, etc.).
- Volunteer check-in. Volunteers check in when they arrive for their shift. Track who showed up vs who was scheduled.
- Check-in station setup. Configure check-in kiosks (iPad stations at entrance). Self-service or greeter-assisted. Configure which service areas are available.

**Ministry Leader View (R3):**
- Check-in for their ministry events. Can run check-in for T.O.R.C.H. meetings, Vineyard Voices rehearsals, etc. See who attended.
- Attendance reports for their ministry.

**Volunteer View (R5):**
- Self check-in. Tap to confirm arrival for their scheduled service.
- If assigned to check-in team (greeters, ushers): can check in other people at the door. Search by name, scan QR from member's app, or manual entry.

**Member View (R8):**
- Self check-in for services. Tap "I'm here" when arriving at church. Or scan QR at entrance kiosk.
- Check in children. Select which children to check in, select service area (Sheepfold, Fresh Fire, Nursery). Receive security code. Quick, under 30 seconds.
- Attendance history. See own attendance streak and history.

**Visitor View (R10):**
- First-time check-in. Digital connect card doubles as check-in. Name, email, phone, how they heard about ICCLA, prayer requests. Submit creates check-in record and prospect in Outreach pipeline.

---

### 14.5 Community Outreach

Outreach is the pipeline and evangelism tile for the church. Position 5 in the grid. Same pattern as Recruits (Sports), Inquiries (Business), Admissions (Education), Deals (Personal). It is the visitor assimilation pipeline, the community outreach campaign manager, and the evangelism coordination system. It replaces VisitorReach, Planning Center workflows, spreadsheet-based visitor tracking, and every disconnected follow-up process. ICCLA's Harvesters ministry is the outreach arm, and this tile is their operational hub.

Views: Pipeline / Campaigns / Events (centered contextual pill to switch)

Side panel (swipe right or menu icon). Pastor: outreach dashboard (total visitors this month, return rate, assimilation rate, pipeline conversion metrics), follow-up queue (overdue items), campaign performance summary, Harvesters activity log, automated workflow editor, settings. Ministry Leader (Harvesters): my outreach team, assigned prospects, follow-up queue, campaign assignments, settings. Volunteer: my assigned follow-ups, upcoming outreach events, settings. Member: community events, volunteer for outreach, invite a friend tool, settings. Visitor: not visible.

#### Pipeline View

**Pastor View (R1):**
- Visitor assimilation funnel at the top. Visual pipeline with stage counts and conversion rates: Explorer (found us online), First Visit (attended a service), Connected (submitted connect card or checked in), Follow-Up Sent (automated or manual contact made), Returned (attended a second time), Joined Group (entered Rooted, Connect Group, or ministry), Became Member (official membership).
- Below funnel: list of all prospects sorted by most recent activity. Each prospect card: name, avatar (or initials), current pipeline stage, source (how they found ICCLA: website, social media, invite from member, community event, walk-in), last interaction date, assigned follow-up person, days in current stage.
- Tap prospect for full detail page: contact info, all interactions (auto-pulled from Messages, Phone, Email, check-in records), connect card responses (including prayer requests), assigned follow-up team member, notes, pipeline history timeline, next action due.
- Drag and drop prospects between stages.
- Automated workflow engine. Build multi-step follow-up sequences triggered by pipeline stage:
  - First Visit triggers: immediate "Thank you for visiting ICCLA" text, next day email from Pastor Dipo with sermon link and welcome message, day 3 personal phone call from Harvesters team member, day 7 invitation to Rooted or upcoming event.
  - Returned triggers: personal message from ministry leader, invitation to a Connect Group, invitation to serve.
  - Joined Group triggers: welcome to group, resource sharing, check-in after first meeting.
  - Inactive (30+ days no activity) triggers: re-engagement message, "We miss you" text, pastoral care flag.
- Workflow builder: set trigger, add steps (text, email, task assignment, wait period, condition branch), set timing. Each step shows completion rate analytics.
- Source tracking. Where are visitors coming from? Pie chart: social media, website, member invites, community events, walk-ins, Hotline to Heaven radio. Helps pastor know which outreach channels are working.
- Conversion metrics. First Visit to Connected rate, Connected to Returned rate, Returned to Member rate. Week over week trends.
- Filter pills: All, Explorer, First Visit, Connected, Follow-Up Sent, Returned, Joined Group, Member, Inactive, This Week, This Month, By Source, Overdue Follow-Ups.
- For ICCLA demo: 25 prospects in pipeline across all stages. 8 first-time visitors this month, 3 in follow-up, 2 returned, 1 just joined Rooted. 2 automated workflows active (visitor follow-up, re-engagement).

**Ministry Leader View (R3) - Harvesters:**
- Pipeline filtered to prospects assigned to their team. Can see full pipeline in read-only mode.
- Follow-up queue. Prospects with overdue or upcoming follow-up tasks. Each shows: name, task description ("Call to welcome"), due date, status (overdue in red, due today in amber, upcoming in default).
- Filter pills: All, My Assignments, Overdue, Due Today, This Week, By Stage.
- Tap prospect for detail page (same as pastor but no workflow editor, no financial data). Can add notes, log interactions, mark tasks complete, reassign to another team member.
- Campaign assignments. Which outreach campaigns their team is responsible for.

**Volunteer View (R5):**
- My assigned follow-ups only. Simplified list of people they are responsible for contacting.
- Filter pills: All, Overdue, Due Today, This Week, Completed.
- Each card: name, task ("Send welcome text"), due date. Tap to see contact info and log the interaction.
- Cannot see full pipeline, cannot see other volunteers' assignments.

**Member View (R8):**
- Not pipeline access. Instead sees:
- "Invite a Friend" tool. Generate a personal invite link or QR code to share. When someone uses the link to visit ICCLA's page or fill out a connect card, the member gets credit as the referral source. Track how many friends they've invited and who visited.
- Upcoming outreach events they can volunteer for or attend.
- Nexus integration: "Generate an invite link for Sunday's service", "How many friends have I invited this year?"

**Visitor View (R10):**
- Not visible. Visitors experience the pipeline from the other side through Hub (welcome, connect card) and Members (check-in).

#### Campaigns View

**Pastor View (R1):**
- Outreach campaign management. Active and past campaigns. Each campaign card: name, type, status, date range, reach count, prospects generated, cost (if applicable).
- Campaign types:
  - Community Event (block party, back-to-school drive, food bank, community service day). Tracks: attendees, connect cards collected, follow-ups initiated.
  - Digital Campaign (social media ads, targeted posts, email blast to community list). Tracks: impressions, clicks, connect card submissions.
  - Door-to-Door (Harvesters evangelism). Tracks: homes visited, conversations, prayer requests collected, invitations accepted.
  - Partner Event (joint events with other churches, community organizations). Tracks: attendees, new contacts.
  - Invite Campaign (member-driven, "Bring a Friend Sunday"). Tracks: invites sent, friends who attended, conversion to return visitors.
  - Hotline to Heaven radio promotion. Tracks: new listeners, listeners who visited in person.
- Create Campaign button. Set type, name, date range, team assignment, budget, goals, target audience.
- Campaign analytics: reach, engagement, conversion to first visit, cost per visitor acquired.
- Filter pills: All, Active, Upcoming, Completed, Community Events, Digital, Door-to-Door, Invite, By Team.
- For ICCLA demo: "Spring Block Party" (community event, completed, 120 attendees, 15 connect cards), "Bring a Friend Sunday" (invite campaign, active, 45 invites sent, 8 friends attended), "Harvesters Saturday Outreach" (door-to-door, recurring monthly).

**Ministry Leader View (R3) - Harvesters:**
- Campaigns assigned to their ministry. Can create campaigns within their ministry scope (pending pastor approval for budget).
- Filter pills: All, My Campaigns, Active, Upcoming, Completed.
- Campaign detail: team roster, assigned areas (for door-to-door), materials needed, results tracking.

**Volunteer View (R5):**
- Campaigns they are participating in. Sign up for upcoming outreach events.
- Filter pills: All, My Campaigns, Upcoming, Sign Up.

**Member View (R8):**
- Public outreach events they can attend or volunteer for. "Spring Block Party" with RSVP. "Bring a Friend Sunday" with invite tool.
- Filter pills: All, Upcoming, Volunteer Opportunities.
- Invite Campaign participation. See active invite campaigns with personal invite link and tracking.

#### Events View

**Pastor View (R1):**
- Community outreach events calendar. Different from Agenda (which is internal church calendar). This is externally-focused: events designed to reach the community.
- Each event card: name, date, location, type, team lead, expected attendance, budget, materials list, volunteer count (filled/needed).
- Tap event for detail: description, logistics plan, volunteer assignments, materials checklist, marketing plan (Social posts scheduled, flyers, etc.), follow-up plan (what happens with contacts collected at the event).
- Create event button.
- Post-event reporting. After event: actual attendance, connect cards collected, follow-ups initiated, cost, team feedback. Feeds into campaign analytics.
- Filter pills: All, Upcoming, This Month, Completed, By Type.
- For ICCLA demo: "Rhythms From The Roots" (cultural event, Feb 22, completed), "Easter Community Celebration" (upcoming), "Monthly Harvesters Saturday" (recurring, next date shown).

**Ministry Leader View (R3):**
- Events for their ministry. Harvesters see their outreach schedule. Other ministry leaders see community events where their ministry is involved.
- Filter pills: All, My Ministry Events, Upcoming, Completed.

**Volunteer View (R5):**
- Outreach events they are signed up for. Upcoming with details and check-in.
- Browse and sign up for future events.
- Filter pills: All, My Events, Upcoming, Sign Up.

**Member View (R8):**
- Public community events. RSVP, share, invite friends.
- Filter pills: All, Upcoming, RSVPed.

---

### 14.6 Community Give

Give is the tithing and donation tile for the church. Position 6 in the grid. Same pattern as Fund (Education), Booster (Sports), Store (Business), Earn (Personal). It is how money flows into the church. It replaces Tithe.ly, Pushpay, Subsplash Giving, and every external donation processor. All transactions flow through KayPay natively. No redirect, no third-party form, no external receipt system.

Views: Give / Campaigns / History (centered contextual pill to switch)

Side panel (swipe right or menu icon). Pastor: giving dashboard (tithes this week, this month, year-to-date vs budget, recurring donor count, average gift, new donors, lapsed donors), top donors, fund balances, pledge tracking, donor segmentation, batch entry for cash/checks, tax statement generator, export, settings (fund definitions, receipt templates, campaign setup). Ministry Leader: my ministry fund balance if applicable, giving summary for ministry events. Member: my giving summary, recurring gifts, tax receipts, pledge status, settings. Visitor: not applicable.

#### Give View

**Pastor View (R1):**
- Giving dashboard at top. Total tithes and offerings: this week, this month, year-to-date. Budget comparison (YTD actual vs YTD budget with percentage). Giving trend chart (12-week line graph). Recurring donor count and percentage of total giving. New donors this month. Lapsed donors (gave last quarter but not this quarter).
- Fund balances. Each fund shows: name, current balance, goal (if applicable), progress bar. Fund types for ICCLA: General/Tithes, Building Fund, Missions, Benevolence (helping members in need), Sheepfold (children's ministry), Youth Ministry, Vineyard Voices (music ministry), Special Projects, Pastor's Discretionary.
- Donor management. Full donor list with: name, lifetime giving total, this year total, last gift date, giving frequency (weekly, monthly, occasional, lapsed), recurring status (active, paused, none). Tap donor for full giving profile: giving history timeline, gift breakdown by fund, communication log, engagement score.
- Donor segmentation. Filter by giving level (major donor $5K+, regular tither, occasional, first-time, lapsed), frequency, fund preference, date range. Build targeted lists for stewardship outreach.
- Batch entry. For cash and check donations received in person. Enter donor name (or anonymous), amount, fund designation, date. Batch processes multiple entries at once. Assigns to correct donor profile.
- Tax statement generator. Generate individual or bulk year-end giving statements. Includes all tax-deductible gifts with dates, amounts, and fund designations. Email directly to donors or print.
- Filter pills: All, General/Tithes, Building Fund, Missions, Benevolence, Special Projects, By Donor Level, Recurring, This Week, This Month, This Year.
- For ICCLA demo: monthly tithes $42,000, YTD $168,000, budget $200,000 (84% on track). 120 recurring donors. 5 fund balances. 15 mock donors with varied giving patterns.

**Ministry Leader View (R3):**
- If their ministry has a designated fund: fund balance, recent gifts to the fund, donor count for the fund.
- Cannot see overall church giving dashboard, individual donor amounts, or donor management. Only their ministry's fund.
- Filter pills: All, My Ministry Fund, This Month, This Year.

**Volunteer View (R5):**
- Same as Member view.

**Member View (R8):**
- Clean giving screen. Minimal friction, under 10 seconds to complete a gift. Same design pattern as Education Fund and KayPay.
- Large amount input center with preset buttons ($10, $25, $50, $100, $250, custom). Fund picker pills below: Tithes, Building Fund, Missions, Benevolence, Special Project.
- Recurring toggle. One-time or recurring (weekly, biweekly, monthly). Donor can start, pause, update, or cancel recurring gifts at any time.
- Payment through KayPay wallet. Tap, confirm, done. Also accepts linked bank (ACH) and linked card. Apple Pay and Google Pay supported.
- "Cover the fees" checkbox. Member can choose to cover KayPay processing fees so 100% of their gift goes to the church.
- Dedicate gift option. "In honor of" or "In memory of" with name field.
- Active campaign highlight. If a campaign is live (Building Fund drive, Missions month), show thermometer and progress below the give input.
- Recent giving summary below input. Last 3 gifts with amount, fund, date.
- Nexus integration: "Give $100 to tithes", "Set up monthly giving of $200", "How much have I given this year?", "Send me my tax receipt."
- Filter pills: All, Tithes, Building Fund, Missions, Benevolence.

**Visitor View (R10):**
- Same clean giving screen as members but simplified. Preset amounts, fund picker (fewer options: General, Building Fund, Missions), payment through KayPay or card.
- No recurring toggle. One-time gifts only.
- After giving: "Thank you for your generosity! Want to learn more about ICCLA?" with link to Hub welcome section.

#### Campaigns View

**Pastor View (R1):**
- Fundraising campaign management. Active and past campaigns. Each card: name, type, goal, raised, donor count, progress percentage, date range, status.
- Campaign types: Building/Capital Campaign (multi-year, large goal, naming opportunities, phase tracking), Missions Campaign (annual or seasonal, supports specific mission trips or partners), Benevolence Drive (help members in need, often confidential), Special Project (one-time need, short timeline), Pledge Campaign (multi-month commitment, donors pledge a total amount and give over time, track pledges: pledged vs received, fulfillment rate).
- Campaign detail: description, thermometer, real-time donor feed, progress updates, share tools.
- Create Campaign button. Set goal, type, date range, description, featured fund, marketing assets.
- Filter pills: All, Active, Upcoming, Completed, Building, Missions, Benevolence, Special, Pledges.
- For ICCLA demo: "Sanctuary Sound System Upgrade" (active, $8K goal, $5,200 raised, 32 donors), "2026 Missions Fund" (active, $25K goal, $12,000 raised), "Holiday Benevolence" (completed, $10K raised).

**Ministry Leader View (R3):**
- Campaigns relevant to their ministry. If Vineyard Voices has a sound equipment campaign, their leader sees it and can share updates.
- Filter pills: All, My Ministry Campaigns, Active.

**Member View (R8):**
- Active campaigns with participation. Thermometer, donor count, "Give to Campaign" button.
- Pledge campaigns: make a pledge, track fulfillment.
- Share campaign to Social or Messages.
- Filter pills: All, Active, My Pledges.

**Visitor View (R10):**
- Active campaigns (public only). Can give to a campaign as a one-time gift.

#### History View

**Pastor View (R1):**
- All transactions. Searchable, filterable, sortable. Each record: donor name (or "Anonymous"), amount, fund, date, method (KayPay wallet, card, ACH, cash, check), receipt status, recurring indicator.
- Summary cards at top: total this month, total this year, average gift amount, transaction count.
- Donor profiles accessible from any transaction.
- Export: CSV, PDF, QuickBooks format.
- Pledge tracking. Outstanding pledges with payment schedules, fulfillment rates, reminder automation.
- Filter pills: All, This Week, This Month, This Year, By Fund, By Method, Recurring, One-Time, Pledges, Cash/Check, Digital.

**Member View (R8):**
- Personal giving history. Grouped by month. Each entry: amount, fund, date, method.
- Year-end giving summary with total by fund.
- Tax receipt download (PDF). Can request mailed statement.
- Recurring gift management: view active recurring gifts, pause, cancel, update amount or frequency.
- Lifetime giving total.
- Filter pills: All, This Year, By Fund, Recurring, Tax Receipts.

**Visitor View (R10):**
- If they have given: receipt for their gift. Otherwise not visible.

---

### 14.7 Community KayTV

KayTV in Community mode is the church's media platform. Same structure as Education KayTV (Featured/Library/Live views). It replaces YouTube for sermons, Facebook Live for services, Vimeo for archives, and the church's existing Hotline to Heaven app for radio content. All video and audio lives here.

Content types for a church: sermons (full-length Sunday messages), sermon series (grouped by theme), worship recordings (Vineyard Voices praise and worship sets), children's content (Sheepfold animated Bible stories, kids worship songs, VBS recordings), youth content (Fresh Fire teen teachings, T.O.R.C.H. young adult sessions), Bible teaching (verse-by-verse studies, devotionals), testimony videos (members sharing their stories), event recordings (Rhythms From The Roots, holiday celebrations, conferences), Hotline to Heaven radio (live and archived broadcasts), behind-the-scenes (ministry in action, baptism highlights, mission trip footage), music videos and worship albums (Vineyard Voices originals).

Views: Featured / Library / Live (centered contextual pill to switch)

#### Featured View

**Pastor View (R1):**
- Hero video at top. This week's sermon auto-featured after Sunday service. Pastor selects featured content. Full-width, auto-playing muted preview.
- Category rows below (horizontal scroll): This Week's Message (most recent sermon, pinned at top), Current Series: "The Recipe for Divine Manifestation" (all parts in order), Worship Highlights (Vineyard Voices sets, praise moments), For the Kids (Sheepfold Bible stories, animated content, kids worship songs), Youth and Young Adults (Fresh Fire and T.O.R.C.H. content), Testimonies (member testimony videos), Hotline to Heaven (radio broadcasts, prayer recordings), Events and Celebrations (holiday services, baptisms, special events), Bible Studies (midweek teaching, verse-by-verse series).
- Admin controls: reorder category rows, feature/unfeature content, manage what visitors vs members can see.

**Ministry Leader View (R3):**
- Same Featured view. Ministry leaders for Vineyard Voices see a "My Ministry Content" section with their worship recordings. Sheepfold leaders see children's content they uploaded.

**Volunteer/Member View (R8):**
- Same Featured view but no admin controls. Content filtered to what their role can access.

**Visitor View (R10):**
- Public content only. Sermons, worship highlights, testimonies, event recordings. Cannot access member-only content like Connect Group studies or internal ministry training videos.
- "Watch Live" banner if a service is currently streaming.
- This is the front door for many visitors. They watch a sermon before they ever step foot in the building.

#### Library View

**Pastor View (R1):**
- Full searchable catalog of all church media.
- Upload button. Upload video or audio with metadata: title, speaker, scripture references, series assignment, category, tags, thumbnail, access permissions (public, members only, ministry-specific, leadership only), schedule publish date, auto-caption toggle.
- Content management. Edit metadata, assign to series, set/change permissions, feature/unfeature, delete.
- Series management. Create and manage sermon series: series name, description, series artwork, ordered list of messages. Each series has its own landing page in the library.
- Analytics per video: views, unique viewers, average watch time, completion rate, peak viewing times, geographic distribution.
- Bulk operations: tag, move, set permissions on multiple videos.
- Filter pills: All, Sermons, Worship, Children, Youth, Bible Study, Testimonies, Events, Radio, By Series, By Speaker, By Scripture, Member Only, Public.
- For ICCLA demo: 20-25 mock videos. 4 sermons from "The Recipe for Divine Manifestation" series with Pastor Dipo. 3 Vineyard Voices worship recordings. 2 children's Bible story animations. 2 T.O.R.C.H. young adult teachings. 2 testimony videos. 2 event recordings (Rhythms From The Roots, Christmas service). 3 Hotline to Heaven radio archives.

**Ministry Leader View (R3):**
- Full library visible. Can upload content for their ministry only. Uploads go through pastor approval before publishing unless pastor grants auto-publish permission.
- Filter pills: All, My Ministry Content, Sermons, Worship, Children, Youth, Events.

**Member View (R8):**
- Library of all content they have access to. Search by title, speaker, scripture, topic, series.
- Filter pills: All, Sermons, Worship, Children, Youth, Bible Study, Testimonies, Events.
- Nexus integration: "Find me a sermon about forgiveness", "Play last Sunday's worship set", "Show me children's Bible stories about David."

**Visitor View (R10):**
- Public content only.
- Filter pills: All, Sermons, Worship, Testimonies, Events.

#### Live View

- Currently live streams. If nothing live, shows upcoming scheduled streams with countdown timers.
- Sunday service live stream. Full live player with live chat overlay (members and visitors can chat during service). Viewer count. Prayer request button during live stream (submits to Prayer Wall in Social and to pastoral care team). React with emoji reactions.
- Hotline to Heaven live radio. Audio-only live stream with prayer request call-in integration. Always accessible (radio runs daily, not just Sundays).
- Upcoming streams: next Sunday service with countdown and "Set Reminder" button. Special events with dates and descriptions.
- Live giving prompt during service. Subtle "Give" button overlaid on live stream that opens KayPay giving flow without leaving the stream.
- For ICCLA demo: upcoming Sunday service as scheduled stream. Hotline to Heaven radio as always-available audio stream.

#### Video Player

- Full-screen or inline playback. Scrub bar with chapter markers (sermon points, worship songs). Speed controls. Closed captions. AirPlay/Chromecast for casting to TV.
- For sermons: scripture references displayed as tappable overlays at relevant moments. Tap scripture to see the full passage. Sermon notes displayed alongside video (split view option).
- Share button: share to Messages, Social, copy link. Clip creation for sermon highlights.
- Comment layer below player. Members can discuss the sermon. Pastor can pin comments or highlight questions for follow-up.
- Related content: more sermons in the same series, same speaker, same scripture book.

---

### 14.8 Community KayPay

KayPay in Community mode is the church's complete financial infrastructure. Same structure as Education KayPay (Wallet/Pay/Invest views). It replaces Aplos, QuickBooks, Sage Intacct, Tithe.ly's processing backend, Pushpay's transaction layer, and every disconnected financial tool a church uses. All giving from the Give tile flows through KayPay. All vendor payments, payroll, and ministry expenses flow through KayPay. The governed settlement chain (Event, Rules, Authorization, Payment, Settlement, Audit) ensures every dollar has a traceable purpose.

The critical difference for churches: fund accounting. Every dollar received is classified as restricted (designated for a specific purpose by the donor) or unrestricted (available for general use). Mixing restricted and unrestricted funds is an IRS compliance violation. KayPay enforces fund separation automatically. When a member gives $500 to the Building Fund, that money cannot be spent on payroll. The system prevents it at the transaction level, not just the reporting level.

Views: Wallet / Pay / Invest (centered contextual pill to switch)

Side panel (swipe right or menu icon). Pastor: switch between personal wallet and church account, church fund balances (all funds at a glance), pending authorizations, payroll status, vendor payment queue, settlement summary, financial reports shortcut, audit log, settings (fund definitions, auto-split rules, authorized signers, spending limits per role, approval thresholds). Ministry Leader: personal wallet, ministry fund balance (if applicable), expense request status. Member: personal wallet, giving summary shortcut, settings. Visitor: personal wallet only.

#### Wallet View

**Pastor View (R1):**

Personal wallet (same as any user): balance, 4% APY, KaNeXT Card, transactions, savings goals.

Church account (toggle in side panel):
- Fund accounting dashboard. Every fund listed with current balance, restricted/unrestricted designation, budget (if set), YTD income, YTD expenses, net position. Fund types for ICCLA: General Fund (unrestricted, tithes and offerings, covers payroll, rent, utilities, operations), Building Fund (restricted, sanctuary expansion, maintenance), Missions Fund (restricted, missionary support, mission trips), Benevolence Fund (restricted, confidential member assistance), Sheepfold Fund (restricted, children's ministry supplies and programs), Youth Ministry Fund (restricted, Fresh Fire and T.O.R.C.H. activities), Vineyard Voices Fund (restricted, music ministry equipment, sound system), Special Projects Fund (restricted, one-time needs), Pastor's Discretionary Fund (restricted, pastoral emergency use, confidential).
- One-page fund summary. The single most important report for the church board. Current balance of every fund. Answers: "How much money do we have, and how much of it is designated?" General Fund balance should cover 2-3 months of operating expenses as a healthy reserve target.
- Governed settlement chain visible on every transaction. What triggered it, what fund rules applied, who authorized it, where the money went, audit timestamp. No dollar moves without a trail.
- Auto-split configuration. When a general tithe comes in, auto-split: 80% General Fund, 10% Building Fund, 5% Missions, 5% Benevolence. When a designated gift comes in, 100% goes to the designated fund. Rules configurable by pastor.
- Pending authorizations. Transactions awaiting approval based on RBAC thresholds. Example: any expense over $1,000 from a restricted fund requires pastor approval. Any expense over $5,000 requires two signatures (pastor + treasurer/board member).
- Payroll management. Staff list: Pastor Dipo, Pastor Nony, ministry directors, administrative staff. Each shows: salary, housing allowance (parsonage, unique to pastoral compensation), deductions, net pay, payment method. Payroll schedule. Run payroll button (authorized roles only). Payroll history. IRS compliance: W-2 generation, housing allowance reporting, FICA exemption tracking for ordained ministers.
- Vendor payments. Outstanding invoices (rent, utilities, insurance, supplies, contractors). Scheduled payments. Payment history. Add vendor. Approve/reject payments.
- Expense tracking. Every expense categorized by fund and account. Receipts attached to expenses (photo upload). Reconciliation with bank statements.
- Financial reports. Statement of Financial Position (Balance Sheet with fund balances), Statement of Activities (Income and Expense by fund), Budget vs Actual by fund, Cash Flow, Giving Summary, Fund Balance Report (the board report). Export to PDF, CSV, QuickBooks format. Audit-ready at all times.
- Audit log. Every transaction, every authorization, every fund transfer, every override. Timestamped, attributed, immutable. Who moved money, from which fund, to where, and why.
- Filter pills: All, General Fund, Building, Missions, Benevolence, Children, Youth, Music, Special, Discretionary, Payroll, Vendors, This Week, This Month, This Year.
- For ICCLA demo: church account balance $185,000 across all funds. General Fund $95,000 (2.5 months operating reserve). Building Fund $42,000. Missions $18,000. Benevolence $8,000. Other funds $22,000. Monthly payroll $28,000 (4 staff). 10 vendor relationships. 5 governed settlement examples with full chain visible.

**Ministry Leader View (R3):**
- Personal wallet.
- Ministry fund view (if their ministry has a designated fund). Balance, recent income and expenses, budget remaining. Can submit expense requests against their ministry fund. Request goes to pastor for approval.
- Cannot see other funds, payroll, vendor payments, or overall church financials.
- Filter pills: All, My Ministry Fund, Expense Requests, This Month.

**Volunteer View (R5):**
- Personal wallet only. No church account access.
- Can submit expense reimbursement requests (bought supplies for ministry, attach receipt, request reimbursement from appropriate fund). Status tracking (submitted, approved, paid).

**Member View (R8):**
- Personal wallet. Balance, 4% APY, KaNeXT Card, transactions, savings goals.
- Giving summary card. Total given this year, breakdown by fund, last gift date. Quick link to Give tile.
- Remittance. For international members (ICCLA is multicultural with many West African members), send money home at 0.2%. Saved recipients with country flags.
- Filter pills: All, Sent, Received, Purchases, Giving.

**Visitor View (R10):**
- Personal wallet only. Standard KayPay experience.

#### Pay View

**All roles:**
- Same P2P send/receive as Education KayPay. Send money, receive, QR code, split payments, remittance. Inline payments from Messages.

**Pastor View (R1) additional:**
- Vendor payment initiation.
- Fund-to-fund transfers (with full audit trail and dual authorization for restricted fund transfers).
- Benevolence disbursement. Confidential payments to members in need. These transactions are visible only to R1-R2 and are marked "Benevolence - Confidential" in the audit log without recipient details visible to the board.

#### Invest View

**All roles:**
- Same as Education KayPay Invest. Infrastructure Fund, Bitcoin, Capital Points.

**Pastor View (R1) additional:**
- Church endowment management (if applicable). Long-term investments of church reserves. Conservative allocation strategy. Board-approved investment policy.

---

### 14.9 Community KayStudios

KayStudios in Community mode is the same cross-mode interactive experiences hub. Same structure (Home/Explore/Library views). It does not change when you switch to Community mode because KayStudios is the one tile that breaks mode-scoping. However, in a Community brand context, creators build faith-based interactive content.

Content types a church creates in KayStudios: Bible trivia (books of the Bible, scripture memory games, Bible character quizzes), Bible study courses (verse-by-verse studies with video lessons and embedded quizzes), devotional series (daily reading plans with reflection questions), new member courses (Rooted program as an interactive course with sessions and completion tracking), volunteer training (safety protocols for Sheepfold workers, usher training, sound team training), worship training (music theory for Vineyard Voices, vocal warmup guides, instrument tutorials), youth games (Fresh Fire and T.O.R.C.H. interactive content, icebreaker games, faith challenges), marriage and family courses, financial stewardship courses (biblical principles of money management), prayer guides (structured prayer frameworks, fasting guides), leadership development (ministry leader training, spiritual gifts assessment).

#### RBAC Views

**Pastor View (R1):**
- Full creator access. Can build any content type. Courses created by the pastor are official church content (branded with ICCLA).
- Can feature or promote specific content to the congregation ("Complete the Rooted course this month").
- Can assign content as required for volunteer roles (Sheepfold volunteers must complete child safety training course before serving).
- Analytics on all church-created content: completions, scores, engagement, time spent.
- Filter pills (creator): All, My Content, Published, Drafts, Analytics, Required Training.

**Ministry Leader View (R3):**
- Creator access for their ministry. Vineyard Voices leader creates worship training courses. Sheepfold leader creates children's Bible games. T.O.R.C.H. leader creates young adult challenges. Harvesters leader creates evangelism training.
- Content published under their ministry brand within ICCLA.
- Analytics on their ministry's content only.
- Filter pills (creator): All, My Ministry Content, Published, Drafts, Analytics.

**Volunteer View (R5):**
- Consumer plus required training. If assigned mandatory training courses (child safety for Sheepfold, usher protocol), those appear as "Required" with a deadline badge. Must complete before being scheduled to serve.
- Can also browse and play any available content.
- Filter pills (consumer): All, Required, Courses, Quizzes, In Progress, Completed.

**Member View (R8):**
- Consumer. Browse and play all available faith content. Bible trivia, devotional courses, study guides, prayer challenges.
- Rooted course appears as a featured item for new members with progress tracking and session completion.
- Achievements: Bible trivia streaks, courses completed, devotional plan completions.
- Filter pills (consumer): All, Courses, Bible Study, Trivia, Devotionals, Challenges.
- Nexus integration: "Start a Bible trivia game", "Find a course on prayer", "How far am I in Rooted?", "What devotional plans are available?"
- For ICCLA demo: "ICCLA Bible Trivia" (game, 50 questions across Old and New Testament, 85 plays, leaderboard), "Rooted: Discover Your Place" (course, 7 sessions, 12 enrolled, matches the real Rooted program), "Books of the Bible Speed Challenge" (timed quiz, 30 seconds per question), "Sheepfold Volunteer Safety Training" (required course, 45 minutes, 18 completions), "Scripture Memory: Psalms" (flashcard deck, 30 verses), "30-Day Prayer Challenge" (challenge, daily prayer prompts, 22 participants).

**Visitor View (R10):**
- Consumer. Can browse and play public content only. Bible trivia and introductory courses. Cannot access member-only content or required training.
- Featured: "Explore the Christian Faith" introductory course if available.
- Filter pills: All, Explore, Trivia, Introductory.
