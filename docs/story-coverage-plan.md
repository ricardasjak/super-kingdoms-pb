# Story Coverage Plan (starkingdoms OG vs docs/stories)

## Covered by existing stories

| Site page | Existing story |
|---|---|
| Status | 0030 economy |
| Buildings | 0031 buildings |
| Research | 0032 / 0033 research |
| Explore | 0035 exploration |
| Military | 0040 units, 0041 disband |
| Attack | 0060 attacking-w-military |
| Missile | 0061 missiles (in progress) |
| Sign up / Log in | 0010 account-creation |
| Game states, newbie/PvE/PvP | 0002, 0004, 0005, 0006, 0022 |
| Shields, rewards | 0050, 0051 |

## Not covered, proposed new stories

| # | Page(s) | Proposed story | Priority | Done |
|---|---|---|---|---|
| 1 | `Modules.aspx` | Modules: what they are, activation, effects | High (check relation to 0033) | |
| 2 | `MineGold.aspx` | Mine gold action | Medium (check relation to 0030) | |
| 3 | `AFKBuilder.aspx` | AFK/auto builder | Medium | |
| 4 | `TargetFinder.aspx` | Target finder: search/filter targets by criteria | High (supports attack/missile) | |
| 5 | `Probe.aspx` | Probing/scouting another kingdom (intel) | High | Draft (0062) |
| 6 | `MySector.aspx` (+ `?last=true`) | Sector view: kingdoms in your sector, paging | High | Draft (0064) |
| 7 | `Politics.aspx` | Sector politics & democratic Sector Leader (SL) elections | Medium | Draft (0072) |
| 8 | `Alliances.aspx`, `AllianceInfo.aspx` | Alliance list, create/join, alliance details | High (split: list/join, info/management) | |
| 9 | `KingdomNews.aspx` | Kingdom news/event log (attacks received, etc.) | High | Draft (0065) |
| 10 | `UniversalNews.aspx`, `News.aspx` | Global/game news & announcements | Low | Draft (0066) |
| 11 | `Msg.aspx`, `SendMessages.aspx`, `Sent.aspx` | In-game messaging (inbox, compose, sent) & SL mass broadcast | Medium | Draft (0070, 0071) |
| 12 | `Preferences.aspx` | Account/kingdom preferences | Low | |
| 13 | `Scores.aspx`, `ScoresDomination.aspx`, category boards | Live universe scores & leaderboards (domination, networth, land, honor, kills, faith, alliances, data export) | High | Draft (0067) |
| 14 | `ScoresArchive.aspx`, `CareerStats.aspx` | Scores archive (rounds R1–R117+, boards, breakdown) & career statistics | High | Draft (0068) |
| 15 | `Stratagems.aspx` | Stratagems: tactical round modifiers & activation | Medium | |
| 16 | `Achievements.aspx` | Player badges & milestone achievements | Low | |

## Suggested order
1. Intel/targeting: 5 (probes) → 4 (target finder) → 6 (sector view), establishing dependencies for attack/missile.
2. Competitive & rankings: 13 (live scores & leaderboards) → 14 (scores archive & career stats).
3. Social & communications: 8 (alliances) → 11 (messaging & SL broadcast) → 7 (sector politics & SL elections) → 9 (kingdom news).
4. Economy & tactics: 1 (modules) → 2 (mine gold) → 3 (AFK builder) → 15 (stratagems).
5. Low priority: news (10), preferences (12), achievements (16), bug report.

## Audited Sidebar Structure
A complete audit of Star Kingdoms navigation was conducted:
- **Status:** `Overview.aspx`, `Modules.aspx`, `MineGold.aspx`, `AFKBuilder.aspx`
- **Sector:** `MySector.aspx`, `Politics.aspx`, `KingdomNews.aspx`
- **Manage:** `Stratagems.aspx`, `Preferences.aspx`
- **Military:** `Units.aspx`, `Attack.aspx`, `Disband.aspx`, `Missiles.aspx`
- **Intel:** `Probe.aspx`, `TargetFinder.aspx`
- **Alliance:** `Alliances.aspx`
- **Sk Uni:** `Scores.aspx` (Leaderboards & Archive), `UniversalNews.aspx`
- **Comms:** `Msg.aspx`, `SendMessages.aspx`, `Sent.aspx`
- **Misc:** `Achievements.aspx`, `Help.aspx`

## Open points
- Confirm whether `Modules.aspx` fits current project scope or should be deferred.
- Confirm if `Data_v3.aspx` universe dumps should be exposed as an unauthenticated or token-authenticated public endpoint for third-party tools.
