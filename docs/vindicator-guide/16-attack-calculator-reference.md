# Chapter 16: Attack Calculator Reference

> **Source:** Vindicator Star Kingdoms Online Attack Calculator (2003)  
> **Original URL:** `http://www.angelfire.com/ill/l33t_hacker/Vindicator/16_calculator.html`

This document preserves the mechanics and JavaScript source code of Vindicator's original 2003 Star Kingdoms combat calculator.

## Combat Calculation Algorithm

### 1. Base Offense Calculation
```javascript
BaseOffense = (Soldiers * 1) + (Troopers * 4) + (Dragoons * 5) + (Tanks * 9) + (TacticalFighters * 10);
```

### 2. Offensive Modifiers
```javascript
OffensiveMultiplier = 100 
  + AllianceStatusMod      // +25 if mutual war, -25 if peace, 0 normal
  + (AttackerPlanetVal / 2)// Desert Wasteland: 35/2 = +17.5%
  + AttackerResearchMod    // +1% per Military Research level (max 30%)
  - DefenderShieldsMod     // -1% per active defender shield (max -10%)
  + AttackerSectorLeader   // +10% if Attacker is Sector Leader (Monarch)
  - AttackerPowerPenalty   // -20% if Attacker is Out of Power (Blackout)
  + AttackerWarLeaders     // +1% per War Leader sent
  - AttackerExtraBuffer;   // User-defined safety percentage margin

TotalOffense = (BaseOffense * OffensiveMultiplier) / 100;
```

### 3. Base Defense Calculation
```javascript
BaseDefense = (Soldiers * 1) + (LaserTroopers * 4) + (LaserDragoons * 5) + (Tanks * 9) + (TacticalFighters * 4);
```

### 4. Defensive Modifiers & Minimum Land Defense Rule
```javascript
DefensiveMultiplier = 100
  + AllianceStatusMod      // +25 if peace, -25 if war
  + DefenderPlanetVal      // Oceanic: +20%
  + DefenderResearchMod    // +1% per Military Research level (max 30%)
  + DefenderSectorLeader   // +10% if Defender is Sector Leader
  - DefenderPowerPenalty;  // -20% if Defender is Out of Power

TotalDefense = (BaseDefense * DefensiveMultiplier) / 100;

// BCart Rule: Land defense is always at least 2 * Land acres (no modifiers)
LandDefense = DefenderLand * 2;

EffectiveDefense = (LandDefense > TotalDefense) ? LandDefense : TotalDefense;
```

### 5. Attack Outcome Resolution
```javascript
if (TotalOffense >= EffectiveDefense + 1) {
    // ATTACK SUCCESSFUL
    Advantage = TotalOffense - EffectiveDefense;
} else {
    // ATTACK FAILS
    Deficit = (EffectiveDefense - TotalOffense) + 1;
}
```

---

## Preserved JavaScript Implementation (2003)

```javascript
//Vindicator Star Kingdoms online calculator. By Vindicator, 2003-03-30,
// 2002-04-06, 2002-04-29 , 2003-06-18, 2003-08-02, 2003-09-02, 2003-11-25 &copy;&reg;&#8482;

//Last update (2003-11-25): Land defense is always 2*land (no bonuses at all) according to BCart.
//Therefore fixed land defense calculations.

//global variables
var totalOffense
var totalDefense
var landDefense
var maxDefense
var advantage
var temp
var number
var numberb
var newnumber

//clears some global values, I have no idea why it should do this, but I think it is useful..
function clearGlobalValues() {
totalOffense=""
totalDefense=""
}

//sets WL to max, 4
function setMaxWl(){
document.form1.atWl.value = 9
}

//sets shields to max, 10
function setMaxShields(){
document.form1.dfShields.value = 10
}

//sets attacker's research to max, 30
function setMaxAt(){
document.form1.atResearch.value = 30
}

//sets defender's research to max, 30
function setMaxDf(){
document.form1.dfResearch.value = 30
}

//displays help alertbox
function displayHelp() {
alert("Vindicator Star Kingdoms calculator\n" +
      "Online version. By Vindicator. 2003-11-25\n\n" +
      "How to use:\n 1.Set all the bonuses, research and planet type\n" +
	  "for both you and the defender. If you are paranoid,\n" +
	  "set -Send Extra %- to a few % extra. Also remember\n" +
	  "to enter how much land the defender has, if he has\n" +
	  "a weak defense.\n\n" +
	  "2. Enter the defender's military, or copy and paste\n" +
      "it into the big textbox and click on -Get Defender-.\n" +
	  "You can do the same thing to get your own military,\n" +
	  "but click on -Get Attacker- instead.\n\n" +
	  "3. Click on -Calculate attack- to see if your attack\n" +
	  "will be successful. The calculator only checks exactly\n" +
	  "how much you have to send. It has no overkill, unless\n" +
	  "you add that yourself with -Send Extra %-, so if you\n" +
	  "want to be sure to be successful, you should send a\n" +
	  "little bit extra, and check so that all the data you\n" +
	  "have entered really is correct before attacking.")
	  }

//clears the text area when clicking on it, if no SoM is in it.
function clearText() {
var text = document.form1.textarea.value.indexOf("Paste your own")
if (text != -1) {clearTextbox()
}
}

//clears text area
function clearTextbox(){
document.form1.textarea.value = ""
}

function getStatsDef(stats){
//replace stupid things in stats (, and newlines)
stats = stats.replace(/,/g,"").replace(/\r/g," ").replace(/\n/g,"")
.replace("Laser Troopers","LaserTrooopers").replace("Laser Dragoons","LaserDragooons")
.replace("Laser Dragoon","LaserDragooons").replace("Laser Trooper","LaserTrooopers")
.replace("Tactical Fighters","TacticalFighters")
//changing names so the calculator won't mistake LD's for dragoons, and think that
//"fighters" is the number of TF's.

//gets the stats of defending kingdom

//Get soldiers
var stat = stats.indexOf("Soldiers");
    var stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield2.value = stat2

//Get laser troopers
stat = stats.indexOf("LaserTrooopers");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield4.value = stat2

//Get laser dragoons
stat = stats.indexOf("LaserDragooons");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield6.value = stat2

//Get tanks
stat = stats.indexOf("Tanks");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield8.value = stat2

//Get tactical fighters
stat = stats.indexOf("TacticalFighters");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield10.value = stat2
//clears the textbox afterwards
clearTextbox()
}


function getStatsAtt(stats){
//replace stupid things in stats (, and newlines)
stats = stats.replace(/,/g,"").replace(/\r/g," ").replace(/\n/g,"")
.replace("Laser Troopers","LaserTrooopers").replace("Laser Dragoons","LaserDragooons")
.replace("Laser Dragoon","LaserDragooons").replace("Laser Trooper","LaserTrooopers")
.replace("Tactical Fighters","TacticalFighters").replace("Troopers ","Trooper ")
.replace("Dragoons ","Dragoon ")
//Get soldiers
var stat = stats.indexOf("Soldiers");
    var stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield1.value = stat2

//Get troopers
stat = stats.indexOf("Trooper");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield3.value = stat2

//Get dragoons
stat = stats.indexOf("Dragoon");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield5.value = stat2

//Get tanks
stat = stats.indexOf("Tanks");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield7.value = stat2

//Get tactical fighters
stat = stats.indexOf("TacticalFighters");
stat2 = "";
    if (stat != -1) {
      stat = stats.substring(stat,(stat+500))
      stat2 = stat.indexOf(" ")
      stat2 = stat.substring((stat2 + 1),500)
      stat2 = Number(stat2.substring(0,stat2.indexOf(" ")))
}
document.form1.textfield9.value = stat2
//clears the textbox afterwards
clearTextbox()
}

	  	  
//main function, raises alert window and calls all other functions.
function calculateAttack() {
totalOffense = (((calculateOffense()) * (calculateOffBonuses())) / 100)
totalDefense = (((calculateDefense()) * (calculateDefBonuses())) / 100)
landDefense = parseInt((document.form1.dfLand.value) * 2)
maxDefense = totalDefense
if (document.form1.dfLand.value == "") {landDefense = 0} // NaN debug
if (landDefense > totalDefense) {maxDefense = landDefense} //Min df=2x land
advantage = parseInt(totalOffense - maxDefense)

alert("Total base offense: " + calculateOffense() + " * " + calculateOffBonuses() +"% = " +
parseInt(totalOffense) + " offense points. \n" + "Total base defense: " + calculateDefense() +
" * " + calculateDefBonuses() + "% = " + parseInt(totalDefense) + " defense points. \n" +
"Land defense = " + landDefense + " defense points. \n \n" + calculateMilitary())
}

function calculateMilitary(){
if (maxDefense == "") {return ("Minimum defense is 2x a kingdom's land.")}
if (parseInt(maxDefense) > parseInt(totalOffense)) {return (parseInt((totalOffense / maxDefense) * 100) + 
"% sent. Attack will fail. \n"
+ "You should send " + parseInt((maxDefense - totalOffense) + 1) + " more attack points.")}
if (parseInt(totalOffense) == parseInt(maxDefense)) {return (parseInt((totalOffense / maxDefense) * 100) +
 "% sent. Attack will fail. \n"
+ "You have to send 1 more attack point to be successful.")
}
if (parseInt(totalOffense) >= (parseInt(maxDefense) + 1)) {
if (parseInt(totalOffense) <= (parseInt(maxDefense) + 20)) {
return (parseInt((totalOffense / maxDefense) * 100) +
 "% sent. Attack will be successful.")
}
}

return (parseInt((totalOffense / maxDefense) * 100) + "% sent. Attack will be successful. \n"
+ "You can send " + (parseInt(totalOffense - maxDefense) -1) + " less attack points. \n" +
"\nRecommended army to use:\n" + calculatePerfectAttack())
}

//calculates offense
function calculateOffense() {
return ((document.form1.textfield1.value * 1) + (document.form1.textfield3.value * 4) +
(document.form1.textfield5.value * 5) + (document.form1.textfield7.value * 9) +
(document.form1.textfield9.value * 10))
}

//calculates offensive bonuses
function calculateOffBonuses() {
var planetValue = parseInt(document.form1.attackerPlanet.value)
var alStatus = parseInt(document.form1.attAlstatus.value)
var atResearch = parseInt(document.form1.atResearch.value)
var dfShields = parseInt(document.form1.dfShields.value)
var atSl = parseInt(document.form1.atSl.value)
var atPow = parseInt(document.form1.atPow.value)
var atWl = parseInt(document.form1.atWl.value)
var atExtra = document.form1.extraPercent.value

if (document.form1.atSl.checked){atSl = 10}
if (document.form1.atPow.checked){atPow = 20}

return (100 + alStatus + (planetValue / 2) + atResearch - dfShields + atSl - atPow +
 atWl - atExtra)
}
//planet value / 2 to remove problems caused with half % in 17,5% extra offense for
// Desert Wasteland.

//calculates defense
function calculateDefense() {
return ((document.form1.textfield2.value * 1) + (document.form1.textfield4.value * 4) +
(document.form1.textfield6.value * 5) + (document.form1.textfield8.value * 9) +
(document.form1.textfield10.value * 4))
}

//calculates defensive bonuses
function calculateDefBonuses() {
var planetValue = parseInt(document.form1.defenderPlanet.value)
var alStatus = parseInt(document.form1.defAlstatus.value)
var dfResearch = parseInt(document.form1.dfResearch.value)
var dfSl = parseInt(document.form1.dfSl.value)
var dfPow = parseInt(document.form1.dfPow.value)

if (document.form1.dfSl.checked){dfSl = 10}
if (document.form1.dfPow.checked){dfPow = 20}

return parseInt(100 + alStatus + planetValue + dfResearch + dfSl - dfPow)
}

//calculates how much the attacker should send to not get unnecessary overkill.
function calculatePerfectAttack(){
if (advantage > 1) {	
number = advantage
	return (soldiersValue(number))
	}
return ""
}

function soldiersValue(number) {
if (document.form1.textfield1.value == "") {return tanksValue(number)} //no soldiers sent at all.
if (number == 0) {return (document.form1.textfield1.value + " soldiers\n" +
tanksValue(number))} //no advantage left.
if (document.form1.textfield1.value > parseInt(number / ((1 * calculateOffBonuses()) / 100))) {

temp = (document.form1.textfield1.value - parseInt(number / ((1 * calculateOffBonuses()) / 100)))
return (temp + " soldiers\n" + tanksValue(0))
}
{
numberb = (number - (document.form1.textfield1.value *  (1 * calculateOffBonuses()) / 100))
return (tanksValue(numberb))
}
}

function tanksValue(number) {
if (document.form1.textfield7.value == "") {return tfsValue(number)} //no tanks sent at all.
if (number == 0) {return (document.form1.textfield7.value + " tanks\n" +
tfsValue(number))} //no advantage left.
if (document.form1.textfield7.value > parseInt(number / ((9 * calculateOffBonuses()) / 100))) {

temp = (document.form1.textfield7.value - parseInt(number / ((9 * calculateOffBonuses()) / 100)))
return (temp + " tanks\n" + tfsValue(0))
}
{
numberb = (number - (document.form1.textfield7.value *  (9 * calculateOffBonuses()) / 100))
return (tfsValue(numberb))
}
}

function tfsValue(number) {
if (document.form1.textfield9.value == "") {return dragoonsValue(number)} //no tf's sent at all.
if (number == 0) {return (document.form1.textfield9.value + " TF's\n" +
dragoonsValue(0))} //no advantage left.
if (document.form1.textfield9.value > parseInt(number / ((10 * calculateOffBonuses()) / 100))) {

temp = (document.form1.textfield9.value - parseInt(number / ((10 * calculateOffBonuses()) / 100)))
return (temp + " TF's\n" + dragoonsValue(0))
}
{
numberb = (number - (document.form1.textfield9.value *  (10 * calculateOffBonuses()) / 100))
return (dragoonsValue(numberb))
}
}

function dragoonsValue(number) {
if (document.form1.textfield5.value == "") {return troopersValue(number)} //no soldiers sent at all.
if (number == 0) {return (document.form1.textfield5.value + " dragoons\n" +
troopersValue(0))} //no advantage left.
if (document.form1.textfield5.value > parseInt(number / ((5 * calculateOffBonuses()) / 100))) {

temp = (document.form1.textfield5.value - parseInt(number / ((5 * calculateOffBonuses()) / 100)))
return (temp + " dragoons\n" + troopersValue(0))
}
{
numberb = (number - (document.form1.textfield5.value *  (5 * calculateOffBonuses()) / 100))
return (troopersValue(numberb))
}
}

function troopersValue(number) {
if (document.form1.textfield3.value == "") {return ""} //no troopers sent at all.
if (number == 0) {return (document.form1.textfield3.value + " troopers")} //no advantage left.
if (document.form1.textfield3.value > parseInt(number / ((4 * calculateOffBonuses()) / 100))) {

temp = (document.form1.textfield3.value - parseInt(number / ((4 * calculateOffBonuses()) / 100)))
return (temp + " troopers\n")
}
return ""
}
```
