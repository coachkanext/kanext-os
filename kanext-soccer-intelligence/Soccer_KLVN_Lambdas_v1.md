# SOCCER KLVN LAMBDAS -- v1

## Purpose
Lambda normalizes INPUTS (production stats) during trait scoring so that a player's KR reflects actual football ability regardless of league. Same function as the KLVN system in basketball intelligence.

## How Lambdas Work
Lambda normalizes INPUTS during trait scoring. It does NOT convert KR OUTPUTS. There is no "Premier League-equivalent KR."

When evaluating a player:
1. Identify their league
2. Look up the league lambda
3. Apply lambda to normalize production stats during trait scoring
4. Score traits, compute component KRs, produce final KR
5. Read the KR against the relevant League KR Legend (or Pro Player KR Legend)

The KR is universal. The lambda adjusts how raw stats translate to trait scores.

## Cross-League Example

Player A: 0.45 G/90 in Premier League (lambda 1.000)
Player B: 0.65 G/90 in Eredivisie (lambda 0.880)

After lambda normalization, Player B's 0.65 G/90 normalizes closer to ~0.57 G/90 at PL-equivalent competition. Player A's 0.45 G/90 stays at 0.45. The trait scores and final KRs reflect this.

---

## MASTER LAMBDA TABLE

### Tier 1 -- Top-5 European Leagues (lambda 0.935-1.000)

| Rank | League Key | Country | Lambda | Calibration | Legend File |
|------|-----------|---------|--------|-------------|-------------|
| 1 | premier_league | England | 1.000 | Reference | Legend_Premier_League_v1 |
| 2 | la_liga | Spain | 0.975 | Estimate | Legend_La_Liga_v1 |
| 3 | serie_a | Italy | 0.960 | Estimate | Legend_Serie_A_v1 |
| 4 | bundesliga | Germany | 0.955 | Estimate | Legend_Bundesliga_v1 |
| 5 | ligue_1 | France | 0.935 | Estimate | Legend_Ligue_1_v1 |

### Tier 1A -- Continental Club Competition (lambda 0.920-0.990)

| Rank | League Key | Scope | Lambda | Calibration | Notes |
|------|-----------|-------|--------|-------------|-------|
| 6 | champions_league_group | UEFA | 0.990 | Estimate | Group stage onward. Use for CL-specific production only. |
| 7 | champions_league_knockout | UEFA | 1.000 | Estimate | Knockout rounds treated as PL-equivalent intensity. |
| 8 | europa_league | UEFA | 0.920 | Estimate | Group stage onward. |
| 9 | conference_league | UEFA | 0.880 | Estimate | Use domestic lambda if higher. |
| 10 | copa_libertadores | CONMEBOL | 0.900 | Estimate | Knockout rounds. Group stage 0.880. |
| 11 | copa_sudamericana | CONMEBOL | 0.840 | Estimate | |
| 12 | afc_champions_league | AFC | 0.820 | Estimate | |
| 13 | caf_champions_league | CAF | 0.780 | Estimate | |

### Tier 2 -- Strong European Domestics + Top Americas (lambda 0.820-0.880)

| Rank | League Key | Country | Lambda | Calibration | Legend File |
|------|-----------|---------|--------|-------------|-------------|
| 14 | eredivisie | Netherlands | 0.880 | Estimate | Legend_Eredivisie_v1 |
| 15 | liga_portugal | Portugal | 0.870 | Estimate | Legend_Liga_Portugal_v1 |
| 16 | brasileiro_serie_a | Brazil | 0.865 | Estimate | Legend_Brasileiro_v1 |
| 17 | championship | England (2nd) | 0.860 | Estimate | Legend_Championship_v1 |
| 18 | liga_mx | Mexico | 0.850 | Estimate | Legend_Liga_MX_v1 |
| 19 | argentine_primera | Argentina | 0.840 | Estimate | -- |
| 20 | belgian_first_division | Belgium | 0.835 | Estimate | -- |
| 21 | 2_bundesliga | Germany (2nd) | 0.835 | Estimate | -- |
| 22 | serie_b_italy | Italy (2nd) | 0.830 | Estimate | -- |
| 23 | segunda_division | Spain (2nd) | 0.825 | Estimate | -- |
| 24 | mls | USA/Canada | 0.820 | Estimate | Legend_MLS_v1 |

### Tier 3 -- Mid-Range European + Strong Global (lambda 0.750-0.819)

| Rank | League Key | Country | Lambda | Calibration | Notes |
|------|-----------|---------|--------|-------------|-------|
| 25 | ligue_2 | France (2nd) | 0.810 | Estimate | |
| 26 | turkish_super_lig | Turkey | 0.800 | Estimate | Inflated by aging star imports |
| 27 | scottish_premiership | Scotland | 0.800 | Estimate | Celtic/Rangers concentration |
| 28 | russian_premier_league | Russia | 0.790 | Estimate | Isolated market post-2022 |
| 29 | austrian_bundesliga | Austria | 0.785 | Estimate | Salzburg pipeline |
| 30 | greek_super_league | Greece | 0.780 | Estimate | Olympiacos/PAOK/AEK concentration |
| 31 | saudi_pro_league | Saudi Arabia | 0.780 | Estimate | High imports but low domestic density |
| 32 | championship_league_one | England (3rd) | 0.780 | Estimate | |
| 33 | swiss_super_league | Switzerland | 0.775 | Estimate | Young Boys/Basel pipeline |
| 34 | czech_first_league | Czech Republic | 0.765 | Estimate | |
| 35 | danish_superliga | Denmark | 0.770 | Estimate | Copenhagen/Midtjylland pipeline |
| 36 | croatian_first_league | Croatia | 0.760 | Estimate | Dinamo Zagreb dominance |
| 37 | serbian_super_liga | Serbia | 0.755 | Estimate | Red Star/Partizan concentration |
| 38 | j_league | Japan | 0.775 | Estimate | Improving rapidly |
| 39 | k_league_1 | South Korea | 0.760 | Estimate | |
| 40 | colombian_primera | Colombia | 0.755 | Estimate | Apertura/Clausura format |
| 41 | chilean_primera | Chile | 0.740 | Estimate | |
| 42 | uruguayan_primera | Uruguay | 0.750 | Estimate | Nacional/Penarol concentration |
| 43 | paraguayan_primera | Paraguay | 0.730 | Estimate | |
| 44 | ecuadorian_serie_a | Ecuador | 0.735 | Estimate | |

### Tier 4 -- Lower European + Global Domestics (lambda 0.650-0.749)

| Rank | League Key | Country | Lambda | Calibration | Notes |
|------|-----------|---------|--------|-------------|-------|
| 45 | polish_ekstraklasa | Poland | 0.740 | Estimate | |
| 46 | ukrainian_premier | Ukraine | 0.735 | Estimate | War-disrupted since 2022 |
| 47 | romanian_liga_1 | Romania | 0.720 | Estimate | |
| 48 | a_league | Australia | 0.730 | Estimate | Summer schedule |
| 49 | hungarian_nb1 | Hungary | 0.710 | Estimate | |
| 50 | norwegian_eliteserien | Norway | 0.720 | Estimate | Summer calendar |
| 51 | swedish_allsvenskan | Sweden | 0.715 | Estimate | Summer calendar |
| 52 | finnish_veikkausliiga | Finland | 0.680 | Estimate | Summer calendar |
| 53 | bulgarian_first_league | Bulgaria | 0.695 | Estimate | |
| 54 | cypriot_first_division | Cyprus | 0.700 | Estimate | |
| 55 | israeli_premier_league | Israel | 0.720 | Estimate | Maccabi/Hapoel concentration |
| 56 | south_african_psl | South Africa | 0.700 | Estimate | Strongest in Africa |
| 57 | egyptian_premier | Egypt | 0.720 | Estimate | Al Ahly/Zamalek dominance |
| 58 | moroccan_botola | Morocco | 0.700 | Estimate | |
| 59 | tunisian_ligue_1 | Tunisia | 0.685 | Estimate | |
| 60 | chinese_super_league | China | 0.710 | Estimate | Post-investment bubble deflation |
| 61 | indian_super_league | India | 0.680 | Estimate | Growing but limited depth |
| 62 | peruvian_primera | Peru | 0.710 | Estimate | |
| 63 | venezuelan_primera | Venezuela | 0.690 | Estimate | |
| 64 | bolivian_primera | Bolivia | 0.670 | Estimate | Altitude factor |
| 65 | league_two | England (4th) | 0.720 | Estimate | |
| 66 | usl_championship | USA (2nd) | 0.690 | Estimate | |
| 67 | brasileiro_serie_b | Brazil (2nd) | 0.760 | Estimate | Competitive second division |
| 68 | argentine_primera_b | Argentina (2nd) | 0.720 | Estimate | |
| 69 | thai_league_1 | Thailand | 0.660 | Estimate | |

### Tier 5 -- Lower Global + National Leagues (lambda 0.550-0.649)

| Rank | League Key | Country/Region | Lambda | Calibration | Notes |
|------|-----------|---------------|--------|-------------|-------|
| 70 | mls_next_pro | USA (3rd) | 0.620 | Estimate | MLS reserve league |
| 71 | national_league | England (5th) | 0.650 | Estimate | |
| 72 | indonesian_liga_1 | Indonesia | 0.630 | Estimate | |
| 73 | malaysian_super_league | Malaysia | 0.620 | Estimate | |
| 74 | uzbek_super_league | Uzbekistan | 0.640 | Estimate | |
| 75 | iraqi_premier | Iraq | 0.630 | Estimate | |
| 76 | qatari_stars_league | Qatar | 0.660 | Estimate | World Cup investment legacy |
| 77 | uae_pro_league | UAE | 0.650 | Estimate | |
| 78 | costa_rican_primera | Costa Rica | 0.640 | Estimate | |
| 79 | honduran_liga_nacional | Honduras | 0.610 | Estimate | |
| 80 | jamaican_premier | Jamaica | 0.580 | Estimate | |
| 81 | ghanaian_premier | Ghana | 0.620 | Estimate | |
| 82 | nigerian_npfl | Nigeria | 0.610 | Estimate | |
| 83 | kenyan_premier | Kenya | 0.580 | Estimate | |
| 84 | cameroonian_elite_one | Cameroon | 0.600 | Estimate | |
| 85 | algerian_ligue_1 | Algeria | 0.640 | Estimate | |
| 86 | lower_semi_pro | Various | 0.550 | Estimate | Catch-all for unlisted semi-pro |

### Tier 6 -- Youth / Academy (lambda 0.450-0.650)

| Rank | League Key | Scope | Lambda | Calibration | Notes |
|------|-----------|-------|--------|-------------|-------|
| 87 | youth_top_academy_u21 | Top-5 league U21 | 0.650 | Estimate | PL2, La Liga Promises, Primavera 1 |
| 88 | youth_top_academy_u18 | Top-5 league U18 | 0.600 | Estimate | PL U18, DFB Junioren-Bundesliga |
| 89 | youth_mid_academy_u21 | Mid-tier league U21 | 0.580 | Estimate | Eredivisie Jong, Belgian U21 |
| 90 | youth_mid_academy_u18 | Mid-tier league U18 | 0.530 | Estimate | |
| 91 | youth_lower_academy | Lower academy U18/U21 | 0.480 | Estimate | |
| 92 | youth_grassroots | Sub-academy youth | 0.450 | Estimate | U16 and below |

### International -- National Teams (lambda 0.850-1.000)

International production uses separate lambdas based on FIFA ranking tiers. These apply only when evaluating international match production specifically.

| FIFA Ranking Tier | Lambda | Examples |
|-------------------|--------|----------|
| Top 10 | 1.000 | Argentina, France, England, Brazil, Belgium, Spain, Netherlands, Portugal, Italy, Germany |
| 11-25 | 0.950 | Colombia, Uruguay, USA, Mexico, Japan, Denmark, Croatia, Switzerland |
| 26-50 | 0.900 | Scotland, Serbia, Morocco, Senegal, Australia, Nigeria, Ecuador, South Korea |
| 51-75 | 0.850 | Finland, Norway, Greece, Paraguay, Peru, DR Congo, Cameroon, Ghana |
| 76-100 | 0.800 | Honduras, Jamaica, Haiti, Kenya, Thailand, New Zealand |
| 100+ | 0.750 | Smaller nations |

Note: International lambdas are supplementary. A player's primary evaluation uses their domestic club league lambda. International production is additive context, not a replacement.

---

## GOVERNANCE / CHANGE CONTROL

Any change to:
- League definitions
- Lambda constants
- Tier assignments
- Youth academy tier mappings
- International lambda tiers

Requires documentation, versioning, and explicit approval.

All lambdas are v1 estimates. Calibration status will be updated as evaluation data accumulates. Target: 50+ evaluated players per league before moving from "Estimate" to "Calibrated."

## CRITICAL CLARIFICATION -- KR IS UNIVERSAL

KLVN lambda normalizes INPUTS during evaluation. It does NOT convert KR OUTPUTS.

A player's KR is a single universal number. It does not change based on what league you're viewing from.

- DO NOT multiply a player's KR by lambda to create a "translated" KR at another league
- DO NOT report separate KR numbers for different leagues
- The KR is computed once, at the player's home league, using lambda-normalized inputs. That number is final and universal.
