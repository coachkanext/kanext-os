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

---

## 15. Personal Mode

Personal mode is the operating environment for individual creators, professionals, and personal brands. The demo brand is Sammy Kalejaiye (@sammyk). Personal mode replaces the entire creator tool stack: Linktree, Stan Store, Beacons, Buffer, Sprout Social, Gumroad, Patreon, Kajabi, Calendly, Mailchimp, and every disconnected tool a creator currently pays $200-500+/month to juggle. One app. One grid. One audience you own.

Personal mode RBAC is the simplest of all five modes. Four roles: Owner (R0), Manager/Agent (R2), Moderator (R5), Subscriber/Follower (R9). If you need more complexity, make a Business brand.

Personal mode home grid:

| Hub | Agenda | Social |
|-----|--------|--------|
| Network | Deals | Earn |
| KayTV | KayPay | KayStudios |

### 15.1 Personal Hub

The Hub in Personal mode is the creator command center. It replaces Linktree ($5-50/mo), Buffer ($6-99/mo), Sprout Social ($249/mo), Beacons ($25/mo), and every analytics dashboard and link-in-bio tool. One screen, three tabs, RBAC determines depth.

Tabs: Overview / Content / Links

Side panel (swipe right or menu icon). Owner: analytics dashboard shortcut, content calendar, audience insights, revenue summary, media kit generator, Nexus content assistant shortcut, settings. Manager/Agent: client analytics, content approvals, revenue tracking, deal pipeline shortcut, settings. Moderator: content moderation queue, flagged comments, reported messages, settings. Subscriber: not applicable.

#### Overview Tab

**Owner View (R0):**
- Creator dashboard at top. Follower/subscriber count with growth trend arrow and number change this week. Total content views across Social and KayTV this month. Engagement rate (likes + comments + shares + saves / impressions). Revenue this month card with amount and trend vs last month.
- Audience insights section. Demographics: age range distribution (bar chart), gender split, top 5 locations (cities/countries), top active hours (heatmap showing best posting times by day and hour). Audience growth chart (30-day line graph with follower gains and losses). New followers this week. Unfollows this week. Follower sources (where new followers found you: Social feed, KayTV, search, external link, referral).
- Content performance summary. Top 3 performing posts this week ranked by engagement. Best performing reel with view count. Best performing KayTV video with watch time. Content type breakdown chart: which format drives the most engagement. Posting consistency score.
- Revenue summary card. Total earned this month. Breakdown by source: digital products, courses, subscriptions/memberships, tips, brand deals, affiliate commissions. Month-over-month trend. Link to Earn tile for full detail.
- Upcoming section. Next scheduled content, next meeting/call, next deal deadline. At a glance: what needs your attention today.
- Quick actions row: Create Post, Schedule Content, View Analytics, Update Links, Generate Media Kit.
- Nexus integration: "How many followers did I gain this week?", "What is my best performing post this month?", "What time should I post today based on my audience?", "Draft a caption for my next post about coaching", "What content should I create this week?"
- For Sammy demo: 2,400 followers, 12% engagement rate, $1,200 revenue this month (KaNeXT Masterclass course $800, coaching calls $300, tips $100). Top post: basketball coaching reel 8,500 views. Audience: 65% male, 18-34 age range, top cities LA, Oakland, Miami, Lagos, Houston.

**Manager/Agent View (R2):**
- Same dashboard data. Full read access to all analytics, content performance, and revenue.
- Content approval queue. Pending approvals count badge.
- Revenue tracking. Can view all earnings and payment history. Can generate invoices for brand deals. Can update rate card.
- Deal pipeline overview from Deals tile.
- Cannot post as the owner without approval. Cannot change account settings or payment information. Cannot withdraw funds.

**Moderator View (R5):**
- Content moderation queue. Comments flagged by the system or reported by users. Review each: approve, remove, or escalate to owner.
- Reported messages. DMs or Room messages reported for abuse.
- Cannot see analytics, revenue, audience data, or deals.

**Subscriber View (R9):**
- Hub not visible to subscribers. They interact through Social, KayTV, KayStudios, and Messages.

#### Content Tab

**Owner View (R0):**
- Content calendar. Full-screen calendar view (day/week/month toggle). Each day shows thumbnails of scheduled and published content with platform icon badge. Color-coded: published (green), scheduled (blue), draft (gray). Drag to reschedule. Tap to edit or view performance.
- Content queue. Set posting frequency ("3 posts per week, Tuesday/Thursday/Saturday at 9am"). Add content to the queue. Queue auto-publishes at the next scheduled slot. Reorder with drag and drop. Replaces Buffer and Later scheduling.
- Content library. All content ever published across Social and KayTV. Searchable by date, type, caption keywords, hashtags. Each item shows: thumbnail, platform, date, engagement metrics, revenue generated.
- Drafts. Unpublished content in progress.
- Content analytics deep dive. Tap any published content for full metrics: impressions, reach, engagement rate, saves, shares, profile visits driven, follower conversions, click-throughs, revenue attributed.
- Compare mode. Select 2-3 posts to compare side by side.
- Content templates. Save successful post formats as templates. Reuse caption structures, hashtag sets, or content frameworks.
- Nexus content assistant: "Draft 5 post ideas about basketball coaching", "Write a caption for this photo", "What hashtags should I use for a coaching reel?", "Repurpose my last KayTV video into 3 Social posts", "What content is trending in my niche right now?"

**Manager/Agent View (R2):**
- Same content calendar, library, and analytics. Can draft content on behalf of owner (goes to approval queue). Can schedule approved content.

#### Links Tab (Link in Bio)

**Owner View (R0):**
- Link in bio page builder. Custom micro-landing page accessible at kanext.app/@sammyk. Replaces Linktree, Beacons, Stan Store storefront, and every link-in-bio tool.
- Page editor. Drag and drop blocks: Link block (title, URL, icon, click tracking), Product block (from Earn with Buy button through KayPay), Video block (embedded KayTV video), Course block (KayStudios enrollment), Booking block (calendar from Agenda, paid bookings through KayPay), Email capture block (subscribers auto-added to Messages list), Tip jar block (preset amounts through KayPay), Social links block (external profile icons), Text block, Image block.
- Reorder blocks with drag and drop. Toggle blocks visible/hidden.
- Theme customization. Background color, button style, font weight, accent color. Preview in real-time.
- Analytics per block. Clicks, click-through rate, conversion rate (for product and booking blocks), revenue generated per block.
- Custom domain support. Use kanext.app/@sammyk or connect your own domain.
- QR code generator. Generate QR code for links page. Print on business cards, flyers, or display at events.

**Media kit generator:**
- Auto-generated one-page media kit built from real analytics data. No manual entry. Always current.
- Includes: profile photo, name, bio, follower count, engagement rate, audience demographics, top content with metrics, content categories/niche, brand partnerships (from Deals), rate card (customizable pricing).
- Downloadable as PDF. Shareable via unique link (always up to date). Embeddable in links page.
- For Sammy demo: 6 link blocks (KaNeXT website, LinkedIn, masterclass on KayStudios, coaching reel on KayTV, Book a Strategy Call, Invest in KaNeXT). 2 product blocks. Tip jar active. Media kit with real demo analytics.

**Manager/Agent View (R2):**
- Can edit link page and media kit on behalf of owner. Can share media kit with potential brand partners.

---

### 15.2 Personal Agenda

Agenda in Personal mode is the creator's calendar. Same structure as all Agenda tiles (Day/Week/Month views). It combines the content calendar from Hub Content tab with personal scheduling, brand deal deadlines, and public events. It replaces Google Calendar, Calendly, and the scheduling features of Buffer/Later.

Views: Day / Week / Month (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner: upcoming deadlines sorted by urgency, quick-add event, content schedule overview, booking requests (from Links page Booking block), sync settings (import from Google Calendar, export to iCal). Manager/Agent: client schedule, pending booking requests, deal deliverable deadlines, quick-add on behalf of owner. Moderator: not applicable. Subscriber: upcoming public events.

#### Day / Week / Month Views

**Owner View (R0):**
- Full personal and professional calendar. Color-coded by type: content (blue, scheduled posts and videos), meetings (green, calls, collaborations, coaching sessions), deals (gold, brand deal deadlines and deliverables), personal (gray, private events), public events (teal, live streams, workshops, meetups), recording/production (orange, shoot days, editing blocks).
- Content schedule blocks. Synced from Hub Content tab queue. Shows what content is going live when. Tap block to preview the post or edit before publish.
- Booking slots. Time slots marked as available for bookings (from Links page Booking block). When someone books, it appears as a confirmed meeting with their name, email, and payment status (if paid booking). Manage availability: set which days and times are bookable, buffer time between bookings, maximum bookings per day.
- Deal deliverable deadlines. Synced from Deals tile. Each brand deal has deliverables with due dates. Deadlines appear on the calendar with deal name and brand.
- Reminders and notifications. Push notification before events. Configurable: 15 min, 1 hour, 1 day before.
- Create event. Title, type, date/time, duration, location (physical or video call link), recurring toggle, notes, invite attendees (from Network), attach files.
- Nexus integration: "What's on my schedule tomorrow?", "Block out Thursday for recording", "When is my next coaching call?", "Move my 3pm to Friday", "What deal deadlines do I have this week?"
- Filter pills: All, Content, Meetings, Deals, Bookings, Personal, Public Events, This Week.
- For Sammy demo: weekly content schedule (3 posts Tuesday/Thursday/Saturday), 2 coaching calls this week, 1 brand deal deadline (KaNeXT investor deck video due Friday), 1 recording day blocked (Wednesday), 3 available booking slots, 1 upcoming public event (Instagram Live Q&A Saturday 7pm).

**Manager/Agent View (R2):**
- Owner's professional calendar visible (content, meetings, deals, bookings). Personal events hidden unless owner shares.
- Can schedule meetings on behalf of owner. Can adjust booking availability. Can respond to booking requests.
- Deal deliverable deadlines visible with full context.
- Filter pills: All, Content, Meetings, Deals, Bookings, Deliverables.

**Moderator View (R5):**
- Not visible.

**Subscriber View (R9):**
- Public events only. Live Q&As, workshops, masterclasses, meetups with RSVP/Register button.
- Filter pills: All, Upcoming, RSVPed.

---

### 15.3 Personal Social

Social in Personal mode is the creator's content platform. For a personal brand, Social IS the product. Every post, reel, and story builds the audience that drives everything else. Same structure as all Social tiles (Feed/Reels/Profile views, scope filter Brand/Mode/All).

Scope filter: Brand (@sammyk only), Mode (all Personal brands), All (everything across all modes).

#### Feed View

**Owner View (R0):**
- Full feed. Own content and content from people/brands you follow.
- Create button. Post types: text, photo, video, carousel (multiple images/videos), poll, link share, product feature (embeds an Earn product with Buy button inline in the feed).
- Post as yourself or cross-post to other brands you own.
- Schedule posts for future publication (syncs to Agenda and Hub Content calendar).
- Pin posts to top of your profile (up to 3 pinned).
- Analytics on every post: impressions, reach, engagement rate, saves, shares, profile visits, follower conversions, link clicks, revenue attributed.
- Promote post. Boost a post to reach beyond your followers (paid promotion through KayPay). Target by location, age, interests.
- Filter pills: All, My Posts, Following, Trending, Saved, Drafts.

**Manager/Agent View (R2):**
- Full feed access. Can draft posts on behalf of owner (goes to approval queue). Can respond to comments if permitted. Analytics visible. Can export performance reports.
- Filter pills: All, Owner's Posts, Drafts, Scheduled, Analytics.

**Moderator View (R5):**
- Feed visible. Can hide or remove comments. Can flag posts from other users. Cannot post or draft.
- Filter pills: All, Flagged, Reported.

**Subscriber View (R9):**
- Feed shows owner's public content. Like, comment, share, save. Product posts show "Buy" button inline. Tip button on posts.
- Filter pills: All, Posts, Reels.

#### Reels View

**Owner View (R0):**
- Short-form video feed. Own reels and reels from followed creators. Create reel with record/upload, music, text overlays, trim, filters, caption, hashtags. Schedule or publish immediately.
- Reel analytics: views, average watch time, completion rate, shares, saves, follower conversions.

**Subscriber View (R9):**
- Vertical scroll reel feed. Like, comment, share, save. Follow button.

#### Stories View

- 24-hour ephemeral content. Owner posts: photo/video with text, stickers, polls, questions, countdown timers, link stickers, music.
- Story highlights. Save to permanent collections on profile. Organize by topic.
- Story analytics: views, taps forward/back, exits, replies, link clicks.
- Subscribers view stories at top of feed as circular avatars.

#### Profile View

**Owner View (R0):**
- Full profile. Avatar, name, bio, follower/following counts, links page button, edit profile. Content grid (3 columns). Pinned posts. Reels tab. KayTV tab. Tagged tab. Profile analytics.

**Subscriber View (R9):**
- Public profile. Follow/Unfollow, Message, Tip, Subscribe buttons. Content grid. Reels tab. KayTV tab.
- For Sammy demo: "Founder & CEO @KaNeXT | Asst. Basketball Coach @LincolnU | Building the future of sports, education, and finance" bio. 25 mock posts. 8 reels. 3 pinned posts. Story highlights: "KaNeXT", "Coaching", "Lincoln", "Personal".

---

### 15.4 Personal Network

Network is the people tile for personal brands. Position 4 in the grid. It is the creator's contact book, collaborator directory, subscriber list, and relationship manager. It replaces the contacts app, a CRM, and scattered spreadsheets tracking who you know.

Views: Contacts / Collaborators / Subscribers (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner: network dashboard (total contacts, subscribers count, subscriber growth, top collaborators), quick search, import contacts, tags manager, export, settings. Manager/Agent: client's network, subscriber analytics, outreach list builder, settings. Moderator: not applicable. Subscriber: not applicable.

#### Contacts View

**Owner View (R0):**
- Full personal contact book. Each contact card: avatar, name, @handle (if on KaNeXT), phone, email, tags, last interaction date, relationship notes.
- Search bar. Search by name, company, tag, city.
- Import contacts from phone. Sync with device contacts. Identify which contacts are on KaNeXT.
- Tap contact for detail: all contact info, communication log (auto-pulled from Messages, Phone, Email), relationship notes (private), tags, shared brands, deal history (from Deals tile).
- Tags: "Investor", "Brand Partner", "Coach", "Family", "Media", "Mentor", "Industry". Custom tags.
- Add contact manually. Quick actions: Call, Message, Email, Add to Deal, Invite to KaNeXT.
- Filter pills: All, Recent, Investors, Partners, Coaches, Media, Family, Industry, On KaNeXT, Not on KaNeXT.
- For Sammy demo: 50+ contacts across categories. 30 on KaNeXT, 20 external.

**Manager/Agent View (R2):**
- Professional contacts visible. Personal/family hidden unless owner shares. Can add contacts, update details, log interactions.
- Filter pills: All, Investors, Partners, Media, Industry, Recent.

#### Collaborators View

**Owner View (R0):**
- People you actively work with. Each card: avatar, name, role/specialty, active projects, last collaboration date, notes.
- Tap for detail: contact info, shared project history, content created together, deals done together, communication log.
- Collaboration request inbox. Other creators request to collaborate. Accept/decline.
- Filter pills: All, Active, Past, By Specialty, Pending Requests.
- For Sammy demo: 5 collaborators (videographer Marcus, designer Sarah, podcast guest Jordan, advisor Patrick, editor Kofi).

**Manager/Agent View (R2):**
- Collaborator list visible. Can manage on behalf of owner. Can reach out for scheduling.
- Filter pills: All, Active, Past, Pending.

#### Subscribers View

**Owner View (R0):**
- Full subscriber/follower list. Subscriber analytics at top: total count, growth this week/month, churn, engagement tier breakdown.
- Engagement tiers auto-segmented: Super Fans (interact with everything, buy products, share), Active (regular engagement), Casual (follow but rarely interact), Dormant (no engagement 30+ days). Each tier shows count and percentage.
- Each subscriber row: avatar, name, @handle, engagement tier badge, follower since date, last interaction.
- Email list. Subscribers who opted in via Links page. Segmentable for email campaigns through Messages.
- Paying subscriber analytics. Revenue, retention rate, churn.
- Export subscriber list (CSV).
- Filter pills: All, Super Fans, Active, Casual, Dormant, Paying, Email List, New This Week, New This Month.
- For Sammy demo: 2,400 subscribers. 120 super fans, 600 active, 1,200 casual, 480 dormant. 340 on email list. 8 paying subscribers.

**Manager/Agent View (R2):**
- Subscriber analytics visible. Can view tiers, growth, paying data. Can build targeted lists.
- Filter pills: All, Super Fans, Active, Paying, Email List, Growth.

---

### 15.5 Personal Deals

Deals is the pipeline tile for personal brands. Position 5 in the grid. Same pattern as Recruits (Sports), Inquiries (Business), Admissions (Education), Outreach (Community). It is where opportunities live before they become revenue. Brand sponsorships, partnerships, collaborations, speaking engagements, consulting gigs, investment conversations. Every opportunity starts here, gets worked through stages, and either closes (revenue flows to Earn and KayPay) or dies.

It replaces email threads with brands, spreadsheets tracking who you pitched, scattered DMs about collaborations, and the chaos of managing opportunities across 5 platforms.

Views: Pipeline / Proposals / Contracts (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner: deal dashboard (total active deals, total pipeline value, deals won this month, win rate, average deal size), quick-add deal, follow-up reminders (overdue tasks), rate card shortcut, media kit shortcut, settings. Manager/Agent: client's pipeline, proposal drafts, contract tracking, invoice generation, settings. Moderator: not applicable. Subscriber: not applicable.

#### Pipeline View

**Owner View (R0):**
- Deal pipeline funnel at top. Visual stages with counts and total value per stage: Prospect (someone expressed interest or you identified an opportunity), Pitched (you sent a proposal or they sent an offer), Negotiating (terms being discussed), Contract (agreement drafted, awaiting signatures), Closed Won (deal done, deliverables begin), Closed Lost (didn't work out).
- Below funnel: list of all active deals sorted by most recent activity. Each deal card: brand/company name with logo, deal title, current stage, deal value, next action due date, assigned contact person.
- Tap deal for full Deal Detail Page:

**Deal Detail Page:**
- Header: brand name, deal title, stage badge, value.
- Contact section: who you're working with at the brand. Name, title, phone, email. Linked to Network contact.
- Deal timeline: chronological log of all activity. Every interaction auto-pulled from Messages, Phone, Email.
- Deliverables checklist (Contract or Closed Won stage): what you owe. Each deliverable has status (pending, in progress, submitted, approved).
- Financials: deal value, payment terms, payment status. Payments auto-tracked through KayPay.
- Files: contract PDF, brief document, brand guidelines, creative assets.
- Notes: private notes about the deal.
- Actions: Send Proposal, Send Invoice, Message Contact, Schedule Call, Move Stage, Mark Won, Mark Lost.
- Drag and drop between pipeline stages from the main pipeline view.
- Nexus integration: "How many active deals do I have?", "What's my pipeline value?", "Draft a pitch email to Nike for a coaching content sponsorship", "What deals are closing this week?", "Follow up with Marcus about the partnership."
- Filter pills: All, Prospect, Pitched, Negotiating, Contract, Closed Won, Closed Lost, This Week, This Month, By Value, Overdue Follow-Ups.
- For Sammy demo: 8 deals in pipeline. "KaNeXT Fund Raise - Valley Capital" (Negotiating, $250K), "Basketball Coaching Content - Overtime Elite" (Pitched, $5,000), "Speaking Engagement - EdTech Conference" (Prospect, $2,500), "Podcast Appearance - The Basketball Hour" (Closed Won, $0 but exposure), "NIL Platform Partnership" (Contract, $10,000), 3 closed lost for realism.

**Manager/Agent View (R2):**
- Full pipeline access. Can manage deals on behalf of owner. Can draft proposals, send invoices, update stages, log interactions.
- Deal analytics: win rate, average deal cycle time, revenue by deal type, best-performing deal sources.
- Filter pills: All, Active, My Drafts, Pending Approval, Overdue, By Stage, By Value.

**Moderator/Subscriber:** Not visible.

#### Proposals View

**Owner View (R0):**
- All proposals sent and received. Each card: brand name, deal title, proposal type (sent or received), date, status (draft, sent, viewed, accepted, declined, expired).
- Create Proposal button. Proposal builder: select from templates or start blank. Sections: introduction (auto-populated from media kit), scope of work (deliverables, timeline), pricing (from rate card or custom), terms (usage rights, exclusivity, revision rounds, payment schedule). Preview as PDF. Send through Messages or generate shareable link.
- Rate card integration. Pull pricing from Links page media kit. Standard rates for: Social post, Reel, Story set, KayTV integration, Speaking engagement, Consulting hour. Customize per proposal.
- Proposal analytics: proposals sent count, acceptance rate, average time to response.
- Filter pills: All, Drafts, Sent, Viewed, Accepted, Declined, Expired.
- For Sammy demo: 3 proposals. 1 accepted (Overtime Elite), 1 pending (EdTech Conference), 1 draft (Nike coaching content concept).

**Manager/Agent View (R2):**
- Can draft proposals on behalf of owner. Drafts go to owner for review. Can use rate card and media kit data. Can track status.
- Filter pills: All, My Drafts, Sent, Pending Owner Approval, Accepted, Declined.

#### Contracts View

**Owner View (R0):**
- All contracts active and archived. Each card: brand name, deal title, contract status (draft, sent for signature, signed, active, completed, expired), value, start/end dates.
- Contract management: upload PDF, request e-signature, track signature status, store executed contracts.
- Active contract tracker: deliverables due, payment milestones, exclusivity periods, usage rights windows. Alerts when deadlines approach.
- Completed contracts move to archive with full history preserved.
- Filter pills: All, Draft, Awaiting Signature, Active, Completed, Archived, Expiring Soon.
- For Sammy demo: 2 active contracts (NIL Platform Partnership, Overtime Elite). 1 completed (Podcast appearance). 1 draft awaiting review.

**Manager/Agent View (R2):**
- Full contract access. Can upload, track, manage deliverable deadlines. Cannot sign on behalf of owner without explicit authorization.
- Filter pills: All, Active, Awaiting Signature, Deliverables Due, Completed.

---

### 15.6 Personal Earn

Earn is the storefront and revenue tile for personal brands. Position 6 in the grid. Same pattern as Booster (Sports), Store (Business), Fund (Education), Give (Community). It is where your audience buys from you. It replaces Stan Store ($29-99/mo), Gumroad (10% fees), Patreon (8-12% fees), Teachable ($59-249/mo), Calendly ($8-16/mo for paid bookings), and every disconnected monetization tool. All transactions flow through KayPay. Zero transaction fees on wallet payments.

Views: Products / Subscriptions / Revenue (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner: revenue dashboard (total this month, by source, trend), top products by sales, subscriber count and MRR, recent purchases, payout history, create product shortcut, settings (payout schedule, tax info, refund policy). Manager/Agent: revenue tracking, product management, invoice generation, payout history, settings. Moderator: not applicable. Subscriber: my purchases, my subscriptions.

#### Products View

**Owner View (R0):**
- Product catalog. All products listed as cards. Each card: thumbnail, title, price (or "Free"), type badge (Digital, Course, Service, Physical, Affiliate), sales count, revenue generated, rating.
- Product types: Digital products (PDFs, ebooks, templates, presets, guides). Courses (priced in Earn, plays in KayStudios). Services (coaching calls, consulting, booked through Agenda, paid through KayPay). Physical products (merch, books, shipping address collected at checkout). Affiliate products (recommend others' products, earn commission).
- Create Product button. Product builder: title, description, price (one-time or payment plan), type, thumbnail/images, files to deliver, availability (always, limited quantity, limited time), tags. Preview. Publish.
- Product analytics per item: views, conversion rate, total sales, total revenue, refund rate, average rating.
- Suggested products. If category has no items, system suggests what to create based on audience size and engagement.
- Filter pills: All, Digital, Courses, Services, Physical, Affiliate, Best Sellers, Free, Drafts.
- For Sammy demo: "KaNeXT Masterclass - Building an OS" (course, $200, 8 enrolled), "1-on-1 Strategy Call" (service, $150, 12 completed), "Photography Preset Pack" (digital, $19, 62 sold), "Weekly Newsletter" (free, 240 subscribers), "Brand Strategy Template" (digital, $45, 28 sold), "Group Coaching - Spring Cohort" (service, $500, 8 enrolled).

**Manager/Agent View (R2):**
- Full product catalog access. Can create products on behalf of owner (approval queue). Can update pricing, descriptions, availability. Can view all sales data.
- Filter pills: All, By Type, Best Sellers, Drafts, Pending Approval.

**Subscriber View (R9):**
- Product storefront. Browsable catalog. Each shows: thumbnail, title, price, description preview, rating, purchase count. Tap for full product page with Buy button through KayPay.
- Filter pills: All, Digital, Courses, Services, Free, Popular.

#### Subscriptions View

**Owner View (R0):**
- Subscription/membership management. Recurring revenue products.
- Active subscriptions listed. Each shows: name, price per period, active subscriber count, MRR, churn rate, total revenue lifetime.
- Create Subscription. Name, description, price, billing period (weekly, monthly, yearly), benefits (exclusive content, early access, community Room, direct messaging, monthly calls, behind-the-scenes). Subscriber limit optional. Free trial option.
- Subscriber management per subscription: list of active subscribers with join date, total paid, engagement level.
- Exclusive content delivery. Subscriber-only posts in Social (lock icon), subscriber-only KayTV videos, subscriber-only Room in Messages. Content gating per tier.
- Multiple tiers. Example: "Free Follower" (public only), "Supporter" ($10/mo, exclusive posts + Room), "Insider" ($25/mo, everything + monthly call + early access + DM access).
- Filter pills: All, Active, By Tier, Churned, Revenue, New This Month.
- For Sammy demo: "KaNeXT Insider" ($25/mo, 8 subscribers, $200 MRR). Benefits: exclusive content, monthly group call, early access, DM access, subscriber-only Room.

**Manager/Agent View (R2):**
- Subscription analytics visible. Can manage tiers, update pricing (with approval), view subscriber list.
- Filter pills: All, Active, By Tier, Revenue, Churned.

**Subscriber View (R9):**
- Available subscriptions with tier comparison. Subscribe button. Manage my subscription (upgrade, downgrade, cancel, update payment).
- My active subscription: current tier, next billing date, benefits unlocked.

#### Revenue View

**Owner View (R0):**
- Revenue dashboard. Total revenue: this week, this month, this year. Month-over-month growth.
- Revenue by source chart: products, subscriptions, services, tips, brand deals (from Deals tile), affiliate commissions. Pie chart and line graph.
- Top products by revenue ranked.
- Transaction list. Every sale: buyer name, product, amount, date, payment method, status. Tap for detail.
- Payout history. Transfers from Earn to KayPay wallet. Payout schedule (instant, daily, weekly).
- Tax reporting. Year-end revenue summary by category. Exportable. 1099 data if applicable.
- Nexus integration: "How much did I earn this month?", "What's my best selling product?", "How many subscribers do I have?", "What's my MRR?", "Generate a revenue report for Q1."
- Filter pills: All, Products, Subscriptions, Services, Tips, Brand Deals, Affiliate, This Week, This Month, This Year, By Product.
- For Sammy demo: $1,200 this month. Masterclass $800, coaching calls $300, tips $100. MRR $200. YTD $4,800.

**Manager/Agent View (R2):**
- Full revenue dashboard. Can generate reports, export, track payouts, invoice brand deal payments.
- Filter pills: All, By Source, This Month, This Year, Invoiced, Pending.

---

### 15.7 Personal KayTV

KayTV in Personal mode is the creator's video platform. Same structure as all KayTV tiles (Featured/Library/Live views). It replaces YouTube as a hosting and monetization platform. The creator owns the content, owns the audience, and keeps the revenue. YouTube takes 30% of memberships and Super Chats. KayTV through KayPay takes 3% on wallet transactions (and the creator can pass that to the viewer with "cover the fee"). At scale, wallet-to-wallet is 0%.

Views: Featured / Library / Live (centered contextual pill to switch)

#### Featured View

**Owner View (R0):**
- Hero video at top. Creator selects featured video. Category rows below (creator organizes): Latest Uploads, Most Popular, Series, Behind the Scenes, Coaching (for Sammy), KaNeXT Updates, Collaborations, Shorts/Clips. Admin controls: reorder rows, feature/unfeature, manage free vs subscriber-only.

**Manager/Agent View (R2):**
- Same view. Can feature/unfeature, reorder rows on behalf of owner.

**Subscriber View (R9):**
- Featured view with free content visible. Subscriber-only shows lock icon with subscribe prompt. Paying subscribers see all content. Tip button on every video. Product tags on videos with inline Buy button.

#### Library View

**Owner View (R0):**
- Full video catalog. Upload button with metadata: title, description, tags, thumbnail, series assignment, access level (public, subscribers only, specific tier), monetization settings (tips enabled, product tags), schedule publish date, premiere mode (countdown and live chat at launch).
- Video analytics per video: views, unique viewers, average watch time, completion rate, traffic source, subscriber conversions, revenue generated (tips, product sales, subscription conversions).
- Series management. Group videos into named series with art, description, episode order. Series landing page.
- Content editing. Trim, cut, chapter markers, subtitles/captions (auto-generated or uploaded), end screens.
- Clip creation. Select highlights from long-form to auto-generate short clips for Social reels. Clip links back to full video.
- Filter pills: All, Public, Subscriber Only, By Series, Most Viewed, Recent, Drafts, Scheduled.
- For Sammy demo: 12 videos. "KaNeXT Product Demo" (featured, 2,400 views), "Why I Built an OS" (5,100 views), 8 Lincoln basketball game films, "Coaching Philosophy" (series), "Building KaNeXT Ep. 1-3" (series).

**Manager/Agent View (R2):**
- Full library. Can upload on behalf of owner (approval queue). Can edit metadata, manage series, schedule. Full analytics.
- Filter pills: All, Published, Drafts, Scheduled, Pending Approval, By Series.

**Subscriber View (R9):**
- Library of accessible videos. Free content always available. Subscriber-only unlocked by tier.
- Filter pills: All, Free, My Subscription, By Series, Most Popular, Recent.

#### Live View

**Owner View (R0):**
- Go Live button. Title, description, thumbnail, access level, monetization (tips, product spotlights). Camera and mic setup. Countdown option.
- During live: viewer count, live chat with moderation tools (pin, remove, ban, slow mode), tip feed (real-time tips with amounts and names through KayPay), product spotlight (pin Earn product at bottom of stream, viewers buy without leaving), real-time analytics.
- Live giving replaces YouTube Super Chat without the 30% cut. Tips flow directly to KayPay wallet.
- After live: auto-saves as VOD in Library. Can edit, add chapters. Chat replay preserved. Tips appear in Earn and KayPay.
- Scheduled streams with "Set Reminder" for subscribers.

**Subscriber View (R9):**
- Watch live. Chat, send tips, tap product spotlights. Set reminders for upcoming streams.

#### Video Player

- Full-screen or inline. Scrub bar with chapter markers. Speed controls. Captions. AirPlay/Chromecast.
- Tip button persistent on player. Product tags as subtle pop-ups at creator-set timestamps.
- Share: Messages, Social, copy link, clip creation.
- Comments below. Creator can pin, heart, reply. Related content from same series or creator.

---

### 15.8 Personal KayPay

KayPay in Personal mode is the creator's financial hub. Same structure as all KayPay tiles (Wallet/Pay/Invest views). For a personal brand, KayPay is where all money lands: product sales from Earn, tips from Social and KayTV, brand deal payments from Deals, subscription revenue, coaching session payments, and peer-to-peer transfers. It replaces Stripe (2.9% + $0.30), PayPal (2.9% + $0.30), Cash App, Venmo, and the AdSense/Payoneer payout nightmare. One balance. One transaction history. One tax export.

Views: Wallet / Pay / Invest (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner: quick balance, revenue stream breakdown, pending payouts, tax reporting shortcut, linked banks and cards, KaNeXT Card controls, savings goals, transaction export, settings. Manager/Agent: client revenue overview, pending invoices, payout tracking, tax report generation, settings. Moderator: not applicable. Subscriber: personal wallet only.

#### Wallet View

**Owner View (R0):**
- Balance displayed large at top. 4% APY indicator. Total balance includes all revenue streams.
- Revenue stream cards below balance. Visual breakdown: Earn Products, Subscriptions, Tips, Brand Deals, Services, Affiliate. Each card tappable to see transactions behind it.
- KaNeXT Card. Virtual card, Apple Pay, Google Pay. Revenue earned goes directly to the card. No payout cycles.
- Transaction history. Every transaction across every revenue stream in one chronological list. Each entry: source (Earn, Tips, Deals, Services, P2P), payer name, amount, date, status. Full audit trail. Tap any transaction for detail: who paid, for what, payment method, settlement chain (Event, Rules, Authorization, Payment, Settlement, Audit), receipt.
- Savings goals. Named goals with auto-save rules. "Tax Reserve" (auto-save 30% of all revenue), "Equipment Fund", "Emergency Fund."
- Tax dashboard. Real-time tax estimate based on earnings. Categorized by revenue type (1099-K, 1099-NEC, 1099-MISC). Quarterly estimated tax calculator. Year-end export: full transaction list categorized for filing, CSV or PDF. Integrates with tax software.
- Pending payouts. If external bank linked, shows pending transfers. Schedule: instant (small fee), daily (free), weekly (free).
- Audit trail. Every dollar traceable. Brand deal payment shows: originated from Deals tile (deal ID), invoice sent (date), payment received (date), deposited to wallet (instant), tax category assigned, available for spend. Nothing ambiguous. Every dollar has a story.
- Nexus integration: "How much did I earn this month?", "What's my tax estimate for Q1?", "Transfer $1,000 to my bank", "Set aside 30% of every payment for taxes automatically", "Show me all payments from Overtime Elite."
- Filter pills: All, Earn Products, Subscriptions, Tips, Brand Deals, Services, Affiliate, P2P, Sent, Received, This Week, This Month, This Year, Tax Export.
- For Sammy demo: wallet balance $8,400. Revenue this month $6,500. KaNeXT Card active. Savings: Tax Reserve $4,200, Equipment Fund $1,200/$2,000. 40+ transactions with full audit trail.

**Manager/Agent View (R2):**
- Client revenue overview. Can see all revenue streams, transaction history, pending payouts. Can generate invoices for brand deals. Can track paid vs outstanding.
- Tax report generation. Year-end reports and quarterly estimates on behalf of owner. Export for accountant.
- Cannot transfer funds. Cannot access KaNeXT Card. Cannot change payout settings.
- Filter pills: All, By Source, Invoiced, Paid, Outstanding, This Month, This Year, Tax Report.

**Subscriber View (R9):**
- Personal wallet only. Their purchases from the creator appear in their own transaction history.

#### Pay View

**All roles:**
- Same P2P send/receive. Send, receive, QR, split, remittance at 0.2%. Inline payments from Messages.

**Owner View (R0) additional:**
- Invoice creation. Professional invoices for brand deals, consulting, speaking. Builder: client info (from Network), line items, payment terms, notes. Send through Messages or email. Track status (sent, viewed, paid, overdue). Auto-reminder for overdue. Paid invoices auto-reconcile with Deals tile.
- Batch invoicing for multiple clients.
- Payment links. Generate unique link for any amount. Share via Social, Messages, or Links page. Anyone with link pays through KayPay.

**Manager/Agent View (R2):**
- Can create and send invoices on behalf of owner. Can track payment status. Can send reminders.

#### Invest View

**All roles:**
- Same as all KayPay Invest. Infrastructure Fund, Bitcoin, Capital Points.

**Owner View (R0) additional:**
- Revenue reinvestment. "Invest 10% of all revenue automatically into Infrastructure Fund." Auto-invest rules that turn earnings into long-term wealth.
- KaNeXT Capital Fund visibility for accredited/qualified investors.

---

### 15.9 Personal KayStudios

KayStudios in Personal mode is the same cross-mode interactive experiences hub. Same structure (Home/Explore/Library views). For a personal brand, KayStudios is where the creator builds and sells interactive content. Courses priced in Earn actually play here. Quizzes, challenges, and games the creator builds for their audience live here.

The key connection: Earn is the storefront (where you list and price products). KayStudios is the delivery platform (where the buyer actually takes the course or plays the game). Earn tracks the money. KayStudios delivers the experience.

#### RBAC Views

**Owner View (R0):**
- Full creator access. Build any content type: courses, quizzes, challenges, flashcards, polls, assessments.
- Courses are the primary product. "KaNeXT Masterclass - Building an OS" listed at $200 in Earn, but the actual 12-lesson course with video modules, text content, embedded quizzes, and completion certificate plays here in KayStudios.
- Creator dashboard in side panel: my published content, plays/completions, ratings, revenue per item (synced from Earn), drafts in progress.
- Can feature content to subscribers ("Complete this quiz to unlock a bonus resource").
- Analytics per item: enrollments, completion rate, average score (for quizzes), time spent, drop-off point (which lesson do people stop at), rating, reviews.
- Filter pills (creator): All, My Content, Published, Drafts, Analytics, Courses, Quizzes, Challenges.
- For Sammy demo: "KaNeXT Masterclass - Building an OS" (course, 12 lessons, $200, 8 enrolled, 62% completion rate), "How Well Do You Know KaNeXT?" (quiz, 10 questions, free, 45 plays), "30-Day Creator Challenge" (challenge, 12 participants), "Basketball Coaching IQ Test" (trivia, free, 200+ plays), "Brand Strategy Assessment" (quiz, $25, 15 completions).

**Manager/Agent View (R2):**
- Can view all published content and analytics. Can draft content on behalf of owner (approval queue). Can manage existing content (update descriptions, pricing adjustments with approval).
- Filter pills: All, Published, Drafts, Pending Approval, Analytics.

**Moderator View (R5):**
- Not visible.

**Subscriber View (R9):**
- Consumer. Browse and play all content the creator has published. Free content available immediately. Paid content requires purchase through KayPay.
- Course player: full learning experience with modules, video, text, quizzes, progress tracking, certificate on completion.
- Quiz/trivia: play, score, share results to Social, see leaderboard.
- Challenges: join, track progress, compete with other subscribers.
- My Library: in progress items with resume, completed items, purchased items.
- Filter pills: All, Free, Purchased, Courses, Quizzes, Challenges, In Progress, Completed.

---

## 16. Business Mode

Business mode is the operating environment for companies, startups, agencies, and organizations. The demo brand is KaNeXT (KaNeXT LLC). Business mode replaces the entire business tool stack: HubSpot (CRM), Monday.com (projects), Salesforce (pipeline), QuickBooks (accounting), Slack (team chat), Notion (docs), and every disconnected tool a business pays $200-500+/user/month to juggle.

Business mode RBAC roles: Owner/CEO (R0), Executive (R2), Manager (R3), Employee (R5), Client/Partner (R9).

Business mode home grid:

| Hub | Agenda | Social |
|-----|--------|--------|
| Team | Inquiries | Store |
| KayTV | KayPay | KayStudios |

### 16.1 Business Hub

The Hub in Business mode is the company command center. It replaces Monday.com dashboards, HubSpot reporting, Notion wikis, and every scattered business analytics tool. Three tabs, RBAC determines depth.

Tabs: Overview / Projects / Operations

Side panel (swipe right or menu icon). Owner/CEO: company dashboard (revenue, pipeline, team activity, project status), KPIs, financial summary, quick search, settings. Executive: department dashboard, KPIs for their division, project portfolio, settings. Manager: team dashboard, project status, task assignments, settings. Employee: my tasks, my projects, company announcements, settings. Client/Partner: project status (their projects only), shared files, settings.

#### Overview Tab

**Owner/CEO View (R0):**
- Company dashboard at top. Revenue this month (from KayPay), pipeline value (from Inquiries), active projects count, team size, burn rate (monthly expenses vs revenue).
- KPI cards row: MRR, customer count, churn rate, average deal size, team utilization rate, NPS score. Each card tappable for trend chart.
- Revenue chart. 12-month line graph. Revenue vs expenses. Profit margin trend. Forecast based on pipeline and recurring revenue.
- Pipeline summary. Stages with counts and values from Inquiries tile. Conversion rate funnel.
- Project health. All active projects with status badges (on track, at risk, behind, completed).
- Team activity feed. Recent activity: deals closed, projects completed, tasks finished, new clients onboarded.
- Company announcements. Pin important messages for the whole team.
- Nexus integration: "What's our revenue this month?", "How many deals are in the pipeline?", "Which projects are behind schedule?", "What's our burn rate?", "Draft a company announcement about hitting $1M ARR."
- Filter pills: All, Revenue, Pipeline, Projects, Team, This Week, This Month, This Quarter.
- For KaNeXT demo: $42,000 MRR, $2.8M pipeline value, 5 active projects, 8 team members, 12 active clients. Revenue trending up 15% MoM.

**Executive View (R2):**
- Same dashboard scoped to their division. Can see company-level KPIs in read-only. Can drill into department data.
- Filter pills: All, My Division, Revenue, Projects, This Quarter.

**Manager View (R3):**
- Team dashboard. Direct reports, task completion rate, active projects, upcoming deadlines. Cannot see company financials.
- Filter pills: All, My Team, My Projects, Tasks Due, This Week.

**Employee View (R5):**
- My dashboard. Tasks assigned, projects I'm on, company announcements, upcoming meetings.
- Filter pills: All, My Tasks, My Projects, Announcements.

**Client/Partner View (R9):**
- Client portal. Their projects with status updates. Shared files. Messages with account manager.
- Filter pills: All, My Projects, Shared Files.

#### Projects Tab

**Owner/CEO View (R0):**
- Full project portfolio. Each card: name, client, project lead, status badge, progress bar, budget (spent vs allocated), deadline, team members.
- Project views: List (default), Kanban (drag between Planning/In Progress/Review/Completed), Timeline (Gantt with dependencies).
- Create Project button. Name, description, client, lead, budget, deadline, milestones, team, files. Template library.
- Project Detail Page: overview, task board (Kanban), milestones timeline, budget tracker (hours, expenses, remaining), files, activity log, client communication thread.
- Task management. Each task: title, assignee, due date, priority, status, description, subtasks, comments, files. Drag between columns.
- Time tracking. Log hours against projects/tasks. Billable vs non-billable. Auto-generates invoices for client work through KayPay.
- Project analytics: on-time delivery rate, budget adherence, team utilization.
- Filter pills: All, Active, Planning, Completed, By Client, By Lead, At Risk, Over Budget.
- For KaNeXT demo: "KaNeXT OS v1.0" (internal, In Progress, 65%), "Investor Data Room" (internal, 80%), "Basketball Intelligence API" (Planning), "Lincoln University Pilot" (client, 40%), "ICCLA Community Setup" (client, Planning).

**Manager View (R3):**
- Projects they lead or their team is on. Can create tasks, assign members, update status, view budget.
- Filter pills: All, My Projects, My Team's Tasks, Active, Planning.

**Employee View (R5):**
- Projects assigned to. Update task status, log time, add comments. Cannot create projects or manage budgets.
- Filter pills: All, My Projects, My Tasks, Due This Week.

**Client/Partner View (R9):**
- Their project(s) only. Status, milestones, deliverables. Can comment and approve milestones.
- Filter pills: All, Active, Completed, Deliverables.

#### Operations Tab

**Owner/CEO View (R0):**
- HR overview. Team size, open positions, recent hires, upcoming reviews.
- Document library. Company wiki, SOPs, policies, templates, contracts. Organized by department. Replaces Notion/Google Drive.
- Workflows. Automated processes: client onboarding, employee onboarding, invoice automation.
- Integrations dashboard.
- Filter pills: All, HR, Documents, Workflows, Integrations.

**Manager View (R3):**
- Department documents and SOPs. Team workflows.
- Filter pills: All, My Department, Documents, Workflows.

**Employee View (R5):**
- Company documents relevant to role. Onboarding tasks. SOPs.
- Filter pills: All, My Documents, SOPs, Training.

---

### 16.2 Business Agenda

Agenda in Business mode is the company calendar. Same structure (Day/Week/Month views). It combines team schedules, project deadlines, client meetings, and company events. It replaces Google Calendar for business, Calendly for client bookings, and the calendar features in Monday.com/HubSpot.

Views: Day / Week / Month (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner/CEO: company calendar, all team schedules, meeting rooms, client meetings, project deadlines, company events, settings. Executive: department calendar, team schedules, client meetings for division. Manager: team calendar, project deadlines, 1:1s, settings. Employee: my calendar, team meetings, project deadlines. Client/Partner: scheduled meetings, project milestones.

#### Day / Week / Month Views

**Owner/CEO View (R0):**
- Full company calendar. All team members' schedules visible (toggle on/off). Color-coded: client meetings (blue), internal meetings (green), project deadlines (gold), company events (teal), personal (gray), standups (orange).
- Client meeting scheduler. Send invites, video call links auto-generated. Meeting notes auto-logged to client profile in Inquiries.
- Project deadline markers synced from Hub Projects tab. Milestones and deliverables visible.
- Company events. All-hands, socials, launches, board meetings.
- Resource scheduling. See who is available. Prevent double-booking.
- Create event. Title, type, date/time, duration, attendees (from Team and Inquiries), location/video link, recurring, notes, files, project link.
- Nexus integration: "What's on the company calendar this week?", "Schedule a call with Lincoln University for Thursday", "When is the next board meeting?", "Who is free for a client call tomorrow at 2pm?"
- Filter pills: All, Client Meetings, Internal, Deadlines, Company Events, My Calendar, By Team Member.
- For KaNeXT demo: weekly standup Monday 9am, 3 client meetings, 2 project deadlines, all-hands Friday, board meeting next week, Sammy's coaching schedule blocked.

**Executive View (R2):**
- Department calendar plus company events. Team schedules. Client meetings for division.
- Filter pills: All, My Division, Client Meetings, Deadlines, Company Events, My Calendar.

**Manager View (R3):**
- Team calendar. Direct reports visible. Project deadlines. 1:1s. Cannot see other departments.
- Filter pills: All, My Team, Client Meetings, Deadlines, 1:1s, My Calendar.

**Employee View (R5):**
- Personal calendar. Meetings invited to, task deadlines, company events. Teammates' free/busy only.
- Filter pills: All, My Meetings, Deadlines, Company Events, My Calendar.

**Client/Partner View (R9):**
- Meetings with KaNeXT contacts only. Project milestones. Can request meetings.
- Filter pills: All, Upcoming Meetings, Project Milestones.

---

### 16.3 Business Social

Social in Business mode is the company's public brand page and internal communication feed. Two purposes: external (marketing, brand content, customer engagement) and internal (team updates, company culture). Same structure as all Social tiles (Feed/Reels/Profile views, scope filter Brand/Mode/All).

Scope filter: Brand (KaNeXT only), Mode (all Business brands), All (everything across all modes).

#### Feed View

**Owner/CEO View (R0):**
- Full feed. Company content and followed brands/people.
- Create button. Post types: text, photo, video, carousel, poll, product feature (embeds Store product), job posting (embeds open position from Team), company update, press release.
- Post visibility toggle: Public (marketing, visible to everyone) or Internal (team only R0-R5, "Internal" badge). Schedule posts. Pin up to 3.
- Analytics on public posts: impressions, reach, engagement, link clicks, leads generated.
- Cross-post to owner's Personal brand simultaneously.
- Filter pills: All, Public, Internal, My Posts, Following, Trending, Saved, Drafts.

**Executive View (R2):**
- Full feed. Can draft public posts (approval queue). Can post internal updates for department directly.
- Filter pills: All, Public, Internal, My Department, Drafts.

**Manager View (R3):**
- Full feed. Can post internal updates for team. Cannot post publicly without approval.
- Filter pills: All, Public, Internal, My Team, Announcements.

**Employee View (R5):**
- Full feed (public and internal). Can like, comment, share. Can post internal (team-level). Cannot post as company brand publicly.
- Filter pills: All, Public, Internal, Announcements, My Posts.

**Client/Partner View (R9):**
- Public content only. Cannot see internal posts.
- Filter pills: All, Posts, Products, Updates.

#### Reels View

**Owner/CEO View (R0):**
- Brand short-form video. Product demos, behind-the-scenes, culture, testimonials, industry insights. Full analytics.

**Client/Partner View (R9):**
- Public reels only.

#### Profile View

**Owner/CEO View (R0):**
- Full company profile. Logo, name, bio/tagline, follower count, website, contact, edit profile. Content grid. Pinned posts. Reels tab. KayTV tab. Company info: founded, team size, industry, location, mission.

**Client/Partner View (R9):**
- Public profile. Follow, Message, Visit Store buttons. Content grid.
- For KaNeXT demo: "KaNeXT - The OS for everything." Bio: "Multi-mode operating system | Communication, Media, Intelligence, Commerce, Finance | Miami, FL." 20 mock posts. 5 reels. Pinned: "KaNeXT OS Launch Announcement", "We're Hiring", "Invest in KaNeXT."

---

### 16.4 Business Team

Team is the people tile for business brands. Position 4 in the grid. It is the employee directory, org chart, HR hub, onboarding system, performance management tool, and workforce dashboard. It replaces BambooHR ($10-20/employee/mo), Gusto ($12/employee/mo), Rippling ($8/employee/mo), and every disconnected HR tool.

Views: Directory / Org Chart / HR (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner/CEO: workforce dashboard (headcount, departments, open positions, recent hires, upcoming reviews), quick search, add employee, export, settings. Executive: department roster, hiring pipeline for division, settings. Manager: my direct reports, team performance, 1:1 schedule, settings. Employee: my profile, company directory, org chart, settings. Client/Partner: account team contacts only.

#### Directory View

**Owner/CEO View (R0):**
- Full employee directory. Each card: avatar, name, title, department, email, phone, status (active, on leave, onboarding), start date.
- Search by name, department, title, skill.
- Tap person for full Employee Profile: contact info, role, department, manager, direct reports, start date, employment type, compensation, PTO balance, performance review history, skills/certifications, onboarding status, notes (private HR, visible R0-R2 only).
- Add Employee triggers onboarding workflow: welcome message through Messages, onboarding checklist (docs, benefits, tools, training in KayStudios), manager notified, buddy assigned.
- Offboarding workflow: access revoked, equipment return, exit interview, knowledge transfer.
- Filter pills: All, Active, By Department, Managers, Contractors, On Leave, New Hires, Open Positions.
- For KaNeXT demo: 8 team members (Sammy CEO, CTO, Head of Product, 2 Engineers, Designer, Marketing Lead, Operations). 2 contractors. 2 open positions.

**Executive View (R2):**
- Full directory. Compensation visible for their department only. Can initiate hiring for department.
- Filter pills: All, My Department, Active, Contractors, Open Positions.

**Manager View (R3):**
- Full directory. Profile without compensation (unless direct report). Can see reports' reviews and PTO.
- Filter pills: All, My Team, By Department, Active.

**Employee View (R5):**
- Directory of active employees. Name, title, department, contact. No compensation, HR notes, or performance data for others. My Profile editable.
- Filter pills: All, By Department, Leadership, My Team.

**Client/Partner View (R9):**
- Account team only. Employees assigned to their project. Name, title, contact. Message, Schedule Call.

#### Org Chart View

**Owner/CEO View (R0):**
- Visual hierarchical tree. CEO at top, departments branching, teams within, individuals at bottom. Tap node to expand/collapse. Tap person for profile. Department summaries. Drag and drop to reorganize.
- Filter pills: All, By Department, Managers Only, Leadership.

**Manager View (R3):**
- Full org chart. Their team highlighted.
- Filter pills: All, My Team, By Department.

**Employee View (R5):**
- Full org chart read-only.
- Filter pills: All, By Department.

**Client/Partner View (R9):**
- Not visible.

#### HR View

**Owner/CEO View (R0):**
- HR dashboard. Headcount, by department, by type, attrition rate, average tenure, PTO utilization.
- Hiring pipeline. Open positions with applicant count and stage (posted, screening, interviewing, offer, hired). Create job posting (flows to Social). Applicant tracking: resume, notes, interview scores, status.
- Performance management. Review cycles (quarterly, annual). Templates: self-assessment, manager assessment, 360 feedback, goal tracking. Completion tracking.
- PTO management. Policy, balances, approval queue, calendar view.
- Document management. Contracts, NDAs, offer letters, tax forms, benefits. Per employee. E-signature.
- Compensation overview. Salary bands, equity, payroll summary (flows to KayPay).
- Filter pills: All, Hiring, Performance Reviews, PTO, Documents, Compensation, By Department.
- For KaNeXT demo: 2 open positions (5 applicants each), Q2 review cycle upcoming, 3 PTO requests pending, all docs signed.

**Executive View (R2):**
- HR dashboard for department. Hiring, reviews, PTO scoped to division.
- Filter pills: All, My Department, Hiring, Reviews, PTO.

**Manager View (R3):**
- Direct reports only. Submit reviews, approve PTO, view onboarding for new hires.
- Filter pills: All, My Reports, Reviews, PTO Requests.

**Employee View (R5):**
- My HR: PTO balance and request, my reviews (self-assessment, manager feedback), my documents, onboarding checklist (if new).
- Filter pills: All, My PTO, My Reviews, My Documents.

---

### 16.5 Business Inquiries

Inquiries is the pipeline tile for business brands. Position 5 in the grid. Same pattern as Recruits (Sports), Admissions (Education), Outreach (Community), Deals (Personal). It is the CRM where leads come in, get qualified, get worked, and close. It replaces HubSpot Sales ($20-890/mo), Salesforce ($25+/user/mo), Pipedrive ($14-99/user/mo), and every disconnected sales tool.

The key difference from Personal Deals: Inquiries is multi-user. Multiple salespeople work the same pipeline with lead assignment, territories, team quotas, and sales analytics across reps.

Views: Pipeline / Leads / Analytics (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner/CEO: sales dashboard (pipeline value, deals this month, win rate, forecast), lead queue, team performance, quota tracking, automation builder, settings. Executive: division pipeline, team quotas, forecast. Manager: team pipeline, rep performance, coaching notes. Employee (sales rep): my pipeline, my leads, my quota. Client/Partner: not visible.

#### Pipeline View

**Owner/CEO View (R0):**
- Full sales pipeline Kanban: New Lead, Qualified, Discovery Call, Proposal Sent, Negotiating, Contract, Closed Won, Closed Lost. Each column shows count and total value.
- Deal cards: company name/logo, deal title, value, assigned rep, days in stage, next action due, probability, health color (green/amber/red). Drag and drop between stages.
- Tap deal for Detail Page: company info, contacts, value, products quoted, proposal history, all communications (auto-pulled from Messages, Phone, Email), meeting notes, files, activity timeline, next steps, win probability.
- Deal-to-project conversion. Closed Won one-tap converts to Hub project. All context carries over. Sales-to-delivery handoff solved.
- Revenue forecast. Weighted pipeline by stage probability. Monthly/quarterly chart. Forecast vs quota.
- Automation engine. New lead auto-assigns by territory/round-robin, stage change triggers email templates, stale deal creates follow-up task, closed deal auto-generates KayPay invoice and Hub project.
- Nexus integration: "What's our total pipeline value?", "Which deals are closing this month?", "Draft a follow-up email for the Lincoln University deal", "What's our win rate this quarter?"
- Filter pills: All, New Lead, Qualified, Discovery, Proposal, Negotiating, Contract, Won, Lost, By Rep, By Value, This Month, This Quarter, Stale Deals, High Value.
- For KaNeXT demo: 15 deals. "Lincoln University - Full OS Deployment" (Negotiating, $120K), "ICCLA - Community Mode" (Proposal, $48K), "Valley Capital - Fund Investment" (Discovery, $250K), "Oakland USD" (New Lead, $500K), "Overtime Elite - Intelligence API" (Qualified, $85K), 5 mid-stage, 5 closed (3 won, 2 lost).

**Executive View (R2):**
- Division pipeline. Full deal detail for their territory. Team quota tracking.
- Filter pills: All, My Division, By Rep, By Stage, This Quarter, Forecast.

**Manager View (R3):**
- Team pipeline. Can reassign deals. Coaching notes on reps. Rep performance metrics.
- Filter pills: All, My Team, By Rep, By Stage, Overdue, This Month.

**Employee/Sales Rep View (R5):**
- My pipeline only. Full CRUD on my deals. My quota tracker with progress bar. Daily task list auto-generated from deal next steps.
- Filter pills: All, My Deals, New Leads, Follow-Ups Due, Proposals Out, Closing This Month, My Quota.

**Client/Partner View (R9):**
- Not visible.

#### Leads View

**Owner/CEO View (R0):**
- All inbound leads. Sources: website form, Social DMs, Phone, email, referrals, events, manual entry.
- Each card: name, company, source, date, status (new, contacted, qualified, disqualified), assigned to.
- Lead scoring. Auto-score by company size, industry fit, engagement level, budget. High-score prioritized.
- Lead routing. Auto-assign by territory, round-robin, product interest, or rep specialty.
- Convert Lead to pipeline deal (data carries over).
- Lead analytics: leads by source, conversion rate, response time, cost per lead.
- Filter pills: All, New, Contacted, Qualified, Disqualified, By Source, By Score, This Week, This Month, Unassigned.

**Manager View (R3):**
- Team leads. Assign/reassign. Review quality.
- Filter pills: All, My Team, Unassigned, New, By Source, This Week.

**Employee/Sales Rep View (R5):**
- My assigned leads. Contact, update status, qualify/disqualify, convert.
- Filter pills: All, My Leads, New, Contacted, Hot.

#### Analytics View

**Owner/CEO View (R0):**
- Sales dashboard. Revenue this month/quarter/year. Pipeline velocity (avg days to close). Win rate. Average deal size. Revenue by product and by rep.
- Funnel analysis. Stage-by-stage conversion rates. Where deals drop off.
- Rep leaderboard. Ranked by revenue, deals won, pipeline generated, activity.
- Forecast accuracy. Past forecasts vs actual.
- Lead source ROI. Which sources produce most revenue. Cost per acquisition.
- Filter pills: All, Revenue, Pipeline, Win Rate, By Rep, By Product, By Source, This Month, This Quarter, This Year.
- For KaNeXT demo: $180K closed this quarter, 35% win rate, 45-day cycle, referral top source (60%), Sammy leading all metrics.

**Executive View (R2):**
- Division analytics. Rep performance for team.
- Filter pills: All, My Division, Revenue, Win Rate, By Rep, This Quarter.

**Manager View (R3):**
- Team analytics. Rep comparison. Coaching insights.
- Filter pills: All, My Team, By Rep, Win Rate, Activity, This Month.

**Employee/Sales Rep View (R5):**
- My analytics. Personal win rate, deal size, pipeline, activity, quota progress.
- Filter pills: All, My Performance, This Month, This Quarter.

---

### 16.6 Business Store

Store is the commerce tile for business brands. Position 6 in the grid. Same pattern as Earn (Personal), Give (Community), Fund (Education), Booster (Sports). Full Shopify-level e-commerce engine. Product catalog, inventory management, order management, shipping, subscriptions, B2B wholesale, POS, customer accounts, storefront analytics. It replaces Shopify ($39-399/mo), WooCommerce, BigCommerce, Square, and every disconnected commerce tool. All transactions flow through KayPay.

Views: Products / Orders / Analytics (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner/CEO: store dashboard (revenue today, orders today, conversion rate, AOV, top products, inventory alerts), quick product add, storefront settings, shipping config, tax settings, discount manager, export. Executive: product line performance. Manager: fulfillment queue, inventory. Employee: fulfillment tasks, product updates. Client/Partner: purchases, order history, account.

#### Products View

**Owner/CEO View (R0):**
- Full product catalog. Each card: image, title, price, status (active, draft, archived), inventory count, variants, sales this month.
- Product types: Physical (shipped, weight, dimensions, inventory, SKU), Digital (instant download), Service (booked through Agenda), Subscription (recurring via KayPay, access-gated), Bundle (grouped discount), B2B/Wholesale (volume pricing, MOQ, net terms).
- Create Product: title, description (rich text), images (up to 10), pricing (compare-at, cost per item for margin), variants (size/color/material each with SKU, price, inventory, image), inventory (quantity per location, low-stock threshold, auto-reorder), shipping (weight, dimensions, HS code, shipping class), SEO (meta title, description, URL), tags, collections, visibility.
- Inventory management. Multi-location tracking. Transfer between locations. Purchase orders to suppliers (create, track: ordered/in transit/received). Low-stock alerts through Pulse. Inventory history (every adjustment logged). Barcode/SKU management. Bulk CSV import.
- Collections. Curated groups: auto-collections by rules or manual. "New Arrivals", "Best Sellers", "KaNeXT OS Plans", "API Products", "Merch".
- Pricing and discounts. Codes (percentage, fixed, free shipping, BXGY). Automatic discounts. Volume pricing for B2B. Sale scheduling.
- Filter pills: All, Active, Draft, Archived, Physical, Digital, Service, Subscription, B2B, Low Stock, By Collection, Best Sellers.
- For KaNeXT demo: "KaNeXT OS Free" ($0/mo, 500 users), "KaNeXT OS Pro" ($29/mo, 45 subscribers), "KaNeXT OS Enterprise" (custom, 3 clients), "Basketball Intelligence API Starter" ($99/mo, 12 subs), "API Pro" ($499/mo, 4 subs), "Logo Tee" ($35, 200 stock, 3 variants), "Hoodie" ($65, 100 stock), "Implementation - Education" ($5K flat), "Implementation - Community" ($3K flat), "Custom Dev" ($200/hr).

**Manager View (R3):**
- Products in their department. Can update inventory, edit details (pricing changes need approval).
- Filter pills: All, My Products, Active, Low Stock, By Collection.

**Employee View (R5):**
- Assigned products. Can update inventory counts, mark received, update descriptions (approval queue).
- Filter pills: All, My Assigned, Low Stock, Needs Update.

**Client/Partner View (R9):**
- Customer storefront. Browse by collection. Product pages with images, description, variants, Add to Cart, Buy Now through KayPay. B2B clients see wholesale pricing and net terms. Account page: order history, saved payments, addresses, wishlist.
- Filter pills: All, By Collection, New Arrivals, Best Sellers, On Sale.

#### Orders View

**Owner/CEO View (R0):**
- Full order management. Each order: number, customer, date, items, total, payment status (paid, pending, refunded), fulfillment status (unfulfilled, partially fulfilled, fulfilled, shipped, delivered, returned).
- Order Detail: customer info (linked to Inquiries if B2B), line items, shipping address, payment details with KayPay settlement chain, fulfillment details (tracking, carrier), order timeline, notes, refund history.
- Fulfillment workflow. Pick, pack, ship. Print shipping labels. Mark shipped with tracking. Customer auto-notified through Messages at each stage.
- Returns and refunds. Approve/deny returns. Generate return label. Receive item. Process refund through KayPay. Auto-restock.
- Abandoned carts. Customer, items, value, time. Auto-recovery email through Messages. Recovery rate tracked.
- Draft orders. Manual orders (phone, custom quotes, B2B). Custom pricing. Invoice through KayPay.
- Subscriptions management. Active subscriptions, subscriber count per plan, MRR, churn. Pause, cancel, upgrade, downgrade.
- Filter pills: All, Unfulfilled, Fulfilled, Shipped, Delivered, Returned, Refunded, Abandoned Carts, Draft Orders, Subscriptions, Today, This Week, This Month, By Product.
- For KaNeXT demo: 35 orders this month. 20 subscription renewals, 10 merch orders, 3 service orders, 2 abandoned carts. MRR $6,400.

**Manager View (R3):**
- Department orders. Fulfillment queue. Process shipments, manage returns.
- Filter pills: All, My Department Orders, Unfulfilled, Shipped, Returns, Today.

**Employee View (R5):**
- Fulfillment tasks. Pick lists, packing slips. Update status. Cannot process refunds.
- Filter pills: All, My Tasks, To Pick, To Pack, To Ship.

**Client/Partner View (R9):**
- My Orders. Status tracking. Track shipment. Request return. Download invoices.
- My Subscriptions. Active plans, billing, upgrade/downgrade, cancel.
- Filter pills: All, Active Orders, Delivered, Returns, Subscriptions.

#### Analytics View

**Owner/CEO View (R0):**
- Store dashboard. Revenue: today, week, month, year with period comparison. Revenue chart.
- Conversion funnel. Visits, add to cart, checkout, orders. Rate at each step. Drop-off analysis.
- Top products by revenue and units. Product performance over time.
- Customer analytics. New vs returning. CLV, AOV, purchase frequency. Segments (one-time, repeat, VIP, churned).
- Inventory analytics. Sell-through rate. Days remaining. Dead stock. Reorder recommendations.
- Subscription analytics. MRR, ARR, growth, churn, ARPU, LTV.
- Channel analytics. Orders from: direct Store, Social posts, KayTV tags, Links page, external referral.
- Shipping analytics. Fulfillment time, costs, delivery rate, return rate.
- Filter pills: All, Revenue, Conversion, Products, Customers, Inventory, Subscriptions, Channels, Shipping, Today, This Week, This Month, This Year.

**Executive View (R2):**
- Division analytics. Revenue and product performance.
- Filter pills: All, My Division, Revenue, Products, This Quarter.

**Manager View (R3):**
- Product analytics. Inventory and fulfillment metrics.
- Filter pills: All, My Products, Inventory, Fulfillment, This Month.

---

### 16.7 Business KayTV

KayTV in Business mode is the company's video platform. Same structure (Featured/Library/Live views). For a business, video includes product demos, tutorials, webinars, company culture, customer testimonials, investor updates, training, and thought leadership. It replaces YouTube for business, Vimeo Pro, Wistia, Loom, and Zoom webinar recordings.

Views: Featured / Library / Live (centered contextual pill to switch)

#### Featured View

**Owner/CEO View (R0):**
- Hero video. Category rows: Product Demos, Tutorials, Customer Testimonials, Company Culture, Investor Updates (internal-only), Webinar Recordings, Thought Leadership, Training (internal-only).
- Admin controls: reorder, feature/unfeature, set access (public, clients only, internal, investors only).

**Employee View (R5):**
- Featured including internal content (training, culture, all-hands). Cannot see investor-only unless granted.

**Client/Partner View (R9):**
- Public and client-tier. Demos, tutorials, testimonials, webinars. Cannot see internal or investor content. Self-service onboarding through video.

#### Library View

**Owner/CEO View (R0):**
- Full catalog. Upload with: title, description, tags, thumbnail, series, access level (public, clients, internal, investors, specific team), category, product association (link to Store product page).
- Analytics: views, unique viewers, watch time, completion rate, traffic source, leads generated (gated content), product page views driven.
- Series management. Gated content (email required to watch, auto-adds to Inquiries as lead). Embed codes for external sites.
- Filter pills: All, Public, Client Only, Internal, Investors, By Series, By Product, Most Viewed, Recent, Drafts.
- For KaNeXT demo: "KaNeXT OS Product Demo" (public, 3,200 views), "Basketball Intelligence Deep Dive" (client, 800 views), "Q1 Investor Update" (investor-only, 45 views), "Employee Onboarding" (internal, 28 views), "Customer Story: Lincoln University" (public, 1,100 views), "How to Set Up Education Mode" (tutorial series, 3 parts), "All-Hands March 2026" (internal).

**Manager View (R3):**
- Library visible. Upload for department (approval queue). Department analytics.
- Filter pills: All, My Department, Public, Internal, By Series.

**Employee View (R5):**
- Accessible content. Training, culture, public. Not investor-only.
- Filter pills: All, Training, Public, Internal, By Series.

**Client/Partner View (R9):**
- Public and client-tier.
- Filter pills: All, Tutorials, Demos, Testimonials, By Product.

#### Live View

**Owner/CEO View (R0):**
- Go Live for company broadcasts. Product launches, webinars, all-hands, investor Q&As, customer events.
- Access control per stream: public, clients, internal, investors.
- During live: viewer count, chat, Q&A queue (moderator filters questions to presenter), screen sharing, product spotlight (pin Store product).
- Lead capture on public webinars (email gate, auto-flows to Inquiries).
- After live: auto-saves as VOD. Attendee list exportable. Follow-up email auto-sent through Messages.
- Scheduled streams with registration page (name, email, company). Calendar invite and reminders.

**Employee View (R5):**
- Watch internal streams. Chat and Q&A participation.

**Client/Partner View (R9):**
- Public and client-tier streams. Chat, Q&A. Register for webinars.

---

### 16.8 Business KayPay

KayPay in Business mode is the company's complete financial operating system. Same structure (Wallet/Pay/Invest views). It handles revenue collection from Store, client invoicing from Inquiries, payroll for Team, vendor payments, expense management, AR, AP, financial reporting, and tax compliance. It replaces QuickBooks ($30-200/mo), Xero ($15-78/mo), Gusto payroll ($40+$12/employee/mo), Bill.com ($45+/user/mo), Stripe (2.9%), Expensify ($5-18/user/mo), and every disconnected financial tool.

Every dollar in and out flows through one system with one audit trail. No reconciliation nightmares.

Views: Wallet / Pay / Invest (centered contextual pill to switch)

Side panel (swipe right or menu icon). Owner/CEO: financial dashboard (cash, revenue, expenses, profit, burn rate, runway), AR, AP, payroll status, tax summary, bank reconciliation, reports, audit log, settings (chart of accounts, approval thresholds, tax config, payroll schedule). Executive: department budget, expense approvals, division reports. Manager: team expenses, project budget, expense approvals. Employee: personal wallet, expense submissions, pay stubs, reimbursements. Client/Partner: personal wallet, invoices, payment history.

#### Wallet View

**Owner/CEO View (R0):**

Personal wallet (same as any user): balance, 4% APY, KaNeXT Card, personal transactions.

Company account (toggle in side panel):
- Financial dashboard. Cash position (all accounts), revenue this month, expenses this month, net profit/loss, burn rate, runway (months at current burn).
- Chart of accounts. Full double-entry ledger. Assets (cash, AR, inventory, equipment), Liabilities (AP, loans, deferred revenue), Revenue (products, subscriptions, services, API), Expenses (payroll, rent, software, marketing, travel, professional services), Equity (owner's equity, retained earnings). Each account shows balance with transaction detail.
- Accounts receivable. Outstanding invoices. Each: client, invoice number, amount, date sent, due date, status (sent, viewed, overdue, paid, partially paid), days overdue. Aging report: current, 30, 60, 90+ days. Auto-reminders. Total AR.
- Accounts payable. Bills owed. Vendor, invoice, amount, due date, status (pending approval, approved, scheduled, paid). Payment scheduling. Approval workflow (threshold-based chain). Total AP.
- Payroll. Full management. Employee list: name, title, salary, deductions (taxes, benefits, retirement), net pay, method. Schedule (biweekly, monthly, custom). Run Payroll: calculates gross, federal/state/local withholdings, SS, Medicare, benefits, retirement, net. Direct deposit to employee wallets. History. Tax filings: W-2, 941 quarterly, state unemployment, year-end. Contractor 1099 tracking separate.
- Expense management. Employee submissions: amount, category, receipt photo, description, project allocation, status (submitted, approved, rejected, reimbursed). Approval chain: employee submits, manager approves, finance reimburses through KayPay. Company card auto-categorization. Spending policies.
- Budget management. By department, project, or category. Real-time budget vs actual. Alerts on overrun.
- Bank reconciliation. Connect external accounts. Match transactions. Flag discrepancies.
- Financial reports. Income Statement (P&L), Balance Sheet, Cash Flow, Budget vs Actual, AR Aging, AP Aging, Payroll Summary, Tax Summary, Department P&L. Export: PDF, CSV, QuickBooks format. Audit-ready.
- Audit trail. Every transaction, approval, payroll run, invoice, bill, reimbursement. Timestamped, attributed, immutable. Full governed settlement chain: Event, Rules, Authorization, Payment, Settlement, Audit.
- Tax management. Sales tax auto-calculated by jurisdiction on Store transactions. Income tax quarterly estimates. Payroll tax withholding and filing. 1099 generation. Year-end tax package.
- Nexus integration: "What's our cash position?", "How much runway do we have?", "Run payroll", "What invoices are overdue?", "What's our burn rate?", "Generate Q1 income statement", "How much did we spend on marketing?"
- Filter pills: All, Revenue, Expenses, Payroll, AR, AP, By Department, By Project, This Week, This Month, This Quarter, This Year, Tax, Audit Log.
- For KaNeXT demo: cash $285,000. Revenue $42K/mo. Expenses $38K (payroll $28K, software $3.5K, rent $4K, misc $2.5K). Net $4K. Burn $38K/mo. Runway 7.5 months. AR: $253K (Lincoln $120K, ICCLA $48K, Overtime $85K). AP: $7.5K (rent, AWS, Anthropic API, insurance, legal). 8 employees, 2 contractors on payroll. 30+ transactions with full audit trail.

**Executive View (R2):**
- Company dashboard read-only. Department budget and spending detail. Approve expenses within limit. Department payroll costs (aggregate, not individual salaries unless direct reports).
- Filter pills: All, My Department, Budget, Expenses, Revenue, This Month, This Quarter.

**Manager View (R3):**
- Project/department budget vs actual. Approve direct report expenses up to limit (over-limit escalates). Cannot see company financials, payroll, AR, AP, or audit log.
- Filter pills: All, My Budget, My Team Expenses, Pending Approvals, This Month.

**Employee View (R5):**
- Personal wallet. Balance, 4% APY, KaNeXT Card.
- Pay stubs per period: gross, deductions breakdown (federal, state, SS, Medicare, health, 401k), net, YTD. Downloadable PDF.
- Expense submission: amount, category, receipt, description, project. Track status. Reimbursements to wallet.
- Benefits summary. Health, retirement, PTO (synced from Team).
- Tax documents. W-2, pay stubs. Downloadable.
- Filter pills: All, Pay Stubs, Expenses, Reimbursements, Tax Documents, This Year.

**Client/Partner View (R9):**
- Personal wallet.
- Invoices from KaNeXT. Outstanding and paid. Pay button through KayPay. Receipts. Payment history.
- Subscription billing management.
- Filter pills: All, Outstanding, Paid, Subscriptions.

#### Pay View

**All roles:**
- Same P2P. QR, split, remittance 0.2%. Inline from Messages.

**Owner/CEO View (R0) additional:**
- Invoice creation. Professional builder: branding, line items (from Store or custom), tax, payment terms (receipt, net 15/30/60), notes, attachments. Send through Messages or email. Track and auto-remind.
- Batch payments. Multiple vendor bills in one batch.
- Payroll disbursement. After running payroll, payments to all employee wallets simultaneously.
- Wire transfers and ACH for large B2B payments.

**Manager View (R3):**
- Request payments for department. Goes through approval chain.

#### Invest View

**All roles:**
- Same as all KayPay Invest. Infrastructure Fund, Bitcoin, Capital Points.

**Owner/CEO View (R0) additional:**
- Company treasury management. Invest idle cash. Set policy (minimum reserve, max allocation). Board-approved strategy.
- KaNeXT Capital Fund I visibility (Sammy is GP).

---

### 16.9 Business KayStudios

KayStudios in Business mode is where the company builds interactive experiences for customers and employees. Same cross-mode engine. If it's a video, it goes in KayTV. If it's a document, it goes in Hub Operations. If the user interacts with it, it goes in KayStudios.

#### Content Types for a Business

**Customer-Facing Interactive Experiences:**
- Interactive product demos. The customer actually uses the product in a sandbox. For KaNeXT: "Try Basketball Intelligence" - input a real player, watch KR evaluation run live, explore output, compare players, build a roster.
- Simulation games. Deep, addictive, Football Manager-style experiences. For KaNeXT: "College Basketball GM" (full spec below). For other businesses: product sandboxes, investment simulators, restaurant management tycoons.
- Calculators and configurators. User inputs data, gets personalized output. "KaNeXT ROI Calculator", "Plan Recommender", "Team Size Calculator."
- Customer onboarding courses. Interactive, self-paced, quizzes and hands-on tasks. "Getting Started with KaNeXT OS" (5 modules). Each module has a task completed in the real product. Replaces onboarding calls.
- Certification programs. Multi-module with proctored assessments. "KaNeXT Certified Administrator" - pass at 80%+, earn badge for KaNeXT profile and LinkedIn.
- Challenges and competitions. "March Madness Bracket Challenge" powered by KR. "Recruiting Challenge" - best class with fixed budget. Leaderboards drive engagement.

**Employee-Facing Interactive Training:**
- Interactive onboarding. "Welcome to KaNeXT" - navigate the product, answer questions, complete tasks, take quiz. Auto-assigned from Team tile workflow.
- Product knowledge. "KaNeXT OS Mastery" - every mode and tile. Sales must score 90%+. Completion tracked in Team HR view.
- Sales role-play. Nexus AI plays the prospect with real objections. Rep responds. Nexus evaluates and coaches. Repeatable.
- Compliance and policy. Interactive scenarios with consequences. Not "read and click agree."
- Skills assessments. Used in hiring from Team tile. Coding challenges, pipeline simulations, timed. Scores feed applicant tracking.

**College Basketball GM (Flagship Experience):**

Football Manager for college basketball, powered by real KaNeXT intelligence.

1. **Choose Your Program.** Any real program or create custom. Set conference, division, budget tier.
2. **Inherit a Roster.** Real current roster from 37K player pool. Real KR ratings, archetypes, production. See Team KR and System Fit% immediately.
3. **Get Your Resources.** Scholarship allocation by division (D1: 13, D2: 10, NAIA: variable, JUCO: unlimited). NIL budget by school tier. Recruiting budget. Coaching staff quality affects development speed.
4. **Set Your System.** Offensive scheme (motion, PnR heavy, post-up, transition, spread) and defensive scheme (man, 2-3 zone, 1-3-1, press). Each has archetype requirements. System Fit% updates in real time.
5. **Recruit.** Browse portal, high school, JUCO, international from real pool. Filter by position, archetype, KR, location, eligibility. Evaluate with actual KR system. Make offers. Compete against AI programs (realistic prestige and budget). Players choose based on prestige, playing time, NIL, location, system fit.
6. **Build Your Roster.** Depth chart. Team KR updates live. Archetype balance visualization. Minutes distribution. Walk-on tryouts.
7. **Develop Players.** Over simulated season, players develop based on coaching, minutes, system fit, natural curves. Freshman KR 72 might reach 78. Wrong system player stagnates.
8. **Simulate Season.** Week-by-week. Results from Team KR, System Fit%, opponent strength, home/away, fatigue, injuries. Box scores generated. Stats accumulate. Mid-season adjustments possible.
9. **Postseason.** Conference tournament. NCAA/NAIA/NJCAA bracket if qualified. Single elimination with upset probability.
10. **Offseason.** Players graduate, transfer, declare for draft. Recruit next class. Multi-season dynasties.
11. **Leaderboard.** Global. Ranked by: championships, win %, best Team KR, best recruiting class, most improved program. Weekly and all-time. Share to Social.
12. **The Hook.** Every step teaches KR, System Fit%, archetypes. One season and they understand the product intuitively. GM Mode is a game that IS the product demo.

#### RBAC Views

**Owner/CEO View (R0):**
- Full creator access. Build any content type. All analytics: plays, completions, leads generated, training completion, certification counts, GM Mode active users.
- Assign required training (syncs with Team tile). Feature experiences to customers.
- Filter pills (creator): All, Customer Experiences, Demos, Simulations, Calculators, Courses, Certifications, Internal Training, GM Mode, Published, Drafts, Analytics, Required.

**Executive/Manager View (R2-R3):**
- Create department content (approval queue). View analytics. Assign department training.
- Filter pills: All, My Department, Published, Drafts, Training Completion.

**Employee View (R5):**
- Required training with deadlines. Product knowledge. Skills. Can play customer-facing experiences.
- Filter pills: All, Required, My Courses, In Progress, Completed, Product Knowledge.

**Client/Partner View (R9):**
- All customer-facing experiences. Demos, GM Mode, calculators, onboarding, certifications.
- GM Mode featured. Free to play. Leaderboard. Save states persist.
- My progress: courses, certifications, GM Mode seasons.
- Filter pills: All, Demos, Courses, GM Mode, Tools, Certifications, In Progress, Completed.
- For KaNeXT demo: "College Basketball GM" (500+ active players), "Try KaNeXT Intelligence" (1,200 plays), "Getting Started with Education Mode" (18 completions), "ROI Calculator" (340 uses), "KaNeXT Certified Admin" (8 certified), "Welcome to KaNeXT" (internal, 8/8), "Sales Playbook" (internal, 4/4).

---

## 17. Sports Mode

Sports mode is the operating environment for athletic programs, teams, and sports organizations. The demo brand is LU Men's Basketball (Lincoln University Oakland). Sports mode replaces the entire athletic department tool stack: Hudl ($900-3,300/year), Synergy Sports, ARMS/JumpForward (recruiting), TeamSnap (team management), and every disconnected coaching, scouting, and recruiting tool. The basketball intelligence system (KR, archetypes, System Fit%, KLVN normalization) is the engine underneath everything.

Sports mode RBAC roles: Head Coach (R0), Assistant Coach (R2), Operations/Analytics (R3), Player (R5), Fan/Recruit/Parent (R9).

Sports mode home grid:

| Hub | Agenda | Social |
|-----|--------|--------|
| Roster | Recruits | Booster |
| KayTV | KayPay | KayStudios |

### 17.1 Sports Hub

The Hub in Sports mode is the coaching command center. It replaces Hudl's coaching dashboard, Synergy's analytics platform, FastScout, FastDraw, and every scouting and game planning tool. Four tabs, RBAC determines depth. The basketball intelligence system powers everything.

Tabs: Overview / Film Room / Scouting / Game Day

Side panel (swipe right or menu icon). Head Coach: team dashboard (record, Team KR, System Fit%, next game), quick access to film, scouting reports, practice plans, recruiting board, game day prep, Nexus intelligence shortcut, settings. Assistant Coach: same minus roster management and budget. Operations/Analytics: film management, stat entry, report generation, scouting assignments, settings. Player: my stats, my film, development plan, practice schedule, settings. Fan/Recruit/Parent: team stats (public), schedule, roster.

#### Overview Tab

**Head Coach View (R0):**
- Team dashboard. Season record (W-L, conference W-L). Team KR. System Fit%. Conference standing. RPI/NET ranking. Streak indicator.
- Roster health snapshot. Player availability: healthy, questionable, out. Injury list with return dates. Practice participation.
- Next game card. Opponent name/logo, date/time, location, opponent Team KR, record, head-to-head, Nexus scouting summary.
- Recent results. Last 5 games with scores and key stats.
- Performance trends. Offensive rating, defensive rating, pace, 3P%, turnover rate, rebounding margin over time. Trend arrows.
- Practice plan for today from Agenda. Drills, time allocation, film clips assigned, focus areas from scouting.
- Quick actions: Film Room, Scouting Report, Practice Plan, Recruiting Board, Game Day Prep.
- Nexus integration: "What's our Team KR?", "Show offensive rating trend last 10 games", "What's Cal Maritime's biggest weakness?", "Build a practice plan for transition defense", "Evaluate the transfer portal PG from Citrus College."
- Filter pills: All, This Week, Last 5 Games, Conference, Home, Away, Wins, Losses.
- For LU demo: 22-6, back-to-back GAAC champions, Team KR 78, System Fit% 94%, 1st in conference. Laolu KR 86, first team all-conference.

**Assistant Coach View (R2):**
- Same dashboard. Full coaching data access. Can edit practice plans, create scouting reports, manage film. Cannot change roster or budget.

**Operations/Analytics View (R3):**
- Team dashboard read-only on coaching decisions. Film upload queue. Stat entry. Report generation. Scouting assignments.
- Filter pills: All, Film Queue, Stats to Enter, Reports, Assignments.

**Player View (R5):**
- My dashboard. Personal stats: PPG, RPG, APG, FG%, 3P%, FT%, KR, archetype. Trend charts. My film clips (coach-assigned). Development plan (areas to improve, goals, progress).
- Practice schedule. Today's plan with my role noted. Team aggregate stats visible.
- Cannot see scouting reports, opponent intelligence, or recruiting data.
- Filter pills: All, My Stats, My Film, Development, Practice.

**Fan/Recruit/Parent View (R9):**
- Public team stats. Record, schedule, roster (name, number, position, class, height). Conference standings.
- Cannot see KR, System Fit%, scouting, practice plans, or coaching intelligence.
- Filter pills: All, Schedule, Roster, Stats.

#### Film Room Tab

**Head Coach View (R0):**
- Full game film library. Every game by date. Film status (raw, tagged, analyzed). KayTV is the video source. Film Room is the intelligence overlay.
- Film viewer with intelligence overlay: play-by-play tags (every possession: half-court, transition, BLOB, SLOB, ATO, press break), shot chart overlay (toggle, all shots with make/miss and location), player tracking highlights, telestration (arrows, circles, freehand, text), slow motion (0.25x, 0.5x), frame-by-frame.
- Playlist builder. Create from tagged possessions. "Laolu 3-point attempts", "Opponent PnR defense", "Our transition offense." Shareable to players through Messages or Player view.
- Auto-tagging powered by intelligence system. Coach can override or add custom tags. Tags linked to box score events.
- Clip creation. Cut possessions/moments. Add telestration, voiceover, annotations. Share or export.
- Side-by-side comparison. Two clips simultaneously.
- Practice film. Same tools for practice footage. Track development week to week.
- Hudl import. Schools with existing Hudl can import film.
- Filter pills: All, Games, Practice, By Opponent, By Player, Tagged, Untagged, Playlists, This Season, Last Season.
- For LU demo: 8 real game films (Pepperdine, Long Beach State, Weber State, LMU, UC Irvine, Cal Maritime, Simpson + 1). Fully tagged with possessions, shot charts, player data. 3 practice films. 5 playlists.

**Assistant Coach View (R2):**
- Full film room. Upload, tag, create playlists, annotate, share to players.

**Operations/Analytics View (R3):**
- Full film management. Primary uploader and tagger. Create playlists for coaches. Stat entry from film feeds intelligence system.
- Filter pills: All, Upload Queue, Tagging Queue, By Game, Completed.

**Player View (R5):**
- My film only. Coach-assigned clips and playlists. Can add personal notes. Highlight reel builder for recruiting. Export to KayTV or Messages.
- Filter pills: All, Assigned Clips, My Highlights, Practice.

#### Scouting Tab

**Head Coach View (R0):**
- Opponent scouting dashboard. Upcoming opponents with game date. Each card: name, record, Team KR, last 5 results, key players.
- Full Scouting Report per opponent: team overview (record, Team KR, System Fit%, ratings, pace, style), roster breakdown (every player with KR, archetype, stats, tendencies), key players flagged (top 3 with KR, shot chart, strengths, weaknesses, defensive approach), offensive tendencies (play types, frequency, effectiveness, set plays with film clips), defensive tendencies (scheme, PnR defense, weaknesses), matchup analysis (lineup vs lineup, player-by-player with advantage/disadvantage from KR and archetype), game plan suggestions from Nexus.
- Self-scout. Same analysis for own team. Identify tendencies opponents might exploit.
- Scouting assignments. Assign staff to scout opponents. Track progress.
- Historical scouting archived by season and opponent.
- Nexus is the backbone: "Evaluate Citrus College roster" triggers full Team KR evaluation.
- Filter pills: All, Upcoming Opponents, Conference, Non-Conference, Completed, Self-Scout, By Date.
- For LU demo: 3 upcoming scouting reports (Cal Maritime complete, Simpson in progress, exhibition TBD). Self-scout. Historical from Pepperdine and Long Beach State.

**Assistant Coach View (R2):**
- Full scouting access. Create, edit reports. Can be assigned tasks.

**Operations/Analytics View (R3):**
- Compile data, pull stats, generate reports for coaches.
- Filter pills: All, My Assignments, Data to Compile, Completed.

**Player View (R5):**
- Not visible. Coaches share relevant info through practice plans and clips.

**Fan/Recruit/Parent View (R9):**
- Not visible. Scouting intelligence is the competitive advantage.

#### Game Day Tab

The Game Day tab is the live operations center during a game. It houses StatKeeper (real-time stat tracking), auto-generated reports (halftime, postgame), and media reports. StatKeeper feeds data into the intelligence system. Nexus consumes the data and generates coaching packets and public-facing reports automatically.

**The Game Day Flow:**
1. StatKeeper (live) - Operations staff tracks every play in real time
2. Live Box Score - updates automatically as stats are entered, visible to coaches on the bench
3. Halftime Staff Packet - auto-generated by Nexus at the halftime buzzer using first-half StatKeeper data + intelligence files (File 05 Scouting Game Ops, halftime section)
4. Postgame Staff Packet - auto-generated by Nexus at the final buzzer using full-game StatKeeper data + intelligence files
5. Media Game Report - public-facing ESPN-style game recap auto-generated by Nexus, publishable to Social and KayTV

**StatKeeper:**

Three phases: Setup, Live, Box Score.

Setup phase: select home/away teams (auto-populated from Roster if it's our game). Game type (Regular, Conference, Tournament, Scrimmage). Half length (20 min, 16 min, custom). Roster sections expandable per team. Tap player to toggle starter/bench with count badge showing 5/5. "Start Game" enabled only when both teams have exactly 5 starters.

Live phase (portrait, designed for one-handed operation on the bench): scoreboard at top (home score, away score, period, game clock with play/pause, End Period button). Player selection row: home players as numbered circles (teal), away players as numbered circles (steel gray). Selected player highlighted with accent ring. Make/miss buttons: 3pt make/miss, 2pt make/miss, FT make/miss. Stat buttons: DefReb, OffReb, TO, STL, AST, BLK, Sub, Foul. Play-by-play feed (last 3 entries, tap to expand full log). Undo button for corrections. Sub overlay: two columns (On Court / Bench), tap to swap. Foul overlay: Personal, Shooting, Offensive, Technical, Flagrant. No player selected + action tapped = "Select a player first" toast.

Box Score phase (generated automatically from live data): final score hero, game info. Home/Away tab toggle. Full stat table per team: #, Name, MIN, PTS, FGM-FGA, 3PM-3PA, FTM-FTA, OREB, DREB, REB, AST, STL, BLK, TO, PF. Team totals row. Horizontal scroll with player name fixed left. Export: JSON, CSV, PDF.

**Auto-Generated Reports (powered by Nexus + Intelligence Files):**

Halftime Staff Packet (auto-generated at halftime buzzer):
- Nexus pulls first-half StatKeeper data and runs it through the Game Ops halftime pipeline (File 05, Section 3)
- Top-3 Decision Summary: 3 bullets ranked, each "problem to adjustment"
- Game State Dashboard: score, pace, fouls/bonus, turnovers, OREB, points per possession
- Five Factors: eFG%, TO%, OREB%, FT rate, transition
- Plan Adherence vs Pregame: "We said deny X, did we?" Checklist
- Opponent offense and defense analysis through OSIE/DSIE lens
- Our offense and defense analysis
- Lineups/matchups/plus-minus: top 3 lineups, worst 2, matchup pain points
- Constraints and risk: foul trouble, fatigue, fragility exploitation
- Simulation projections: win probability from current position + adjustments (if Simulation Engine available)
- Adjustments Sandbox: 2-5 defensive options, 2-5 offensive options, each with benefit/risk/projected impact
- Delivered to coaching staff through Nexus overlay or Messages. Coaches see it on their phone/tablet at halftime.
- Confidence percentage based on data tier (V1 box score only = 55-70%, V2 with film tags = 82-92%)

Postgame Staff Packet (auto-generated at final buzzer):
- Full game box score with advanced stats
- Five Factors final
- Plan adherence audit: what we said we'd do vs what actually happened
- Opponent analysis: what they did, what worked for them, what didn't
- Our analysis: what worked, what didn't, key moments
- Lineup analysis: every lineup combination with plus-minus and minutes
- Player grades: each player's performance rated against expectations
- Teaching clips auto-tagged: top 5 positive moments, top 5 correctable moments (linked to film in Film Room if game was recorded)
- Development notes: which players showed growth, which struggled
- Next game preview: initial thoughts on upcoming opponent based on intelligence
- Confidence percentage based on data tier
- Delivered to coaching staff. Archived for season-long trend tracking.

Media Game Report (auto-generated, public-facing):
- ESPN-style game recap written by Nexus. Professional sports writing tone.
- Headline: "Lincoln 89, Cal Maritime 74: Laolu Kalejaiye's 28 Points Power Oaklanders to 23rd Win"
- Game summary paragraph: flow of the game, key runs, turning points
- Player of the game with stats and context
- Key stats box: team comparison table
- Quotes placeholder (coach can add real quotes before publishing)
- Box score (simplified, public-friendly format)
- Publishing options: auto-post to Social as a game recap post, share to KayTV as a graphic overlay on game highlights, export as PDF for media distribution, email to local media contacts from Network
- School SID (Sports Information Director) can review and edit before publishing. Or set to auto-publish for programs without an SID.
- For LU demo: 3 completed media game reports from real games (Pepperdine, Long Beach State, Cal Maritime). Each with Nexus-written recap, Laolu as player of the game in Pepperdine report (38 pts, 12 threes).

**Head Coach View (R0):**
- Full Game Day tab. Can launch StatKeeper (or delegate to operations). Receives halftime and postgame packets. Can edit and approve media reports before publishing.
- Game history: all games this season with box scores, staff packets, media reports archived. Tap any game to review.
- Filter pills: All, Upcoming, Completed, Box Scores, Staff Packets, Media Reports, This Season.

**Assistant Coach View (R2):**
- Full Game Day access. Can operate StatKeeper. Receives all packets. Can contribute to media reports.
- Filter pills: All, Upcoming, Completed, Box Scores, Packets.

**Operations/Analytics View (R3):**
- Primary StatKeeper operator. Runs stat tracking during games. Reviews and corrects box scores post-game. Manages media report distribution.
- Filter pills: All, StatKeeper, Box Scores, Media Reports, Export.

**Player View (R5):**
- My game stats only. Can see own box score line per game. Season averages. Personal game log.
- Cannot see staff packets, scouting data, or full team analytics.
- Filter pills: All, My Games, My Stats.

**Fan/Recruit/Parent View (R9):**
- Published media reports (public). Box scores (public). Game results.
- Live box score during games (if enabled by coach - real-time score and stats visible to fans watching the game).
- Filter pills: All, Results, Box Scores, Reports.

---

### 17.2 Sports Agenda

Agenda in Sports mode is the program calendar. Same structure (Day/Week/Month views). Built around the competitive season: games, practices, travel, recruiting, film sessions, academics, and compliance. Game day operations live in Hub Game Day tab, not here. Agenda is the schedule.

Views: Day / Week / Month (centered contextual pill to switch)

Side panel (swipe right or menu icon). Head Coach: full program calendar, practice plan builder, recruiting calendar with NCAA period overlay, travel itineraries, compliance deadlines, settings. Assistant Coach: program calendar, practice plans, recruiting assignments. Operations/Analytics: film deadlines, travel logistics, facility scheduling. Player: my schedule. Fan/Recruit/Parent: game schedule, visit dates.

#### Day / Week / Month Views

**Head Coach View (R0):**
- Full program calendar. Color-coded: games (red, home/away), practices (blue, drill plan attached), film sessions (purple, clips attached), travel (orange, itinerary), recruiting (green, visits/calls/evaluation periods), meetings (gray), workouts (teal, S&C), compliance deadlines (gold).
- Practice planning. Each block expandable: warmup, drills with time and focus, team offense, team defense, scrimmage, cooldown/film. Drills linked to scouting focus. Film Room clips embedded for on-court teaching.
- Recruiting calendar. NCAA/NAIA/GAAC periods overlaid (contact, evaluation, quiet, dead). Visits, calls, evaluation trips. Compliance guardrails warn on dead period conflicts.
- Travel itineraries on away games: departure, transport, hotel, venue, game time, return.
- Player academic monitoring. Midterm/final dates (synced from Education mode if on platform). Tutoring. Advisor meetings. Practice adjustments during exams.
- Nexus integration: "What's the schedule this week?", "Build a practice plan for Tuesday focused on zone offense", "What recruiting events can I attend this month?", "When are midterms?"
- Filter pills: All, Games, Practices, Film, Travel, Recruiting, Meetings, Workouts, Compliance, This Week.
- For LU demo: full GAAC season (28 games). Weekly rhythm: Mon practice+film, Tue practice, Wed shootaround+travel, Thu game/practice, Fri game/off, Sat game/practice, Sun off. 3 recruiting calls. Cal Maritime travel. Midterms next week, 2 players flagged.

**Assistant Coach View (R2):**
- Full calendar. Edit practice plans and film sessions. Recruiting assignments visible. Cannot change game schedule or compliance.
- Filter pills: All, Games, Practices, Film, Recruiting, My Assignments, This Week.

**Operations/Analytics View (R3):**
- Logistics focus. Film deadlines (due within 24 hours of game). Travel logistics. Facility scheduling.
- Filter pills: All, Film Deadlines, Travel, Logistics, This Week.

**Player View (R5):**
- My schedule. Games, practices, film sessions, workouts, academic, team meetings. Cannot see recruiting, compliance, staff meetings.
- Filter pills: All, Games, Practices, Film, Workouts, Academic, This Week.

**Fan/Recruit/Parent View (R9):**
- Public game schedule with results and KayTV livestream links. Recruits see confirmed visit dates. Parents see child's schedule plus academic dates (if shared through consent gate).
- Filter pills: All, Upcoming Games, Past Results.

---

### 17.3 Sports Social

Social in Sports mode is the program's public brand and team communication platform. Three audiences: fans (public content, highlights, recruiting announcements), the team (internal communication, film assignments), and recruits (program culture showcase). Same structure (Feed/Reels/Profile, scope filter Brand/Mode/All).

Scope filter: Brand (LU MBB only), Mode (all Sports brands), All (everything).

#### Feed View

**Head Coach View (R0):**
- Full feed. Post as program brand. Types: text, photo, video, carousel, poll, game result graphic (auto-generated from Game Day box score), recruiting announcement ("Welcome to the family" with commitment graphic), schedule graphic, player spotlight.
- Visibility: Public (fan-facing, recruiting) or Internal (team only R0-R5, "Team Only" badge).
- Game result auto-posts from media report. Recruiting commits auto-generate graphic (coach approves).
- Filter pills: All, Public, Team Only, My Posts, Following, Game Results, Recruiting, Saved.

**Assistant Coach View (R2):**
- Full feed. Draft public (approval queue). Post internal directly.
- Filter pills: All, Public, Team Only, Drafts, Game Results.

**Operations/Analytics View (R3):**
- Full feed. Draft public. Manage game result graphics and scheduling.
- Filter pills: All, Public, Scheduled, Drafts, Game Results.

**Player View (R5):**
- Public and internal team posts. Like, comment, share. Can post internal (teammates and coaches only). Cannot post as program brand publicly. Can share Film Room highlight reel to personal brand.
- Filter pills: All, Public, Team Only, My Posts.

**Fan/Recruit/Parent View (R9):**
- Public only. Game results, highlights, recruiting, schedule, culture. For recruits: Social IS the program's pitch.
- Filter pills: All, Game Results, Highlights, Recruiting, Schedule.

#### Reels View

**Head Coach View (R0):**
- Program short-form: game highlights (auto-clipped from KayTV), practice clips, workouts, recruiting days, culture.

**Fan/Recruit/Parent View (R9):**
- Public reels. Highlights, spotlights, culture.

#### Profile View

**Head Coach View (R0):**
- Program profile. Logo, name, record, conference, followers, bio, edit. Content grid. Pinned (up to 3). Reels tab. KayTV tab.

**Fan/Recruit/Parent View (R9):**
- Public profile. Follow, Message (recruits can DM if enabled). Content grid.
- For LU demo: "Lincoln University Men's Basketball | GAAC Champions | Oakland, CA" bio. 20 mock posts. 6 reels. Pinned: "Back-to-Back GAAC Champions", "Laolu - First Team All-Conference", season schedule.

---

### 17.4 Sports Roster

Roster is the people tile for sports brands. Position 4 in the grid. Complete roster management: player profiles with KR intelligence, depth chart, eligibility tracker, medical status, scholarship/NIL allocation, and coaching staff directory. It replaces TeamSnap, ARMS, and scattered spreadsheets. The intelligence system (Files 01-03) powers everything. Every player has KR, archetype, badges, confidence. Team KR Pipeline computes overall quality. System Fit% shows if pieces work together.

Views: Players / Depth Chart / Staff (centered contextual pill to switch)

Side panel (swipe right or menu icon). Head Coach: roster dashboard (Team KR, System Fit%, spots used, scholarship allocation, top needs), quick search, add player, eligibility overview, medical report, scholarship budget, NIL tracker, settings. Assistant Coach: roster access, profiles, depth chart, recruiting notes. Operations/Analytics: data management, eligibility paperwork, compliance. Player: my profile, team roster (public). Fan/Recruit/Parent: public roster.

#### Players View

**Head Coach View (R0):**
- Full roster. Each card: photo, name, number, position, class, KR badge (color by tier), archetype badge, PPG/RPG/APG, medical dot (green/yellow/red), eligibility dot (green/yellow/red).
- Player Detail Page (coach): profile header (photo, name, number, position, class, height/weight, hometown, previous school). KR Intelligence (coach-only, File 01): KR 0-100 with confidence%, archetype, trait clusters (Shooting, Finishing, Playmaking, Rebounding, On-Ball D, Team D, Physical), badges, system fit%, development trajectory. Season stats (full table + game log). Film clips linked from Film Room. Eligibility (years remaining, GPA, credits, degree progress, transfer history). Medical (status, active injuries, history, clearance). Scholarship/NIL (percentage, compensation, contract dates). Development plan (goals, progress, workout plan, linked to File 06). Notes (private coaching, R0-R2 only).
- Roster management: edit info, update medical/eligibility, adjust scholarship, depth chart moves, redshirt designation, release.
- Roster composition: spots used vs max, scholarship equivalencies used vs available, position breakdown.
- Gap analysis (File 03): top needs by Team KR impact, missing demands, fragility flags (starter-backup gap 10+ KR).
- Nexus integration: "What's our Team KR?", "Who's our best 3-point shooter?", "Show gap analysis", "What's Laolu's development trajectory?", "Compare our PG depth to Cal Maritime's."
- Filter pills: All, Starters, Rotation, Bench, Redshirt, By Position, By Class, Healthy, Injured, Eligible, At Risk.
- For LU demo: 21 players (ESPN roster). Laolu KR 86. Team KR 78. System Fit% 94%. 2 questionable. 1 academic warning. Gap: interior depth fragility flag.

**Assistant Coach View (R2):**
- Full roster and intelligence. Can update medical and practice notes. Cannot change scholarship or release players.

**Operations/Analytics View (R3):**
- Roster data. Update player info. Manage eligibility paperwork, compliance forms, medical clearance docs. Cannot see KR, coaching notes, or scholarship.
- Filter pills: All, Eligibility Paperwork, Medical Clearance, Compliance, By Player.

**Player View (R5):**
- Team roster public info: name, number, position, class, height/weight, stats. No KR, archetypes, intelligence. My profile: own stats, game log, development plan, academic status.
- Filter pills: All, By Position, Starters.

**Fan/Recruit/Parent View (R9):**
- Public roster. Name, number, position, class, height/weight, season averages. No intelligence, medical, eligibility, scholarship.
- Filter pills: All, By Position, By Class.

#### Depth Chart View

**Head Coach View (R0):**
- Visual by position (PG, SG/Wing, SF/Wing, PF/Big, C/Big). Starter and backups with KR and medical dot. Starter-to-backup KR gap flagged if 10+ (fragility risk). Drag and drop to rearrange.
- Lineup builder. Select any 5: combined KR, offensive/defensive split, archetype composition, lineup System Fit%. Compare combinations side by side.
- Minutes projection. Allocate minutes, see how distribution affects Team KR.
- Filter pills: All Positions, Guards, Wings, Bigs, Starters Only.

**Player View (R5):**
- Depth chart visible (name, number, position order). No KR.

**Fan/Recruit/Parent View (R9):**
- Public depth chart. Starters and key rotation. No intelligence overlay.

#### Staff View

**Head Coach View (R0):**
- Full staff directory. Photo, name, title, contact, bio. Staff assignments (recruiting territories, film, academics). Manage staff: add/remove, update roles.
- Filter pills: All, Coaching Staff, Support Staff, Administration.

**Player View (R5):**
- Staff directory with contact. Reach coaches, trainer, advisor through Messages or Phone.
- Filter pills: All, Coaches, Support.

**Fan/Recruit/Parent View (R9):**
- Public staff. Names, titles, photos. Recruiting contact (email or Message only).
- Filter pills: All, Coaches.

---

### 17.5 Sports Recruits

Recruits is the pipeline tile for sports brands. Position 5 in the grid. Serves two audiences: for coaches, the recruiting command center with 37K player pool and KR intelligence; for recruits/parents, the NCSA replacement with real intelligence. Replaces ARMS/JumpForward ($2,000-5,000/yr), NCSA ($500-3,000 premium), and every recruiting spreadsheet.

Views (coaches): Board / Portal / Search. Views (recruits): Profile / Schools / Interest.

Side panel. Head Coach: recruiting dashboard (board count, offers, commits, spots open, scholarship remaining), player pool search, target list, evaluation queue, compliance calendar. Assistant Coach: territory assignments, prospect communication. Operations: compliance, paperwork, visit coordination. Player: my recruiting profile. Recruit/Parent: my profile, school search, interest tracker.

#### Coach Experience

##### Board View

**Head Coach View (R0):**
- Recruiting board. Visual by priority: Top Targets, Secondary, Monitoring, Offered, Committed. Each card: name, position, height/weight, school/level, KR badge, archetype badge, system fit% for our system, status (identified, contacted, offered, visiting, committed, signed, passed).
- Tap for Recruiting Profile (coach): contact info (player, parents/guardians), recruiting timeline (first identified through decision), communication log (auto-pulled from Messages/Phone), evaluation notes, film clips, scholarship offer details, NIL offer, competing schools, academic status.
- Roster Decision Intelligence (File 03): Team KR Delta, gap analysis, displacement report, resource analysis (spot + scholarship + NIL cost per TKR point), multi-candidate comparison.
- Add Prospect from pool search or manual entry.
- Nexus: "Find PGs in portal KR 75+ who fit our system", "Compare Ricketts and Sanchez for our guard spot", "What's Team KR delta adding Ricketts?", "Draft offer letter for Ricketts."
- Filter pills: All, Top Targets, Secondary, Monitoring, Offered, Committed, Signed, Passed, By Position, By KR, By Level, By Class.
- For LU demo: 12 prospects. 3 top targets (Citrus PG transfer), 4 secondary, 3 monitoring, 1 offered, 1 committed. Full KR + Team KR delta on each.

**Assistant Coach View (R2):**
- Full board. Add prospects, update status, log evaluations. Territory assignments visible.
- Filter pills: All, My Territory, My Prospects, By Priority, By Status.

##### Portal View

**Head Coach View (R0):**
- Transfer portal live feed from 37K pool. Each: name, position, previous school/level, KR, archetype, entry date, status (in portal, withdrawn, committed), destination.
- Powered by Global Database Section 4.2. Real-time updates.
- System fit filter. Fit% computed on demand against our schemes.
- Nexus recommendations: "Based on gap analysis (need interior depth), top 5 portal bigs for your system ranked by Team KR Delta."
- Tap for full evaluation with KR, archetype, fit, delta, cost analysis.
- Filter pills: All, In Portal, By Position, By Archetype, By KR Range, By Level, System Fit 80%+, By Conference, Guards, Wings, Bigs.

##### Search View

**Head Coach View (R0):**
- Full 37K player pool search. By name or advanced filter: position, height, weight, KR range, archetype, level, conference, state, class, stats, BPR range.
- Tap for full profile with KR evaluation.
- Saved searches with notifications when new matches appear.
- Browse by level, conference, or team.
- Filter pills: All, By Position, By KR, By Level, By State, By Conference, By Archetype, Portal Only, Available Only.

#### Recruit/Parent Experience

##### Profile View

**Fan/Recruit/Parent View (R9):**
- My Recruiting Profile. Name, position, class, height/weight, GPA, test scores, school, club team, highlight video (from KayTV), stats, awards, contact.
- KR Intelligence (public version). If in the 37K pool: KR rating, archetype, trait clusters visible. The game-changer vs NCSA. KaNeXT tells you what level you can play at and which programs need your archetype.
- "Where Do I Fit?" from Development Intelligence (File 06). Best-fit programs, realistic level, programs with open spots at your position.
- Profile visibility. Coaches find you in pool searches. Notification when a coach views your profile.
- Highlight reel from KayTV with stats overlay.

##### Schools View

**Fan/Recruit/Parent View (R9):**
- School search. Every program in database. Filter: level, state, conference, academic program, scholarship availability, system type.
- Each card: name, logo, level, conference, record, Team KR, coach, location.
- Detail: roster (public), staff, system identity, demand gaps (what they need, from coverage map), results, academics.
- "Fit Score" per school. KR + archetype vs system demands + open needs. "Lincoln University: 92% Fit - they need a shooting guard and run motion offense that maximizes your archetype."
- Compare 2-3 schools side by side.

##### Interest View

**Fan/Recruit/Parent View (R9):**
- Interest tracker. Schools reached out or interested in. Status (interested, contacted, visited, offered, committed), last contact, coach, notes.
- Coach activity. Which coaches viewed your profile (school, date).
- Message coaches through Messages (if enabled).
- Organize: Dream Schools, Strong Interest, Exploring, Backup.
- Filter pills: All, Dream, Strong Interest, Exploring, Offered, By Level.

---

### 17.6 Sports Booster

Booster is the money-in tile for sports brands. Position 6. Replaces Opendorse (NIL marketplace), INFLCR (compliance + analytics), Fanstake (fan crowdfunding), Sportsmo (play pledges), NIL Club (brand marketplace), and every athletics fundraising tool. All through KayPay. Full compliance engine built in.

Three things in one: fan giving platform (donations, tickets, merch, gamified challenges), NIL marketplace (brands find athletes, athletes find deals), and compliance engine (every deal logged, disclosed, auditable).

Views: Give / NIL Marketplace / Fan Shop (centered contextual pill to switch)

Side panel. Head Coach: booster dashboard, NIL allocation powered by PTV, compliance status. Operations: donor management, compliance reporting. Player: NIL profile, deals, earnings, brand opportunities. Fan/Parent: giving, campaigns, challenges, merch, tickets.

#### Give View

**Head Coach View (R0):**
- Dashboard. Total raised, breakdown: unrestricted donations (tax-deductible), NIL contributions (not tax-deductible), tickets, merch, Fan Challenges, play pledges. Donor management with levels. Campaign management. Tax receipt automation (auto-distinguishes deductible vs non-deductible).
- Filter pills: All, Donations, NIL Contributions, Tickets, Merch, Fan Challenges, Pledges, By Donor Level, This Month, This Season.
- For LU demo: $62K raised. 85 donors. NIL pool $18K. Annual fund $28K. Tickets $8K. Merch $5K. Challenges $3K.

**Fan/Parent View (R9):**
- Clean giving. Presets ($10-$250+custom). Fund picker: Athletic Department (tax-deductible), NIL Fund, Travel, Equipment, active campaign. Recurring toggle.
- Play-Based Pledges. "$2 per three-pointer", "$5 per win." Auto-charges via KayPay from StatKeeper data. Season total: "Your pledges contributed $84 this season."
- Stake an Athlete. Browse roster and recruits. Pledge NIL money to specific player. Current players: direct to NIL. Recruits: escrow until commitment (refund if they go elsewhere). Athletes keep 90%+. Full compliance.
- Fan Challenges. Challenge a friend. Both put up $5-$50. Predict: winner, margin, player stats, team stats. StatKeeper auto-resolves. ALL money to program fund (winner chooses: NIL, department, campaign). Winner gets leaderboard. Loser's money still supports program. Share to Social, tag friends, group challenges, rival school challenges.
- Leaderboards. Top Challenger, Top NIL Supporter, Top Donor. Badges on Social profile.
- Impact dashboard. "Your contributions: $340. $200 department, $100 NIL, $40 challenges."
- Filter pills: All, One-Time, Recurring, Pledges, Stakes, Fan Challenges, Campaigns, My History.

#### NIL Marketplace View

**Head Coach View (R0):**
- NIL pool dashboard. Balance, sources (fan contributions, collective, revenue sharing). Allocation powered by PTV (File 03).
- Allocation table. Every player: name, KR, PTV (worth to this team), PMV (market value), current NIL, gap. Nexus: "Laolu PTV $45K, current NIL $12K. Underpaid. Portal risk."
- Brand deal oversight. All deals visible: player, brand, type, value, dates, deliverables, compliance status.
- Compliance dashboard. NCAA/NAIA/GAAC rules embedded. Auto-flags: disclosure thresholds, booster conflicts, pay-for-play violations. Compliance officer review. Annual report exportable. Full audit trail on every deal through KayPay.
- Revenue sharing tracker (House settlement). Institutional allocation, collective NIL, marketplace deals. Total compensation budget.
- Filter pills: All, Pool Balance, Allocations, Active Deals, By Player, Compliance, Flagged, Revenue Sharing.

**Player View (R5):**
- My NIL Profile (athlete media kit for brands). Name, sport, school, position, social following, engagement, content examples, audience demographics.
- Brand Marketplace. Browse available deals: brand, campaign description, compensation ($50-$5K+), deliverables, deadline, exclusivity. Nexus smart matching: "Based on your audience (65% male 18-24, Oakland, basketball), these brands fit you best."
- Apply for deals. If accepted, contract auto-generated through KayPay with deliverables, terms, compliance disclosure.
- My Active Deals. Status: deliverables due, content submitted, brand approved, payment status.
- My Earnings. Total NIL this season. Breakdown: pool allocation, marketplace deals, fan stakes. Payment history. 1099 at year-end.
- Create content. Integration with Social and KayTV. Tag brand, submit for approval, publish when approved.
- Compliance checklist per deal. Deal logged, school notified, value reported, conflict check passed. Green/red indicators.
- Nexus: "What NIL deals are available?", "What's my valuation?", "How much have I earned?", "Am I compliant?"
- Filter pills: All, Available Deals, My Active Deals, Applied, Earnings, Compliance.
- For LU demo: Laolu NIL profile (KR 86, 1,200 followers, 15% engagement). 3 available deals. 1 active ($300 clothing brand). Season NIL: $2,400 ($1,800 pool + $600 marketplace).

**Fan/Parent View (R9):**
- NIL transparency. Aggregate: "LU athletes earned $18K in NIL across 12 deals." Individual details private. Can stake athletes (flows to Give).

#### Fan Shop View

**Head Coach View (R0):**
- Merch and tickets. Same Store engine scoped to program. Jerseys, tees, hats, posters, signed items. Tickets: single game, season pass, premium, away travel packages.

**Player View (R5):**
- Player merch. Personal merch under NIL. Revenue direct to player through KayPay.

**Fan/Parent View (R9):**
- Storefront. Buy through KayPay. Tickets with QR for game day in Pulse/Agenda. Game Day Bundle (ticket + parking + merch discount). Player-specific merch (portion to athlete NIL).
- Filter pills: All, Merch, Tickets, Season Pass, Player Merch, Bundles.

---

### 17.7 Sports KayTV

KayTV in Sports mode is the YouTube of sub-NCAA sports and the Hudl of game film combined. Broadcast network, film library, scouting tape exchange, highlight factory, and podcast network. For programs that never get on ESPN, KayTV IS their ESPN.

Three content layers: Game Film (coaching, intelligence overlay, RBAC-gated), Broadcasts (fan-facing, live and archived), Network Content (podcasts, docs, original series).

Views: Featured / Library / Live (centered contextual pill to switch)

#### Featured View

**Head Coach View (R0):**
- Hero: latest broadcast or upcoming livestream. Rows: Our Game Film (coaching-tagged), Opponent Film (scouting), Highlights (auto-clipped), Player Spotlights, Practice Film (internal), Podcasts (KaNeXT Sports Network), Documentaries, Recruiting Videos.
- Admin: public vs coaching-only vs player-only. Game film with intelligence overlay ALWAYS coaching-only (R0-R3). Raw broadcast public.

**Player View (R5):**
- Latest broadcast, my highlights, team highlights, podcasts. Coach-assigned "Watch List" at top. Cannot see opponent scouting, intelligence overlays, or practice film.

**Fan/Recruit/Parent View (R9):**
- Latest broadcast, highlights, spotlights, podcasts, docs, upcoming streams. Every game available. For recruits: game broadcasts are part of evaluating the program.

#### Library View

**Head Coach View (R0):**

**Coaching Film Library (R0-R3 only):**
- Every game with intelligence overlay from Hub Film Room. Film Room = analysis workspace. KayTV Coaching Library = organized viewing catalog.
- Opponent film. Other teams' public KayTV broadcasts pulled in for scouting. Tag and clip same as own film.
- Film exchange. Request from opponents through Messages. Replaces Hudl film exchange.
- Practice film. Internal, never public.

**Public Media Library (all roles):**
- Game broadcasts archived as VOD. Highlights auto-generated. Player highlight reels (built by players from coach-assigned clips). Original content (behind-the-scenes, player features, alumni stories).

**KaNeXT Sports Network (podcast + original programming):**
- Podcast network. Locked On style for sub-NCAA. Each program hosts shows: "Inside LU Basketball" (weekly recap, preview, interviews), "GAAC Weekly" (conference coverage powered by KR intelligence), "The Transfer Portal Report" (portal analysis by KR), "Game Day Preview" (public-safe scouting preview).
- Documentaries and features. Season docs, player stories, program history.
- Sports talk and analysis. Commentary, debate, interview series.
- Network discovery. Browse shows across all KaNeXT programs. Subscribe. Notifications. Podcast RSS for Apple Podcasts, Spotify.
- Upload: video or audio with metadata. Coaching film auto-tagged from StatKeeper. Broadcasts auto-archived from live. Podcasts: upload audio, show art, episode info.
- Filter pills (coach): All, Our Film, Opponent Film, Practice, Broadcasts, Highlights, Podcasts, Docs, By Opponent, By Player, This Season, Last Season, Internal, Public.

**Player View (R5):**
- Public content plus my coach-assigned film. Highlight reel builder. Podcasts and features.
- Filter pills: All, My Film, My Highlights, Broadcasts, Podcasts, Features.

**Fan/Recruit/Parent View (R9):**
- All public. Broadcasts, highlights, reels, podcasts, docs, features. Subscribe to podcast.
- Filter pills: All, Broadcasts, Highlights, Podcasts, Docs, Player Reels, This Season.
- For LU demo: 8 game broadcasts, auto-highlights per game, Laolu highlight reel (38-pt Pepperdine), "Inside LU Basketball" (6 eps), "GAAC Weekly" (4 eps), "Laolu's Journey" feature (8 min), 3 behind-the-scenes.

#### Live View

**Head Coach View (R0):**
- Go Live for game broadcasts. Camera setup (KayVision or manual feed). Scoreboard overlay from StatKeeper. Commentary input.
- During live: viewer count, chat, real-time StatKeeper score overlay, highlight clip button (mark moments for auto-clip), ad break insertion.
- Multi-camera (KayVision): tactical wide, broadcast follow, baseline. Director switches feeds live. Replay from any angle.
- After live: auto-saves VOD, highlights auto-generated, box score overlay added.

**Fan/Recruit/Parent View (R9):**
- Watch live. Chat. Score overlay. Share link. Set reminders. Live giving through Booster. Fan Challenges active during games. Audio-only option for programs without cameras.

---

### 17.8 Sports KayPay

KayPay in Sports mode handles the athletic program's financial infrastructure. Same structure (Wallet/Pay/Invest). Where all money flows: booster donations, NIL payments, tickets, merch, Fan Challenges, scholarship disbursements, travel, equipment, operating budget. Replaces disconnected athletic department financial tools.

Views: Wallet / Pay / Invest (centered contextual pill to switch)

Side panel. Head Coach: program dashboard (budget, revenue, expenses, NIL pool, scholarships), approvals, vendors, travel budgets. Assistant Coach: expense reimbursements. Operations: full financial management, compliance reporting. Player: wallet, NIL earnings, scholarship. Fan/Parent: wallet, giving receipts, purchases.

#### Wallet View

**Head Coach View (R0):**

Personal wallet (same as any user).

Program account (toggle):
- Dashboard. Budget (from AD/institution), revenue this season (Booster + tickets + merch + broadcast), expenses (travel, equipment, meals, recruiting, operations), remaining budget, NIL pool balance.
- Revenue breakdown: donations, NIL contributions, tickets, merch, Fan Challenges, pledges, broadcast sponsorships, events. Each tappable.
- Expense categories: travel (bus, flights, hotels, road meals), equipment (uniforms, gear), recruiting (visits, travel, camps), facilities (gym rental at Laney College), game ops (officials, staff), marketing/media, administrative (compliance, insurance).
- Budget vs actual by category with alerts.
- Scholarship tracker. Total budget, per-player allocation, unallocated remaining. Synced with Roster.
- NIL pool management. Inflows (fans, collective, revenue sharing), outflows (player payments), balance, per-player allocation synced with Booster NIL. Every payment with governed settlement chain.
- Vendor payments. Equipment, travel, meals, facilities. Invoices, scheduled payments, history.
- Compliance financial reporting. Every dollar auditable. NCAA/NAIA/GAAC compliance. Scholarship limits. NIL tracked separately. Revenue sharing compliance. Annual report for AD.
- Full governed settlement chain. Event, Rules, Authorization, Payment, Settlement, Audit.
- Nexus: "Remaining travel budget?", "Recruiting spend this season?", "NIL pool balance?", "Generate compliance report."
- Filter pills: All, Revenue, Expenses, NIL, Scholarships, Travel, Recruiting, Equipment, Vendors, This Month, This Season, Budget vs Actual, Compliance.
- For LU demo: budget $120K. Revenue $62K from Booster. Expenses $85K. NIL pool $18K (8 player allocations). 6 vendors. Full audit trail.

**Assistant Coach View (R2):**
- Budget overview (read-only). Submit expense reimbursements. Track status.
- Filter pills: All, My Expenses, Submitted, Approved, Reimbursed.

**Operations View (R3):**
- Full financial management. Vendor payments, reconciliation, expense approvals, compliance reports, revenue tracking.
- Filter pills: All, Revenue, Expenses, Vendors, Pending Approvals, Compliance, This Month.

**Player View (R5):**
- Personal wallet. 4% APY, KaNeXT Card.
- My NIL earnings. Total, breakdown (pool, marketplace, stakes). Payment history. 1099 year-end.
- My scholarship status. Amount, disbursement schedule, balance. Synced from Roster.
- Filter pills: All, My NIL, My Scholarship, Payments, Tax Documents.

**Fan/Parent View (R9):**
- Personal wallet. Giving receipts (every donation, pledge, challenge, stake). Tax-deductible flagged. Year-end statement. Purchase history (tickets, merch).
- Filter pills: All, Giving Receipts, Purchases, Tax Deductible, This Season.

#### Pay View

**All roles:**
- Same P2P. QR, split, remittance 0.2%. Inline from Messages.

**Head Coach View (R0) additional:**
- Vendor payment initiation. NIL disbursement to player wallets (compliance-documented). Recruiting expense approval. Travel advances with post-trip reconciliation.

**Operations View (R3) additional:**
- Process approved payments. Batch vendor payments. Purchase orders.

#### Invest View

**All roles:**
- Same as all KayPay Invest. Infrastructure Fund, Bitcoin, Capital Points.

**Head Coach View (R0) additional:**
- Program endowment visibility (if applicable).

---

### 17.9 Sports KayStudios

KayStudios in Sports mode is where the intelligence system becomes playable. Same cross-mode engine. Coaches get interactive training and tactical tools, players get development courses and IQ training, fans get College Basketball GM and trivia.

If it's video, KayTV. If it's a document, Hub. If you interact, KayStudios.

#### Content Types

**Coaching Tools (R0-R3):**
- Tactical draw tool. Interactive whiteboard for play design. Player icons, arrows, screens, cuts. Save to playbook. Share to players. Animate execution sequence. Replaces FastDraw.
- Practice plan builder (interactive). Drag-and-drop drill blocks linked to film clips and tactical diagrams. Design workspace (vs Agenda which is calendar-based).
- Coaching certification. "KaNeXT Intelligence System Mastery" - learn KR, System Fit%, archetypes for recruiting and game planning. Scenarios and assessments.
- Scouting scenario training. Nexus presents scouting situations. Coach evaluates, Nexus provides feedback and optimal analysis.

**Player Development (R5):**
- Basketball IQ courses. "Reading PnR Coverage" (watch, identify, choose read), "Shot Selection" (situations, choose shot, see expected PPP), "Defensive Rotations" (watch, identify mistake, drag to correct).
- Film study courses. Coach-created interactive sessions. Watch clip, answer "What should happen next?", see correct read.
- Physical development tracking. Log workouts, track lifts/vertical/speed. Goals. Progress over time. Synced with S&C staff.
- Academic support. Study aids, flashcards, time management. Stay eligible (synced with Roster).
- Life skills. Financial literacy (NIL money management, taxes, agents), media training, nutrition, mental health.

**Fan Experiences (R9):**
- College Basketball GM. Flagship game. Full spec in Business KayStudios 16.9. Fans play for fun, coaches learn the system. Same leaderboard.
- Pick'em. Weekly predictions using KR data. "KaNeXT predicts LU by 8. Agree?" Points for correct picks. Season leaderboard.
- Basketball trivia. KR trivia, team trivia, rules, history. Quick games, leaderboards, shareable.
- Bracket challenges. Tournament brackets powered by KR.
- Fantasy roster builder. Dream roster from 37K pool. Salary cap. Compete on Team KR score.
- Player comparison tool. Pick any two players, see KR comparison, traits, archetype matchup. Interactive and visual.

#### RBAC Views

**Head Coach View (R0):**
- Full creator. Build coaching tools, diagrams, training. Assign player courses. Analytics on completion and engagement.
- Filter pills (creator): All, Coaching Tools, Player Courses, Fan Experiences, Draw Tool, Playbook, Published, Drafts, Analytics.

**Assistant Coach View (R2):**
- Same. Create tactical content and training.

**Operations View (R3):**
- Create fan content (trivia, challenges). Cannot access coaching tactical tools.

**Player View (R5):**
- Required development courses (coach-assigned, deadlines). IQ training. Film study. Physical tracking. Academic. Life skills. Can also play fan experiences.
- Filter pills: All, Required, Basketball IQ, Film Study, Workouts, Academic, Life Skills, Games, In Progress, Completed.

**Fan/Recruit/Parent View (R9):**
- All fan experiences. GM Mode featured. Free. Leaderboard. Save states. Multi-season. For recruits: GM Mode teaches the intelligence system.
- Filter pills: All, GM Mode, Pick'em, Trivia, Brackets, Fantasy, Leaderboard.
- For LU demo: College Basketball GM (500+ players, GAAC featured), "GAAC Trivia" (200+ plays), "Weekly Pick'em" (45 participants), "Tournament Bracket", "Dream GAAC Team" (fantasy, 30 entries), "Defensive Rotation Trainer" (player course), "NIL Financial Literacy" (15 completions).

---

## 18. Universal Tile Definitions

These definitions explain what each tile IS across all modes. The per-mode sections (4, 14, 15, 16, 17) specify the exact features, RBAC views, and demo data. This section provides the universal understanding.

### 18.1 Hub (Position 1)

Hub is tile position 1. Top-left of every grid. The command center for any institution.

Hub answers: "What is happening right now and what needs my attention?" It is not a feed (Social), not a calendar (Agenda), not a conversation (Messages). It is the operational dashboard with full workspace tools.

Every Hub has tabs. The first tab is always Overview: a KPI dashboard with the metrics that matter most. Remaining tabs are operational workspaces where real work gets done.

**Education Hub:** Academic operations. Enrollment, courses, GPA tracking, student life. Full course management system: create courses with modules, lessons, assignments, quizzes, discussions, and syllabus. Students submit work, take assessments, view grades. Faculty gradebook. Course analytics.

**Community Hub:** Organizational operations. Membership health, event planning, group management, service/meeting planning with volunteer scheduling and drag-and-drop order builder. Works for any community: religious, civic, cultural, nonprofit.

**Sports Hub:** Athletic operations. Team performance, game film analysis with intelligence overlay and telestration, opponent scouting powered by the intelligence system, game day operations with live stat tracking that auto-generates coaching analysis at halftime, postgame reports, and publishable media recaps.

**Business Hub:** Company operations. Revenue, project management with Kanban/timeline/task tracking, internal operations with document library, automated workflows, and HR.

**Personal Hub:** Creator operations. Audience analytics, content calendar with queue-based scheduling, link-in-bio page builder with drag-and-drop blocks and per-block analytics, auto-generated media kit from real data.

Hub has a side panel with quick-access shortcuts, RBAC-scoped per role. Hub is the most mode-specific tile.

### 18.2 Agenda (Position 2)

Agenda is tile position 2. Top-center of every grid. The calendar for any institution.

Agenda answers: "What is scheduled and when?" Three views: Day, Week, Month. Events are color-coded by type. Every event supports attachments, attendees, location (physical or video), and reminders.

Agenda is the LEAST mode-specific tile. A calendar is a calendar. What changes per mode is event types and RBAC visibility:

**Education:** Class schedules, due dates, exams, campus events, office hours, registration deadlines.
**Community:** Services/gatherings, group meetings, volunteer schedules, events, holidays, outreach.
**Sports:** Games, practices (drill plans attached), film sessions, travel itineraries, recruiting calendar with compliance period overlay, academic monitoring.
**Business:** Client meetings, project deadlines, team meetings, company events, resource scheduling.
**Personal:** Content schedule (synced from Hub), meetings, deal deadlines, booking slots, public events.

RBAC controls who sees which event types. Supports recurring events, external calendar sync, and reminders.

### 18.3 Social (Position 3)

Social is tile position 3. Top-right of every grid. The content and communication platform.

Social answers: "What is my institution saying and what is happening in my community?" Feed (scrollable content), Reels (short-form video), Profile (brand's public page).

Scope filter: Brand (this brand only), Mode (all brands in this mode), All (everything across all modes).

Post types available everywhere: text, photo, video, carousel, poll, link share. Additional types vary by mode.

The critical feature: visibility toggle. Every post is Public (marketing, visible to everyone) or Internal (team communication, visible only to members). Eliminates the need for separate internal comms tools. RBAC controls who can post publicly vs internally vs only consume.

### 18.4 People Tile (Position 4)

Position 4 is the people tile. Middle-left of every grid. The name changes per mode but the pattern is identical: it is the directory of every person connected to the institution.

Mode names: **Roster** (Sports), **Team** (Business), **Campus** (Education), **Members** (Community), **Network** (Personal).

Every people tile has: searchable directory, detailed profiles, and organizational views (depth chart, org chart, households, collaborators depending on mode).

**Sports Roster:** Player profiles with athletic intelligence (rating, archetype, traits, system fit), stats, film, medical, eligibility, scholarship/NIL, development plan. Depth chart. Staff directory.
**Business Team:** Employee profiles with role, department, manager, reports, reviews, PTO, skills. Org chart. HR workspace with hiring, performance, onboarding/offboarding, compliance.
**Education Campus:** Student profiles with academic record, enrollment, financial aid, advisor. Faculty profiles. Staff directory.
**Community Members:** Member profiles with engagement score, milestones, households, volunteer roles, communication log. Household view. Check-in with child safety.
**Personal Network:** Contacts (imported, synced). Collaborators. Subscribers with engagement tiers and email list.

RBAC is strict. Leaders see full profiles with private data. Peers see public profiles. Outsiders see minimal information. Privacy is structural.

### 18.5 Pipeline Tile (Position 5)

Position 5 is the pipeline tile. Middle-center of every grid. The name changes per mode but the pattern is identical: it is the two-sided marketplace where institutions find people and people find institutions.

Mode names: **Recruits** (Sports), **Inquiries** (Business), **Admissions** (Education), **Outreach** (Community), **Deals** (Personal).

Every pipeline tile connects supply and demand. The institution has needs (roster spots, job openings, enrollment seats, congregation growth, brand partnerships). The individual has goals (play college sports, get a job, find the right school, find a community, monetize their audience). The intelligence system sits in the middle and makes the match.

This is fully built for Sports mode through the basketball intelligence system: coaches search the 37K player pool with ratings, archetype filtering, system fit scoring, and projected team impact. Recruits build profiles, see their evaluation, get "Where Do I Fit?" recommendations showing which programs need their archetype, and track which coaches view their profile. The intelligence makes it democratic - a player at a small JUCO gets the same objective evaluation as a 5-star recruit.

This two-sided intelligence pattern extends to every mode over time:

**Sports Recruits (live):** Coach side: recruiting board, player pool search, portal feed, projected impact, cost analysis. Recruit side: profile with intelligence, school search with fit scores, coach tracking, direct messaging.
**Business Inquiries (current: CRM; future: talent/client marketplace):** Lead scoring, pipeline, deal-to-project conversion, forecast. Future: businesses and freelancers discover each other through intelligence matching.
**Education Admissions (current: application pipeline; future: student-school matching):** Application tracking, yield analytics. Future: students get "Where Do I Fit?" for schools based on academic profile, interests, and goals. Faculty recruitment with research fit matching.
**Community Outreach (current: visitor pipeline; future: community-person matching):** Visitor follow-up, campaigns, re-engagement. Future: people discover communities by values, programs, location, and culture.
**Personal Deals (current: creator pipeline; future: brand-creator marketplace):** Sponsorship negotiation, proposals, contracts. Future: brands discover creators by audience fit, creators discover opportunities by brand alignment.

The intelligence that powers Sports Recruits becomes the template for every mode. The metrics change but the architecture is identical: a pool of evaluated individuals, institutional needs, and an engine that matches them. Network effects compound as more institutions and individuals join.

### 18.6 Money-In Tile (Position 6)

Position 6 is the money-in tile. Middle-right of every grid. The name changes per mode but the pattern is identical: where money flows into the institution. Every dollar goes through KayPay's governed settlement chain.

Mode names: **Booster** (Sports), **Store** (Business), **Fund** (Education), **Give** (Community), **Earn** (Personal).

**Sports Booster:** Fan donations, NIL contributions and marketplace (brands discover athletes, athletes discover deals, compliance engine built in), ticket sales, merch, play-based pledges (auto-charge per game action), fan challenges (both sides put up money, all goes to program), athlete staking.
**Business Store:** Full commerce engine. Physical products with inventory and shipping, digital products, services with booking, subscriptions with recurring billing, B2B wholesale, bundles, discounts. Order management, fulfillment, returns, abandoned cart recovery.
**Education Fund:** Tuition with installment plans, financial aid, scholarships, donor campaigns, alumni giving, grants, endowment management.
**Community Give:** Donations with fund designation, recurring giving, campaigns, tax receipts. Fund accounting enforced at transaction level - restricted funds cannot be spent on unauthorized purposes.
**Personal Earn:** Digital products, courses (priced here, delivered in KayStudios), services (booked through Agenda), subscriptions with tiered access, tips, affiliate commissions.

All payments through KayPay. Every transaction has the governed settlement chain. Tax compliance built in.

### 18.7 KayTV (Position 7)

KayTV is tile position 7. Bottom-left of every grid. The name never changes. It is the institution's own video platform. Not YouTube. Not Vimeo. Not Hudl. Yours.

The problem: institutions don't own their video. A church uploads sermons to YouTube next to conspiracy theories and unwanted ads. A small college program can't afford Hudl so game film lives on a coach's phone or doesn't exist. A business puts demos on Vimeo where nobody finds them. A creator uploads to YouTube and the algorithm decides who sees it while YouTube takes 30%. Video is scattered, uncontrolled, and owned by platforms that don't care about your institution.

KayTV changes this. Every institution gets its own clean, organized, branded video platform. Every video in one place. The institution controls access, organization, and distribution. No unwanted ads. No algorithm burying content. No third-party platform tax.

Three views: Featured (curated landing), Library (full searchable catalog), Live (real-time streaming with auto-save to VOD).

**Sports:** The biggest deal. Most sub-NCAA programs have zero broadcast infrastructure. Games played in front of 200 people, no one else sees them. Recruits can't watch film. Fans who can't attend miss everything. KayTV gives EVERY program their own broadcast network. Every game livestreamed and archived. Highlights auto-clipped. Film available for coaching with intelligence overlay. Film exchangeable for scouting. Players build recruiting reels from broadcasts. Podcast network for sub-NCAA sports. The smallest program has the same infrastructure as a Power 5 school.

**Community:** Sermons on YouTube mixed with everything else. Worship recordings, children's content, teaching series scattered or lost. KayTV gives every organization a clean media library. Members find last week's message in one tap. Parents find safe children's content. Worship music alongside teaching. Radio streams live. Visitors watch before they ever walk in. Everything produced is in one place, owned by them.

**Education:** Lectures scattered across Zoom, Drive, YouTube. KayTV consolidates. Students access recordings through courses. Prospective students watch tours. Professional and organized.

**Business:** Demos, testimonials, training, webinars, investor updates across YouTube, Vimeo, Loom, Drive, Zoom. KayTV consolidates. Gated content captures leads. Internal stays internal. Investor-only stays gated.

**Personal:** Creators own every viewer relationship. Tips direct to wallet. Subscriber-only gating. Product tags in videos. No algorithm. No 30% platform cut.

Universal features: chapter markers, speed controls, captions, casting, clip creation, series management, analytics, comments, sharing. Single source of truth for all video - other tiles pull FROM KayTV and layer their own interfaces on top.

### 18.8 KayPay (Position 8)

KayPay is tile position 8. Bottom-center of every grid. The name never changes. The financial infrastructure for every person and every institution.

The problem: money is broken for institutions. A church uses one tool for donations, another for accounting, another for payroll, another for reimbursements. A business uses five to ten financial tools that don't talk to each other. A creator gets paid from five platforms on five different schedules into five different accounts. Nobody has a unified view of where the money is.

KayPay eliminates all of this. One wallet. One ledger. One audit trail. Every dollar that moves flows through the governed settlement chain: Event (what triggered it), Rules (what policies applied), Authorization (who approved), Payment (how processed), Settlement (where it went), Audit (permanent record). No dollar moves without a trail.

Three views: Wallet (dashboard, balance, 4% APY, KaNeXT Card), Pay (send, receive, QR, split, remittance at 0.2%, invoices, vendor payments, payroll), Invest (Infrastructure Fund, Bitcoin, Capital Points).

**Sports:** Program budget tracking, NIL pool with compliance-documented payments, scholarship tracking, booster revenue reconciliation, vendor payments. Player: NIL earnings with tax docs.
**Business:** Full double-entry accounting, AR with aging and auto-reminders, AP with approval workflows, payroll with tax withholding and filing, expense management with receipt capture and approval chains, budget vs actual, exportable financial reports.
**Education:** Tuition collection with installment plans, financial aid tracking, scholarship funds, donor fund accounting, department budgets.
**Community:** Fund accounting with restricted/unrestricted enforcement at the transaction level. Money given to the building fund cannot be spent on payroll. The system prevents it. Designated fund balances, tax receipt generation, clergy-specific payroll (housing allowance), board-ready financial reports.
**Personal:** Every revenue stream in one wallet. Tax dashboard with real-time estimates by category. Auto-save rules for taxes. Invoice creation. The KaNeXT Card lets creators spend earnings immediately.

What makes KayPay different: everything is connected (revenue from position 6 auto-reconciles, payments from position 5 tracked end-to-end, payroll syncs with position 4). The governed settlement chain is architecture, not a feature. Compliance is structural (fund restrictions enforced at transaction level, NIL documented in settlement chain, tax categorized at moment of transaction).

### 18.9 KayStudios (Position 9)

KayStudios is tile position 9. Bottom-right of every grid. The name never changes. The interactive experiences platform. Play. Build. Solve. Compete. Learn by doing.

The problem: passive content doesn't stick. People watch a video and forget 90%. They read a document and retain less. But when they play a game, make decisions, face consequences, and compete - they remember everything. Simulation-based learning outperforms lecture by 3-5x. People spend thousands of hours in Football Manager learning tactics they'd never read in a textbook. KayStudios brings this to every institution.

The separation from KayTV is absolute: KayTV is watch. KayStudios is do. Training video = KayTV. Training course with quizzes and scenarios = KayStudios. Sermon = KayTV. Bible trivia = KayStudios. Game broadcast = KayTV. College Basketball GM = KayStudios.

KayStudios is the one tile that breaks mode scoping. Content created in any mode is playable from any mode. The engine is universal. The content travels.

**The engine supports:** Courses (multi-lesson, text + video + quiz, progress tracking, certificates). Games (trivia, simulation, strategy, tycoon, adventure, leaderboards, achievements, save states, multiplayer). Simulations (complex decision-making powered by real data). Tools (calculators, configurators, assessments, diagnostics). Challenges (time-limited, competitive, individual or team, leaderboards).

**Sports:** College Basketball GM (Football Manager for college basketball, real 37K player pool, real intelligence data). Tactical draw tool. Player IQ courses. Life skills (NIL financial literacy, media training). Pick'em, brackets, fantasy, trivia. Coach scouting scenario training with AI feedback.
**Business:** Interactive product demos (sandbox, not video). Customer onboarding courses. Certification programs. Sales role-play with AI. Calculators and configurators. Compliance training with scenarios.
**Education:** Interactive learning beyond the LMS. Virtual labs and simulations. Study games. Exam prep. Career path simulators. Financial literacy simulators. Faculty build interactive content supplementing lectures and course materials.
**Community:** Scripture and values-based interactive content. Trivia. New member onboarding courses. Volunteer training with interactive scenarios. Leadership development. Youth games and challenges.
**Personal:** Creator-built courses (priced in Earn, delivered here). Quizzes, assessments, challenges with leaderboards. Interactive tools for audience.

**Creator tools:** No-code builder for authorized users. Lesson creation, game templates, assessment builders. Content through RBAC approval workflows before publishing.

**Safety model:** KayStudios is not the open internet. Every experience is published by an institution or creator through KaNeXT with RBAC-controlled approval. Content tied to a brand. Brand tied to real people. No anonymous publishing. No unmoderated user-generated content. Safe by architecture, not moderation.

---

## 19. Settings

Settings is accessed from the Brand Drawer (bottom of drawer, below brand list). Not a tile. Not a footer page. Full-screen page with back button to return to drawer.

Two sections: Account (personal, across all brands) and Brand (active brand, admin roles only).

### 19.1 Account Settings

Applies to YOU across every brand. Every user sees these.

**Profile:** Full name, profile photo (upload/take, crop to circle), @handle (unique across KaNeXT), email (primary + secondary, verification), phone (primary + secondary, verification, this is your KaNeXT phone number), bio, date of birth (private), location (city/state/country, not public unless enabled).

**Security:** Change password (strength indicator). Two-factor authentication (authenticator app, SMS, email). Biometric login (Face ID / Touch ID toggle). Active sessions (device name, location, last active, log out per session, log out all). Login history (last 10). Account recovery (recovery email, phone, codes).

**Notifications:** Master toggle. Per-category toggles: Messages, Social, KayPay, Agenda, Pulse, Phone, Nexus. Per-brand settings ("Mute Lincoln notifications 24 hours", "KaNeXT notifications business hours only"). Delivery: push, in-app badge, email digest (daily/weekly), SMS critical only. Quiet hours.

**Privacy:** Who can message me (everyone, followers, brand members, no one). Profile visibility. Phone/email discoverability. Directory visibility per brand (show/hide). Activity status (online indicator). Read receipts. Data sharing opt in/out.

**KayPay Settings:** Linked banks (add/remove, set primary). Linked cards. KaNeXT Card controls (freeze, spending limits, international/online toggles, view card number with biometric). Payout preferences (keep for 4% APY, auto-transfer instant/daily/weekly). Default payment method order. Transaction PIN (optional for high amounts). Remittance saved recipients. Tax information (SSN/TIN, filing status, address for 1099s).

**Appearance:** Dark mode (on/off/system, OLED true black). Text size (small/medium/large/XL). Reduce motion. High contrast.

**Language:** App language selection.

**Help & Support:** Searchable help center. Contact support (ticket through Messages). Report bug (screenshot, auto device info). Feature request. Community forum.

**About:** Version number. Terms of Service. Privacy Policy. Open source licenses. KaNeXT website.

**Account Actions:** Log out (this device). Log out all devices. Deactivate (temporary, reversible). Delete account (permanent, 30-day grace period).

### 19.2 Brand Settings

Applies to active brand. Only visible to admin authority (R0 Owner, R1-R2 depending on mode). Not visible if you lack admin authority.

**Brand Profile:** Name (owner only), logo/avatar, description/bio, contact email, contact phone, website URL, physical address, mode (display only, locked after creation), brand code (unique join code).

**Members & Roles:** Member list (name, handle, role, joined, last active, status). Invite by handle, email, phone, share link, QR, brand code. Set role at invite. Change roles. Remove member. Suspend member (temporary disable). Bulk invite via CSV. Pending invites (resend/cancel).

**Brand Customization:** Brand colors (primary/secondary, applied to pills, headers, accents, default KaNeXT blue, customizable per brand). Custom domain for Links page (Personal mode).

**Permissions & Policies:** Content approval workflow on/off. Recruit messaging on/off (Sports). Directory visibility defaults. Content moderation sensitivity.

**Billing & Subscription:** Current plan, features/limits, upgrade/downgrade, payment through KayPay, billing history, cancel.

**Data & Export:** Export all brand data (CSV/JSON). Data retention policy. GDPR/privacy compliance (access requests, right to deletion).

**Integrations:** Connected external tools (Google Calendar, Hudl, QuickBooks). API access. Webhooks.

**Danger Zone:** Transfer ownership. Archive brand (reversible). Delete brand (permanent, 30-day grace, owner password required).

---

## 20. Onboarding & Brand Creation

### 20.1 Launch Screen

First launch. White background (#FFFFFF). KaNeXT "K" logo centered, larger than current build (increase logo size ~40% from current). Code input field directly below the K. Minimal styling: subtle bottom border, no label. Keyboard rises when tapped.

Nothing else. No title. No subtitle. No buttons. No explanation. K and code.

### 20.2 Code Entry

User types a code. Validates against server in real-time after minimum character count.

**Valid code:** Brief success animation (K pulses or glows blue). Transitions to account creation (20.4).

**Invalid code:** Subtle shake on input field. After 2 failed attempts, transitions to FOMO video (20.3).

### 20.3 FOMO Video

Full-screen auto-play. 60-90 seconds. KaNeXT sizzle reel showing OS across modes. No skip for first 10 seconds, then small X top-right.

After video ends or dismissed:
- K logo centered
- Code field below K (same as launch)
- "Join" text link at bottom. Small, understated, not a button.

### 20.4 Account Creation (Valid Code Path)

Three screens, one field each, full screen with large input. Progress dots at top.

Screen 1: "Your name" → full name. Next.
Screen 2: "Phone or email" → toggle between. Next.
Screen 3: "Create a password" → with visibility toggle. Done.

No username, no photo, no bio. Get them in fast.

System creates:
1. User's Personal brand automatically (name from screen 1)
2. Adds the brand associated with the code (code knows brand + role)
3. Adds 5 preloaded demo brands as followed (Sammy Kalejaiye, KaNeXT, Lincoln University, LU Men's Basketball, ICCLA) so the app has content from day one

### 20.5 Brand Onboarding Video

Brand-specific video plays after account creation. Depends on the code:

**Investor code:** KaNeXT investor pitch video. Product, vision, intelligence, market, team, ask. After video → Nexus: "Welcome to KaNeXT, [name]. I'm Nexus. I can walk you through the product, the intelligence system, the financials, the team, or anything else. What would you like to explore?"

**Coach code:** Coaching onboarding video. Hub, Film Room, Scouting, StatKeeper, Roster, Recruits. After → Nexus: "Welcome, Coach [name]. I can help you set up your roster, scout your next opponent, evaluate a portal prospect, or walk you through any part of the system."

**Student code:** Student onboarding. Courses, schedule, campus life, wallet. After → Nexus.

**General code (no video configured):** Skip video, land on Home screen of the brand.

Onboarding video is configurable per brand by the brand owner. Church records their welcome. Business records their tour. No custom video = skip to Home.

### 20.6 Join Path (No Code)

User taps "Join" from post-video screen. Minimal form:

- Name (text field)
- Organization (optional, placeholder: "School, company, team, church...")
- Submit

No email. No phone. No password. No promises. After submit: K logo. "We'll be in touch." Nothing else.

Submission goes to a review queue. If approved, they receive an invitation code. The platform is brand-first and curated. You don't get in without a code. Join is interest submission, not account creation.

### 20.7 Returning User

After first launch, app opens to Home screen of last active brand. No code screen. Biometric auto-login if enabled, otherwise session persists.

Session expired or logged out: K + code field, plus "Log in" text link at bottom. Tap → email/phone + password → back in.

### 20.8 Brand Creation (Inside App)

Any authenticated user can create a brand from the Brand Drawer.

**Entry:** Brand Drawer → "+" button or "Create Brand" at bottom of brand list, above Settings.

**Step 1: Choose Mode.** Four cards: Sports ("Team, program, or league"), Business ("Company, startup, or agency"), Education ("School, university, or program"), Community ("Church, nonprofit, or organization"). Personal auto-created, cannot create second. Tap to select.

**Step 2: Brand Info.** Name (text). Logo (upload/photo, optional). Description (optional).

**Step 3: Confirmation.** Preview: mode badge, name, logo. "Create Brand" button. Brand created. User is Owner (R0). App switches to new brand. Nexus opens: "Welcome to [Brand Name]. I can help you set up your [mode]. Want to start by inviting your team, or walk through the tools?"

Owner generates invite codes from Brand Settings (19.2) to invite members with specific roles.
