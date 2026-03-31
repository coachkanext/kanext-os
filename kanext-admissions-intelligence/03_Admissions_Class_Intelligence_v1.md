# ADMISSIONS CLASS INTELLIGENCE
## v1.0 - Class KR Pipeline, Composition Analysis, Revenue & Retention Modeling

---

# CLASS KR - MATH, PIPELINE & DIAGNOSTICS

## 0. Scope
This is the single authoritative document for Class KR computation. Class KR is the enrollment-weighted aggregation of students' Final Student KRs within a defined cohort, with program-distribution weighting, financial sustainability adjustment, and institution-type contextual scaling.

Class KR does not evaluate students. It consumes finalized student outputs from upstream.

## 1. Inputs (Non-Negotiable)

Class KR consumes only:

**Per student in cohort:**
- Final Student KR (from Student Evaluation Pipeline)
- Component KRs: AKR, PKR, EKR, IQKR
- Program/Major
- Credit load (full-time: 12+ credits, part-time: under 12)
- Enrollment status (new freshman, continuing, transfer, readmit)
- Financial aid package (total aid, net tuition revenue per student)
- Retention risk tier (Critical/High/Moderate/Low-Moderate/Low)
- System Fit %

**Per institution (from Institutional Context):**
- Institution Type
- Total enrollment target
- Financial aid budget
- Tuition rate
- Target class composition (if defined)
- Historical retention rates by cohort

**Explicit exclusions (locked):**
- No re-evaluation of individual Student KRs
- No modification of component KRs
- No re-scoring of suppression or badges
- No re-computation of System Fit (already baked into individual evaluations)

## 2. Cohort Definition

A "class" or "cohort" is a defined group of students evaluated together. Common cohort definitions:
- **Incoming Freshman Class:** All new first-time freshmen for a given term
- **Incoming Transfer Class:** All new transfer students for a given term
- **Full Incoming Class:** All new students (freshmen + transfers) for a given term
- **Continuing Cohort:** All returning students in a specific class year
- **Program Cohort:** All students (new and continuing) in a specific program/major
- **Full Enrollment:** All enrolled students institution-wide

The cohort must be defined before Class KR runs. Different cohort definitions produce different Class KR values. This is expected and correct.

## 3. Student Weight Per Class KR

Each student's contribution to Class KR is weighted by credit load. Full-time students contribute more to institutional outcomes than part-time students.

### Credit Load Weighting
| Credit Load | Weight |
|------------|--------|
| 15+ credits (overload) | 1.10 |
| 12-14 credits (standard full-time) | 1.00 |
| 9-11 credits (three-quarter time) | 0.75 |
| 6-8 credits (half-time) | 0.50 |
| Under 6 credits (less than half-time) | 0.25 |

### Normalization
Student_Weight_i = Credit_Load_Weight_i / SUM(all Credit_Load_Weights)

All weights sum to 1.0.

## 4. Class KR Computation

### Raw Class KR
Raw_Class_KR = SUM(Student_KR_i * Student_Weight_i) for all students in cohort

### Component Class KRs
Class_AKR = SUM(AKR_i * Student_Weight_i)
Class_PKR = SUM(PKR_i * Student_Weight_i)
Class_EKR = SUM(EKR_i * Student_Weight_i)
Class_IQKR = SUM(IQKR_i * Student_Weight_i)

These show the class's aggregate strengths and weaknesses across the four dimensions.

### Program-Weighted Class KR
For institutions with multiple programs, the class's distribution across programs matters. An institution with 80% of students in its strongest program and 20% in its weakest has a different profile than one with an even distribution.

Program_Class_KR = SUM(Program_Avg_KR_p * Program_Share_p) for all programs p

Where:
- Program_Avg_KR_p = average Student KR of all students in program p
- Program_Share_p = proportion of total enrollment in program p

This gives a program-weighted view of class quality. If one program is much stronger than others, it pulls the class KR up. If one program is much weaker, it drags it down. This is useful for identifying programs that need attention.

## 5. Class KR Diagnostics

### 5.1 Academic Distribution
Bin all students in the cohort by KR tier and count:

| KR Tier | Count | % of Class | Target % (if set) | Gap |
|---------|-------|-----------|-------------------|-----|
| 90-100 | | | | |
| 80-89 | | | | |
| 70-79 | | | | |
| 60-69 | | | | |
| Below 60 | | | | |

This shows whether the class is top-heavy, bottom-heavy, or evenly distributed. It also shows gaps against institutional targets if they exist.

### 5.2 Program Distribution
| Program | # Students | Avg KR | Capacity | Fill Rate | Revenue/Student |
|---------|-----------|--------|----------|-----------|----------------|
| Business Administration | | | | | |
| Nursing | | | | | |
| Education | | | | | |
| ... | | | | | |

Programs below capacity are revenue gaps. Programs above capacity may need faculty/section expansion. Programs with low average KR may need admission standard adjustment or additional support resources.

### 5.3 Geographic Distribution
| Region/State | # Students | % of Class | Tuition Rate (in-state/out-of-state) |
|-------------|-----------|-----------|--------------------------------------|

Geographic concentration risk: if 90% of students come from one county, enrollment is vulnerable to local economic or demographic shifts.

### 5.4 Financial Aid Distribution
| Aid Category | # Students | Avg Aid Amount | Net Revenue/Student |
|-------------|-----------|---------------|-------------------|
| Full scholarship | | | |
| Partial scholarship (50%+) | | | |
| Partial scholarship (under 50%) | | | |
| Need-based aid only | | | |
| No aid (full pay) | | | |

Tuition discount rate = Total Aid Awarded / (Total Students * Sticker Price)

### 5.5 Retention Risk Distribution
| Risk Tier | # Students | % of Class | Projected Attrition |
|-----------|-----------|-----------|-------------------|
| Critical | | | |
| High | | | |
| Moderate | | | |
| Low-Moderate | | | |
| Low | | | |

Projected attrition = SUM(students in tier * historical attrition rate for that tier)

### 5.6 System Fit Distribution
| Fit Range | # Students | % of Class | Avg KR in Range |
|-----------|-----------|-----------|----------------|
| 90-100% (Excellent Fit) | | | |
| 75-89% (Good Fit) | | | |
| 60-74% (Adequate Fit) | | | |
| Below 60% (Poor Fit) | | | |

Students below 60% System Fit are at elevated retention risk regardless of their KR. These are the "high-KR, poor-fit" admits who are most likely to leave for a better-fitting institution.

### 5.7 Suppression Prevalence
| Suppression Type | # Students Flagged | % of Class |
|-----------------|-------------------|-----------|
| Work Suppression | | |
| Family Suppression | | |
| Health Suppression | | |
| Environmental Suppression | | |
| Language Suppression | | |
| First-Generation Suppression | | |
| Any Suppression (unduplicated) | | |

High suppression prevalence indicates that the institution's student body is systematically underperforming relative to ability. This has implications for support service investment, financial aid strategy, and realistic retention target setting.

---

# COMPOSITION ANALYSIS

## Purpose
Composition Analysis goes beyond diagnostics to evaluate whether the incoming class meets institutional strategic goals. It answers: "Is this the class we wanted? Where did we hit our targets and where did we miss?"

## Composition Dimensions

### Academic Composition Target
The institution sets a target distribution of KR tiers. Example: "We want 15% of the class at KR 90+, 40% at 80-89, 30% at 70-79, 15% below 70."

The system compares actual to target and flags gaps.

### Program Composition Target
Each program has a target enrollment (based on faculty capacity, revenue model, market demand). The system compares actual enrollment per program to target and identifies:
- **Underenrolled programs:** Revenue risk, may need recruitment emphasis or program refresh
- **Overenrolled programs:** Resource strain, may need capacity expansion or enrollment cap
- **Program deserts:** Programs with zero or near-zero enrollment that may need sun-setting

### Diversity Composition
Institutions track demographic composition for federal reporting, accreditation, and mission alignment. The system reports actual composition against institutional targets across:
- Race/Ethnicity (IPEDS categories)
- Gender
- First-generation status
- In-state vs out-of-state
- International students
- Age distribution (traditional vs non-traditional)
- Veterans

The system does NOT optimize for demographic targets in KR computation. Demographics inform composition analysis and may influence financial aid strategy, but they never modify a student's KR.

### Financial Composition Target
The institution needs a certain net revenue to operate. The system reports:
- Actual net tuition revenue vs target
- Tuition discount rate vs target
- Full-pay vs aided student ratio
- Average net revenue per student by program

### Geographic Composition
Geographic diversity serves both mission and risk-management purposes. The system reports geographic concentration and flags single-source dependence.

---

# REVENUE PROJECTION PER CLASS

## Purpose
Revenue Projection computes the expected financial contribution of a class over its full lifecycle (enrollment to graduation or departure).

## Per-Student Revenue Model

### Lifetime Student Value (LSV)
LSV_i = SUM over semester s from 1 to expected_semesters:
  [(Tuition_s - Aid_s) + Fees_s + Room_Board_s + Auxiliary_s] * Retention_Probability_s

Where:
- Tuition_s = semester tuition (may increase annually per institutional schedule)
- Aid_s = total institutional aid awarded (may be renewable with conditions)
- Fees_s = mandatory fees per semester
- Room_Board_s = room and board revenue (0 for commuters)
- Auxiliary_s = bookstore, parking, technology fees, etc.
- Retention_Probability_s = probability the student is still enrolled in semester s (cumulative retention rate)

### Expected Semesters
| Program Type | Expected Semesters | Note |
|-------------|-------------------|------|
| Associate Degree | 4 | 2 years |
| Bachelor's Degree | 8 | 4 years |
| Accelerated Bachelor's | 6 | 3 years |
| Master's Degree | 4 | 2 years |
| Doctoral Degree | 8-12 | Variable |
| Certificate | 2-4 | Variable |

Expected semesters is adjusted by credit velocity. A student taking 12 credits/semester in a 120-credit program will take 10 semesters, not 8.

### Retention Probability Per Semester
Retention probability is computed using the student's retention risk tier and historical institutional retention data.

| Risk Tier | Year 1 Retention | Year 2 Retention | Year 3 Retention | Year 4 Graduation |
|-----------|-----------------|-----------------|-----------------|-------------------|
| Low | 95% | 90% | 87% | 80% |
| Low-Moderate | 88% | 82% | 77% | 68% |
| Moderate | 78% | 70% | 63% | 52% |
| High | 65% | 52% | 42% | 30% |
| Critical | 50% | 35% | 25% | 15% |

These are baseline rates. Institutions with stronger support infrastructure will have higher rates across all tiers. The system calibrates against the institution's actual historical data when available.

### Semester-by-Semester LSV
For each semester, compute: Revenue_s * Retention_Probability_s

This produces a declining revenue curve because retention probability decreases each semester. The area under the curve is the student's LSV.

## Class Revenue Projection

### Three Scenarios

**Best Case:** All students persist to graduation. No attrition. This is the theoretical maximum revenue from the class.

Class_Revenue_Best = SUM(LSV_i at 100% retention for all i)

**Expected Case:** Historical retention rates applied per risk tier. This is the most likely revenue outcome.

Class_Revenue_Expected = SUM(LSV_i at risk-adjusted retention for all i)

**Worst Case:** Retention rates 10 percentage points below historical at each tier. This is the downside scenario.

Class_Revenue_Worst = SUM(LSV_i at historical-10% retention for all i)

### Revenue by Program
Break down class revenue by program to identify which programs contribute the most to institutional sustainability and which are subsidized.

| Program | # Students | Avg LSV | Total Program Revenue | % of Class Revenue |
|---------|-----------|---------|---------------------|-------------------|

### Revenue at Risk
Revenue at risk = Class_Revenue_Expected - Class_Revenue_Worst

This is the amount of revenue the institution could lose if retention underperforms. It quantifies the financial value of retention investment.

---

# RETENTION MODELING PER CLASS

## Purpose
Retention Modeling projects how many students in the class will persist to the next enrollment period and ultimately to graduation. It identifies where attrition is likely to occur and quantifies the impact.

## Class Retention Projection

### Step 1: Aggregate Risk Distribution
Count students in each risk tier for the cohort.

### Step 2: Apply Tier-Specific Retention Rates
Using institutional historical data (or baseline rates if no history available), project how many students in each tier will return.

Projected_Returning = SUM(Students_in_Tier_t * Retention_Rate_t) for all tiers t

### Step 3: Identify Intervention Leverage Points
For each risk tier, compute the marginal value of retention improvement:

If we move 1 student from Critical to High risk (through intervention), the expected revenue gain = LSV_at_High_retention - LSV_at_Critical_retention.

This tells the institution where retention investment has the highest ROI.

### Step 4: Flag Concentration Risks
If more than 30% of the class is in High or Critical risk tiers, the class has a retention crisis. This requires institution-wide strategy, not individual intervention.

If a specific program has disproportionately high risk (e.g., 60% of Business students are High/Critical), that program needs targeted support.

### Step 5: Project Graduation Rate
Using the cohort's risk distribution and historical graduation rates per tier, project the class's expected graduation rate.

Compare to institutional targets and accreditation thresholds. If the projected graduation rate is below accreditation requirements, flag immediately.

---

# FINANCIAL AID BUDGET OPTIMIZATION

## Purpose
Financial Aid Optimization allocates the institution's aid budget to maximize the combined outcome of yield (for prospective students) and retention (for enrolled students) subject to budget constraints.

## Optimization Framework

### Objective Function
Maximize: SUM(Yield_Probability_i * Enrollment_Value_i) + SUM(Retention_Probability_i * Continuation_Value_i)

Subject to: SUM(Aid_i) <= Total_Aid_Budget

Where:
- Yield_Probability_i = likelihood that prospect i enrolls, given the aid offer
- Enrollment_Value_i = expected net revenue from student i over their enrollment lifecycle
- Retention_Probability_i = likelihood that enrolled student i persists, given the aid amount
- Continuation_Value_i = remaining expected net revenue from student i

### Aid Sensitivity Estimation

**For Yield (Prospective Students):**
Each student has an estimated yield sensitivity - how much their enrollment probability changes per $1,000 of additional aid.

| Student Profile | Estimated Yield Sensitivity (per $1K aid) |
|----------------|------------------------------------------|
| High financial need, high fit, high KR | +8-12% yield probability |
| High financial need, high fit, moderate KR | +6-10% yield probability |
| Low financial need, high fit | +1-3% yield probability |
| High financial need, low fit | +3-6% yield probability |
| Low financial need, low fit | +0-2% yield probability |

Students with high financial need and high System Fit are the highest-leverage yield investments. They want to come but cannot afford it.

**For Retention (Enrolled Students):**
Each student has an estimated retention sensitivity - how much their persistence probability changes per $1,000 of additional aid.

| Student Profile | Estimated Retention Sensitivity (per $1K aid) |
|----------------|----------------------------------------------|
| Financial Strain flag + otherwise engaged | +10-15% retention probability |
| Financial Strain flag + disengaged | +5-8% retention probability |
| No Financial Strain + engaged | +0-2% retention probability |
| No Financial Strain + disengaged | +0-1% retention probability |

Aid has the highest retention impact on students whose PRIMARY barrier is financial. If the student is disengaged for non-financial reasons, additional aid has minimal retention effect.

### Constraint Handling

The optimizer respects institutional constraints:
- **Total budget ceiling:** Total aid cannot exceed budget
- **Merit vs need split:** Some institutions require a minimum percentage allocated to need-based or merit-based aid
- **Endowed restrictions:** Endowed scholarships have specific criteria (major, GPA, demographics) that cannot be overridden
- **Federal/state compliance:** Title IV institutions must follow federal aid regulations
- **Minimum/maximum per student:** Some institutions cap individual awards or have minimum meaningful award thresholds (an award of $200 is meaningless; minimum $1,000 to impact behavior)
- **Diversity targets:** Aid may be allocated to support demographic composition goals

### Scenario Modeling

The system can model "what if" scenarios:

| Scenario | Parameters | Output |
|----------|-----------|--------|
| Baseline | Current aid allocation | Expected yield, retention, revenue |
| Increase merit | +10% to merit pool, -10% from need | Yield/retention/revenue change |
| Increase need | +10% to need pool, -10% from merit | Yield/retention/revenue change |
| Expand budget | +$500K total budget | Marginal yield/retention/revenue |
| Reduce discount | -5% tuition discount rate | Yield/retention/revenue impact |
| Target program | Extra $200K to Nursing recruitment | Program enrollment change |

Each scenario shows the full cascade: aid change, yield change, retention change, class composition change, revenue change.

---

# CLASS KR TIERS

## Purpose
Class KR Tiers translate the aggregate Class KR into an institutional quality label, the same way Institution Legends translate Student KR into individual context.

## Tier Definitions (Universal - Interpreted Per Institution Type)

| Class KR | Tier Label | Description |
|----------|-----------|-------------|
| 90-100 | Elite Class | Across-the-board excellence. High AKR, strong engagement, deep professional preparation. This class will have exceptional graduation rates, strong outcomes, and elevate institutional reputation. Rare outside elite privates and honors programs. |
| 85-89 | Strong Class | Above-average quality across most dimensions. Some gaps but overall a class the institution should be proud of. Good graduation rate projected. Revenue targets likely met. |
| 80-84 | Solid Class | Meets institutional expectations. Adequate quality distribution, reasonable retention projection, revenue targets achievable with normal support investment. |
| 75-79 | Average Class | Meets minimum standards but has gaps. Some programs underenrolled, some KR tiers underrepresented, retention risk is moderate. Needs attention but not crisis. |
| 70-74 | Below Average | Noticeable quality gaps. High proportion of at-risk students, revenue targets may not be met, retention intervention needed at scale. |
| 65-69 | Weak Class | Significant quality concerns. Multiple programs underenrolled, high risk distribution, revenue shortfall likely. Institutional strategy conversation needed. |
| Below 65 | Critical | Class quality is below institutional sustainability threshold. Enrollment crisis likely. Immediate strategic intervention required. |

## Context Matters
A Class KR of 78 means very different things at different institution types:
- At an Ivy: This would be a crisis. Their classes are typically 90+.
- At a Regional State: This is average. Room for improvement but functional.
- At a Community College: This is strong. CC classes are typically in the 65-75 range due to open admission.

The tier labels are universal, but the EXPECTED Class KR varies by institution type. The system flags when a class is significantly above or below the expected range for its institution type.

### Expected Class KR Ranges by Institution Type
| Institution Type | Expected Range | Notes |
|-----------------|---------------|-------|
| Elite Private | 88-96 | Highly selective admission drives high class KR |
| Research University (R1) | 82-90 | Selective but larger, more variance |
| Regional State | 74-82 | Moderate selectivity, wider distribution |
| HBCU | 72-82 | Variable by institution, cultural engagement boosts retention |
| Faith-Based | 74-84 | Mission alignment boosts retention even at lower KR |
| Community College | 60-72 | Open admission, highest suppression prevalence |
| Trade/Technical | 65-78 | Competency-focused, PKR-heavy |
| Online/Non-Traditional | 62-75 | Self-directed population, high variance |

---

## VERSION HISTORY
- v1.0: Initial build. Class KR pipeline (credit-weighted computation, program-weighted computation, 7 diagnostic categories), Composition Analysis (5 dimensions), Revenue Projection (3-scenario LSV model, program-level breakdown), Retention Modeling (tier-based projection, intervention leverage analysis), Financial Aid Budget Optimization (yield/retention sensitivity, constraint handling, scenario modeling), Class KR Tiers with expected ranges by institution type. Architecture mirrors basketball File 03 (Team Intelligence).
