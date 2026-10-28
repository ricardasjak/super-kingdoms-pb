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
| 5 | `Probe.aspx` | Probing/scouting another kingdom (intel) | High | |
| 6 | `MySector.aspx` (+ `?last=true`) | Sector view: kingdoms in your sector, paging | High | |
| 7 | `Politics.aspx` | Politics (rulers, votes, or similar) | Medium | |
| 8 | `Alliances.aspx`, `AllianceInfo.aspx` | Alliance list, create/join, alliance details | High (split: list/join, info/management) | |
| 9 | `KingdomNews.aspx` | Kingdom news/event log (attacks received, etc.) | High | |
| 10 | `News.aspx` | Global/game news | Low | |
| 11 | `MailRoom.aspx`, `Inbox.aspx` | Messaging: inbox, compose | Medium | |
| 12 | `Achievements.aspx` | Achievements | Low (check overlap with 0051 rewards) | |
| 13 | `Preferences.aspx` | Account/kingdom preferences | Low | |
| 14 | `SubmitBug.aspx` | Bug report form | Low | |
| 15 | Sidebar "Manage" / "Sk Uni" sections | Possible extra pages (rankings, help); still to identify | Check | |

## Suggested order
1. Intel/targeting: 5 → 4 → 6, so the attack/missile stories have their dependencies.
2. Social: alliances (8), then messaging (11), then kingdom news (9).
3. Economy extras: modules (1), mine gold (2), AFK builder (3), politics (7).
4. Low priority: news, achievements, preferences, bug report.

## Open points
- Sidebar sections "Manage", "Sk Uni", "Misc" were expanded, but I didn't capture their full link lists. A quick follow-up pass would confirm there are no other pages (item 15).
- Some pages, such as Modules and Politics, may be unrelated to your goals. Tell me which to drop before story writing.
